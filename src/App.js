import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/css/react-bootstrap-table.css';
import Dropdown from 'react-dropdown';
import './App.css';
import Web3 from 'web3';
import keythereum from 'keythereum';
import ethTx from 'ethereumjs-tx';
import { messagesABI } from './Messages.js';
import IpfsAPI from 'ipfs-api';
import logo from './images/social-network.png'
import EthCrypto from 'eth-crypto';
import {keys} from './accounts.js'
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      sms: 'Mensaje por defecto',
      account: '',
      contractAddress: '0x79b26b495e46632f4097b7f057306fd8ae47c6f2', //ropsten with add circle onlyeOwner and publicKey
      to: ''
    };
    this.web3 = new Web3(Web3.givenProvider);
    var self = this;
    this.web3.currentProvider.publicConfigStore.on('update', function (changed) {
      if (self.state.account !== changed.selectedAddress) {
        self.setState({ account: changed.selectedAddress })
        self.handleRefreshInbox();
        self.handleRefreshPublicInbox();
      }
    });
    this.handleRefreshInbox = this.handleRefreshInbox.bind(this)
    this.handleRefreshPublicInbox = this.handleRefreshPublicInbox.bind(this);
    this.handleNewPublicMessage = this.handleNewPublicMessage.bind(this);
  }

  async componentWillMount() {
    if (this.web3) {
      console.log("before");
      let listening;
      try {
        listening = await this.web3.eth.net.isListening();

        this.setState({
          isConnected: true,
          messageContract: new this.web3.eth.Contract(messagesABI, this.state.contractAddress),
          ipfs: IpfsAPI(
            {
              host: 'localhost',
              port: 5002,
              protocol: 'http',
              headers: {
                'Access-Control-Allow-Origin': '*'
              }
            }
          )
        });
        const accounts = await this.web3.eth.getAccounts();

        if (!accounts.length) {
          alert('Please, you need loggin in Metamask')
          return;
        }

        this.setState({ account: accounts[0].toLowerCase() })

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
    this.checkMetamak();

    try {
      var updateSms = []
      if (this.state.messageContract === undefined) {
        return;
      }
      const totalMessages = await this.state.messageContract.methods.lastIndex(this.state.account).call()
      var pos;
      for (pos = 1; pos <= totalMessages; pos++) {
        const message = await this.state.messageContract.methods.getMessageByIndex(this.state.account, pos).call()
        let messageText = message[1]
        let encryptedData
        try{
          encryptedData = EthCrypto.cipher.parse(messageText);
        }
        catch(e){
          console.log('Error al parsear el messageText')
        }
        try{
          const priv = keys[this.state.account]
          messageText = await EthCrypto.decryptWithPrivateKey(priv, encryptedData);
        }
        catch(e){
          console.log(e);
        }
        try {
          messageText = await this.state.ipfs.files.cat(messageText)
        }
        catch (e) {
          console.log('El mensaje no esta haseado: ' + messageText)
        }
        updateSms.push({ id: message[2], from: message[0].toLowerCase(), to: this.state.account, text: messageText })
      }
      this.setState({ dataSmsIn: updateSms })
    }
    catch (e) {
      alert('Unexpected error: ' + e)
    }

  }

  async handleRefreshPublicInbox() {
    this.checkMetamak();

    try {
      var updatePublicSms = []
      if (this.state.messageContract === undefined) {
        return;
      }
      const totalMessages = await this.state.messageContract.methods.lastCircleIndex().call()
      var pos;
      for (pos = 1; pos <= totalMessages; pos++) {
        const message = await this.state.messageContract.methods.getCircleMessageByIndex(pos).call()
        let messageText = message[1]
        try {
          messageText = await this.state.ipfs.files.cat(message[1])
        }
        catch (e) {
          console.log('El mensaje no esta cifrado: ' + messageText)
        }
        updatePublicSms.push({ id: message[2], from: message[0].toLowerCase(), text: messageText })
      }
      this.setState({ dataCircleSmsIn: updatePublicSms })
    }
    catch (e) {
      alert('Unexpected error: ' + e)
    }

  }

  async writeIpfs(text) {
    try {
      let content = this.state.ipfs.types.Buffer.from(text);
      let results = await this.state.ipfs.files.add(content);
      let hash = results[0].hash;
      return hash;
    }
    catch (e) {
      alert('Unexpected error: ' + e)
    }
  }

  handleNewMessage = async (event) => {

    this.checkMetamak();
    if (this.state.to === '') {
      alert('Please, select new receiver')
    }
    else {
      const hash = await this.writeIpfs(this.state.sms);
      const pub = await this.state.messageContract.methods.getPublicKey(this.state.to).call()
      const encryptedHash = await EthCrypto.encryptWithPublicKey(pub._key, hash);
      const encryptedCompress = EthCrypto.cipher.stringify(encryptedHash)
      this.state.messageContract.methods.sendMessage(this.state.to, encryptedCompress).send({ from: this.state.account });
    }
    event.preventDefault();
  }

  async handleNewPublicMessage(event) {

    this.checkMetamak();
    const hash = await this.writeIpfs(this.state.sms);
    this.state.messageContract.methods.sendCircleMessage(hash).send({ from: this.state.account });
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
    return keyObject;
  }

  _onSelectReceiver = (user) => {
    this.setState({ to: user.value });
  }

  checkMetamak() {
    if (this.state.account === '') {
      alert('Please, you need loggin in Metamask');
      return;
    }
  }

  render() {
    const options = [
      { value: '', label: 'Sent to' },
      { value: '0x99578382d949153736abc6717c357707adf9f42d', label: 'Alice - 0x99578382D949153736aBc6717c357707aDF9F42d' },
      { value: '0x9aed0a1447345c15254e95cb92a0fb514f9896ad', label: 'Bob - 0x9AeD0a1447345c15254e95CB92a0Fb514f9896ad' },
      { value: '0x6b3ddd067cbdd33fad8cf9992d57eb412d53759c', label: 'Frank - 0x6B3DdD067Cbdd33FAD8cF9992D57EB412D53759C' },
      { value: '0x7950dc9c0357dc283bca403ab4ae381c91e48a25', label: 'Anonymous- 0x7950dC9C0357Dc283bca403aB4AE381c91E48A25' }]
    return (
      <div>
        <div className="row">
          <div>
            <img src={logo} width="500" height="270" alt="Build the future" />
          </div>
        </div>
        <br/>
        <h1>Social Network DAPP</h1>
        <br />
        <label>Your account: <b>{this.state.account}</b></label>
        <br />
        <label>
          Message:{' '}
          <input type="text" value={this.state.sms} onChange={this.handleChange} />
        </label>
        <br />
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
        <br/>
        <button onClick={this.handleNewPublicMessage}> Sent Public Sms</button>
        <button onClick={this.handleRefreshPublicInbox}> Refresh Public Inbox</button>        
        <br />
        <div className="App">
          <p className="Table-header">Public Messages</p>
          <div>
            <BootstrapTable data={this.state.dataCircleSmsIn}>
              <TableHeaderColumn isKey dataField='id'>
                ID
          </TableHeaderColumn>
              <TableHeaderColumn dataField='from'>
                From
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
