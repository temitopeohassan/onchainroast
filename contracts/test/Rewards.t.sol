// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Rewards.sol";


contract RewardsTest is Test {
    Rewards rewards;
    address winner = address(0x123);

    function setUp() public {
        rewards = new Rewards();
    }

    function testMintNFT() public {
        vm.prank(address(this));
        rewards.mintNFTWinner(1, winner);
        assertEq(rewards.ownerOf(1), winner);
    }
}
