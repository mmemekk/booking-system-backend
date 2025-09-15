const restaurantServices = require("../services/restaurantServices");
const { AppError } = require("../middleware/errorHandler");

exports.getAllRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantServices.getAllRestaurant();
    return res.json({ restaurant });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const restaurant = await restaurantServices.getRestaurantById(restaurantId);

    return res.json({ restaurant });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const { name, branch, phone, email, username, password } = req.body;

    if (!name || !phone || !username || !password) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    const createdRestaurant = await restaurantServices.createRestaurant({
      name,
      branch,
      phone,
      email,
      username,
      password,
    });

    return res.status(201).json({ createdRestaurant });
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    // Check if there's data to update
    const { name, branch, phone, email, username, password } = req.body;
    if (!name && !branch && !phone && !email && !username && !password) {
      throw new AppError(400, "NO_DATA", "No data provided for update");
    }

    const updatedRestaurant = await restaurantServices.updateRestaurant(
      restaurantId,
      {
        name,
        branch,
        phone,
        email,
        username,
        password,
      }
    );

    return res.json({ updatedRestaurant });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const deletedRestaurant = await restaurantServices.deleteRestaurant(
      restaurantId
    );

    return res.json({
      message: "Restaurant deleted successfully",
      deletedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};
