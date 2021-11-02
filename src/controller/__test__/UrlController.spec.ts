import * as request from 'supertest';
import { Express } from 'express'
import { createServer } from '../../utils/server';
import { TestHelper } from '../../utils/TestHelper';


let app: Express;
let token: string, shortId: string, expiryDate: string, id: number

const userPayload = { username: "testduser", password: "test1234" }
const urlPayload = { actualUrl: "https://github.com/AiverReaver/dyte-challenge-full-stack-backend" }
const updateUrlPayload = { newShortId: "myUrl", newActualUrl: "https://github.com/AiverReaver/dyte-challenge-full-stack-frontend" }

beforeAll(async () => {
    await TestHelper.instance.setupTestDB()
    process.env.JWT_SECRET = "testkey"
    process.env.JWT_REFRESH_SECRET = "testkey"
    app = await createServer();
})

beforeAll((done) => {
    request(app).post("/register")
        .send(userPayload)
        .set('Accept', 'application/json')
        .then(res => {
            request(app)
                .post("/login")
                .send(userPayload)
                .set('Accept', 'application/json')
                .then(res => {
                    token = res.body.data.token
                    done()
                })
        }).catch((err) => { done(err) })
})

afterAll(() => {
    TestHelper.instance.teardownTestDB()
})

describe("POST /url/shorten", () => {


    it('should return 401 & valid response for unauthorised user', done => {
        request(app).post("/url/shorten")
            .send(urlPayload)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401).then(res => {
                expect(res.body).toMatchObject({ message: "unauthorised" })
                done()
            }).catch((err) => done(err))
    })

    it('should return 201 & valid response for authorised user', done => {
        request(app).post("/url/shorten")
            .send(urlPayload)
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(201).then(res => {
                expect(res.body)
                    .toMatchObject({
                        message: "url shorten",
                        data: {
                            actualUrl: urlPayload.actualUrl,
                            visitors: 0,
                            views: 0,
                            lastDevice: "unknown",
                            lastBrowser: "unknown",
                        }
                    })
                expect(res.body.data.shortId).toBeTruthy()
                expect(res.body.data.expiryDate).toBeTruthy()
                shortId = res.body.data.shortId;
                expiryDate = res.body.data.expiryDate;
                id = res.body.data.id
                done()
            }).catch((err) => done(err))
    })

    it("should return 201 && valid response for same actual url", (done) => {
        request(app).post("/url/shorten")
            .send(urlPayload)
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(201).then(res => {
                expect(res.body)
                    .toMatchObject({
                        message: "URL Already shorten by you",
                        data: {
                            actualUrl: urlPayload.actualUrl,
                            visitors: 0,
                            views: 0,
                            lastDevice: "unknown",
                            lastBrowser: "unknown",
                            shortId,
                            expiryDate
                        }
                    })

                done()
            }).catch((err) => done(err))
    })

    it("should return 400 && valid response for invalid url", (done) => {
        request(app).post("/url/shorten")
            .send({ actualUrl: "invalidurl" })
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body)
                    .toMatchObject({
                        message: "Invalid Url",
                    })

                done()
            }).catch((err) => done(err))
    })

})

describe("get /url", () => {

    it('should return 401 && valid response for unauthorised user', done => {
        request(app).get("/url")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401).then(res => {
                expect(res.body).toMatchObject({ message: "unauthorised" })
                done()
            }).catch((err) => done(err))
    })

    it('should return 200 & valid response for authorised user', done => {
        request(app).get("/url")
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "urls fetched", data: expect.any(Array) })
                done()
            }).catch((err) => done(err))
    })

})

describe("Patch /url/:id", () => {
    it('should return 401 && valid response for unauthorised user', done => {
        request(app).patch(`/url/${id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401).then(res => {
                expect(res.body).toMatchObject({ message: "unauthorised" })
                done()
            }).catch((err) => done(err))
    })

    it('should return 400 && valid response for authorised user with url id that does not exist', done => {
        request(app).patch(`/url/500`)
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "Url not found" })
                done()
            }).catch((err) => done(err))
    })

    it('should return 400 && valid response for authorised user with shortId and actual url that already exist', done => {
        request(app).patch(`/url/${id}`)
            .send({ newShortId: shortId, newActualUrl: urlPayload.actualUrl })
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "Short url With that id already exist" })
                done()
            }).catch((err) => done(err))
    })

    it("should return 200 & valid response for authorised user with newShortId", done => {
        request(app).patch(`/url/${id}`)
            .send({ newShortId: updateUrlPayload.newShortId, newActualUrl: urlPayload.actualUrl })
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "url updated successfully" })
                done()
            }).catch((err) => done(err))
    })

    it("should return 200 & valid response for authorised user with newActualUrl", done => {
        request(app).patch(`/url/${id}`)
            .send(updateUrlPayload)
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "url updated successfully" })
                done()
            }).catch((err) => done(err))
    })

    it("should return 200 & valid response for authorised user when both shortId and actual are updated", done => {
        request(app).patch(`/url/${id}`)
            .send({ newShortId: "testshortId", newActualUrl: "https://www.google.com" })
            .set('Accept', 'application/json')
            .set("token", token)
            .expect('Content-Type', /json/)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "url updated successfully" })
                done()
            }).catch((err) => done(err))
    })
})

describe("delete /url/:shortId", () => {

    let deleteShortId: string
    beforeAll((done) => {
        request(app).post("/url/shorten")
            .send({ actualUrl: "https://www.github.com/" })
            .set('Accept', 'application/json')
            .set("token", token)
            .then(res => {
                deleteShortId = res.body.data.shortId
                done()
            }).catch((err) => done(err))
    })

    it('should return 401 && valid response for unauthorised user', done => {
        request(app).delete(`/url/${deleteShortId}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401).then(res => {
                expect(res.body).toMatchObject({ message: "unauthorised" })
                done()
            }).catch((err) => done(err))
    });

    it('should return 400 && valid response for authorised user with invalid shortId', done => {
        request(app).delete(`/url/invalidId`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .set("token", token)
            .expect(400).then(res => {
                expect(res.body).toMatchObject({ message: "Url not found" })
                done()
            }).catch((err) => done(err))
    });

    it('should return 200 && valid response for authorised user with valid shortId', done => {
        request(app).delete(`/url/${deleteShortId}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .set("token", token)
            .expect(200).then(res => {
                expect(res.body).toMatchObject({ message: "deleted Successfully" })
                done()
            }).catch((err) => done(err))
    });
})