import { describe } from "node:test";
import request from 'supertest';
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entities/User";


describe('POST /auth/register', () => {

    let connection: DataSource;

    beforeAll(async() => {
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

       test('should be return statusCode 201', async () => {
            // AAA 
            // Arrange 
            const userData = {
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }

            // Act 

            const response = await request(app).post('/auth/register').send(userData)

            // Assart
            expect(response.statusCode).toBe(201);
        });

         // return json data using api call post methoad
         test("should be return json data", async () => {
            // AAA
            // Arrange
            const userData = {
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }
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
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }
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
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }
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
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }
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
                fullName:'Mohammad Easin',
                companyName: 'Demo Company',
                companyWebsite: 'devsaim.com',
                phone:'01850463208',
                email: 'devmeasin@gmail.com',
                password: '********',
            }

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

        
    })
    // describe("Fields are missing", () => {

    // })
    // describe("Fields are not proper format", () => {

    // })

    
})