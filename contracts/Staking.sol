//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "hardhat/console.sol";

contract Staking {
    uint256 public totalStake;
    mapping(address=>uint256) public stake;
    mapping(address=>uint256) public rewardsPerUnitZero;

    uint256 public rewardsPerUnitNow;

    uint256 public immutable  minDistribution;
    IERC20Metadata public immutable token; 
    uint256 public immutable precision;
 
    constructor(address _token, uint256 minAmount) {
        token = IERC20Metadata(_token);
        precision = 10**IERC20Metadata(_token).decimals();
        minDistribution = 10**IERC20Metadata(_token).decimals() * minAmount;
    }
    
    function distribute(uint256 amount) public {
        console.log("distribute address", msg.sender);
        console.log("distribute", amount);
        require(amount >= minDistribution, "Staking: Not enough to distribute");
        require(totalStake > 0, "Distribute: The deposit must be called before than destribute.");
        rewardsPerUnitNow = rewardsPerUnitNow + (amount * precision / totalStake);
        console.log("how much allowance", amount);
        token.transferFrom(msg.sender, address(this), amount);
    }

    function deposit(uint256 amount) public {
        console.log("deposit address", msg.sender);
        console.log("deposit", amount);
        uint256 rewards = rewardsOf(msg.sender);
        totalStake = totalStake + rewards + amount;
        stake[msg.sender] = stake[msg.sender] +amount + rewards;
        console.log("stake amount : ", stake[msg.sender]);
        console.log("stake amount : ", amount);
        console.log("stake amount : ", rewards);
        rewardsPerUnitZero[msg.sender] = rewardsPerUnitNow;
        token.transferFrom(msg.sender, address(this), amount);           
    }

    function unstake(uint256 amount) public {
        uint256 rewards = rewardsOf(msg.sender);
        uint256 staked = stake[msg.sender];
        require(amount <= staked + rewards, "Staking: not enough stake balance");
        totalStake = totalStake + rewards - amount;
        stake[msg.sender] = staked + rewards - amount;
        rewardsPerUnitZero[msg.sender] = rewardsPerUnitNow;
        token.transfer(msg.sender, amount);           
    }
    
    function withdrawableOf(address account) public view returns(uint256) {
        uint256 rewards = rewardsOf(account);
        return stake[account] + rewards;       
    }

    function rewardsOf(address account) public view returns(uint256) {
        uint256 rewardsPerUnit = rewardsPerUnitNow - rewardsPerUnitZero[account];
        return rewardsPerUnit * stake[account] / precision;
    }


}
