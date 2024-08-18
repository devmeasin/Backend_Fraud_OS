import express from "express";
import authenticate from "../middlewares/authenticate";
import { initiateBkashPayment } from "../middlewares/payment_process/bkash/initiateBkashPayment";
import { confirmBkashPayment } from "../middlewares/payment_process/bkash/confirmBkashPayment";

import { activatePackage } from "../middlewares/payment_process/activatePackage";

const router = express.Router();

router.post("/payment/bkash/initiate", authenticate, initiateBkashPayment);
router.get("/payment/bkash/confirmation", confirmBkashPayment, activatePackage);

export default router;
