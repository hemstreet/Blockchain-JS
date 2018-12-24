const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2PServer {

    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({
            port: P2P_PORT
        });
        server.on('connection', (socket) => this.connectSocket(socket));


        this.connectToPeers();

        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    connectToPeers() {
        peers.forEach((peer) => {
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);
    }

    messageHandler(socket) {
        socket.on('message', (message) => {
            const json = JSON.parse(message);
            const data = json.data;
            switch(json.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
                default:
                    console.log(`Type: ${json.type} not supported`);
            }
        });
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction))
    }

    broadcastClearTransactions(socket) {
        const message = JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        });

        this.sockets.forEach(socket => socket.send(message));

    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            data: this.blockchain.chain
        }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            data: transaction
        }));
    }
}

module.exports = P2PServer;