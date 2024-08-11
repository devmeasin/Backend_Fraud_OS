import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entities/User";

describe("GET /auth/self", () => {
    // setup db conncetion
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5001");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        // await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();

        jwks.start();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        test("should be return 200 status code", async () => {
            // Arrange
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assart
            expect(response.statusCode).toBe(200);
        });

        test("should be return user data", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Act
            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assart
            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(user.id);
        });

        test("should be not return password field", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Act
            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assart
            expect(response.body).not.toHaveProperty("password");
        });
    });
});
