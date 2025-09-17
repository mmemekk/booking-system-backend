const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();

const {
    getStoreHourAfterException,
    getTableAvailabilityAfterException,
    getTablesWithDetails,
    generateSlotsForTable,
    mapSlotsByTime,
    get
} = require("./availabilityHelpers");

exports.getAvailability = async (restaurantId, date, time, capacity) => {
    try{
        
        // 1️⃣ Get store hours after exceptios
        const { isClosed, openTime, closeTime, slotDuration } = await getStoreHourAfterException(restaurantId, date);

  if (isClosed) return { restaurantId, date, partySize, availableSlots: [] };

//   // 2️⃣ Fetch tables with availability, exceptions, reservations
//   const tables = await getTablesWithDetails(restaurantId, dayOfWeek, date, partySize);

//   // 3️⃣ Generate all slots and map to time-first structure
//   const allSlots = mapSlotsByTime(tables, slotDuration, openTime, closeTime);

//   return { restaurantId, date, partySize, availableSlots: allSlots };

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getStoreHourWithOutTimeSlot = async (restaurantId, date) => {
    try{

        return await getStoreHourAfterException(restaurantId, date);

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getTableAvailabilityWithOutTimeSlot = async (restaurantId, date) => {
    try{
        
        return await getTableAvailabilityAfterException(restaurantId, date);

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};
