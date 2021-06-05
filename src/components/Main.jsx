import React, { useRef } from 'react'
import dai from '../dai.png'

const Main = ({
  data: {
    stakingBalance,
    dappTokenBalance,
    daiTokenBalance,
    stakeTokens,
    unstakeTokens
  }
}) => {
  const inputRef = useRef(undefined)

  const balanceTable = () => (
    <table className="table table-borderless text-muted text-center">
      <thead>
        <tr>
          <th scope="col">Staking Balance</th>
          <th scope="col">Reward Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {window.web3.utils.fromWei(stakingBalance.toString(), 'Ether')} mDAI
          </td>
          <td>
            {window.web3.utils.fromWei(dappTokenBalance.toString(), 'Ether')}{' '}
            DAPP
          </td>
        </tr>
      </tbody>
    </table>
  )

  const mainCard = () => (
    <div className="card mb-4">
      <div className="card-body">
        <form
          className="mb-3"
          onSubmit={event => {
            event.preventDefault()
            let amount
            amount = inputRef.current.value.toString()
            amount = window.web3.utils.toWei(amount, 'Ether')
            stakeTokens(amount)
          }}
        >
          <div>
            <label className="float-left">
              <b>Stake Tokens</b>
            </label>
            <span className="float-right text-muted">
              Balance: {window.web3.utils.fromWei(daiTokenBalance, 'Ether')}
            </span>
          </div>
          <div className="input-group mb-4">
            <input
              type="text"
              ref={inputRef}
              className="form-control form-control-lg"
              placeholder="0"
              required
            />
            <div className="input-group-append">
              <div className="input-group-text">
                <img src={dai} height="32" alt="" />
                &nbsp;&nbsp;&nbsp; mDAI
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            STAKE!
          </button>
        </form>
        <button
          type="submit"
          className="btn btn-link btn-block btn-sm"
          onClick={event => {
            event.preventDefault()
            unstakeTokens()
          }}
        >
          UN-STAKE...
        </button>
      </div>
    </div>
  )

  return (
    <div className="mt-3">
      {balanceTable()}
      {mainCard()}
    </div>
  )
}

export default Main
