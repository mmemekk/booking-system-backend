const bookingServices = require('../services/bookingServices');
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");
const { format } = require('morgan');


exports.getBooking = async (req, res, next) => {
  try {
    const getBooking = await bookingServices.getBooking();

    return res.json({ getBooking });

  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { tableId, customerName, customerPhone, bookingDate, startTime, endTime, capacity } = req.body;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!tableId || !customerName || !customerPhone || !bookingDate || !startTime || !endTime || !capacity) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    const formattedBookingDate = dateTimeFormat.formatDateForDatabase(bookingDate);
    const formattedStartTime = dateTimeFormat.formatTimeForDatabase(startTime);
    const formattedEndTime = dateTimeFormat.formatTimeForDatabase(endTime);

    const createdBooking = await bookingServices.createBooking(restaurantId,{
      tableId,
      customerName,
      customerPhone,
      bookingDate,
      formattedBookingDate,
      formattedStartTime,
      formattedEndTime,
      capacity
    });

    return res.status(201).json({ createdBooking });

  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const updatedBooking = await bookingServices.updateBooking();
    
    return res.json({ restaurant });

  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const deletedBooking = await bookingServices.deleteBooking();
    
    return res.json({ restaurant });

  } catch (error) {
    next(error);
  }
};