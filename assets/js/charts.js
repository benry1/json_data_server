var labels = Array()
var balanceData = Array()
var rewardsData = Array()
var ftsoData = Array()
var rewardEpochs = Array()
var sgbPriceData = Array()
var galaBalance = Array()
var galaPrice = Array()


//Returns string of 
async function fetchBalances() {
    fetch("http://3.144.179.213:3000/getBalanceData").then(resp => buildValues(resp))  
}

async function buildValues(resp ) {
    var parsed = await resp.json()
    console.log(parsed)
    for (var key in parsed) {
        if (parsed.hasOwnProperty(key)) {
            var record = parsed[key]
            labels.push(record["date"])
            balanceData.push(record["witterBalance"])
            rewardsData.push(record["witterReward"])
            ftsoData.push(record["ftsoReward"])
            rewardEpochs.push(record["rewardEpoch"])
            sgbPriceData.push(record["SGBPrice"])
            galaBalance.push(record["galaBalance"])
            galaPrice.push(record["galaPrice"])
        }
    }
    renderCharts()
}

function renderCharts() {
    const data = {
        labels: labels,
        datasets:[{
            label: 'Songbird Balance',
            data: balanceData
        }]
    };
    const data1 = {
        labels: labels,
        datasets:[{
            label: 'Songbird Reward',
            data: rewardsData
        }]
    };
    const data2 = {
        labels: labels,
        datasets:[{
            label: 'FTSO Reward',
            data: ftsoData
        }]
    };
    const data3 = {
        labels: labels,
        datasets:[{
            label: 'Gala Balance',
            data: galaBalance
        }]
    };
    const config = {
        type: 'line',
        data: data
    };
    const config1 = {
        type: 'line',
        data: data1,
    };
    const config2 = {
        type: 'line',
        data: data2,
    };
    const config3 = {
        type: 'line',
        data: data3,
    };
    
    
    const myChart = new Chart(
      document.getElementById('sgbBalance'),
      config
    );
    const myChart1 = new Chart(
        document.getElementById('sgbReward'),
        config1
      );
      const myChart2 = new Chart(
        document.getElementById('ftsoFee'),
        config2
      );
      const myChart3 = new Chart(
        document.getElementById('galaBalance'),
        config3
      );
}

fetchBalances()

