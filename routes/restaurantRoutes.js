const express = require("express");
const router = express.Router();
const restaurantControllers = require("../controllers/restaurantControllers");
const tableAvailabilityControllers = require("../controllers/tableAvailabilityControllers");

//Main restaurant routes
router.get("/", restaurantControllers.getAllRestaurant);
router.get("/:restaurantId", restaurantControllers.getRestaurantById);
router.post("/", restaurantControllers.createRestaurant);
router.patch("/:restaurantId", restaurantControllers.updateRestaurant);
router.delete("/:restaurantId", restaurantControllers.deleteRestaurant);

//Restaurant-level table availability batch update
router.patch(
  "/:restaurantId/table/availability/all",
  tableAvailabilityControllers.updateAllTableAvailability,
);

//Nested routes for restaurant-specific details
router.use("/:restaurantId/table", require("./tableRoutes"));
router.use("/:restaurantId/store-hour", require("./storeHourRoutes"));
router.use("/:restaurantId/store-exception", require("./storeExceptionRoutes"));
router.use("/:restaurantId/availability", require("./availabilityRoutes"));

module.exports = router;
