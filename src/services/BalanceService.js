const { Op } = require('sequelize');
const { sequelize } = require('../model');
const HttpError = require('../HttpError');

class BalanceService {
    constructor(models) {
        this.models = models;
    }

    async deposit(userId, amount) {
        const { Job, Contract, Profile } = this.models;

        const result = await sequelize.transaction(async (t) => {
            const client = await Profile.findByPk(userId);

            if (!client || client.type === 'contractor') {
                throw new HttpError(400, 'Invalid user')
            }

            if (!amount) {
                throw new HttpError(400, 'Invalid amount')
            }

            const unpaidAmount = await Job.sum('price', {
                where: {
                    [Op.or]: [
                        { paid: { [Op.or]: [null, false] } },
                    ],
                },
                include: {
                    model: Contract,
                    required: true,
                    attributes: [],
                    where: {
                        status: 'in_progress',
                        ClientId: client.id,
                    },
                },
            })

            if (amount > unpaidAmount * 0.25) {
                throw new HttpError(400, 'Limit exceeded')
            }

            client.balance = parseFloat((client.balance + amount).toFixed(2))

            await client.save({ transaction: t })

            return client
        })

        return result
    }
}

module.exports = BalanceService;
