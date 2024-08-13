import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import { Config } from "../../src/config";

describe("POST /auth/login", () => {
    // setup db conncetion
    beforeAll(async () => {
        await mongoose.connect(Config.DB_URI as string);
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe("Given all fields", () => {
        test("should be return 400 status code phone field is missing", async () => {
            //Arrange
            const userData = {
                phone: "",
                password: "password",
            };
            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assart
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Invalid phone number format for BD",
                    }),
                ]),
            );
        });

        test("should be return 400 status code password field is missing", async () => {
            //Arrange
            const userData = {
                phone: "01850463208",
                password: "",
            };
            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assart
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Password field value is missing!",
                    }),
                ]),
            );
        });
    });
});
