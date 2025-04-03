// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Voting.sol";


contract DeployVoting is Script {
    function run() external {
        vm.startBroadcast();
        Voting voting = new Voting();
        vm.stopBroadcast();
    }
}

