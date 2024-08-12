import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import checkAPILimit from "../middlewares/checkAPILimit";

const router = Router();

router.post("/qc-data", authenticate, checkAPILimit, (req, res) => {
    res.json({
        message: req,
    });
});

export default router;
