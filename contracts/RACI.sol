// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract RACI is ERC20, ERC20Permit, Ownable {

    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10 ** 18;

    // Конструктор выпускает фиксированное количество токенов на указанный адрес
    constructor(address initialHolder, address initialOwner)
        ERC20("RACI", "RACI")
        ERC20Permit("RACI")
        Ownable(initialOwner)
    {
        _mint(initialHolder, MAX_SUPPLY);
    }

    // Держатель может сжечь часть своих токенов, уменьшая общий supply
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
