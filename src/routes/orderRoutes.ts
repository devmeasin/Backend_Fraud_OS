import express, { Request, Response } from "express";
import { OrderController } from "../controllers/OrderController";
import authenticate from "../middlewares/authenticate";
import { OrderService } from "../services/OrderService";
import { AuthRequest } from "../types";

const orderService = new OrderService();

const router = express.Router();
const orderController = new OrderController(orderService);

// Create order
router.post("/create", authenticate, (req: Request, res: Response) =>
    orderController.createOrder(req as AuthRequest, res),
);

// Get all orders with filters
router.get("/", authenticate, (req: Request, res: Response) =>
    orderController.getOrders(req as AuthRequest, res),
);

// Get single order by ID
router.get("/:orderId", authenticate, (req: Request, res: Response) =>
    orderController.getOrderById(req as AuthRequest, res),
);

// Update order
router.put("/:orderId", authenticate, (req: Request, res: Response) =>
    orderController.updateOrder(req as AuthRequest, res),
);

// Update order status
router.patch("/:orderId/status", authenticate, (req: Request, res: Response) =>
    orderController.updateOrderStatus(req as AuthRequest, res),
);

// Delete order
router.delete("/:orderId", authenticate, (req: Request, res: Response) =>
    orderController.deleteOrder(req as AuthRequest, res),
);

export default router;
