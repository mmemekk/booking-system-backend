const { PrismaClient } = require("@prisma/client");
const { AppError } = require("./errorHandler");
const prisma = new PrismaClient();


exports.checkTableIdBelongToRestaurantId = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const tableId = parseInt(req.params.tableId);

    if (!restaurantId || isNaN(restaurantId) || !tableId || isNaN(tableId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID and Table ID are required");
    }

    const table = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId: restaurantId
      }
    });

    if (!table) {
      throw new AppError(404, "NOT_FOUND", "Table not found for this restaurant");
    }

    next(); // pass to the next middleware/controller
  } catch (error) {
    next(error);
  }
};
