const { Op } = require('sequelize');

class BalanceService {
    constructor(models) {
        this.models = models;
    }

    async deposit(userId, amount) {
        const { Job, Contract, Profile } = this.models;

        const result = await sequelize.transaction(async (t) => {
            const client = await Profile.findByPk(userId);

            if (!client || client.type === 'contractor') {
                throw new RequestError('Invalid user', 400)
            }

            if (!amount) {
                throw new RequestError('Invalid amount', 400)
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
                throw new RequestError('Limit exceeded', 400)
            }

<<<<<<< HEAD
        if (amount > sumOfUnpaidJobs * 0.25) {
            throw {
                message: 'Limit exceeded',
                status: 400
            }
        }
=======
            client.balance = parseFloat((client.balance + amount).toFixed(2))
>>>>>>> 620a3d9 (feat: refactored balance service to use transaction)

            await client.save({ transaction: t })

            return client
        })

<<<<<<< HEAD
            return {
                old_balance: client.balance,
                new_balance: updatedClient.balance,
            };
        } catch (error) {
            throw {
                message: error
            };
        }
=======
        return result
>>>>>>> 620a3d9 (feat: refactored balance service to use transaction)
    }
}

module.exports = BalanceService;
