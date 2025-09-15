const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();


exports.getTable = async (restaurantId, filter) => {
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
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};

exports.createTable = async (restaurantId, tableData) => {
    try{
        if (tableData.name == null || tableData.name.trim() === "") {
            const existingTables = await prisma.table.findMany({
                where: { restaurantId },
            });
            tableData.name = `Table ${existingTables.length + 1}`;
        }

        const table = await prisma.table.create({
            data: {
                restaurantId: parseInt(restaurantId),
                name: tableData.name,
                capacity: tableData.capacity,
                description: tableData.description
            }
        });

        return table;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};

exports.updateTable = async (restaurantId, tableId, tableData) => {
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
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};

exports.deleteTable = async (restaurantId, tableId) => {
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
        throw new AppError(404, "NOT_FOUND", "Store exception not found");
        }
        
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};