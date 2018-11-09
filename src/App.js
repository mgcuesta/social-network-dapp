import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/css/react-bootstrap-table.css'
import Dropdown from 'react-dropdown'
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
      selectedReceiver: '',
      contractAddress: '0x3fDda2392D89765946F89Af93F21be3E5C487EF1',
      to: '0x9AeD0a1447345c15254e95CB92a0Fb514f9896ad'
    };
    //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    this.web3 = new Web3(Web3.givenProvider);
    this.handleRefreshInbox = this.handleRefreshInbox.bind(this)
  }

  async componentWillMount() {
    if (this.web3) {
      console.log("before");
      let listening;
      try {
        listening = await this.web3.eth.net.isListening();

        this.setState({
          isConnected: true,
          messageContract: new this.web3.eth.Contract(messagesABI, this.state.contractAddress)
        });
        const accounts = await this.web3.eth.getAccounts();

        if (!accounts.length) {
          console.log("haz login capullo");
          return;
        }

        this.setState({ account: accounts[0] })

      } catch (e) {
        console.log("error", e);
      }
      console.log(listening);


    }
  }

  handleChange = (event) => {
    this.setState({ sms: event.target.value });
  }

  async handleRefreshInbox() {
    var updateSms = []
    // alert(addresses[user.value]);
    const totalMessages = await this.state.messageContract.methods.lastIndex(this.state.account).call()
    var pos;
    for (pos = 1; pos <= totalMessages; pos++) {
      // alert('post: ' + pos);
      const message = await this.state.messageContract.methods.getMessageByIndex(this.state.account, pos).call()
      //alert('message: '+message[1])
      this.setState({ smsGet: message[1] });
      updateSms.push({ id: message[2], from: message[0], to: this.state.account, text: message[1] })
      this.setState({ dataSmsIn: updateSms })
    }

  }

  handleNewMessage = (event) => {

    // const alice = {address: '0x59ebd6d3e83d6933e140913a34f296254490022c', privateKey: '7de472733d1c3e247c48a3150f634df12eff1e4e09cc431d91aad4681f6c6016'};


    //var keyObject = this.createAccount();
    //const rawTx = this.createTx(keyObject.address, keyObject.crypto.ciphertext);
    //const rawTx = this.createTx(accounts[0].address, accounts[0].privateKey);

    // this.web3.eth.sendSignedTransaction(rawTx, (_erro, _repo) => {
    //   console.log(_erro, _repo);
    // });
    //alert('acc: ',this.web3.eth.accounts[0])
    if (this.state.selectedReceiver === '') {
      alert('Please, select new receiver')
    }
    else {
      this.state.messageContract.methods.sendMessage(this.state.to, this.state.sms).send({ from: this.state.account });
    }
    event.preventDefault();
  }

  createTx = (address, privateKey) => {
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

  createAccount = () => {
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

  _onSelectReceiver = (user) => {
    this.setState({ selectedReceiver: user.value });
    //alert(user.value );
  }

  handleGetMessage = (event) => {
    var self = this;
    this.state.messageContract.methods.getLastMessage(this.state.account).call()
      .then(
        function (response) {
          self.setState({ smsGet: response[1] });
          return response[1];
        }
      );
    event.preventDefault();
  }


  render() {
    const options = [
      { value: '', label: 'Sent to' },
      { value: '0x99578382D949153736aBc6717c357707aDF9F42d', label: 'Alice - 0x99578382D949153736aBc6717c357707aDF9F42d' },
      { value: '0x9AeD0a1447345c15254e95CB92a0Fb514f9896ad', label: 'Bob - 0x9AeD0a1447345c15254e95CB92a0Fb514f9896ad' },
      { value: '0x6B3DdD067Cbdd33FAD8cF9992D57EB412D53759C', label: 'Frank - 0x6B3DdD067Cbdd33FAD8cF9992D57EB412D53759C' },
      { value: '0x7950dC9C0357Dc283bca403aB4AE381c91E48A25', label: 'Anonymous- 0x7950dC9C0357Dc283bca403aB4AE381c91E48A25' }]
    return (
      <div>
        <h2>Your account: {this.state.account}</h2>
        <br />
        <label>
          Message:{' '}
          <input type="text" value={this.state.sms} onChange={this.handleChange} />
        </label>
        <br/>
        <Dropdown options={options} onChange={this._onSelectReceiver} value={options[0]} placeholder="Select an option" />
        <br />
        <button onClick={this.handleNewMessage}> Sent Sms</button>
        <button onClick={this.handleRefreshInbox}> Refresh Inbox</button>
        <br />
        <div className="App">
          <p className="Table-header">Private Messages</p>
          <div>
            <BootstrapTable data={this.state.dataSmsIn}>
              <TableHeaderColumn isKey dataField='id'>
                ID
          </TableHeaderColumn>
              <TableHeaderColumn dataField='from'>
                From
          </TableHeaderColumn>
              <TableHeaderColumn dataField='to'>
                To
          </TableHeaderColumn>
              <TableHeaderColumn dataField='text'>
                Text
          </TableHeaderColumn>
            </BootstrapTable>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
