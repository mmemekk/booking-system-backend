const { AppError } = require("../middleware/errorHandler");

// Validate HH:mm format
exports.validateTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new AppError(
      400,
      "INVALID_TIME_FORMAT",
      "Time must be in HH:mm format"
    );
  }
};

// Validate date format (YYYY-MM-DD)
exports.validateDateFormat = (date) => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(date)) {
    throw new AppError(
      400,
      "INVALID_DATE_FORMAT",
      "Date must be in YYYY-MM-DD format"
    );
  }

  const parsedDate = new Date(date);
  const [year, month, day] = date.split("-");
  if (
    parsedDate.getUTCFullYear() !== parseInt(year, 10) ||
    parsedDate.getUTCMonth() + 1 !== parseInt(month, 10) ||
    parsedDate.getUTCDate() !== parseInt(day, 10)
  ) {
    throw new AppError(400, "INVALID_DATE", "Invalid date");
  }
};

//Format time for database
exports.formatTimeForDatabase = (time) => {
  this.validateTimeFormat(time);
  return new Date(`1970-01-01T${time}:00.000z`);
};

// Format date for database storage
exports.formatDateForDatabase = (date) => {
  this.validateDateFormat(date);
  return new Date(date);
};

//Format time for response (HH:mm)
exports.formatTimeForResponse = (dateTime) => {
  if (!dateTime) return null;

  return dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
};

// Format date for response (YYYY-MM-DD)
exports.formatDateForResponse = (date) => {
  if (!date) return null;

  return date.toISOString().split("T")[0];
};

// Format date + time for response (YYYY-MM-DD HH:mm)
exports.formatDateTimeForResponse = (dateTime) => {
  if (!dateTime) return null;

  const year = dateTime.getUTCFullYear();
  const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateTime.getUTCDate()).padStart(2, "0");
  const hours = String(dateTime.getUTCHours()).padStart(2, "0");
  const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

exports.formatTimeForStoreHourResponse = (storeHour) => {
  return {
    ...storeHour,
    openTime: storeHour.openTime
      ? this.formatTimeForResponse(storeHour.openTime)
      : null,
    closeTime: storeHour.closeTime
      ? this.formatTimeForResponse(storeHour.closeTime)
      : null,
  };
};

exports.formatTimeForStoreHourResponseArray = (storeHours) => {
  return storeHours.map(this.formatTimeForStoreHourResponse);
};

exports.formatDateTimeForStoreExceptionResponse = (storeException) => {
  return {
    ...storeException,
    date: this.formatDateForResponse(storeException.date),
    openTime: storeException.openTime
      ? this.formatTimeForResponse(storeException.openTime)
      : null,
    closeTime: storeException.closeTime
      ? this.formatTimeForResponse(storeException.closeTime)
      : null,
  };
};

exports.formatDateTimeForStoreExceptionResponseArray = (storeException) => {
  return storeException.map(this.formatDateTimeForStoreExceptionResponse);
};

exports.formatTimeForTableAvailabilityResponse = (tableAvailability) => {
  return this.formatTimeForStoreHourResponse(tableAvailability);
};

exports.formatTimeForTableAvailabilityResponseArray = (tableAvailability) => {
  return tableAvailability.map(this.formatTimeForTableAvailabilityResponse);
};

exports.formatDateTimeForTableExceptionResponse = (tableException) => {
  return {
    ...tableException,
    date: this.formatDateForResponse(tableException.date),
    exceptTimeFrom: tableException.exceptTimeFrom
      ? this.formatTimeForResponse(tableException.exceptTimeFrom)
      : null,
    exceptTimeTo: tableException.exceptTimeTo
      ? this.formatTimeForResponse(tableException.exceptTimeTo)
      : null,
  };
};

exports.formatDateTimeForTableExceptionResponseArray = (tableException) => {
  return tableException.map(this.formatDateTimeForTableExceptionResponse);
}

exports.formatDateTimeForEffectiveStoreHourResponse= (availability) => {
  return {
    ...availability,
    date: this.formatDateForResponse(availability.date),
    openCloseTimes: availability.openCloseTimes.map((slot) => ({
      openTime: this.formatTimeForResponse(slot.openTime),
      closeTime: this.formatTimeForResponse(slot.closeTime),
    })),
  };
}

exports.formatDateTimeForEffectiveTableAvailabilityResponse = (table) => {
  return {
    ...table,
    availabilities: table.availabilities
      ? table.availabilities.map((slot) => ({
          ...slot,
          openTime: this.formatTimeForResponse(slot.openTime),
          closeTime: this.formatTimeForResponse(slot.closeTime),
        }))
      : undefined,
    exceptions: table.exceptions
      ? table.exceptions.map((slot) => ({
          ...slot,
          date: this.formatDateForResponse(slot.date),
          exceptTimeFrom: this.formatTimeForResponse(slot.exceptTimeFrom),
          exceptTimeTo: this.formatTimeForResponse(slot.exceptTimeTo),
        }))
      : undefined,
    calculatedAvailabilities: table.calculatedAvailabilities
      ? table.calculatedAvailabilities.map((slot) => ({
          openTime: this.formatTimeForResponse(slot.openTime),
          closeTime: this.formatTimeForResponse(slot.closeTime),
        }))
      : undefined,
  };
};

exports.formatDateTimeForEffectiveTableAvailabilityResponseArray = (tables) => {
  return Array.isArray(tables)
    ? tables.map(this.formatDateTimeForEffectiveTableAvailabilityResponse)
    : [];
};

exports.formatDateTimeForAvailabilityWithOutTimeSlotResponseArray = (tables) => {
  return Array.isArray(tables)
    ? tables.map(this.formatDateTimeForEffectiveTableAvailabilityResponse)
    : [];
};

exports.formatDateTimeForGetAvailabilityResponse = (table) => {
  return {
    ...table,
    availabilities: table.availabilities
      ? table.availabilities.map((slot) => ({
          from: this.formatTimeForResponse(slot.openTime),
          to: this.formatTimeForResponse(slot.closeTime),
        }))
      : undefined
  };
};

exports.formatDateTimeForGetAvailabilityResponseArray = (tables) => {
  return Array.isArray(tables)
    ? tables.map(this.formatDateTimeForGetAvailabilityResponse)
    : [];
};

exports.formatDateTimeForBookingResponse = (booking) => {
  return {
    ...booking,
    bookingDate: booking.bookingDate
      ? this.formatDateForResponse(booking.bookingDate)
      : null,
    startTime: booking.startTime
      ? this.formatTimeForResponse(booking.startTime)
      : null,
    endTime: booking.endTime
      ? this.formatTimeForResponse(booking.endTime)
      : null,
  };
};

exports.formatDateTimeForBookingResponseArray = (booking) => {
  return booking.map(this.formatDateTimeForBookingResponse);
}

