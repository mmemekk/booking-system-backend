const express = require('express');
const router = express.Router({ mergeParams: true });
const availabilityControllers = require('../controllers/availabilityControllers');

router.get("/with-out-time-slot", availabilityControllers.getAvailabilityWithOutTimeSlot); //query params: date,time,capacity
router.get("/store-hour/with-out-time-slot", availabilityControllers.getStoreHourWithOutTimeSlot); //query params: date,time
router.get("/table/with-out-time-slot", availabilityControllers.getTableAvailabilityWithOutTimeSlot); //query params: date,time,capacity

module.exports = router;