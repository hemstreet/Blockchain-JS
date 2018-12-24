const { INITIAL_BALANCE } = require('../config');
const ChainUtility = require('../chain-utility');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtility.genKeyPair();
        // PublicKey is also known as the senders wallet address
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `
        Wallet -
            publicKey: ${this.publicKey.toString()}
            balance:   ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {

        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction
    }
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];

        blockchain.chain.forEach(block => {
           block.data.forEach(transaction => {
               transactions.push(transaction);
           });
        });

        const walletInputTransactions = transactions.filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0;

        // TODO to speed this up, traverse chain backwards and get first found

        if (walletInputTransactions.length > 0) {
            const recentInputTransaction = walletInputTransactions.reduce((previous, current) => {
                return previous.input.timestamp > current.input.timestamp ? previous : current;
            });

            balance = recentInputTransaction.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputTransaction.input.timestamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        // should this be publicKey?
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
}

module.exports = Wallet;