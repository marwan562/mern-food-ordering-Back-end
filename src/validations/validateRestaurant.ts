import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

// Validation middleware
const validateRestaurant = [
  // Validate and sanitize each field
  body("restaurantName").notEmpty().withMessage("Restaurant name is required."),
  body("city").notEmpty().withMessage("City is required."),
  body("country ").notEmpty().withMessage("City is required."),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price must be a positive number."),
  body("estimatedDeliveryTime") 
    .isInt({ min: 0 })
    .withMessage("Estimated delivery time must be a positive integer."),
  body("cuisines").isArray().withMessage("Cuisines must be an array."),
  body("cuisines.*")
    .isString()
    .withMessage("Each cuisine must be a string.")
    .notEmpty()
    .withMessage("Cuisine cannot be empty."),
  body("menuItems").isArray().withMessage("Menu items must be an array."),
  body("menuItems.*.name")
    .notEmpty()
    .withMessage("Menu item name is required."),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu item price must be a positive number."),
  body("lastUpdate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid date format for last update."),

  // Handle validation results
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export default validateRestaurant;
