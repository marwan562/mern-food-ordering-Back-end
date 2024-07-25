import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import AppError from "../utils/AppError";

interface CustomRequest extends Request {
  userId?: string;
}

const getMyUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError("User Not Found!", 404));
    }
    res.status(200).send(user)
  } catch (err) {
    next(err);
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auth0Id } = req.body;

    if (!auth0Id) {
      return next(new AppError("auth0Id is required", 400));
    }

    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return next(new AppError("Existing user", 400));
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).send(newUser.toObject());
  } catch (err) {
    next(new AppError("Failed to create user", 500));
  }
};

const updateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, addressLine1, city, country } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return next(new AppError("User Not Found!", 404));
    }

    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;

    await user.save();

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

export default {
  getMyUser,
  createUser,
  updateUser,
};
