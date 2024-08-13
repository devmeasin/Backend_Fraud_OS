import createJWKSMock from "mock-jwks";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { User } from "../../src/models/userModel"; // Assuming you have a User Mongoose model
import { Config } from "../../src/config";

describe("GET /auth/self", () => {
    // Setup MongoDB connection
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5001");
        await mongoose.connect(Config.DB_URI as string);
    });

    beforeEach(async () => {
        // Clear the database before each test
        await User.deleteMany({});
        jwks.start();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("Given all fields", () => {
        test("should return 200 status code", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            const user = await User.create({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Arrange
            const accessToken = jwks.token({
                sub: String(user._id),
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        test("should return user data", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            const user = await User.create({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Act
            const accessToken = jwks.token({
                sub: String(user._id),
                role: user.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body._id).toBe(String(user._id));
        });

        test("should not return password field", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            const user = await User.create({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Act
            const accessToken = jwks.token({
                sub: String(user._id),
                role: user.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.body).not.toHaveProperty("password");
        });
    });
});
