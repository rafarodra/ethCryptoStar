const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});

    let newStar = await instance.tokenIdToStarInfo.call(tokenId); 
    assert.equal(newStar.name, 'Awesome Star!'); 
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star1', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star2', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star3', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star4', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let tokenId = 6;
    let instance = await StarNotary.deployed();
    await instance.createStarWithSymbol('Awesome Star with symbol!', tokenId, 'SYMBOL', {from: accounts[0]}); 
    
    let newStar = await instance.tokenIdToStarInfo.call(tokenId); 
    assert.equal(newStar.name, 'Awesome Star with symbol!'); 
    assert.equal(newStar.symbol, 'SYMBOL'); 
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let tokenId1 = 7; 
    let tokenId2 = 8; 
    let user1 = accounts[1];
    let user2 = accounts[2];

    let instance = await StarNotary.deployed();
    await instance.createStarWithSymbol('myStar1', tokenId1, 'MS1', {from: user1}); 
    await instance.createStarWithSymbol('myStar2', tokenId2, 'MS2', {from: user2});
    await instance.exchangeStars(tokenId1, tokenId2, {from: user1}); 
    assert.equal(await instance.ownerOf.call(tokenId1), user2);
    assert.equal(await instance.ownerOf.call(tokenId2), user1);
}).timeout(10000);

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let tokenId = 9; 
    let fromUser = accounts[1];
    let toUser = accounts[2]; 

    let instance = await StarNotary.deployed();
    await instance.createStarWithSymbol('My Super Star', tokenId, 'MSS', {from: fromUser}); 
    assert.equal(await instance.ownerOf.call(tokenId), fromUser);

    await instance.transferStar(toUser,tokenId,{from: fromUser}); 
    assert.equal(await instance.ownerOf.call(tokenId), toUser);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let tokenId = 10;
    let instance = await StarNotary.deployed();
    await instance.createStarWithSymbol('Greatest Star Ever!', tokenId, 'GSE', {from: accounts[0]}); 
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), 'Greatest Star Ever!');
    assert.equal(await instance.lookUptokenIdToStarInfo(778), '');
});