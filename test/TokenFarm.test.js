const TokenFarm = artifacts.require('TokenFarm')
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const tokens = n => web3.utils.toWei(n, 'ether')

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    // init contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // Transfer all tokens to TokenFarm
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

    // Transfer 100 Mock DAI tokens to accounts[1]
    await daiToken.transfer(investor, '100000000000000000000', {
      from: owner
    })
  })

  describe('Mock Dai Deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp Token Deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    it('has received 1M tokens', async () => {
      const balance = await dappToken.balanceOf(tokenFarm.address)
      assert.equal(balance, tokens('1000000'))
    })

    it('Investor has received 100 Mock DAI tokens', async () => {
      const balance = await daiToken.balanceOf(investor)
      assert.equal(balance, tokens('100'))
    })
  })

  describe('Farming tokens', async () => {
    it('rewards investors who are staking mDai tokens', async () => {
      // Check investor balance before staking
      const investorInitialDaiBalance = await daiToken.balanceOf(investor)

      assert.equal(
        investorInitialDaiBalance.toString(),
        tokens('100'),
        'Investor Mock DAI wallet correct before staking'
      )

      // Approve spending of token from investor wallet to tokenFarm
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: investor
      })

      // Stake Mock DAI tokens
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      // check staking result
      const investorDaiTokenBalance = await daiToken.balanceOf(investor)
      assert.equal(
        investorDaiTokenBalance.toString(),
        tokens('0'),
        'Investor Mock DAI wallet balance correct after staking'
      )

      // check staking result
      const tokenFarmDaiBalance = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(
        tokenFarmDaiBalance.toString(),
        tokens('100'),
        'Token Farm Mock DAI balance correct after staking'
      )

      // check staking result
      const tokenFarmStakingBalance = await tokenFarm.stakingBalance(investor)
      assert.equal(
        tokenFarmStakingBalance.toString(),
        tokens('100'),
        'Token Farm Mock DAI balance correct after staking'
      )

      const investorIsStaking = await tokenFarm.isStaking(investor)
      assert.equal(
        investorIsStaking.toString(),
        'true',
        'Investor staking status is correct after staking'
      )

      const investorHasStaked = await tokenFarm.hasStaked(investor)
      assert.equal(
        investorHasStaked.toString(),
        'true',
        'Investor has staked status is correct after staking'
      )

      // Issue tokens
      await tokenFarm.issueTokens({ from: owner })

      // Ensure investor received tokens after issuing
      const investorBalanceAfterIssue = await dappToken.balanceOf(investor)
      assert.equal(
        investorBalanceAfterIssue.toString(),
        investorInitialDaiBalance.toString(),
        'Investor has received balance of dai equal to their staking balance'
      )

      // Ensure other people cannot issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor })

      // Check results after unstaking
      const investorDaiBalanceAfterUnstaking = await daiToken.balanceOf(
        investor
      )
      assert.equal(
        investorDaiBalanceAfterUnstaking.toString(),
        investorInitialDaiBalance.toString(),
        'Investor Mock DAI balance correct after unstaking'
      )

      // Check token farm balance is correct
      const tokenFarmDaiBalanceAfterUserUnstake = await daiToken.balanceOf(
        tokenFarm.address
      )
      assert.equal(
        tokenFarmDaiBalanceAfterUserUnstake.toString(),
        tokens('0'),
        'Token Farm Mock DAI balance correct after unstaking'
      )

      // Check user staking balance is 0 in token farm
      const tokenFarmStakingBalanceAfterUnstake = await tokenFarm.stakingBalance(
        investor
      )
      assert.equal(
        tokenFarmStakingBalanceAfterUnstake.toString(),
        tokens('0'),
        'Investor staking balance 0 after unstaking'
      )

      // Check user not staking anymore
      const tokenFarmUserIsStakingAfterUnstake = await tokenFarm.isStaking(
        investor
      )
      assert.equal(
        tokenFarmUserIsStakingAfterUnstake.toString(),
        'false',
        'Investor is not staking anymore in isStaking map after unstaking'
      )
    })
  })
})
