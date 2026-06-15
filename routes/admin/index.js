const express = require('express');
const router = express.Router();

const requireRole = require('../../middleware/requireRole');
const adminController = require('../../controllers/adminController');


router.get(
  '/stats',
  requireRole('admin', 'superadmin'),
  adminController.getStats
);

module.exports = router;