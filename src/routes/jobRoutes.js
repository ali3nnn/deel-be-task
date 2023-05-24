const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const JobService = require('../services/JobService');

// GET /jobs/unpaid - Get unpaid jobs for user's active contracts
router.get('/unpaid', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const jobService = new JobService(models);
  try {
    const { id: profileId } = req.profile;
    const jobs = await jobService.getUnpaidJobsForUser(profileId);
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});

// POST /jobs/:job_id/pay - Client pays the contractors for job
router.post('/:job_id/pay', getProfile, async (req, res) => {
  const models = req.app.get('models');
  const jobService = new JobService(models);
  try {
    const client = req.profile;
    const { job_id } = req.params;
    await jobService.payJob(job_id, client);
    res.status(200).send({
      message: `Job ${job_id} has been paid`
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

module.exports = router;
