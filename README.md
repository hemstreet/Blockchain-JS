Blockchain in javascript
=

Setup
===
* `npm install`

Running
===
* `npm start` ( optional env variables can be passed to configure more peers)
> HTTP_PORT=3003;P2P_PORT=5003;PEERS=ws://localhost:5001
>> Peers is a comma separated list that defines existing peers. When a peer is added, it will sync it's connection string to existing peers

Bugs
===
* syncing transactions across peers ( when updating transactions to have more outputs ). Changes do not sync

Improvements
===

* A GET ‘/balance’ endpoint that allows the user to calculate their balance based on the blockchain, and view it at any time.

* Add transaction fees for each user, of 1 currency. Include these fees as part of the reward for the miner.

* Develop a frontend, where a user can see every fellow user’s public addresses, and send currency to the individual. This frontend could show the current difficulty of the system. It could have buttons for mining the transactions, or viewing the blockchain data.

* An implementation where the Miner’s mine() function only grabs a group of the transactions, and not the entire pool. When the subset of transactions from the pool is included in the chain, they would need to be cleared from the pool, and synchronized across all miners.

* Route the blockchain-approved reward transactions through its own dedicated server. That way, not everyone can create transactions through the special blockchain wallet.