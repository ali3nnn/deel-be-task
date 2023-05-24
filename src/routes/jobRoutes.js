const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const JobService = require('../services/JobService');

// GET /jobs/unpaid - Get unpaid jobs for user's active contracts
router.get('/unpaid', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const { id: profileId } = req.profile;
  const jobService = new JobService(models);
  
  try {
    const jobs = await jobService.getUnpaidJobsForUser(profileId);
    res.status(200).send(jobs);
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// POST /jobs/:job_id/pay - Client pays the contractors for job
router.post('/:job_id/pay', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const client = req.profile;
  const { job_id } = req.params;
  const jobService = new JobService(models);

  try {
    await jobService.payJob(job_id, client);
    res.status(200).send(`Job ${job_id} has been paid`);
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

module.exports = router;
