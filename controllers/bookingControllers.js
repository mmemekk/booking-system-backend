const bookingServices = require('../services/bookingServices');
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");
const availabilityServices = require("../services/availabilityServices");
const availabilityHelpers = require("../services/availabilityHelpers");

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
    const { customerName, customerPhone, bookingDate, bookingTime, capacity, specialRequest } = req.body;
    console.log("Create Booking Request Body", req.body)

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!customerName || !customerPhone || !bookingDate || !bookingTime || !capacity) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    const formattedBookingDate = dateTimeFormat.formatDateForDatabase(bookingDate);
    const formattedBookingTime = dateTimeFormat.formatTimeForDatabase(bookingTime);
    const formattedCapacity = parseInt(capacity);
    const getTableForBookingByCapacity = await availabilityServices.getTableForBookingByCapacity(restaurantId, formattedBookingDate, formattedCapacity);
    if(!getTableForBookingByCapacity.success) {
      throw new AppError(
        400,
        "CAPACITY_EXCEED_MAXIMUM",
        "Requested capacity exceeds maximum capacity. Contact restaurant directly for arrangement"
      )
    }

    const tableByCapacity = getTableForBookingByCapacity.tables;
    const SortedTableByCapacity = tableByCapacity.sort((a,b) => (a.capacity-b.capacity) || (a.id-b.id));
    const tableBasedOnBookingTime =  await bookingServices.getTableBasedOnBookingTime(SortedTableByCapacity,formattedBookingTime);
    const tableId = parseInt(tableBasedOnBookingTime.id)

    console.log("tableId", tableId)

    const createdBooking = await bookingServices.createBooking(restaurantId,{
      tableId,
      customerName,
      customerPhone,
      bookingDate,
      formattedBookingDate,
      formattedBookingTime,
      capacity,
      specialRequest
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

    const { tableId, customerName, customerPhone, bookingDate, startTime, endTime, capacity, specialRequest, status} = req.body;
    const formattedBookingDate = bookingDate
      ? dateTimeFormat.formatDateForDatabase(bookingDate)
      : undefined;
    const formattedStartTime = startTime
      ? dateTimeFormat.formatTimeForDatabase(startTime)
      : undefined;
    const formattedEndTime = endTime
      ? dateTimeFormat.formatTimeForDatabase(endTime)
      : undefined;
    
    if (status && !["created", "confirmed", "canceled","noshow", "success"].includes(status)) {
      throw new AppError(400, "INVALID_STATUS", "Status must be one of: created, success, canceled, noshow");
    }

    const updatedBooking = await bookingServices.updateBooking(bookingRef,{
      tableId,
      customerName,
      customerPhone,
      formattedBookingDate,
      formattedStartTime,
      formattedEndTime,
      capacity,
      specialRequest,
      status
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