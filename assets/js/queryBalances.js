require('dotenv').config()
let sleep = require('util').promisify(setTimeout);
const { PublicKey } = require('@solana/web3.js');
const Web3 = require('web3')
const Solana3 = require('@solana/web3.js')

// mod.cjs
//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fetch = require('node-fetch')
var JSONdb = require('simple-json-db')

const abi = require('./abi.js')

//Returns a JS object with TODAY'S balances
//Not the most recent balances in the db!
async function readCurrentBalances() {
	console.log("Hey!")
    //Songbird Tokens
    
	var witterAddress = process.env.songbirdAddress
    console.log(witterAddress)
	var rpc = new Web3(new Web3.providers.HttpProvider("http://3.132.128.10:9650/ext/bc/C/rpc"))
    console.log("Connected to RPC")
	var sgbBalance = await querySongbird(rpc, witterAddress)
    // var exfiBalance = await queryExFi(rpc, witterAddress)


    //Get SGB Price
    console.log("Getting first price data..")
    var sgbPrice = await queryBitrue("SGB")
    console.log(sgbPrice)

    //TODO: Solana price
    var solanaBalance = await querySolana();
    solanaPrice = await queryBitrue("SOL")

    var exfiPrice = await queryBitrue("EXFI")

    var date = new Date().toLocaleDateString()
    var balancesObj = { 
        'date': date,
        'witterBalance': sgbBalance,
        'SGBPrice': sgbPrice,
        // 'exfiBalance': exfiBalance,
        'exfiPrice': exfiPrice,
        'solanaBalance': solanaBalance,
        'solanaPrice': solanaPrice
    }

    console.log(balancesObj)
    return balancesObj;
}


//Read today's balances, and add a new DB entry.
async function setBalanceData(galaBalance) {
    var witterAddress = process.env.songbirdAddress
    var ftsoAddress   = process.env.ftsoAddress
    var dbPath        = process.env.db

    var rpc = new Web3(new Web3.providers.HttpProvider("http://3.132.128.10:9650/ext/bc/C/rpc"))

    var FtsoRewardManagerContract = new rpc.eth.Contract(abi.FtsoRewardManagerABI, "0xc5738334b972745067fFa666040fdeADc66Cb925")
    var FtsoManagerContract = new rpc.eth.Contract(abi.FtsoManagerAbi, "0xbfA12e4E1411B62EdA8B035d71735667422A6A9e")
    var currentRewardEpoch = await FtsoManagerContract.methods.getCurrentRewardEpoch().call()
    console.log(currentRewardEpoch)

    //Get Witter reward
    var witterRewardArray = (await FtsoRewardManagerContract.methods.getStateOfRewards(witterAddress, currentRewardEpoch - 1).call())["_rewardAmounts"]
    var witterReward = 0;
    for (var i = 0; i < witterRewardArray.length; i++) {
        witterReward += parseFloat(Web3.utils.fromWei(witterRewardArray[i]))
    }
    console.log("Total reward: ", witterReward)

    //Get FTSO Reward
    var witterFTSOReward = Web3.utils.fromWei((await FtsoRewardManagerContract.methods.getStateOfRewards(ftsoAddress, currentRewardEpoch - 1).call())["_rewardAmounts"][0])
    console.log(currentRewardEpoch, witterReward, witterFTSOReward)

    //Gala
    var galaPrice = await queryBitrue("GALA")

    //Store in db
    var db = new JSONdb(dbPath);
    var currentBalances = await readCurrentBalances()
    currentBalances['witterReward'] = Math.round(witterReward)
    currentBalances['ftsoReward'] = Math.round(witterFTSOReward)
    currentBalances['rewardEpoch'] = currentRewardEpoch
    currentBalances['galaBalance'] = galaBalance
    currentBalances['galaPrice'] = galaPrice
    // var dbObj = { 
    //     'date': date,
    //     'witterBalance': Math.round(witterBalance), 
    //     'witterReward': Math.round(witterReward), 
    //     'ftsoReward': Math.round(witterFTSOReward),
    //     'rewardEpoch': currentRewardEpoch,
    //     'SGBPrice': sgbPrice,
    //     'galaBalance': galaBalance,
    //     'galaPrice': galaPrice,
    //     'solanaBalance': solanaBalance,
    //     'solanaPrice': solanaPrice 
    // }
    console.log("Final:", currentBalances)
    // db.set(date, currentBalances)

    return currentBalances;
}

async function queryBitrue(symbol) {
    //Get SGB Price
    console.log("Getting bitrue for ", symbol)
    var price = [] //Adding the empty object just bypasses the fetch. Throwing errors on me :(
    var counter = 0;
        while (price.length == 0 && counter < 10){
            var resp = await fetch("https://www.bitrue.com/api/v1/ticker/24hr?symbol=" + symbol + "USDT").catch(error => console.log(error))
            price = await resp.json()  
            counter++             
            sleep(100)
        }
    var finalPrice = price[0]["lastPrice"]
    console.log(finalPrice)
    return finalPrice
}


async function querySongbird(rpc, address) {
    var WNatContract = new rpc.eth.Contract(abi.WNatAbi, "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED")

    var witterBalanceSgb = await rpc.eth.getBalance(address)
    var witterBalanceWsgb = await WNatContract.methods.balanceOf(address).call()
    
    var witterBalance = parseInt(Web3.utils.fromWei(witterBalanceSgb, 'ether')) + parseInt(Web3.utils.fromWei(witterBalanceWsgb,'ether'))
    console.log("SGB Balance", witterBalance, witterBalanceSgb, witterBalanceWsgb)
    return witterBalance
}

async function queryExFi(rpc, address) {
    var ExFiContract = new rpc.eth.Contract(abi.ExFiAbi, "0xC348F894d0E939FE72c467156E6d7DcbD6f16e21");
    var witterExfiBalance = await ExFiContract.methods.balanceOf(address).call()
    var exfiBalance = parseInt(Web3.utils.fromWei(witterExfiBalance, 'ether'))
    console.log("Exfi Balance:", exfiBalance)
    return exfiBalance
}

async function querySolana() {
    // Connect to cluster
    var connection = new Solana3.Connection(
        "https://solana-api.projectserum.com",
        'confirmed',
    ); 
    var publicKey = new PublicKey(process.env.solanaAddress)
    var balance = await connection.getBalance(publicKey)
    console.log("Sol balance:", parseFloat((balance*(10**-9)).toFixed(2)))
    return parseFloat((balance*(10**-9)).toFixed(2))
}

// setBalanceData(500)

exports.setBalanceData = setBalanceData;
exports.readCurrentBalances = readCurrentBalances;
