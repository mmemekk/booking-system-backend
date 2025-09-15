const express = require('express');
const router = express.Router({ mergeParams: true });
const availabilityControllers = require('../controllers/availabilityControllers')

router.get("/", availabilityControllers.getAvailability); //filters: date,time,capacity


module.exports = router;