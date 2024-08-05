import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Restaurant from "../models/myRestaurantModel";
import Order from "../models/orderModel";



const searchRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const city = req.params.city || "";
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOptions = (req.query.sortOptions as string) || "lastUpdate";
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let querys: any = {};

    querys.city = new RegExp(city, "i");
    const checkCity = await Restaurant.countDocuments(querys);

    if (checkCity === 0) {
      return next(new AppError("City not found", 404));
    }

    if (selectedCuisines) {
      const cuisinesArr = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
      querys.cuisines = { $all: cuisinesArr };
    }

    if (searchQuery) {
      const searchRegExp = new RegExp(searchQuery, "i");
      querys.$or = [
        { restaurantName: searchRegExp },
        { cuisines: { $in: [searchRegExp] } },
      ];
    }

    const totalResults = await Restaurant.countDocuments(querys);

    const restaurants = await Restaurant.find(querys)
      .limit(pageSize)
      .skip(skip)
      .sort({ [sortOptions]: 1 })
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalResults / pageSize);

    res.status(200).send({
      data: restaurants,
      pagination: { totalResults, totalPages, currentPage: page },
    });
  } catch (err) {
    next(err);
  }
};

const detailsRestautant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.params.id;

    if (!restaurantId) {
      return next(new AppError("Id id required", 400));
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return next(new AppError("Restaurant Not Found!", 404));
    }

    res.status(200).send(restaurant);
  } catch (err) {
    next(err);
  }
};

export default {
  searchRestaurant,

  detailsRestautant,
 
};
