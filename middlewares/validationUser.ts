import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const validateUserInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, addressLine1, city, country } = req.body;

  let errors: { [key: string]: string } = {};

  if (!name) {
    errors.name = "Name is required";
  }

  if (!addressLine1) {
    errors.addressLine1 = "Address Line is required";
  }

  if (!city) {
    errors.city = "City is required";
  }

  if (!country) {
    errors.country = "Country is required";
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
};

export default validateUserInput;
