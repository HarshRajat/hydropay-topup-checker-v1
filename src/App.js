import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'

const BigNumber = require("bignumber.js");
var web3;

let tokenAddress = "0xebbdf302c940c6bfd49c6b165f457fdb324649bc"
var abi = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]

window.addEventListener('load', async () => {

});

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {  
    web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    web3.eth.getAccounts().then(console.log);

    //const testnet = 'https://mainnet.infura.io/v3/270b3572338f47809a391c21e45310af';
    //web3 = new Web3(new Web3.providers.HttpProvider(testnet));

    const accounts = await web3.eth.getAccounts()
    //console.log("here: " + accounts[0]);

    var amount =  8060;
    var ein = 7328;

    const amt = new BigNumber(amount).mul('1e18').toString(10)
    const data = '0x' + new BigNumber(ein).toString(16).padStart(64, "0")
    this.setState({ account: accounts[0], amount: amt, data: data, numWallets: -1 })
  }

  loadWallets() {
    var wallets = [];

    fetch('wallets.txt')
    .then((r) => r.text())
    .then(info  => {

      info.split('\n').map((item, i) => {
        wallets.push(item);
        //console.log(item);
      });

      this.setState({numWallets: wallets.length, walletsLoaded: true, loadedWallets: wallets});
    })

  };

  async doWalletChecks(){
    // console.log("here");
    // console.log(this.state.loadedWallets);

    var wallets = this.state.loadedWallets;
    var contract = new web3.eth.Contract(abi, tokenAddress)

    for( var i = 0; i < wallets.length; ++i ) { //wallets.length
      var info = await this.getBalance(wallets[i], contract);
      const list = this.state.checkedWallets.concat(info);
      this.setState({checkedWallets: list});

      if (info != null) {
        const aclist = this.state.actualWallets.concat(info);
        this.setState({actualWallets: aclist});
      }
    }
  };

  async getBalance(wallet, contract) {
      //console.log(wallet);
      var info = null;

      // Get ERC20 Token contract instance
      var balance = 0;

      // Call balanceOf function
      await contract.methods.balanceOf(wallet).call(function(err,res){
          if(!err){
              balance = web3.utils.fromWei(res, 'ether');
          } else {
              //console.log(err);
          }
      });

      if (balance > 0) {
        info = {};

        info.wallet = wallet;
        info.bal = balance;

        if (balance >= 5000) {
          info.msg = "Valid Topup";
          info.num = 1;
        }
        else {
          info.msg = "Insufficient Balance";
          info.num = 2;
        }

        console.log(info);
        // const list = this.state.checkedWallets.concat(info);
        // this.setState({checkedWallets: list});
      }

      return info;
  }

  constructor(props) {
    super(props)
    this.state = ({ account: 'Loading', amount: 'Calculating', data: 'Loading', numWallets: -1, walletsLoaded:false , loadedWallets: null, checkedWallets: [], actualWallets: [] })

    this.loadWallets = this.loadWallets.bind(this); 
    this.doWalletChecks = this.doWalletChecks.bind(this);
  }

  render() {
    return (
      <div className="container">
        <p>Your account: {this.state.account}</p>
        <p>Amount: {this.state.amount}</p>
        <p>EIN: {this.state.data}</p>
        <hr></hr>
        { 
            (this.state.numWallets == -1)?( 
            <WalletsLoading clickFunc={this.loadWallets} numberOfWallets={this.state.numWallets} />
            ) : ( 
            <DoWalletsChecks clickFunc={this.doWalletChecks} numberOfWallets={this.state.numWallets} />
            ) 
        } 
        <hr></hr>
        <CheckingWallets checkedWallets={this.state.checkedWallets} totalWallets={this.state.numWallets} actualWallets={this.state.actualWallets}/>
        <hr></hr>
      </div>
    );
  }
}

const CheckingWallets = (props) => {
  const wallets = props.actualWallets;
  const totalWalletsNum = props.totalWallets;
  const checkWalletsNum = props.checkedWallets.length;

  var walletinfo;
  var content;

  // for (walletinfo in wallets) {
  //   //content = content + "<p>Wallet: " + walletinfo.wallet + "</p>";
  //   console.log("Wallet:" + walletinfo);
  // }
  // console.log(wallets);
  wallets.forEach((element, index, array) => {
    // console.log(element.wallet); // 100, 200, 300
    // console.log(index); // 0, 1, 2

    content = content + "<p>Wallet: " + element.wallet + "</p>";
});

  if (checkWalletsNum > 0) {
    return (
      <p>Checking Wallets: {checkWalletsNum} / {totalWalletsNum}</p>
    );
  }
  else {
    return null;
  }
};


const WalletsLoading = (props) => {
  const numberOfWallets = props.numberOfWallets;
  if (numberOfWallets == -1) {
    return (
      <button onClick={props.clickFunc}>
        Load Wallets!
      </button>
    );
  }
  else {
    return (
      <button>
        Processing...
      </button>
    );
  }
};

const DoWalletsChecks = (props) => {
  return (
    <button onClick={props.clickFunc}>
      Check {props.numberOfWallets} Wallets Now!
    </button>
  );
}

export default App;