const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');


describe('Transaction Pool', () => {
    let transactionPool, wallet, transaction, blockchain;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        wallet = new Wallet();
        blockchain = new Blockchain();
        transaction = wallet.createTransaction('random-address', 30, blockchain, transactionPool);
    });

    it('adds a transaction to the pool', () => {
        expect(transactionPool.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transation in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);

        const newTransaction = transaction.update(wallet, 'foo-address', 40);
        transactionPool.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(transactionPool.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction)
    });

    it('clears transactions', () => {
       transactionPool.clear();
       expect(transactionPool.transactions).toEqual([]);
    });

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions;
        beforeEach(() => {
            validTransactions = [...transactionPool.transactions];

            for (let i = 0; i < 6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('foo-address', 30, blockchain, transactionPool);

                if (i%2 == 0) {
                    transaction.input.amount = 999999;
                } else {
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid and corrupt transactions', () => {
            expect(JSON.stringify(transactionPool.transactions)).not.toEqual(validTransactions);
        });

        it('grabs valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
    });

    describe('creating a reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it(`reward the miner's wallet`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD)
        });
    });
});