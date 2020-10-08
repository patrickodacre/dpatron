// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    // this is a "state" variable
    string public name = "DApp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    // MAPS
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;

    // events
    event TokensStaked(address indexed investor, uint amountStaked, uint newDaiBalance, uint newStakingBalance);
    event TokensUnstaked(address indexed investor, uint amountUnstaked, uint newDaiBalance, uint newStakingBalance);
    event TokensIssued(address indexed investor, uint amountIssued, uint newDappBalance);


    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // stakeTokens transfers tokens from the investor's wallet
    // and deposits them into this contract
    function stakeTokens(uint _amount) public {
        // all ERC20 tokens have a transferFrom method
        daiToken.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
            hasStaked[msg.sender] = true;
        }

        uint remainingDai = daiToken.balanceOf(msg.sender);

        emit TokensStaked(msg.sender, _amount, remainingDai, stakingBalance[msg.sender]);
    }

    // unstakeTokens reimburses the entire staking balance to the user.
    // We updated the hasStaked status, but we don't recreate the stakers array
    // as it is likely too costly to recreate the array.
    function unstakeTokens(uint _amount) public {
        uint currentBalance = stakingBalance[msg.sender];

        require(_amount <= currentBalance, "You cannot unstake more than you have staked.");

        stakingBalance[msg.sender] = stakingBalance[msg.sender] - _amount;

        if (stakingBalance[msg.sender] == uint(0)) {
            hasStaked[msg.sender] = false;
        }

        daiToken.transfer(msg.sender, _amount);

        uint newDaiBalance = daiToken.balanceOf(msg.sender);

        emit TokensUnstaked(msg.sender, _amount, newDaiBalance, stakingBalance[msg.sender]);
    }

    function issueTokens() public {
        require(msg.sender == owner, "Only the contract owner can issue tokens.");

        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];

            // just skip this investor if they
            // are no longer staked
            if (!hasStaked[recipient]) {
                continue;
            }

            uint amountIssued = stakingBalance[recipient];
            // 1:1 exchange
            dappToken.transfer(recipient, amountIssued);

            uint dappBalance = dappToken.balanceOf(recipient);

            emit TokensIssued(recipient, amountIssued, dappBalance);
        }
    }
}
