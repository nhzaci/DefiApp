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
      let result

      // Check investor balance before staking
      result = await daiToken.balanceOf(investor)

      assert.equal(
        result.toString(),
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
    })
  })
})
