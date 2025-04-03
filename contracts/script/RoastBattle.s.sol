// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RoastBattle.sol";

contract DeployRoastBattle is Script {
    function run() external {
        vm.startBroadcast();
        RoastBattle battle = new RoastBattle();
        vm.stopBroadcast();
    }
}
