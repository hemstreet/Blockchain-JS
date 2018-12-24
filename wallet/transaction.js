const ChainUtility = require('../chain-utility');
const { MINING_REWARD } = require('../config');

class Transaction {
    constructor() {
        this.id = ChainUtility.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        // Is the new amount wanting to be sent more than the current balance in the senders wallet?
        if (amount > senderOutput.amount) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;

        this.outputs.push({
            amount,
            address: recipient
        });

        // Resign transaction because we have modified the data
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount) {

        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        return Transaction.transactionWithOutputs(senderWallet, [
            {
                amount: senderWallet.balance - amount,
                address: senderWallet.publicKey
            },
            {
                amount,
                address: recipient
            }
        ]);
    }

    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD,
            address: minerWallet.publicKey
        }]);
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtility.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtility.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtility.hash(transaction.outputs)
        );
    }
}

module.exports = Transaction;