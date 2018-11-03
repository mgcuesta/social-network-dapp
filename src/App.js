import React, { Component } from 'react';
import { Button, Table, ListGroupItem, ListGroup } from 'react-bootstrap';
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem';
import './App.css';
import Web3 from 'web3';
import keythereum from 'keythereum';
import ethTx from 'ethereumjs-tx';
import { messagesABI } from './Messages.js';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      sms: 'Mensaje por defecto',
      smsGet: '',
      account: '',
      contractAddress: '0x959a5c9fb6def9c5fe772c1f46e8a2f769b0469d',
      from: '0xeD5D1cDE7Dd6E9A47D9cc83F8C8023332B82865f',
      to: '0x5ee1DCd6C0CcED39FFe44948bF1e9305716B2AA4'
    };
    //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    this.web3 = new Web3(Web3.givenProvider);
    this.handleChange = this.handleChange.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.handleGetMessage = this.handleGetMessage.bind(this);
    this.setState = this.setState.bind(this);
  }

  componentWillMount() {
    if (this.web3 && this.web3.eth.net.isListening().then(console.log)) {
      this.setState({
        isConnected: true,
        messageContract: new this.web3.eth.Contract(messagesABI, this.state.contractAddress)
      });
      var self = this;
      //this.setState({account: this.web3.eth.getAccounts().then(function (acs) {this.state.account = acs[0]})});
      this.web3.eth.getAccounts().then(function (acs) {
        self.setState({ account: acs[0] })
      });
    }
  }

  handleChange(event) {
    this.setState({ sms: event.target.value });
  }

  handleGetChange(event) {

  }

  handleNewMessage(event) {
    /* definition of an Object */
    var Account = function (address, privateKey) {
      this.address = address;
      this.privateKey = privateKey;
      return this;
    };

    var accounts = [new Account('0x59ebd6d3e83d6933e140913a34f296254490022c', '7de472733d1c3e247c48a3150f634df12eff1e4e09cc431d91aad4681f6c6016'),
    new Account('0x25deaf3503595d6517d079bee4b08ab6506f291d', '0427a6434cb8cfe49d7ba43eb194f94e9717617b83515be6c8188f34ef5ce840')
    ];

    // const alice = {address: '0x59ebd6d3e83d6933e140913a34f296254490022c', privateKey: '7de472733d1c3e247c48a3150f634df12eff1e4e09cc431d91aad4681f6c6016'};


    //var keyObject = this.createAccount();
    //const rawTx = this.createTx(keyObject.address, keyObject.crypto.ciphertext);
    const rawTx = this.createTx(accounts[0].address, accounts[0].privateKey);

    this.web3.eth.sendSignedTransaction(rawTx, (_erro, _repo) => {
      console.log(_erro, _repo);
    });

    event.preventDefault();
  }

  createTx(address, privateKey) {
    const txParams = {
      nonce: '0x0',
      gasPrice: '0x0',
      gasLimit: '0xffffff',
      to: this.state.contractAddress,
      value: '0x00',
      from: address,
      data: this.state.messageContract.methods.sendMessage(this.state.to, this.state.sms).encodeABI()
    };

    // Transaction is created
    const tx = new ethTx(txParams);

    // Transaction is signed
    tx.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = tx.serialize();
    const rawTx = '0x' + serializedTx.toString('hex');
    console.log(rawTx);
    return rawTx;
  }

  createAccount() {
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
    console.log('private key: ', keyObject.privateKey);
    console.log('address: ', '0x' + keyObject.address);
    console.log(Buffer.from(keyObject.crypto.ciphertext, 'hex'));
    console.log(keyObject.crypto.ciphertext);
    return keyObject;
  }

  sendMessageUsingMetamask() {
    //       console.log('try to send msg: '+ this.state.sms);
    //       console.log('try to send from: '+ this.state.from);
    //       console.log('try to send to: '+ this.state.to);
    //       this.state.messageContract.methods.sendMessage(this.state.to, this.state.sms).send(
    //       { from: this.state.from,
    //         jsonInterface : messagesABI,
    //          gas: 100000000,
    //          gasPrice: '0'
    //       });    
  };

  handleGetMessage(event) {
    var self = this;
    this.state.messageContract.methods.getLastMessage(this.state.to).call()
      .then(
        function (response) {
          self.setState({ smsGet: response[1] });
          return response[1];
        }
      );
    event.preventDefault();
  }


  render() {
    return (
      <div>
        <h2>Is connected?:</h2><br />
        {this.state.isConnected ? 'Connected to local node' : 'Not Connected'}
        <h2>Your account: {this.state.account}</h2>
        <br />
        From:
        <ListGroup>
          <ListGroupItem>Alice</ListGroupItem>
          <ListGroupItem>Bob</ListGroupItem>
          <ListGroupItem>Frank</ListGroupItem>
        </ListGroup>;
        <label>
          Message:
          <input type="text" value={this.state.sms} onChange={this.handleChange} />
        </label>
        <button onClick={this.handleNewMessage}> Sent Sms</button>
        <br />
        <label>
          Message:
          <input type="text" value={this.state.smsGet} onChange={this.handleGetChange} />
        </label>
        <button onClick={this.handleGetMessage}> Get Sms</button>
        <br />
        <Button variant="primary">Primary</Button>
        <br/>
        <DropdownButton
          bsStyle="primary"
          title="From"
          id="dropdown-size-large"
       
        >
          <MenuItem eventKey="1">Alice</MenuItem>
          <MenuItem eventKey="2">Bob</MenuItem>
          <MenuItem eventKey="3" active>Active Item</MenuItem>
        </DropdownButton>
        <Table responsive>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice</td>
              <td>Bob </td>
              <td>Thanks you for your tech talk</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default App;
