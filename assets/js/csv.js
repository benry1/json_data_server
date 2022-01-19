//Build CSV for different asks
// var labels = Array()
// var balanceData = Array()
// var rewardsData = Array()
// var ftsoData = Array()
// var rewardEpochs = Array()
// var sgbPriceData = Array()
// var galaBalance = Array()
// var galaPrice = Array()
// var solanaBalance = Array()
// var solanaPrice = Array()

var currentSongbirdBalance = 0
var currentSongbirdPrice = 0
var currentSolanaBalance = 0
var currentSolanaPrice = 0
var currentExfiPrice = 0

async function fetchCurrentBalance() {
    await fetch("http://witterbalances.ignorelist.com/getBalanceData").then(resp => buildValues(resp))  
}

async function buildValues(json) {
    var parsed = await json.json()
    currentSongbirdBalance = parsed['witterBalance']
    currentSongbirdPrice = parsed['SGBPrice']
    currentSolanaBalance = parsed['solanaBalance']
    currentSolanaPrice = parsed['solanaPrice']
    currentExfiPrice = parsed['exfiPrice']
}

//TODO: Today's Balances CSV
async function buildCurrentBalanceCsv() {
    await fetchCurrentBalance()
    var date = new Date().toLocaleDateString()
    var csvLabels = "Date,Asset,Balance,Price,Value"

    //sgb
    var sgb = date + ",SGB," + currentSongbirdBalance + "," + currentSongbirdPrice + "," + (currentSongbirdBalance * currentSongbirdPrice).toFixed(2)
    
    var sol = date + ",SOL," + currentSolanaBalance + "," + currentSolanaPrice + "," + (currentSolanaPrice * currentSolanaBalance).toFixed(2)

    let csvContent =  csvLabels + "\n" + sgb + "\n" + sol + "\n"
    console.log(csvContent)
    return csvContent
}

async function downloadCurrentBalances() {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(await buildCurrentBalanceCsv()));
        element.setAttribute('download', "CurrentWitterBalances.csv");
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
}

//TODO: Historical Balances CSV
async function buildBalanceHistoryCsv() {
    if (labels.length == 0) {
        await fetchBalanceHistory()
    }

    var csvLabels = "Date,Asset,Balance,Price,Value\n"
    var rows = Array()
    var assets = ["Songbird", "Solana", "Gala"]

    assets.forEach(asset => {
        labels.forEach((date, index) => {
            var thisRow = ""
            var balance = 0;
            var price = 0;
            switch (asset) {
                case "Songbird": balance = balanceData[index]; price = sgbPriceData[index]; break;
                case "Solana": balance = solanaBalance[index]; price = solanaPrice[index]; break;
                case "Gala": balance = galaBalance[index]; price = galaPrice[index]; break;
            }
            thisRow = date + "," + asset + "," + balance + "," + price + "," + (balance * price).toFixed(2)
            rows.push(thisRow)
        })
    })

    var ret = csvLabels 
        + rows.join("\n")
    console.log(ret)
    return ret;
}

async function downloadHistoricalBalances() {
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/csv;charset=utf-8," + encodeURIComponent(await buildBalanceHistoryCsv()));
    element.setAttribute('download', "HistoricalWitterBalances.csv");
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
