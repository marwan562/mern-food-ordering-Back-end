import express from "express";
import { jwtCheck, jwtParse } from "../middlewares/checkTokenAuth0";
import orderController from "../controllers/orderController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, orderController.getMyOrders);

router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  orderController.createCheckoutSessions
);
router.post("/checkout/webhook", orderController.stripeWebHookHandler);

export default router;
