// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Rewards.sol";

contract DeployRewards is Script {
    function run() external {
        vm.startBroadcast();
        Rewards rewards = new Rewards();
        vm.stopBroadcast();
    }
}
