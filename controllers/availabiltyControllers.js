const availabilityServices = require("../services/availabilityServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    const { date, time, capacity } = req.query;

    return res.json({ formattedTableException });
  } catch (error) {
    next(error);
  }
};