import express from "express";
import userControllers from "../controllers/userControllers";
import { jwtCheck, jwtParse } from "../middlewares/checkTokenAuth0";
import validateUserInput from "../middlewares/validationUser";

const router = express.Router();
router.get("/" , jwtCheck , jwtParse , userControllers.getMyUser)
router.post("/", jwtCheck, userControllers.createUser);
router.patch(
  "/",
  jwtCheck,
  jwtParse,
  validateUserInput,
  userControllers.updateUser
);

export default router;
