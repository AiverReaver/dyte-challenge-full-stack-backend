import * as request from 'supertest';
import { Express } from 'express'
import { createServer } from '../../utils/server';
import { TestHelper } from '../../utils/TestHelper';


let app: Express;

beforeAll(async () => {
    await TestHelper.instance.setupTestDB()

    process.env.JWT_SECRET = "testkey"
    process.env.JWT_REFRESH_SECRET = "testkey"

})

beforeEach(async () => {
    app = await createServer();
})

afterAll(() => {
    TestHelper.instance.teardownTestDB()
})



const userPayload = { username: "testduser", password: "test1234" }
describe("POST /register", () => {

    it('should return 201 & valid response', done => {
        request(app).post("/register")
            .send(userPayload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201).then(res => {
                expect(res.body).toMatchObject({ message: "User registered", data: { id: 1, username: userPayload.username } })
                done()
            }).catch((err) => done(err))
    })

    it("should return 400 and valid response for existing user", done => {
        request(app).post("/register")
            .send(userPayload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "User already exist" })
                done()
            }).catch((err) => done(err))
    })
})

describe("POST /login", () => {

    let bcrypt = { compare: jest.fn() }
    const bcryptCompare = jest.fn().mockResolvedValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;
    it('should return 200 & valid response', done => {
        request(app).post("/login")
            .send(userPayload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "User login", data: { username: userPayload.username } })
                expect(res.body.data.token).not.toBe("")
                expect(res.body.data.refresh_token).not.toBe("")
                done()
            }).catch((err) => done(err))
    })

    it("should return 400 and valid response for wrong password", done => {
        request(app).post("/login")
            .send({ ...userPayload, password: "wrongpass" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "Either username or password is wrong" })
                done()
            }).catch((err) => done(err))
    })

    it("should return 400 and valid response for unknow user", done => {
        request(app).post("/login")
            .send({ ...userPayload, username: "randomuser" })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "User does not exist" })
                done()
            }).catch((err) => done(err))
    })
})