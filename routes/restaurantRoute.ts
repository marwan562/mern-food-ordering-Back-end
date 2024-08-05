import express from "express"
import restaurantController from "../controllers/restaurantController"
import { jwtCheck, jwtParse } from "../middlewares/checkTokenAuth0"

const router = express.Router()


router.get("/search/:city",restaurantController.searchRestaurant)
router.get("/details/:id",restaurantController.detailsRestautant)


export default router