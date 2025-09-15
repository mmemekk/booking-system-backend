const express = require('express');
const router = express.Router({ mergeParams: true });
const tableControllers = require('../controllers/tableControllers')

//Main table routes
router.get("/", tableControllers.getTable);
router.post("/", tableControllers.createTable);
router.patch("/:tableId", tableControllers.updateTable);
router.delete("/:tableId", tableControllers.deleteTable);

//Nested routes for table-specific details
router.use("/:tableId/availability", require("./tableAvailabilityRoutes"));
router.use("/:tableId/exception", require("./tableExceptionRoutes"));

module.exports = router;