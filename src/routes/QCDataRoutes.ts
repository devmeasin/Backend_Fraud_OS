import { Request, Router } from "express";
import authenticate from "../middlewares/authenticate";
// import checkAPILimit from "../middlewares/checkAPILimit";
import { RedX_Data } from "../api/redx";
import { checkSchema, validationResult } from "express-validator";
import { BDNumberShema } from "../validator/BDNumberShema";

const router = Router();

router.post("/qc-data", authenticate, async (req: Request, res) => {
    await checkSchema(BDNumberShema).run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const data = await RedX_Data({ phone: req.body.phone });
    res.json({
        data,
    });
});

export default router;
