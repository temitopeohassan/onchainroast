// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RoastBattle.sol";

contract RoastBattleTest is Test {
    RoastBattle battle;
    address challenger = address(0x123);
    address opponent = address(0x456);

    function setUp() public {
        battle = new RoastBattle();
    }

    function testCreateBattle() public {
        vm.prank(challenger);
        battle.createBattle(opponent);
        (address c, address o,,,) = battle.battles(1);
        assertEq(c, challenger);
        assertEq(o, opponent);
    }

    function testSubmitRoast() public {
        vm.prank(challenger);
        battle.createBattle(opponent);
        vm.prank(challenger);
        battle.submitRoast(1, "Challenger's roast");
        (, , string memory cRoast,,) = battle.battles(1);
        assertEq(cRoast, "Challenger's roast");
    }
}

