import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { TMenuItem } from "../src/models/myRestaurantModel";
import AppError from "../utils/AppError";
import Order from "../src/models/orderModel";
import { Types } from "mongoose";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_API_SECRET as string);
const STRIPE_WEB_HOOK = process.env.STRIPE_WEB_HOOK as string;

const getMyOrders = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    //api/order?sortOrderCreated=lastCreated&orderStatus=placed,paid
    const orderStatus = (req.query.orderStatus as string) || "";
    const sortOrderCreated = req.query.sortOrderCreated as
      | "lastCreated"
      | "oldCreated";

    let querys: any = { user: req.userId };

    if (orderStatus) {
      querys["status"] = orderStatus;
    }

    if (orderStatus) {
      const orderStatusArr = orderStatus.split(",");
      querys["status"] = { $in: orderStatusArr };
    }
    console.log(querys);
    const sortOrder = sortOrderCreated === "lastCreated" ? -1 : 1;

    const order = await Order.find(querys)
      .populate("restaurant")
      .sort({ created_At: sortOrder });

    if (!order) {
      return next(new AppError("order not found", 404));
    }

    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};

type TCreateCheckOutRequest = {
  restaurantId: string;
  menuItems: {
    _id: string;
    name: string;
    price: number;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
};

const stripeWebHookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return next(new AppError("stripe-signature not found", 400));
    }

    event = stripe.webhooks.constructEvent(
      req.body, // Raw body as Buffer
      sig as string,
      STRIPE_WEB_HOOK
    );
    console.log(event.type);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).send("Order ID not found in metadata");
    }

    if (session.amount_total === null || session.amount_total === undefined) {
      return res.status(400).send("Amount total is missing from the session");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    order.status = "paid";
    order.totalAmount = session.amount_total / 100;

    await order.save();
    res.status(200).send("Event received");
  }
};

const createCheckoutSessions = async (
  req: Request & { userId?: Types.ObjectId },
  res: Response,
  next: NextFunction
) => {
  try {
    const createCheckOutRequest: TCreateCheckOutRequest = req.body;

    if (!createCheckOutRequest.restaurantId) {
      return next(new AppError("Restaurant ID is required", 400));
    }

    const restaurant = await Restaurant.findById(
      createCheckOutRequest.restaurantId
    );

    if (!restaurant) {
      return next(new AppError("Restaurant not found", 404));
    }

    const newOrder = new Order({
      restaurant: restaurant._id,
      user: req.userId,
      status: "placed",
      deliveryDetails: createCheckOutRequest.deliveryDetails,
      cartItems: createCheckOutRequest.menuItems.map((el) => ({
        menuItemId: el._id,
        quantity: el.quantity,
        name: el.name,
      })),
    });

    const lineItems = await createLineItems(
      createCheckOutRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if (!session.url) {
      return next(new AppError("Error creating Stripe session", 500));
    }
    await newOrder.save();
    res.status(200).send({ url: session.url });
  } catch (err) {
    console.error(err);
    next(new AppError("Internal Server Error", 500));
  }
};

const createLineItems = async (
  createCheckOutRequest: TCreateCheckOutRequest,
  menuItems: TMenuItem[]
) => {
  const lineItems = createCheckOutRequest.menuItems.map((item) => {
    const menuItem = menuItems.find(
      (menu) => menu._id.toString() === item._id.toString()
    );

    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: menuItem.price * 100,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(item.quantity),
    };

    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await stripe.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice * 100,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${process.env.FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/details/${restaurantId}?cancelled=true`,
  });
  return sessionData;
};

export default {
  stripeWebHookHandler,
  createCheckoutSessions,
  getMyOrders,
};
