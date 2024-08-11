import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";

describe("POST /auth/login", () => {
    // setup db conncetion
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        // await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
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
