import { Router } from "express";
import { DeliveryPartnerController } from "../controllers/DeliveryPartners/DeliveryPartnersController";
import { DeliveryPartner } from "../models/deliveryPartnerModel";
import { DeliveryPartnerService } from "../services/DeliveryPartners/DeliveryPartnersService";
import authenticate from "../middlewares/authenticate";
import logger from "../utils/logger";

const deliveryPartnerController = new DeliveryPartnerController(
    logger,
    new DeliveryPartnerService(DeliveryPartner, logger),
);

const router = Router();

router.post("/create", authenticate, (req, res, next) =>
    deliveryPartnerController.createDeliveryPartner(req, res, next),
);

router.put("/update/:deliveryPartnerId", authenticate, (req, res, next) =>
    deliveryPartnerController.updateDeliveryPartner(req, res, next),
);

router.delete("/delete/:deliveryPartnerId", authenticate, (req, res, next) =>
    deliveryPartnerController.deleteDeliveryPartner(req, res, next),
);

router.get("/", authenticate, (req, res, next) =>
    deliveryPartnerController.getDeliveryPartners(req, res, next),
);

router.get("/:deliveryPartnerId", authenticate, (req, res, next) =>
    deliveryPartnerController.getDeliveryPartnerById(req, res, next),
);

export default router;
