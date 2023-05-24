const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const ContractService = require('../services/ContractService')

// GET /contracts/:id - Get contract by ID
router.get('/:id', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const { id: contractId } = req.params;
  const { id: profileId } = req.profile;
  const contractService = new ContractService(models);

  try {
    const contract = await contractService.getContractById(contractId, profileId)
    res.status(200).send(contract);
  } catch(err) {
    res.status(err.code).send(err.message)
  }

});

// GET /contracts - Get contracts for user
router.get('/', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const { id: profileId } = req.profile;
  const contractService = new ContractService(models);

  try {
    const contracts = await contractService.getContractsByProfileId(profileId)
    res.status(200).send(contracts)
  } catch (err) {
    res.status(err.code).send(err.message)
  }
});

module.exports = router;
