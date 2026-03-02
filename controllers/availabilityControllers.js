const availabilityServices = require("../services/availabilityServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, time, capacity } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);
    const formattedTime = time ? dateTimeFormat.formatTimeForDatabase(time) : undefined;
    const formattedCapacity = capacity ? parseInt(capacity) : undefined;

    const getAvailability= await availabilityServices.getAvailability(
      restaurantId,
      formattedDate,
      formattedTime,
      formattedCapacity
    );

    const formattedGetAvailability = dateTimeFormat.formatDateTimeForGetAvailabilityResponseArray(getAvailability);

    return res.json({ date, time, capacity, formattedGetAvailability });

  } catch (error) {
    next(error);
  }
};

exports.getAvailabilityWithOutTimeSlot = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, capacity } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);
    const formattedCapacity = capacity ? parseInt(capacity) : undefined;

    const getAvailabilityWithOutTimeSlot = await availabilityServices.getAvailabilityWithOutTimeSlot(
      restaurantId,
      formattedDate,
      formattedCapacity
    );

    const formattedGetAvailabilityWithOutTimeSlot = dateTimeFormat.formatDateTimeForAvailabilityWithOutTimeSlotResponseArray(getAvailabilityWithOutTimeSlot);

    return res.json({ date, capacity, formattedGetAvailabilityWithOutTimeSlot });

  } catch (error) {
    next(error);
  }
};

exports.checkAvailabilityForBooking = async (req, res, next) => {
  try {
    console.log(req.body);
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, time, capacity, maxAlternative } = req.body;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!date || !time || !capacity) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    let formattedMaxAlternative;
    if (!maxAlternative || isNaN(parseInt(maxAlternative))) {
      formattedMaxAlternative = 4; // default value for number of returned alternative time slots
    } else{
      formattedMaxAlternative = parseInt(maxAlternative);
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);
    const formattedTime = time ? dateTimeFormat.formatTimeForDatabase(time) : undefined;
    const formattedCapacity = capacity ? parseInt(capacity) : undefined;

    const getAvailabilityForBooking = await availabilityServices.getAvailabilityForBooking(
      restaurantId,
      formattedDate,
      formattedTime,
      formattedCapacity,
      formattedMaxAlternative
    );

    const formattedGetAvailabilityForBooking = dateTimeFormat.formatDateTimeForGetAvailabilityForBookingResponse(getAvailabilityForBooking);

    return res.json(formattedGetAvailabilityForBooking );

  } catch (error) {
    next(error);
  }
};

exports.getEffectiveStoreHour = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    const getEffectiveStoreHour = await availabilityServices.getEffectiveStoreHour(
      restaurantId,
      formattedDate
    );

    const formattedGetEffectiveStoreHour = dateTimeFormat.formatDateTimeForEffectiveStoreHourResponse(getEffectiveStoreHour);

    return res.json({ formattedGetEffectiveStoreHour });

  } catch (error) {
    next(error);
  }
};

exports.getEffectiveTableAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    const getEffectiveTableAvailability = await availabilityServices.getEffectiveTableAvailability(
      restaurantId,
      formattedDate
    );

    const formattedGetEffectiveTableAvailability= dateTimeFormat.formatDateTimeForEffectiveTableAvailabilityResponseArray(getEffectiveTableAvailability);

    return res.json({ formattedGetEffectiveTableAvailability });

  } catch (error) {
    next(error);
  }
};