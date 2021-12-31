const express = require('express')
require('dotenv').config()
const JSONdb = require('simple-json-db');
const cors = require('cors')
const getBalance = require("./assets/js/queryBalances")
const path = require('path');
const app = express()
const port = 3000

var db = new JSONdb(process.env.db);
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname)))
app.options('*', cors())

app.get('/getBalanceData', (req, resp) => {
    db = new JSONdb(process.env.db)
    resp.send(db.JSON())
})

app.post('/setBalanceData', (req, resp) => {
    console.log(req.body)
    var balance = req.body["galaBalance"]
    var msg = getBalance.main(balance).then(complete => {
        resp.send(complete)
    }).catch(error =>
        resp.send(error)
        )
})

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, "/balances.html"))
})

app.listen(port, () => {
    console.log('Listening on localhost:', port)
})