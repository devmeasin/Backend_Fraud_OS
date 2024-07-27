import request from "supertest";
import { calculateDiscount } from "../src/unit";
import app from "../src/app";

describe.skip("CalculateDiscount", () => {
    it("should calculateDiscount", () => {
        const result = calculateDiscount(100, 10);
        expect(result).toBe(10);
    });
    it("should be statusCode 200", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});
