const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const bookingReferenceUtil = require("../utils/bookingReference");


exports.getBooking = async (restaurantId, filter) => {
    try{
        const { minCapacity } = filter;
        let where = { restaurantId };

        if (minCapacity) {
            where.capacity = { gte: parseInt(minCapacity) };
        }

        const orderBy = minCapacity ? { capacity: 'asc' } : { id: 'asc' };
        
        const tables = await prisma.table.findMany({
            where,
            orderBy
        });

        return tables;

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