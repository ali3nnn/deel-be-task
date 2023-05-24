const { Op } = require('sequelize');
const { sequelize } = require('../model');
const HttpError = require('../HttpError');

class JobService {
  constructor(models) {
    this.Job = models.Job;
    this.Contract = models.Contract;
    this.Profile = models.Profile;
    this.sequelize = models.sequelize;
  }

  async getUnpaidJobsForUser(profileId) {

    const jobs = await this.Job.findAll({
      include: {
        model: this.Contract,
        as: 'Contract',
        where: {
          status: 'in_progress',
          [Op.or]: [
            { ContractorId: profileId },
            { ClientId: profileId },
          ],
        },
      },
      where: { paid: { [Op.or]: [null, false] } },
    });

    if (!jobs.length) {
      throw new HttpError(404, "No unpaid jobs found")
    }

    return jobs;
  }

  async payJob(jobId, client) {
    const t = await sequelize.transaction();


    if (client.type === 'contractor') {
      throw new HttpError(403, `You are not a client`)
    }

    const job = await this.Job.findOne({
      include: {
        model: this.Contract,
        as: 'Contract',
        where: {
          status: 'in_progress',
          ClientId: client.id
        }
      },
      where: {
        id: jobId,
        [Op.or]: [
          { paid: null },
          { paid: false }
        ]
      }
    })

    if (!job) {
      throw new HttpError(404, `Job not found or it has been paid`)
    }

    if (client.balance < job.price) {
      throw new HttpError(200, `Client doesn't have enough balance`)
    }

    const contractor = await this.Profile.findOne({
      where: {
        id: job.Contract.ContractorId
      }
    })

    try {

      // Update the job as paid
      const p1 = await this.Job.update({
        paid: true,
        paymentDate: new Date()
      }, {
        where: {
          id: jobId
        },
        transaction: t
      })

      // Update the contractor's balance
      const p2 = await this.Profile.update({
        balance: contractor.balance + job.price
      }, {
        where: {
          id: job.Contract.ContractorId
        },
        transaction: t
      })

      // Update the client's balance
      const p3 = await this.Profile.update({
        balance: client.balance - job.price
      }, {
        where: {
          id: client.id
        },
        transaction: t
      })

      const transactions = await Promise.all([p1, p2, p3])
      const isUpdatedFailed = transactions.some(item => !item[0])

      if (isUpdatedFailed) {
        throw new HttpError(500, `Request failed`)

      }

      // Run the transaction
      await t.commit()

      return true;
    } catch (error) {

      // Rollback the transaction
      await t.rollback();
      
      throw new HttpError(500, JSON.stringify(error));
    }
  }

}

module.exports = JobService;
