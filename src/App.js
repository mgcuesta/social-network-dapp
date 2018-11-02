import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import keythereum from 'keythereum';
import ethTx from 'ethereumjs-tx';
//import messagesABI from './Messages.js';

class App extends Component {
 constructor(props) {
    super(props);
    this.state = {isConnected: false,
            sms: 'Mensaje por defecto',
            smsGet: '',
            account: '',
            contractAddress: '0x959a5c9fb6def9c5fe772c1f46e8a2f769b0469d',
            from: '0xeD5D1cDE7Dd6E9A47D9cc83F8C8023332B82865f',
            to: '0x5ee1DCd6C0CcED39FFe44948bF1e9305716B2AA4'};
    //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    this.web3 = new Web3(Web3.givenProvider);
    this.handleChange = this.handleChange.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.handleGetMessage = this.handleGetMessage.bind(this);
    this.setState = this.setState.bind(this);
 }

   componentWillMount() {
// var erc20ABI = JSON.parse(fs.readFileSync(file+"DummyERC20.json"));
// var abi = erc20ABI.abi #essential
var messagesABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "messageStalingPerior",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastMsgIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "keys",
    "outputs": [
      {
        "name": "key",
        "type": "string"
      },
      {
        "name": "keyType",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "messages",
    "outputs": [
      {
        "name": "from",
        "type": "address"
      },
      {
        "name": "text",
        "type": "string"
      },
      {
        "name": "time",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_sender",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "_receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "message",
        "type": "string"
      }
    ],
    "name": "NewMessage",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_sender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_key",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "_keytype",
        "type": "string"
      }
    ],
    "name": "PublicKeyUpdated",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_text",
        "type": "string"
      }
    ],
    "name": "sendMessage",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "lastIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_who",
        "type": "address"
      }
    ],
    "name": "getLastMessage",
    "outputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_who",
        "type": "address"
      },
      {
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getMessageByIndex",
    "outputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_who",
        "type": "address"
      },
      {
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "newMessage",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_who",
        "type": "address"
      }
    ],
    "name": "getPublicKey",
    "outputs": [
      {
        "name": "_key",
        "type": "string"
      },
      {
        "name": "_keyType",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_key",
        "type": "string"
      },
      {
        "name": "_type",
        "type": "string"
      }
    ],
    "name": "setPublicKey",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
     if(this.web3 && this.web3.eth.net.isListening().then(console.log)) {
       this.setState({isConnected: true,
       messageContract: new this.web3.eth.Contract(messagesABI, this.state.contractAddress)
       });
       var self = this;
       //this.setState({account: this.web3.eth.getAccounts().then(function (acs) {this.state.account = acs[0]})});
       this.web3.eth.getAccounts().then(function (acs) {
            self.setState ( {account: acs[0]})
       });
     }
   }

     handleChange(event) {
       this.setState({sms: event.target.value});
     }

     handleGetChange(event) {

     }

     handleNewMessage(event) {

     var params = { keyBytes: 32, ivBytes: 16 };
     var dk = keythereum.create(params);
     console.log(dk);

     var options = {
       kdf: "pbkdf2",
       cipher: "aes-128-ctr",
       kdfparams: {
         c: 262144,
         dklen: 32,
         prf: "hmac-sha256"
       }
     };
     var keyObject = keythereum.dump('', dk.privateKey, dk.salt, dk.iv, options);
    const txParams = {
      nonce: '0x0',
      gasPrice: '0x0',
      gasLimit: '0xffffff',
      to: '0x959a5c9fb6def9c5fe772c1f46e8a2f769b0469d',
      value: '0x00',
      from: '0x'+keyObject.address,
      data: this.state.messageContract.methods.sendMessage(this.state.to, this.state.sms).encodeABI()
    };

    // Transaction is created
    const tx = new ethTx(txParams);

    // Transaction is signed
    tx.sign(Buffer.from(keyObject.crypto.ciphertext, 'hex'));
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    console.log(rawTx)

    this.web3.eth.sendSignedTransaction(rawTx, (_erro, _repo) => {
        console.log(_erro,_repo);
    });

//       console.log('try to send msg: '+ this.state.sms);
//       console.log('try to send from: '+ this.state.from);
//       console.log('try to send to: '+ this.state.to);
//       this.state.messageContract.methods.sendMessage(this.state.to, this.state.sms).send(
//       { from: this.state.from,
//         jsonInterface : messagesABI,
//          gas: 100000000,
//          gasPrice: '0'
//       });
       event.preventDefault();
     }

     handleGetMessage(event) {
       var self = this;
       this.state.messageContract.methods.getLastMessage(this.state.to).call()
           .then(
           function (response) {
             self.setState({smsGet: response[1]});
             return response[1];
           }
           );
       event.preventDefault();
     }

  render() {
      return (
      <div>
        <h2>Is connected?:</h2><br/>
        {this.state.isConnected?'Connected to local node':'Not Connected'}
        <h2>Your account: {this.state.account}</h2>
        <br/>
        <label>
          Message:
          <input type="text" value={this.state.sms} onChange={this.handleChange} />
        </label>
        <button onClick={this.handleNewMessage}> Sent Sms</button>
        <br/>
        <label>
          Message:
          <input type="text" value={this.state.smsGet} onChange={this.handleGetChange}/>
        </label>
        <button onClick={this.handleGetMessage}> Get Sms</button>

      </div>
         );
  }
}

export default App;
