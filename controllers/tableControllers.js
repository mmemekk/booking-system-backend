const tableServices = require("../services/tableServices");
const { AppError } = require("../middleware/errorHandler");

exports.getTable = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const minCapacity = req.query.minCapacity;

    const getTable = await tableServices.getTable(restaurantId, {
      minCapacity,
    });

    return res.json({ getTable });
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const { name, capacity, description } = req.body;

    if (!capacity) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    const createdTable = await tableServices.createTable(restaurantId, {
      name,
      capacity,
      description,
    });

    return res.json({ createdTable });
  } catch (error) {
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const tableId = parseInt(req.params.tableId);

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!tableId || isNaN(tableId)) {
      throw new AppError(400, "MISSING_ID", "Table ID is required");
    }

    const { name, capacity, description } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new AppError(400, "INVALID_INPUT_FIELD", "Name cannot be empty");
      }
    }

    const updateTable = await tableServices.updateTable(restaurantId, tableId, {
      name,
      capacity,
      description,
    });

    return res.json({ updateTable });
  } catch (error) {
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const tableId = parseInt(req.params.tableId);

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!tableId || isNaN(tableId)) {
      throw new AppError(400, "MISSING_ID", "Table ID is required");
    }

    const deletedTable = await tableServices.deleteTable(restaurantId, tableId);

    return res.json({
      message: "Table deleted successfully",
      deletedTable,
    });
  } catch (error) {
    next(error);
  }
};
