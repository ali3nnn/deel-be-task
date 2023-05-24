// const express = require('express');
// const router = express.Router();
// const { Op } = require('sequelize');
// const { sequelize } = require('../model')
// const { getProfile } = require('../middleware/getProfile');
// const { isValidDate } = require('../utils');

// // POST /balances/deposit/:userId - Deposit money for client
// router.post('/deposit/:userId', getProfile, async (req, res) => {
//     const amount = Number(req.query.amount);
//     const { Job, Contract, Profile } = req.app.get('models');
//     const client = req.profile;
//     const { userId } = req.params

//     if (userId != client.id) {
//         return res.status(400).send('Incorrect user id');
//     }

//     if (!amount) {
//         return res.status(400).send('Invalid amount');
//     }

//     if (client.type === 'contractor') {
//         return res.status(400).send('You are not a client');
//     }

//     const unpaidJobs = await Job.findAll({
//         include: {
//             model: Contract,
//             as: 'Contract',
//             where: {
//                 status: 'in_progress',
//                 ClientId: client.id,
//             },
//         },
//         where: {
//             [Op.or]: [
//                 { paid: { [Op.or]: [null, false] } },
//             ],
//         },
//     });

//     if (!unpaidJobs.length) {
//         return res.status(200).send('Client has paid all their jobs');
//     }

//     const priceOfUnpaidJobs = unpaidJobs.reduce((acc, job) => {
//         return acc + job.price;
//     }, 0);

//     if (amount > priceOfUnpaidJobs * 0.25) {
//         return res.status(400).send({ err: "You cannot deposit more than 25% of your total jobs to pay" });
//     }

//     const t = await sequelize.transaction();
//     try {
//         await Profile.update(
//             {
//                 balance: client.balance + amount,
//             },
//             {
//                 where: {
//                     id: client.id,
//                 },
//                 transaction: t,
//             }
//         );

//         await t.commit();

//         res.status(200).send({
//             old_balance: client.balance,
//             new_balance: (await Profile.findOne({ where: { id: client.id } })).balance,
//         });
//     } catch (error) {
//         await t.rollback();
//         res.status(500).send(error);
//     }
// });

// module.exports = router;

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
        res.status(error.status || 500).send(error);
    }
});

module.exports = router;
