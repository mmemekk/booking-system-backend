const express = require("express");
const router = express.Router({ mergeParams: true });
const tableException = require("../controllers/tableExceptionControllers");
const { checkTableIdBelongToRestaurantId } = require("../middleware/checkIdentification");

router.use(checkTableIdBelongToRestaurantId);

router.get("/", tableException.getTableException);
router.post("/", tableException.createTableException);
router.patch("/:exceptionId", tableException.updateTableException);
router.delete("/:exceptionId", tableException.deleteTableException);

module.exports = router;
