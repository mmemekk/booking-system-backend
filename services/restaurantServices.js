const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();


exports.getAllRestaurant = async () => {
    try {
        const restaurant = await prisma.restaurant.findMany();
        return restaurant;

    } catch (error) {
        console.error(error);
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch restaurants");
    }
}

exports.getRestaurantById = async (restaurantId) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { 
                id: restaurantId 
            }
        });

        if (!restaurant || restaurant.length === 0) {
            throw new AppError(404, "RESTAURANT_NOT_FOUND", "Restaurant not found");
        }

        return restaurant;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch restaurant by ID");
  }
}

exports.createRestaurant = async (restaurantData) => {
    try {
        const { name, branch, phone, email, username, password } = restaurantData;

        // Check if username is already exists
        const existingUsername = await prisma.restaurant.findUnique({
            where: { 
                username: username 
            }
        });
        if (existingUsername) {
        throw new AppError(400, "USERNAME_TAKEN", "Username is already taken");
        }

        //Check if name + branch combination already exists
        const existingRestaurant = await prisma.restaurant.findFirst({  
            where: {
                name: name,
                branch: branch || null
        }
        });
       if(existingRestaurant){
           throw new AppError(400, "RESTAURANT_EXISTS", "Restaurant with this name and branch already exists");
       }

       //Create new restaurant in the database
       const createdRestaurant = await prisma.restaurant.create({
         data: {
           name,
           branch,
           phone,
           email,
           username,
           password 
         }
       });

        return createdRestaurant;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to create restaurant");
    }
}

exports.updateRestaurant = async (restaurantId, updateRestaurantData) => {

    try {
        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: {
            id: restaurantId,
            },
        });
        if (!existingRestaurant) {
            throw new AppError(400, "RESTAURANT_NOT_FOUND", "Restaurant not found");
        }

        // If username is being updated, check for duplicates
        if (updateRestaurantData.username) {
            const existingUsername = await prisma.restaurant.findFirst({
                where: {
                    username: updateRestaurantData.username,
                    NOT: {
                        id: restaurantId,
                    },
                },
            });
            
            if (existingUsername) {
                throw new AppError(400,"USERNAME_TAKEN","Username is already taken");
            }
        }

        // If name and branch are being updated, check for duplicates
        if (updateRestaurantData.name || updateRestaurantData.branch) {
            const duplicateRestaurant = await prisma.restaurant.findFirst({
                where: {
                    name: updateRestaurantData.name || existingRestaurant.name,
                    branch: updateRestaurantData.branch || existingRestaurant.branch,
                    NOT: {
                        id: restaurantId,
                    },
                },
            });

            if (duplicateRestaurant) {
                throw new AppError( 400, "RESTAURANT_EXISTS", "Restaurant with this name and branch already exists");
            }
        }

        // Remove undefined fields from update data
        const cleanData = Object.fromEntries(
            Object.entries(updateRestaurantData).filter(
            ([_, value]) => value !== undefined
            )
        );

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: cleanData,
        });

        return updatedRestaurant;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to update restaurant data");
    }
};

exports.deleteRestaurant = async (restaurantId) => {
    try {
        // Check if restaurant exists
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { 
                id: restaurantId 
            }
        });
        if (!existingRestaurant) {
            throw new AppError(404, "RESTAURANT_NOT_FOUND", "Restaurant not found");
        }

        const deleteRestaurant = await prisma.restaurant.delete({
            where: { 
                id: restaurantId 
            }
        });

        return deleteRestaurant;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to delete restaurant");
    }
}