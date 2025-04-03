// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Rewards is ERC721 {
    uint256 public tokenId;
    mapping(uint256 => address) public battleWinners;
    
    constructor() ERC721("RoastChampion", "ROAST") {}

    function mintNFTWinner(uint256 _battleId, address _winner) external {
        tokenId++;
        _mint(_winner, tokenId);
        battleWinners[_battleId] = _winner;
    }
}
