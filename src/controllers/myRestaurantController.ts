import { NextFunction, Request, Response } from "express";
import Restaurant from "../src/models/myRestaurantModel";
import cloudinary from "cloudinary";
import AppError from "../utils/AppError";
import Order from "../src/models/orderModel";

interface ICustomReq extends Request {
  userId?: string;
  country?: string;
}

const getRestaurantOrders = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return next(new AppError("restaurant not found", 404));
    }

    const order = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .sort({ created_At: -1 });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};

const updateStatusOrder = async (
  req: ICustomReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const order = await Order.findById({ _id: orderId });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return next(new AppError("Restaurant not found", 404));
    }

    order.status = status;

    await order.save();

    res.status(201).send(order);
  } catch (err) {
    next(err);
  }
};

const uploadImageUrl = async (image: Express.Multer.File) => {
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataUrl = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = (await cloudinary.v2.uploader.upload(dataUrl)).url;

  return uploadResponse;
};

const getMyRestaurant = async (
  req: ICustomReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const myRestaurant = await Restaurant.findOne({
      user: req.userId,
    }).populate("user");

    if (!myRestaurant) {
      return next(new AppError("Restaurant not found", 404));
    }

    res.status(200).send(myRestaurant);
  } catch (err) {
    next(err);
  }
};

const updateMyRestaurant = async (req: ICustomReq, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;

    if (req.file) {
      const imageUrl = await uploadImageUrl(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createMyRestaurant = async (
  req: ICustomReq,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const existingRestaurant = await Restaurant.findOne({ user: userId });

    if (existingRestaurant) {
      return next(new AppError("Restaurant already exists", 409));
    }

    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const uploadResponse = await uploadImageUrl(image);

    const restaurant = new Restaurant({
      ...req.body,
      imageUrl: uploadResponse,
      user: userId,
    });

    await restaurant.save();

    res
      .status(201)
      .json({ message: "Restaurant created successfully", restaurant });
  } catch (err) {
    next(err);
  }
};

export default {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getRestaurantOrders,
  updateStatusOrder,
};
