const express = require('express');
const router = express.Router();
const AdminService = require('../services/adminService');

// GET /admin/best-profession - Get the best profession within a date range
router.get('/best-profession', async (req, res) => {
    const models = req.app.get('models');
    const adminService = new AdminService(models);
    
    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);

    try {
        const bestProfession = await adminService.getBestProfession(startDate, endDate, req.app.get('models'));
        if(bestProfession.profession) {
            res.status(200).send(bestProfession);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

// GET /admin/best-clients - Get the best clients within a date range
router.get('/best-clients', async (req, res) => {
    const models = req.app.get('models');
    const adminService = new AdminService(models);

    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);
    const limit = req.query.limit;

    try {
        const bestClients = await adminService.getBestClients(startDate, endDate, limit, req.app.get('models'));
        if(bestClients.length) {
            res.status(200).send(bestClients);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(error.status || 500).send(error.message);
    }
});

module.exports = router;

