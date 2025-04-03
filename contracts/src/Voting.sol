// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Vote {
        uint256 battleId;
        address voter;
        address votedFor;
    }
    
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voteCount;

    event VoteCast(uint256 indexed battleId, address indexed voter, address indexed votedFor);

    function castVote(uint256 _battleId, address _votedFor) external {
        require(!hasVoted[_battleId][msg.sender], "Already voted");
        hasVoted[_battleId][msg.sender] = true;
        voteCount[_battleId][_votedFor]++;
        emit VoteCast(_battleId, msg.sender, _votedFor);
    }

    function getWinner(uint256 _battleId) external view returns (address) {
        if (voteCount[_battleId][address(0)] > voteCount[_battleId][address(1)]) {
            return address(0);
        }
        return address(1);
    }
}
