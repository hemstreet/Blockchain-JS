const ChainUtility = require('../chain-utility');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lashHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lashHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block -
            Timestamp:  ${this.timestamp}
            Last Hash:  ${this.lastHash.substring(0, 10)}
            Hash:       ${this.hash.substring(0, 10)}
            Nonce:      ${this.nonce}
            Difficulty: ${this.difficulty}
            Data:       ${this.data}`
    }

    static genesis() {
        return new this('Genesis time', '-----', '1st-hash', [], 0, DIFFICULTY);
    }

    static mineBlock(lastBlock, data) {
        let hash, timestamp;

        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        // Difficulty is the number of leading 0's in our hash, continue generating until we get a valid proof of work
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;
    }

    static hash(timestamp, lashHash, data, nonce, difficulty) {
        return ChainUtility.hash(`${timestamp}${lashHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;

        return Block.hash(timestamp, lastHash, data, nonce, difficulty)
    }
}

module.exports = Block;
