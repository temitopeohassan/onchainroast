// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Voting.sol";


contract VotingTest is Test {
    Voting voting;
    address voter = address(0x789);
    address participant1 = address(0x123);
    address participant2 = address(0x456);

    function setUp() public {
        voting = new Voting();
    }

    function testVote() public {
        vm.prank(voter);
        voting.castVote(1, participant1);
        assertEq(voting.voteCount(1, participant1), 1);
    }
}
