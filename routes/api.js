"use strict;"

module.exports = function (app) {
  var contract = app.contract
  var web3 = app.web3

	app.get('/', (req, res) => res.send('Welcome to MOON token API'))

  // Create account
  app.post('/account', (req, res) => {
    var password = req.body.password

    web3.eth.personal.unlockAccount(web3.eth.coinbase, '111')
    .then( result => {
      return web3.eth.personal.newAccount(password)  
    })
    .then( (result) => {
      web3.eth.sendTransaction({from: web3.eth.coinbase, to: result, value: '100000000000000000'})
      res.send({
        success: true,
        address: result
      })
    })
  })

  app.get('/account/:address', (req, res) => {
    var address = req.params.address
    
    Promise.all([contract.methods.allowance(web3.eth.coinbase, address).call(), contract.methods.balanceOf(address).call()])
    .then( (results) => {
      res.send({
        "allowance": results[0],
        "balance": results[1]
      })
    })
  })

  app.post('/token/allowance/approve', (req, res) => {
    var to_address = req.body.to_address
    var amount = req.body.amount

    web3.eth.personal.unlockAccount(web3.eth.coinbase, '111')
    .then(function(result){
      contract.methods.approve(to_address, amount).send()
      .on('transactionHash', function(hash){
          res.send({
            tx: hash
          })
      })
    })
  })

  app.post('/token/allowance/reset', (req, res) => {
    var to_address = req.body.to_address
    var amount = req.body.amount

    web3.eth.personal.unlockAccount(web3.eth.coinbase, '111')
    .then(function(result){
      contract.methods.approve(to_address, 0).send()
      .on('transactionHash', function(hash){
          res.send({
            tx: hash
          })
      })
    })
  })

  app.post('/token/send', (req, res) => {
    var from_address = req.body.from_address
    var password = req.body.password

    var to_address = req.body.to_address
    var amount = req.body.amount

    web3.eth.personal.unlockAccount(from_address, password)
    .then(function(result){
      contract.methods.transfer(to_address, amount).send({from: from_address})
      .on('transactionHash', function(hash){
          res.send({
            tx: hash
          })
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber)
        console.log(receipt)
      })
    })
  })

  app.post('/token/give', (req, res) => {
    var from_address = req.body.from_address
    var password = req.body.password

    var to_address = req.body.to_address
    var amount = req.body.amount

    web3.eth.personal.unlockAccount(from_address, password)
    .then(function(result){
      contract.methods.transferFrom(web3.eth.coinbase, to_address, amount).send({from: from_address})
      .on('transactionHash', function(hash){
          res.send({
            tx: hash
          })
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber)
        console.log(receipt)
      })
    })
  })

  var accepted_subcommands = ['link', 'balance', 'give'];
  var accounts = {};

  loadAccounts();

	// Slack
  app.post('/slack_command', (req, res) => {
    console.log(req.body)
    
      var user_id = req.body.user_id;
      var text = req.body.text

      accepted_subcommands.forEach( s => {
        if (text.indexOf(s) == 0) {
          if (s === 'link') {
            linkSlackToETHAccount(user_id)
            .then( address => {
              res.send({
                text: 'Linked to address ' +  address
              })
            });
          }

          if (s === 'balance') {
            getBalance(user_id)
            .then( result => {
              var response = 'You have *' + result.balance + '* tokens and *' + result.eth + '* ETH\n*'+ result.allowance +'* available tokens for giving!'
              res.send({
                text: response
              })
            })
          }

          if (s === 'give') {
            var parts = text.split(' ');
            var amount = parts[2];
            var to_account_id = parts[1].substr(2, 9);

            if (!accounts[to_account_id]) {
              res.send({
                text: 'ETH address is not linked to this user!'
              })
              return;
            }

            giveToken(user_id, to_account_id, amount)
            .then( tx => {
              res.send({
                text: 'Sent! ' + tx
              })
            });
            
          }
        }
      })

    })

  function loadAccounts() {
    var fs = require('fs');
    var path = './accounts.json';
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        accounts = {}
        return;
      }
      accounts = JSON.parse(data);
    })
  }

  function syncAccounts() {
    var fs = require('fs');
    var path = './accounts.json';
    fs.writeFile(path, JSON.stringify(accounts), function(err) {
        if(err) {
            return console.log(err);
        }
    });
  }

  function linkSlackToETHAccount(user_id) {
    if (accounts[user_id]) {
      return Promise.resolve(accounts[user_id])
    }

    return saveAccount(web3.eth.accounts.create())
    .then( (account) => {

      accounts[user_id] = account.address;
      syncAccounts()

      // Add ETH for further transactions
      contract.methods.approve(account.address, 10000).send({
        from: web3.eth.coinbase, 
        gas: 2000000,
      });

      setTimeout( () => {
        web3.eth.sendTransaction({
          from: web3.eth.coinbase, 
          to: account.address, 
          value: '100000000000000000',
          gas: 2000000,
        });
      }, 30000)

      return Promise.resolve(account.address)
    })
  }

  function getBalance(user_id) {
    var address = accounts[user_id];

    return Promise.all([contract.methods.allowance(web3.eth.coinbase, address).call(), contract.methods.balanceOf(address).call(), web3.eth.getBalance(address)])
    .then( (results) => {
      return Promise.resolve({
        "allowance": results[0],
        "balance": results[1],
        "eth": results[2]
      })

    })
  }

  function giveToken(from_user_id, to_user_id, amount) {
    var from_address = accounts[from_user_id];
    var to_address = accounts[to_user_id];

    return unlockAccount(from_address, '111')
    .then(function(result){
      return new Promise( (resolve, reject) => {
        contract.methods.transferFrom(web3.eth.coinbase, to_address, amount).send({from: from_address, gas: 2000000})
        .on('transactionHash', function(hash){
            resolve(hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber)
          console.log(receipt)
        })
      })
    })
  }

  function saveAccount(account) {
    return new Promise((resolve, reject) => {
      var json = web3.eth.accounts.encrypt(account.privateKey, '111');

      var fs = require('fs');
      var path = './keystore/' + account.address;
      fs.writeFile(path, JSON.stringify(json), function(err) {
          if(err) {
              console.log(err);
              reject(err);
              return
          }

          resolve(account)
      });
    })
  }

  function unlockAccount(address, password) {
    // Check if address is inside wallet
    web3.eth.accounts.wallet.remove(address)

    return new Promise( (resolve, reject) => {
      var fs = require('fs');
      var path = './keystore/' + address.toString();

      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          reject(false)
          return;
        }
        var json = JSON.parse(data);
        var account = web3.eth.accounts.decrypt(json, '111');

        web3.eth.accounts.wallet.add(account)
        resolve(true)
      })
    })
  }
}