const bookingServices = require('../services/bookingServices');
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getBooking = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const { bookingId, bookingRef, bookingDate, tableId } = req.query;

    const booking = await bookingServices.getBooking(
      restaurantId,
      {
        bookingId,
        bookingRef,
        bookingDate,
        tableId
      }
    );

    const formattedBooking = dateTimeFormat.formatDateTimeForBookingResponseArray(
      booking
    );

    return res.json({ formattedBooking });

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

    const formattedCreateBooking =  dateTimeFormat.formatDateTimeForBookingResponse(
      createdBooking
    );

    return res.status(201).json({ formattedCreateBooking });

  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const bookingRef = req.params.bookingRef;
    if (!bookingRef) {
      throw new AppError(400, "MISSING_ID", "Booking Ref is required");
    }

    const { tableId, customerName, customerPhone, bookingDate, startTime, endTime, capacity } = req.body;
    const formattedBookingDate = bookingDate
      ? dateTimeFormat.formatDateForDatabase(bookingDate)
      : undefined;
    const formattedStartTime = startTime
      ? dateTimeFormat.formatTimeForDatabase(startTime)
      : undefined;
    const formattedEndTime = endTime
      ? dateTimeFormat.formatTimeForDatabase(endTime)
      : undefined;

    const updatedBooking = await bookingServices.updateBooking(bookingRef,{
      tableId,
      customerName,
      customerPhone,
      formattedBookingDate,
      formattedStartTime,
      formattedEndTime,
      capacity
    });
    const formattedUpdateBooking =  dateTimeFormat.formatDateTimeForBookingResponse( updatedBooking );
    
    return res.json({ formattedUpdateBooking });

  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    
    const bookingRef = req.params.bookingRef;
    if (!bookingRef) {
      throw new AppError(400, "MISSING_ID", "Booking Ref is required");
    }

    const deletedBooking = await bookingServices.deleteBooking(bookingRef);
    const formattedDeletedBooking =  dateTimeFormat.formatDateTimeForBookingResponse( deletedBooking );

    return res.json({ formattedDeletedBooking });

  } catch (error) {
    next(error);
  }
};