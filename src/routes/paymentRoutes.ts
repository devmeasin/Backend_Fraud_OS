// import express from "express";
// import {
//     initiateBkashPayment,
//     confirmBkashPayment,
//     initiateSslCommerzPayment,
//     sslCommerzSuccess,
// } from "../controllers/PaymentController"; // Adjust the path
// import authenticate from "../middlewares/authenticate";

// const router = express.Router();

// // bKash payment routes
// router.post("/payment/bkash/initiate",authenticate, initiateBkashPayment);
// router.post("/payment/bkash/confirm",authenticate, confirmBkashPayment);

// // SSLCommerz payment routes
// router.post("/payment/sslcommerz/initiate",authenticate, initiateSslCommerzPayment);
// router.post("/payment/sslcommerz/success",authenticate, sslCommerzSuccess);

// export default router;

import express from "express";
import authenticate from "../middlewares/authenticate";
import { initiateBkashPayment } from "../middlewares/payment_process/bkash/initiateBkashPayment";

import { activatePackage } from "../middlewares/payment_process/activatePackage";
import { confirmBkashPayment } from "../middlewares/payment_process/bkash/confirmBkashPayment";

const router = express.Router();

router.post("/payment/bkash/initiate", authenticate, initiateBkashPayment);
router.get("/payment/bkash/confirmation", confirmBkashPayment, activatePackage);

export default router;
