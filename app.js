function loadConfigs(env) {
    if (env == 'local') {
        return {
            rpc_endpoint: 'http://localhost:8545',
            contract_address: '0xcb755e3b8a7c1e43a2abbc0bd52d5957f9aa2715'
        }
    }
    else if (env == 'rinkeby') {
        return {
            rpc_endpoint: 'https://rinkeby.infura.io/O53EWpAKCdqS4vqwEusI',
            contract_address: '0xcb755e3b8a7c1e43a2abbc0bd52d5957f9aa2715'
        }
    }
    return {

    }
}


var configs = loadConfigs('rinkeby')
console.log('RPC Endpoint: ' + configs.rpc_endpoint)

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(configs.rpc_endpoint));

//0xab54a688a201efa8c1ca205b666f8c5c1299f684
var fs = require('fs');
var path = './keystore/UTC--2018-02-22T06-55-02.720109958Z--ab54a688a201efa8c1ca205b666f8c5c1299f684';
fs.readFile(path, 'utf8', (err, data) => {
  if (err) {
    return;
  }
  var json = JSON.parse(data);
  var account = web3.eth.accounts.decrypt(json, '111');

  web3.eth.accounts.wallet.add(account)
  web3.eth.coinbase = account.address

  // console.log(web3.eth.accounts.wallet)
})

// Moon token Smart contract
var CONTRACT_ADDRESS = configs.contract_address
var ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mintToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"tokenName","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"}]
var contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {
    from: web3.eth.coinbase
})

const cluster = require('cluster');
const numCPUs = 1

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {

        var env = {
            allowScheduleExternal: (i == 0 ? "true" : "false")
        };

        cluster.fork(env);
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ${worker.process.pid} died');
    });

} else {
    var express = require('express');
    var app = express();
    var server = require('http').Server(app);
    var path = require('path');

    var logger = require('morgan');
    var methodOverride = require('method-override');
    var lessMiddleware = require('less-middleware');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var errorHandler = require('errorhandler');
    var fs = require('fs');
    var compression = require('compression');

    var configs = require('./config.js')();
    app.use(logger(configs.MORGAN_LOG_FORMAT));

    var allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, token, Cache-Control');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.status(200).send();
        }
        else {
            next();
        }
    };

    process.env.TZ = 'UTC';

    app.set('port', process.env.PORT || 7777);
    app.use(allowCrossDomain);
    app.use(methodOverride());
    app.use(bodyParser.json({limit: '10mb'}));
    app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));
    app.use(multer());
    app.use(lessMiddleware(path.join(__dirname, '/public')));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(compression());

    if ('development' == app.get('env')) {
        app.use(errorHandler());
    }

    //Enable CORS
    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    app.contract = contract
    app.web3 = web3

    var apiv1 = require('./routes/api');
    apiv1(app);

    server.listen(app.get('port'), function () {
        console.log('Express server listening on port' + app.get('port'));
    });

    module.exports = app;
}

// web3.eth.personal.unlockAccount('0xab54a688a201efa8c1ca205b666f8c5c1299f684', '111')
// .then(function(result){
// 	contract.methods.balanceOf('0xab54a688a201efa8c1ca205b666f8c5c1299f684').call().then(console.log)
// 	contract.methods.transfer('0x4c7552d44cde0e35cd827eb40c1ca57284505d67', 1000000).send().then(console.log)	
// })

// const EthereumTx = require('ethereumjs-tx')
// Another the way to execute Smart contract, by usung private key to sign transaction and sendRawTransaction
// const privateKey = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex')
// var data = web3.eth.abi.encodeFunctionCall({
// 		"constant": false,
// 		"inputs": [],
// 		"name": "deploy",
// 		"outputs": [],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	}, []);

// const txParams = {
//   nonce: '0x01',
//   gasPrice: '0x098bca5a00', 
//   gasLimit: '0x16bb49',
//   from: '0x627306090abab3a6e1400e9345bc60c78a8bef57',
//   to: '0xb9a219631aed55ebc3d998f17c3840b7ec39c0cc', 
//   value: '0x00', 
//   data: data,
//   chainId: 5777
// }

// const tx = new EthereumTx(txParams)
// tx.sign(privateKey)
// const serializedTx = tx.serialize()

// web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
// .on('receipt', console.log);

