//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract Staking {
    mapping(address=>uint256) public stake;
    mapping(address=>uint256) public sZero;

    uint256 public sNow;
    IERC20  public immutable token;
    constructor(address _token) public  {
        token = IERC20(_token);
    }

    //function deposit(uint256 amount) public {
        
    //}

}
