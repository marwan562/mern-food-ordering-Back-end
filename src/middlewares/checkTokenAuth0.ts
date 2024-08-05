import { Response, Request, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import AppError from "../utils/AppError";
import User from "../src/models/userModel";
import jwt from "jsonwebtoken";
import "dotenv/config";

interface CustomRequest extends Request {
  auth0Id?: string;
  userId?: string;
}

export const jwtCheck = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  tokenSigningAlg: process.env.TOKEN_SIGN_IN_ALG,
});

export const jwtParse = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("Error: You can't access this request", 403));
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded) {
      return next(new AppError("Invalid token", 403));
    }

    const auth0Id = decoded.sub;

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.auth0Id = auth0Id;
    req.userId = user._id.toString();

    next();
  } catch (err) {
    console.error("JWT parsing error:", err);
    next(err);
  }
};
