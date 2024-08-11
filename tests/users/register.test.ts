import fs from "fs";
import { describe } from "node:test";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entities/User";
import { RefreshToken } from "../../src/entities/RefreshToken";
import path from "path";
import { verify } from "jsonwebtoken";
import { Config } from "../../src/config";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        // Connect to the database
        try {
            connection = await AppDataSource.initialize();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to initialize database connection:", error);
        }
    });

    beforeEach(async () => {
        // Database truncate
        // await truncateTables(connection);
        if (connection) {
            await connection.dropDatabase();
            await connection.synchronize();
        }
    });

    afterAll(async () => {
        if (connection) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        test("should be return statusCode 201", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            expect(response.statusCode).toBe(201);
        });

        // return json data using api call post methoad
        test("should be return json data", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        // persist user data in database
        test("should be persist user data in database", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assart
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].fullName).toBe(userData.fullName);
            expect(users[0].companyName).toBe(userData.companyName);
            expect(users[0].phone).toBe(userData.phone);
        });

        test("should assign a customer role", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assart
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        test("should password not.toBe equal password in db", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            // Assart
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        test("should be return 400 status code if phone in db already existis", async () => {
            // AAA
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
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();

            // Assart
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        test("should return access token and refresh token as cookies for valid credentials", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (err) {
                return err;
            }
            // Assart
            if (!response.headers["set-cookie"]) {
                throw new Error(
                    "Response does not contain 'set-cookie' header",
                );
            }

            const accessTokenCookie = response.headers["set-cookie"].find(
                (cookie: string) => cookie.startsWith("accessToken="),
            );
            const refreshTokenCookie = response.headers["set-cookie"].find(
                (cookie: string) => cookie.startsWith("refreshToken="),
            );

            expect(accessTokenCookie).toBeDefined();
            expect(refreshTokenCookie).toBeDefined();

            const accessToken: string = accessTokenCookie
                .split(";")[0]
                .split("=")[1];
            const refreshToken: string = refreshTokenCookie
                .split(";")[0]
                .split("=")[1];
            const decodedAccessToken = verify(accessToken, privateKey);
            const decodedRefreshToken = verify(
                refreshToken,
                Config.REFRESH_TOKEN_SECRET!,
            );
            expect(Number(decodedAccessToken.sub)).toBe(1);
            expect(Number(decodedRefreshToken.sub)).toBe(1);
        });

        test("should store the refresh token in the database", async () => {
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: Number(response.body.id),
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe("fields are missing", () => {
        test("should be return 400 status code is phone field is missing", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            expect(response.statusCode).toBe(400);
            const users = await connection.getRepository(User).find();
            expect(users).toHaveLength(0);
        });

        test("should be return 400 status code is fullName field is missing", async () => {
            // AAA
            // Arrange
            const userData = {
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            expect(response.statusCode).toBe(400);
            // const users = await connection.getRepository(User).find();
            expect(response.body.errors[0].msg).toEqual(
                "fullName Name Reqired!",
            );
        });
        test("should be return 400 status code is companyName name field is missing", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart
            expect(response.statusCode).toBe(400);
            // const users = await connection.getRepository(User).find();
            expect(response.body.errors[0].msg).toEqual("companyName Reqired");
        });

        test("should be return 400 status code password is not match", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "*****",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assart

            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "password should be at least 8 chars",
                    }),
                ]),
            );
        });

        test("should save hashed password correctly if all validations pass", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasin@gmail.com",
                password: "********",
            };
            // Act
            await request(app).post("/auth/register").send(userData);

            const users = await connection.getRepository(User).find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            // Check if password is hashed with bcrypt
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        test("should be return 400 status code if email is not a valid email", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "devmeasingmail.com",
                password: "********",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assart
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Invalid email format" }),
                ]),
            );
        });
    });

    describe("fields are not proper format", () => {
        test("should be return trim value email field", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName: "Mohammad Easin",
                companyName: "Demo Company",
                companyWebsite: "devsaim.com",
                phone: "01850463208",
                email: "    devmeasin@gmail.com  ",
                password: "********",
            };
            // Act
            await request(app).post("/auth/register").send(userData);
            // Assart
            const users = await connection.getRepository(User).find();
            expect(users[0].email).toBe("devmeasin@gmail.com");
        });
    });
});
