const { Op } = require('sequelize');

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

    return contracts;
  }
}

module.exports = ContractService;
