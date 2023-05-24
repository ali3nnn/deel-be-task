const express = require('express');
const router = express.Router();
const BalanceService = require('../services/BalanceService');

// POST /balances/deposit/:userId - Deposit money for client
// I assume anyone can do deposits for a client
router.post('/deposit/:userId', async (req, res) => {
    const amount = Number(req.body.amount);
    const { userId } = req.params;
    const models = req.app.get('models');
    try {
        const balanceService = new BalanceService(models);
        const result = await balanceService.deposit(userId, amount);
        res.status(200).send(result);
    } catch (error) {
        res.status(error.code).send(error.message);
    }
});

module.exports = router;
