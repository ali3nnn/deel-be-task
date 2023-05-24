const { Op } = require('sequelize');
const { isValidDate } = require("../utils");
const { sequelize } = require('../model');

class AdminService {

    constructor(models) {
        this.models = models;
    }

    async getBestProfession(startDate, endDate) {
        const { Job, Contract, Profile } = this.models;

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            throw { status: 400, message: 'Invalid date' };
        }

        const jobs = await Job.findAll({
            where: {
                paymentDate: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                }
            },
            include: {
                model: Contract,
                as: 'Contract',
                attributes: ['ContractorId'],
                include: {
                    model: Profile,
                    as: 'Contractor',
                    attributes: ['profession'],
                },
            },
            group: 'Contract.Contractor.profession',
            attributes: [
                [sequelize.fn('sum', sequelize.col('price')), 'total_price'],
            ],
            order: [
                [sequelize.col('total_price'), 'DESC'],
            ],
            raw: true
        });

        if(!jobs.length) {
            return {
                profession: null,
                earned: null
            }
        }

        return {
            profession: jobs[0]['Contract.Contractor.profession'],
            earned: jobs[0].total_price
        };
    }

    async getBestClients(startDate, endDate, limit) {
        const { Job, Contract, Profile } = this.models;

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            throw { status: 400, message: 'Invalid date' };
        }

        const clientsData = await Job.findAll({
            where: {
                paymentDate: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            include: {
                model: Contract,
                as: 'Contract',
                attributes: ['ClientId'],
                include: {
                    model: Profile,
                    as: 'Client',
                    attributes: ['firstName', 'lastName'],
                },
            },
            group: 'Contract.ClientId',
            attributes: [
                [sequelize.fn('sum', sequelize.col('price')), 'paid'],
            ],
            order: [
                [sequelize.col('paid'), 'DESC'],
            ],
            limit: limit || 2,
        });

        // if (!clientsData || clientsData.length === 0) {
            // throw { status: 404, message: 'Clients not found' };
        // }

        const customResults = clientsData.map((clientData) => {
            return {
                id: clientData.Contract.ClientId,
                fullName: clientData.Contract.Client.firstName + ' ' + clientData.Contract.Client.lastName,
                paid: clientData.paid,
            };
        });

        return customResults;
    }
}

module.exports = AdminService;
