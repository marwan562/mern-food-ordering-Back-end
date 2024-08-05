import { NextFunction, Request, Response } from "express";
import { TError } from "../src/types";

const globalError = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("ERROR 💥", err);

  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

export default globalError;
