import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'

const App = () => {
  const [account, setAccount] = useState('0x0')
  const [daiToken, setDaiToken] = useState({})
  const [tokenFarm, setTokenFarm] = useState({})
  const [dappToken, setDappToken] = useState({})
  const [daiTokenBalance, setDaiTokenBalance] = useState('0')
  const [dappTokenBalance, setDappTokenBalance] = useState('0')
  const [stakingBalance, setStakingBalance] = useState('0')
  const [loading, setLoading] = useState(true)

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      )
    }
  }

  const getBlockchainData = async () => {
    const web3 = window.web3
    const [account] = await web3.eth.getAccounts()
    setAccount(account)

    const networkId = await web3.eth.net.getId()

    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      setDaiToken(daiToken)
      const daiTokenBalance = await daiToken.methods.balanceOf(account).call()
      setDaiTokenBalance(daiTokenBalance.toString())
    } else {
      alert('DaiToken contract yet to be deployed to network')
    }

    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      )
      setDappToken(dappToken)
      const dappTokenBalance = await dappToken.methods.balanceOf(account).call()
      setDappTokenBalance(dappTokenBalance.toString())
    } else {
      alert('SetDappToken contract yet to be deployed to network')
    }

    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      )
      setTokenFarm(tokenFarm)
      const stakingBalance = await tokenFarm.methods
        .stakingBalance(account)
        .call()
      setStakingBalance(stakingBalance.toString())
    } else {
      alert('TokenFarm contract yet to be deployed to network')
    }

    setLoading(false)
  }

  const stakeTokens = amount => {
    setLoading(true)
    daiToken.methods
      .approve(tokenFarm._address, amount)
      .send({ from: account })
      .on('transactionHash', hash => {
        tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: account })
          .on('transactionHash', hash => {
            setLoading(false)
          })
      })
  }

  const unstakeTokens = amount => {
    setLoading(true)
    tokenFarm.methods
      .unstakeTokens()
      .send({ from: account })
      .on('transactionHash', hash => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadWeb3()
    getBlockchainData()
  }, [])

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: '600px' }}
          >
            <div className="content mr-auto ml-auto">
              {loading ? (
                <p className="text-center">Loading...</p>
              ) : (
                <Main
                  data={{
                    stakingBalance,
                    daiTokenBalance,
                    dappTokenBalance,
                    stakeTokens,
                    unstakeTokens
                  }}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
