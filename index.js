const express = require('express')
require('dotenv').config()
const JSONdb = require('simple-json-db');
const cors = require('cors')
const getBalance = require("./queryBalances")
const app = express()
const port = 3000

var db = new JSONdb(process.env.db);
app.use(express.json());
app.use(cors())
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

app.listen(port, () => {
    console.log('Listening on localhost:${port}')
})