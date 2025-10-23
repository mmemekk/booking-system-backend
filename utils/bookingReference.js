const { AppError } = require("../middleware/errorHandler");
const crypto = require("crypto");
const validateRestaurantName = (restaurantName) => {
    if (restaurantName == null || typeof restaurantName !== "string" || restaurantName.trim() === "") {
        throw new AppError(400, "INVALID_RESTAURANT_NAME", "Restaurant name is required to generate booking reference");
    }
};

const validateBookingDate = (bookingDate) => {
    if (bookingDate == null || typeof bookingDate !== "string" || bookingDate.trim() === "") {
        throw new AppError(400, "INVALID_BOOKING_DATE", "Booking date is required to generate booking reference");
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingDate)) {
        throw new AppError(400, "INVALID_DATE_FORMAT", "Booking date must follow format yyyy-mm-dd");
    }
};

exports.generateBookingReference = (restaurantName, bookingDate) => {
    validateRestaurantName(restaurantName);
    validateBookingDate(bookingDate);

    const namePart = restaurantName
        .replace(/\s+/g, "") // Remove spaces
        .toUpperCase()
        .padEnd(3, "X")      // Pad with X if shorter than 3 letters
        .substring(0, 3);    // Take first 3 letters

    const [year, month, day] = bookingDate.split("-");
    const datePart = `${year.slice(-2)}${month}${day}`;
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase()

    return `${namePart}-${datePart}-${randomPart}`;
};