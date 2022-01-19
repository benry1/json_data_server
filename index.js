const express = require('express')
require('dotenv').config()
const JSONdb = require('simple-json-db');
const cors = require('cors')
const getBalance = require("./assets/js/queryBalances")
const path = require('path');
const https = require('https');
const http  = require('http');
const fs = require('fs');
const app = express()
const port = 3000

var pkey = fs.readFileSync('./selfsigned.key', 'utf8');
var pcrt = fs.readFileSync('./selfsigned.crt', 'utf8');

var db = new JSONdb(process.env.db);
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname)))
app.options('*', cors())

app.get('/getBalanceHistory', (req, resp) => {
    db = new JSONdb(process.env.db)
    resp.send(db.JSON())
})

app.get('/getBalanceData', (req, resp) => {
    var msg = getBalance.readCurrentBalances().then(complete => {
        resp.send(complete)
    }).catch(error => 
        resp.send(error)
    )
})

app.post('/setBalanceData', (req, resp) => {
    console.log(req.body)
    var balance = req.body["galaBalance"]
    var msg = getBalance.setBalanceData(balance).then(complete => {
        resp.send(complete)
    }).catch(error =>
        resp.send(error)
        )
})

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, "/balances.html"))
})

var secureServer = https.createServer({key: pkey, cert: pcrt}, app)

secureServer.listen(port + 1, () => {
    console.log('Listening on localhost:', port + 1)
})

app.listen(port, () => {
	console.log("Http is listening too!", port)
})
