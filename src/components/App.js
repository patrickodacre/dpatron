import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Main from './Main'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'

class App extends Component {

  constructor(props) {
    super(props)

      this.state = {
          account: null,
          daiToken: {},
          dappToken: {},
          tokenFarm: {},
          daiTokenBalance: '0',
          dappTokenBalance: '0',
          stakingBalance: '0',
          loading: true,
      }
  }

    loadEth = async () => {
        try {
            this.setState({loading: true})
            await this.loadWeb3()
            await this.loadData()
            await this.registerContractEventListeners()
            this.setState({loading: false})
        } catch (e) {
            this.setState({loading: false})
            console.error(e.message)
            alert('Failed to connect to the network.')
        }
    }

    loadData = async () => {
        const {web3} = window
        const [account] = await web3.eth.getAccounts()

        this.setState({account})

        const networkID = await web3.eth.net.getId()

        // DAI Token
        {
            const tokenData  = DaiToken.networks[networkID]
            if (tokenData && tokenData.address) {
                const daiToken = await new web3.eth.Contract(DaiToken.abi, tokenData.address)
                this.setState({daiToken})

                const balance = await daiToken.methods.balanceOf(this.state.account).call()
                this.setState({daiTokenBalance: balance.toString()})
            } else {
                throw new Error('DAI Token contract not deployed to the detected network.')
            }
        }

        // Dapp Token
        {
            const tokenData  = DappToken.networks[networkID]
            if (tokenData && tokenData.address) {
                const dappToken = await new web3.eth.Contract(DappToken.abi, tokenData.address)
                this.setState({dappToken})

                const balance = await dappToken.methods.balanceOf(this.state.account).call()
                this.setState({dappTokenBalance: balance.toString()})
            } else {
                throw new Error('Dapp Token contract not deployed to the detected network.')
            }
        }

        // Token Farm
        {
            const tokenData  = TokenFarm.networks[networkID]
            if (tokenData && tokenData.address) {
                const tokenFarm = await new web3.eth.Contract(TokenFarm.abi, tokenData.address)
                this.setState({tokenFarm})

                const balance = await tokenFarm.methods.stakingBalance(this.state.account).call()
                this.setState({stakingBalance: balance.toString()})
            } else {
                throw new Error('Token Farm contract not deployed to the detected network.')
            }
        }

    }

    loadWeb3 = async () => {
        // ethereum object is set by
        // https://eips.ethereum.org/EIPS/eip-1193
        // compliant providers like MetaMask
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (Web3 && Web3.currentProvider) {
            window.web3 = new Web3(Web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
            throw new Error('Non-Ethereum browser detected.')
        }
    }

    stakeTokens = async amount => {
        this.setState({ loading: true })

        this.state.daiToken.methods
            .approve(this.state.tokenFarm._address, amount)
            .send({ from: this.state.account })
            .on('transactionHash', (hash) => {
                this.state.tokenFarm.methods.stakeTokens(amount)
                    .send({ from: this.state.account })
                    .on('receipt', r => {
                        console.log('Staked tokens receipt: ', r)
                        this.setState({ loading: false })
                    })
                    .on('error', err => {
                        alert(err.message)
                        console.error(err)
                        this.setState({ loading: false })
                    })
            })
            .on('error', err => {
                console.error(err)
                this.setState({loading: false})
            })
    }

    unstakeTokens = async amount => {
        this.setState({loading: true})

        this.state.tokenFarm.methods
            .unstakeTokens(amount)
            .send({from: this.state.account})
            .on('receipt', r => {
                console.log('done unstaking tokens.')
                this.setState({loading: false})
            })
            .on('error', err => {
                console.error(err)
                this.setState({loading: false})
            })
    }

    registerContractEventListeners = async () => {
        this.state.tokenFarm.events.TokensStaked({filter: {address: this.state.account}})
            .on('data', ({returnValues}) => {

                this.setState({
                    stakingBalance: returnValues.newStakingBalance.toString(),
                    daiTokenBalance: returnValues.newDaiBalance.toString(),
                })
            })
            .on('error', err => {
                console.error(err)
                alert(err.message)
            })

        this.state.tokenFarm.events.TokensUnstaked({filter: {address: this.state.account}})
            .on('data', ({returnValues}) => {

                this.setState({
                    stakingBalance: returnValues.newStakingBalance.toString(),
                    daiTokenBalance: returnValues.newDaiBalance.toString(),
                })
            })
            .on('error', err => {
                console.error(err)
                alert(err.message)
            })

        this.state.tokenFarm.events.TokensIssued({filter: {address: this.state.account}})
            .on('data', ({returnValues}) => {

                console.log(`Issued ${returnValues.amountIssued} Dapp Tokens`)

                this.setState({
                    dappTokenBalance: returnValues.newDappBalance,
                })
            })
            .on('error', err => {
                console.error(err)
                alert(err.message)
            })
    }

  render() {

      const content = this.state.loading
            ? <div>You must connect with a wallet like MetaMask to use this site.</div>
            : <Main
                    daiTokenBalance={this.state.daiTokenBalance}
                    dappTokenBalance={this.state.dappTokenBalance}
                    stakingBalance={this.state.stakingBalance}
                    stakeTokens={this.stakeTokens}
                    unstakeTokens={this.unstakeTokens}
            />

    return (
      <div>
        <Navbar onLoadEth={this.loadEth} account={this.state.account}/>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '1000px' }}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
