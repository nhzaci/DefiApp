pragma solidity ^0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
      dappToken = _dappToken;
      daiToken = _daiToken;
      owner = msg.sender;
    }

    function stakeTokens(uint _amount) public {
      // Require amount greater than 0
      require(_amount > 0, "amount cannot be 0");

      // Transfer Mock Dai tokens to this contract for staking
      daiToken.transferFrom(msg.sender, address(this), _amount);

      // Update Staking balance
      stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

      // Add user to staker array only if they haven't staked before
      if (!hasStaked[msg.sender]) {
        stakers.push(msg.sender);
      }

      // Update staking status
      hasStaked[msg.sender] = true;
      isStaking[msg.sender] = true;
    }

    // Issuing Tokens
    function issueTokens() public {
      // Only the owner can issue tokens
      require(msg.sender == owner, "Caller must be the owner");

      // Iterate through stakers and issue 1:1 balance of token to staking balance
      for (uint i = 0; i < stakers.length; i++) {
        address recipient = stakers[i];
        uint balance = stakingBalance[recipient];
        if (balance > 0) {
          dappToken.transfer(recipient, balance);
        }
      }
    }

    // Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
      // Fetch staking balance
      uint balance = stakingBalance[msg.sender];

      // Require amount greater than 0
      require(balance > 0, "Staking balance cannot be 0");

      // Transfer mock dai tokens to this contract for withdrawal
      daiToken.transfer(msg.sender, balance);

      // Reset staking balance
      stakingBalance[msg.sender] = 0;

      // Update staking status
      isStaking[msg.sender] = false;
    }
}
