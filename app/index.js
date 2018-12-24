const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2PServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2PServer(blockchain, transactionPool);
const miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

app.use(bodyParser.json());

const ROUTES = {
    blocks: '/blocks',
    mine: '/mine',
    mineTransactions: '/mine-transactions',
    transactions: '/transactions',
    transact: '/transact',
    publicKey: '/public-key'
};

app.get(ROUTES.blocks, (req, res) => {
   res.json(blockchain.chain);
});

app.post(ROUTES.mine, (req, res) => {
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    p2pServer.syncChains();

    res.redirect(ROUTES.blocks);
});

app.get(ROUTES.mineTransactions, (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect(ROUTES.blocks);
});


app.get(ROUTES.transactions, (req, res) => {
    res.json(transactionPool.transactions);
});

app.post(ROUTES.transact, (req, res) => {
    const { recipient, amount } = req.body;

    const transaction = wallet.createTransaction(recipient, amount, blockchain, transactionPool);

    p2pServer.broadcastTransaction(transaction);

    res.redirect(ROUTES.transactions);
});

app.get(ROUTES.publicKey, (req, res) => {
    res.json({
        publicKey: wallet.publicKey
    });
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

p2pServer.listen();