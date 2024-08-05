import express from "express";
import userRoute from "./routes/userRoute";
import myRestaurantRoute from "./routes/myRestaurantRoute";
import restaurantRoute from "./routes/restaurantRoute";
import orderRoute from "./routes/orderRoute";
import globalError from "./middlewares/globalError";
import cors from "cors";
import "../db";
import "dotenv/config";
import "./configs/cloudinaryConfig";

const app = express();

app.use(cors());
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());
//check access server Work
app.get("/health", async (req, res) => {
  res.send("work");
});

// My Routes API
app.use("/api/my/user", userRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/order", orderRoute);

//middleware global Error Handler
app.use(globalError);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + process.env.PORT);
});
