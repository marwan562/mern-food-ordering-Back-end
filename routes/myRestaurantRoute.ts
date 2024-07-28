import express, { NextFunction, Request, Response } from "express";
import myRestaurantController from "../controllers/myRestaurantController";
import { jwtCheck, jwtParse } from "../middlewares/checkTokenAuth0";
import validateRestaurant from "../validations/validateRestaurant";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

const uploadMiddleware = upload.single("imageFile");

router.get("/", jwtCheck, jwtParse, myRestaurantController.getMyRestaurant);
router.patch(
  "/",
  jwtCheck,
  jwtParse,
  uploadMiddleware,
  myRestaurantController.updateMyRestaurant
);

router.post(
  "/",
  uploadMiddleware,
  validateRestaurant,
  jwtCheck,
  jwtParse,
  myRestaurantController.createMyRestaurant
);

export default router;
