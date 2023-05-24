const { Op } = require('sequelize');

class BalanceService {
    constructor(models) {
        this.models = models;
    }

    async deposit(userId, amount) {
        const { Job, Contract, Profile } = this.models;

        const client = await Profile.findByPk(userId);

        if (!client) {
            throw {
                message: 'Invalid user',
                status: 400
            }
        }

        if (!amount) {
            throw {
                message: 'Invalid amount',
                status: 400
            }
        }

        if (client.type === 'contractor') {
            throw {
                message: 'Invalid user type',
                status: 400
            }
        }

        const unpaidJobs = await Job.findAll({
            include: {
                model: Contract,
                as: 'Contract',
                where: {
                    status: 'in_progress',
                    ClientId: client.id,
                },
            },
            where: {
                [Op.or]: [
                    { paid: { [Op.or]: [null, false] } },
                ],
            }
        });

        if (!unpaidJobs.length) {
            return {
                message: 'No unpaid jobs',
                status: 200
            }
        }

        const sumOfUnpaidJobs = unpaidJobs.reduce((acc, job) => {
            return acc + job.price;
        }, 0);

        if (amount > sumOfUnpaidJobs * 0.25) {
            throw {
                message: 'Limit exceeded',
                status: 400
            }
        }

        try {
             await Profile.update(
                {
                    balance: client.balance + amount,
                },
                {
                    where: {
                        id: client.id,
                    }
                }
            );

            const updatedClient = await Profile.findByPk(client.id);

            return {
                old_balance: client.balance,
                new_balance: updatedClient.balance,
            };
        } catch (error) {
            throw {
                message: error
            };
        }
    }
}

module.exports = BalanceService;
