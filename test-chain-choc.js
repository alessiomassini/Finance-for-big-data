// This script is designed to test the solidity smart contract - chain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact

var chain = artifacts.require('chain')

contract('chain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    var ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "Fernando Rodriguez"
    var productID = upc + sku
    const productPrice = web3.utils.toWei('1', "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const manufacturerID = accounts[3]
    const retailerID = accounts[4]
    const consumerID = accounts[5]

    console.log("<----------------ACCOUNTS----------------> ")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Manufacturer: accounts[3] ", accounts[3])
    console.log("Retailer: accounts[4] ", accounts[4])
    console.log("Consumer: accounts[5] ", accounts[5])

    console.log("<-------TESTING CONTRACT FUNCTIONS------->")
    
    // 1st Test
    it("Testing smart contract function produceItem() that allows a farmer to produce chocolate", async() => {
        const chain = await chain.deployed();

        // Add farmer address to farmerRole
        await chain.addFarmer(originFarmerID)

        // Declare and initialize a variable for event
        var eventEmitted = false;
        itemState = 0;

        // Mark an item as produced by calling function produceItem()
        await chain.produceItemByFarmer(upc, originFarmName, productPrice, {from:originFarmerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc)

        // check for last past emitted events
        await chain.getPastEvents('ProduceByFarmer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Update test OwnerID (Following the item ownerID through the contract)
        ownerID = originFarmerID;

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 2nd Test
    it("Testing smart contract function sellItemByFarmer() that allows a farmer to sell chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 1;
        
        // Mark an item as processed by calling function processtItem()
        await chain.sellItemByFarmer(upc, productPrice, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Processed()
        await chain.getPastEvents('ForSaleByFarmer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
            //console.log(events) // same results as the optional callback above
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 3rd Test
    it("Testing smart contract function purchaseItemByDistributor() that allows a distributor to buy chocolate", async() => {
        const chain = await chain.deployed()

        await chain.addDistributor(distributorID);

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 2;
        var balance = web3.utils.toWei('10', "ether")

        // Mark an item as Packed by calling function packItem()
        await chain.purchaseItemByDistributor(upc,{from: distributorID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Packed()
        await chain.getPastEvents('PurchasedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
            //console.log(events) // same results as the optional callback above
        });

        //const hash = await chain._upcTxLookup(upc);
        //console.log(hash)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 4th Test
    it("Testing smart contract function shippedItemByFarmer() that allows a farmer to ship chocolate ", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 3;
        // Mark an item as ForSale by calling function sellItem()
        await chain.shippedItemByFarmer(upc,{from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event ForSale()
        await chain.getPastEvents('ShippedByFarmer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        
        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid price')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 5th Test
    it("Testing smart contract function receivedItemByDistributor() that allows a distributor to receive chocolate", async() => {
        const chain = await chain.deployed()
        //await chain.addDistributor(distributorID);

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 4;

        // Mark an item as Sold by calling function buyItem()
        await chain.receivedItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Sold()
        await chain.getPastEvents('ReceivedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //change ownerID to distributorID
        //ownerID = distributorID

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 6th Test
    it("Testing smart contract function processedItemByDistributor() that allows a distributor to process chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 5;
        
        // Watch the emitted event ProcessedByDistributor()
        await chain.processedItemByDistributor(upc,3,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event ProcessedByDistributor
        await chain.getPastEvents('ProcessedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 7th Test
    it("Testing smart contract function packageItemByDistributor() that allows a distributor to package chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 6;
        
        // Mark an item as Sold by calling function buyItem()
        await chain.packageItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('PackagedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid retailerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 8th Test
    it("Testing smart contract function sellItemByDistributor() that allows a distributor to sell chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 7;

        //ownerID = consumerID;

        await chain.sellItemByDistributor(upc,productPrice,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ForSaleByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 9th Test
    it("Testing smart contract function purchaseItemByManufacturer() that allows a manufacturer to purchase chocolate", async() => {
        const chain = await chain.deployed()

        await chain.addManufacturer(manufacturerID);
        
        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 8;

        var balance = web3.utils.toWei('10', "ether")

        await chain.purchaseItemByManufacturer(upc,{from: manufacturerID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('PurchasedByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], manufacturerID, 'Error: Invalid manufacturerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 10th Test
    it("Testing smart contract function shippedItemByDistributor() that allows a distributor to ship chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 9;

        await chain.shippedItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ShippedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })
    
    // 11th Test
    it("Testing smart contract function receivedItemByManufacturer() that allows a manufacturer to receive chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 10;

        await chain.receivedItemByManufacturer(upc,{from: manufacturerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ReceivedByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], manufacturerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 12th Test
    it("Testing smart contract function processedItemByManufacturer() that allows a manufacturer to process chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 11;
        
        // Watch the emitted event ProcessedByManufacturer()
        await chain.processedItemByManufacturer(upc,3,{from: manufacturerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event ProcessedByManufacturer
        await chain.getPastEvents('ProcessedByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], manufacturerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 13th Test
    it("Testing smart contract function packageItemByManufacturer() that allows a manufacturer to package chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 12; 

        // Mark an item as Sold by calling function buyItem()
        await chain.packageItemByManufacturer(upc,{from: manufacturerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('PackagedByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], manufacturerID, 'Error: Invalid manufacturerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 14th Test
    it("Testing smart contract function sellItemByManufacturer() that allows a manufacturer to sell chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 13;
        
        //ownerID = retailerID;

        await chain.sellItemByManufacturer(upc,productPrice,{from: manufacturerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ForSaleByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], manufacturerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 15th Test
    it("Testing smart contract function purchaseItemByRetailer() that allows a retailer to purchase chocolate", async() => {
        const chain = await chain.deployed()

        await chain.addRetailer(retailerID);
        
        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 14;

        var balance = web3.utils.toWei('10', "ether")

        await chain.purchaseItemByRetailer(upc,{from: retailerID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('PurchasedByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid retailerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })
    
    // 16th Test
    it("Testing smart contract function shippedItemByManufacturer() that allows a manufacturer to ship chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 15;

        await chain.shippedItemByManufacturer(upc,{from: manufacturerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ShippedByManufacturer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], manufacturerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], manufacturerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })
    
    // 17th Test
    it("Testing smart contract function receivedItemByRetailer() that allows a retailer to receive chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 16;

        //ownerID = retailerID;

        await chain.receivedItemByRetailer(upc,{from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ReceivedByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 18th Test
    it("Testing smart contract function sellItemByRetailer() that allows a retailer to sell chocolate", async() => {
        const chain = await chain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 17;

        //ownerID = consumerID;

        await chain.sellItemByRetailer(upc,productPrice,{from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('ForSaleByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 19th Test
    it("Testing smart contract function purchaseItemByConsumer() that allows a consumer to purchase chocolate", async() => {
        const chain = await chain.deployed()
        
        await chain.addConsumer(consumerID)
        
        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 18;
        
        var balance = web3.utils.toWei('10', "ether")
        
        //ownerID = consumerID;

        await chain.purchaseItemByConsumer(upc,{from: consumerID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await chain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await chain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await chain.getPastEvents('PurchasedByConsumer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[6], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[9], consumerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 20th Test
    it("Testing smart contract function fetchItemBufferOne()", async() => {
        const chain = await chain.deployed();

        const resultBufferOne = await chain.fetchItemBufferOne(upc);
        
        // Verify the result set
        assert.equal(resultBufferOne[0],sku,"Error: Invalid item SKU")
        assert.equal(resultBufferOne[1],upc,"Error: Invalid item UPC")
        assert.equal(resultBufferOne[2],consumerID,"Error: Invalid OwnerID")
        assert.equal(resultBufferOne[3],originFarmerID,"Error: Invalid originFarmID")
        assert.equal(resultBufferOne[4],originFarmName,"Error: Invalid originFarmName")
    })

    // 21st Test
    it("Testing smart contract function fetchItemBufferTwo()", async() => {
        const chain = await chain.deployed()
        const resultBufferTwo = await chain.fetchItemBufferTwo(upc);
        
        // Verify the result set
        assert.equal(resultBufferTwo[0],sku, "Error: Invalid item SKU")
        assert.equal(resultBufferTwo[1],upc, "Error: Invalid item UPC")
        assert.equal(resultBufferTwo[2],productID, "Error: Invalid item productID")
        assert.equal(resultBufferTwo[4],productPrice, "Error: Invalid productPrice")
        assert.equal(resultBufferTwo[5],itemState, "Error: Invalid itemState")
        assert.equal(resultBufferTwo[6],distributorID, "Error: Invalid distributorID")
        assert.equal(resultBufferTwo[7],manufacturerID, "Error: Invalid manufacturerID")
        assert.equal(resultBufferTwo[8],retailerID, "Error: Invalid retailerID")
        assert.equal(resultBufferTwo[9],consumerID, "Error : Invalid consumerID")
    })
    
// async function to help check block hashTx
async function getTx(blockNumber){
    let tx1 = await web3.eth.getBlock(blockNumber);
    return  (await web3.eth.getTransaction(tx1.transactions[0]));
}

    // 22nd Test
    it("Testing smart contract function fetchItemHistory()", async() => {
        const chain = await chain.deployed()
        const resultItemHistory = await chain.fetchitemHistory(upc);
        
        // get TX value from block number
        const FTD = await getTx(resultItemHistory[0].toString());
        const DTM = await getTx(resultItemHistory[1].toString());
        const MTR = await getTx(resultItemHistory[2].toString());
        const RTC = await getTx(resultItemHistory[3].toString());
        
        // Verify the result set 
        assert.equal(FTD.from, distributorID, "Error: Invalid transaction between farmer and distributor")
        assert.equal(DTM.from, manufacturerID, "Error: Invalid transaction between distributor and manufacturer")
        assert.equal(MTR.from, retailerID, "Error: Invalid transaction between manufacturer and retailer")
        assert.equal(RTC.from, consumerID, "Error: Invalid transaction between retailer and consumer")
    })
});