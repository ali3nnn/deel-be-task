const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const ContractService = require('../services/ContractService')

// GET /contracts/:id - Get contract by ID
router.get('/:id', getProfile, async (req, res) => {
  const { id: contractId} = req.params;
  const { id: profileId} = req.profile;
  const models = req.app.get('models');
  const contractService = new ContractService(models);

  const contract = await contractService.getContractById(contractId, profileId)

  if (!contract) {
    return res.status(404).send();
  }

  res.status(200).json(contract);
});

// GET /contracts - Get contracts for user
router.get('/', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const contractService = new ContractService(models);
  const { id: profileId} = req.profile;

  const contracts = await contractService.getContractsByProfileId(profileId)

  if (!contracts) {
    return res.status(404).send();
  }

  res.json(contracts);
});

module.exports = router;
