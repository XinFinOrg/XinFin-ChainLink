const adaptor = require('./index');

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 5000

app.use(bodyParser.json())

app.post('/', function (req, res) {
    adaptor.handler(req, res)
});

let listener = app.listen(port, function () {
    console.log("CryptoCompare External Adaptor listening on", listener.address().address + listener.address().port);
});

// app.listen(port, () => console.log(`Listening on port ${port}!`))


// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// app.post('/', function (req, res) {
//     adaptor.gcpservice(req, res)
// });

// let listener = app.listen(process.env.PORT, function () {
//     console.log("CryptoCompare External Adaptor listening on", listener.address().address + listener.address().port);
// });