// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RoastBattle {
    struct Battle {
        address challenger;
        address opponent;
        string challengerRoast;
        string opponentRoast;
        uint256 startTime;
        uint256 voteEndTime;
        bool finalized;
        address winner;
    }

    mapping(uint256 => Battle) public battles;
    uint256 public battleCount;

    event BattleCreated(uint256 indexed battleId, address indexed challenger, address indexed opponent);
    event RoastSubmitted(uint256 indexed battleId, address indexed participant, string roast);
    event BattleFinalized(uint256 indexed battleId, address indexed winner);

    function createBattle(address _opponent) external {
        battleCount++;
        battles[battleCount] = Battle(msg.sender, _opponent, "", "", block.timestamp, block.timestamp + 1 days, false, address(0));
        emit BattleCreated(battleCount, msg.sender, _opponent);
    }

    function submitRoast(uint256 _battleId, string memory _roast) external {
        Battle storage battle = battles[_battleId];
        require(msg.sender == battle.challenger || msg.sender == battle.opponent, "Not a participant");
        require(block.timestamp < battle.voteEndTime, "Battle ended");

        if (msg.sender == battle.challenger) {
            battle.challengerRoast = _roast;
        } else {
            battle.opponentRoast = _roast;
        }
        emit RoastSubmitted(_battleId, msg.sender, _roast);
    }

    function finalizeBattle(uint256 _battleId, address _winner) external {
        Battle storage battle = battles[_battleId];
        require(block.timestamp >= battle.voteEndTime, "Voting not ended");
        require(!battle.finalized, "Battle already finalized");

        battle.winner = _winner;
        battle.finalized = true;
        emit BattleFinalized(_battleId, _winner);
    }
}

