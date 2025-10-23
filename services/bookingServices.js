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
        const restaurantName = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { name: true }
        });

        const bookingRef = bookingReferenceUtil.generateBookingReference(restaurantName.name, bookingData.bookingDate);
        const booking = await prisma.booking.create({
            data: {
                bookingRef,
                restaurantId: parseInt(restaurantId),
                tableId: bookingData.tableId,
                customerName: bookingData.customerName,
                customerPhone: bookingData.customerPhone,
                bookingDate: bookingData.formattedBookingDate,
                startTime: bookingData.formattedStartTime,
                endTime: bookingData.formattedEndTime,
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

exports.updateBooking = async (restaurantId, tableId, tableData) => {
    try{
        const updateTable = await prisma.table.update({
            where: {
                id: tableId,
                restaurantId: restaurantId
            },
            data: {
                name: tableData.name,
                capacity: tableData.capacity,
                description: tableData.description
            }
        });

        return updateTable;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table");
    }
};

exports.deleteBooking = async (restaurantId, tableId) => {
    try{
        const deleteTable = await prisma.table.delete({
            where: {
                id: tableId,
                restaurantId: restaurantId
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