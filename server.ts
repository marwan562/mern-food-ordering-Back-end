import express from "express";
import userRoute from "./routes/userRoute";
import "dotenv/config";
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

// User Route API
app.use("/api/my/user", userRoute);

//middleware global Error Handler
app.use(globalError);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + process.env.PORT);
});
