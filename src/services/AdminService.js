const { Op } = require('sequelize');
const { isValidDate } = require("../utils");
const { sequelize } = require('../model');
const HttpError = require('../HttpError');

class AdminService {

    constructor(models) {
        this.models = models;
    }

    async getBestProfession(startDate, endDate) {
        const { Job, Contract, Profile } = this.models;

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            throw new HttpError(400, 'Invalid date')
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

        if (!jobs.length) {
            throw new HttpError(404, 'No jobs found')
        }

        return {
            profession: jobs[0]['Contract.Contractor.profession'],
            earned: jobs[0].total_price
        };
    }

    async getBestClients(startDate, endDate, limit) {
        const { Job, Contract, Profile } = this.models;

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            throw new HttpError(400, 'Invalid date')
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

        if(!clientsData.length) {
            throw new HttpError(404, 'No clients found')
        }

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
