import express from "express";
import userRoute from "./routes/userRoute";
import myRestaurantRoute from "./routes/myRestaurantRoute";
import "dotenv/config";
import "./configs/cloudinaryConfig"
import cors from "cors";
import globalError from "./middlewares/globalError";
import "./db";

const app = express();

app.use(express.json());
app.use(cors());

//check access server Work
app.get("/health", async (req, res) => {
  res.send("work");
});

// My Routes API
app.use("/api/my/user", userRoute);
app.use("/api/my/restaurant", myRestaurantRoute);

//middleware global Error Handler
app.use(globalError);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + process.env.PORT);
});
