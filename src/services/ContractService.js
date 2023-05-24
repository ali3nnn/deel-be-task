const { Op } = require('sequelize');
const HttpError = require('../HttpError');

class ContractService {
  constructor(models) {
    this.Contract = models.Contract;
  }

  async getContractById(id, profileId) {
    const contract = await this.Contract.findOne({
      where: {
        id,
        [Op.or]: [
          { ContractorId: profileId },
          { ClientId: profileId },
        ],
      },
    });

    if(!contract) {
      throw new HttpError(404, "Contracts not found")
    }

    return contract;
  }

  async getContractsByProfileId(profileId) {
    const contracts = await this.Contract.findAll({
      where: {
        [Op.or]: [
          { ContractorId: profileId },
          { ClientId: profileId },
        ],
        status: { [Op.ne]: 'terminated' },
      },
    });

    if(!contracts.length) {
      throw new HttpError(404, "Contracts not found")
    }

    return contracts;
  }
}

module.exports = ContractService;
