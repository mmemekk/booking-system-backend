const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const bookingReferenceUtil = require("../utils/bookingReference");


exports.getBooking = async (restaurantId, filter) => {
    try{
        const { bookingId, bookingRef, bookingDate, tableId } = filter;

        let where = { restaurantId: parseInt(restaurantId) };

        if (bookingId) {
            where.id = parseInt(bookingId); 
        }

        if (bookingRef) {
            where.bookingRef = bookingRef; 
        }

        if (bookingDate) {
            where.bookingDate = new Date(bookingDate); 
        }

        if (tableId) {
            where.tableId = parseInt(tableId);
        }

        const booking = await prisma.booking.findMany({
            where
        });

        if (!booking || booking.length === 0) {
            throw new AppError(404, "BOOKINGS_NOT_FOUND", "No bookings found for the given filters");
        }

        return booking;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table");
    }
};

exports.createBooking = async (restaurantId, bookingData) => {
    try{
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true, slotDuration: true}
        });

        console.log("FormattedBookingTime", bookingData.formattedBookingTime)
        console.log(typeof(bookingData.formattedBookingTime))
        const slotDuration = parseInt(restaurant.slotDuration);
        const calculatedEndTime = new Date(new Date(bookingData.formattedBookingTime).getTime() + slotDuration * 60000);

        console.log("calculatedEndTime", calculatedEndTime)
        console.log(typeof(calculatedEndTime))
        console.log("formattedBookingTime", bookingData.formattedBookingTime)

        const bookingRef = bookingReferenceUtil.generateBookingReference(restaurant.name, bookingData.bookingDate);
        const booking = await prisma.booking.create({
            data: {
                bookingRef,
                restaurantId: parseInt(restaurantId),
                tableId: bookingData.tableId,
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                bookingDate: bookingData.formattedBookingDate,
                startTime: bookingData.formattedBookingTime,
                endTime: calculatedEndTime,
                capacity: bookingData.capacity,
                status: "created"
            }
        });

        return booking;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to create booking");
    }
};

exports.updateBooking = async (bookingRef, bookingData) => {
    try{
        const updateTable = await prisma.booking.update({
            where: {
                bookingRef
            },
            data: {
                tableId: bookingData.tableId,
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                bookingDate: bookingData.formattedBookingDate,
                startTime: bookingData.formattedStartTime,
                endTime: bookingData.formattedEndTime,
                capacity: bookingData.capacity,
            }
        });

        return updateTable;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to update table");
    }
};

exports.deleteBooking = async (bookingRef) => {
    try{
        const deleteTable = await prisma.booking.delete({
            where: {
                bookingRef
            }
        });

        return deleteTable;
        
    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
        // Prisma not found error
        throw new AppError(404, "NOT_FOUND", "Table not found");
        }
        
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table");
    }
};

exports.getTableBasedOnBookingTime = async (table, bookingTime) => {
    try{

        if (!table || !Array.isArray(table)) {
            throw new AppError(400, "INVALID_TABLE_DATA", "Invalid table data");
        }

        if (!bookingTime) {
            throw new AppError(400, "MISSING_BOOKING_TIME", "Booking time is required");
        }

        const requestedTimeMs = new Date(bookingTime).getTime();

        const matchedTable = table.find(table =>
            table.availabilities?.some(slot=>
                new Date(slot.openTime).getTime() === requestedTimeMs
            )
        )

        if (!matchedTable) {
            throw new AppError(
                400,
                "TIME_NOT_AVAILABLE",
                "Requested time slot is not available"
            );
        }

        return matchedTable

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "INTERNAL_ERROR", "Failed Internal Logic");
    }
};
