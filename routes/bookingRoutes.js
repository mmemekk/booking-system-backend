const express = require('express');
const router = express.Router();
const bookingControllers = require('../controllers/bookingControllers');

router.get('/', bookingControllers.testRoute);

module.exports = router;