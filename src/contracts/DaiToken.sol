// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DaiToken is ERC20 {

    constructor(uint256 initialSupply) public ERC20("Mock DAI Token", "mDAI") {
        _mint(msg.sender, initialSupply);
    }
}
