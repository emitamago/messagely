const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message")
const { SECRET_KEY } = require("../config")

let u1Token;
// let u1JoinAt;
// let u1LastLogIn;

describe("user Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");

        let u1 = await User.register({
            username: "test1",
            password: "password",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
        });

        u1Token = jwt.sign({ username:"test1" }, SECRET_KEY);
        // u1JoinAt = u1.join_at;
        // u1LastLogIn = u1.last_login_at;

        let u2 = await User.register({
            username: "test2",
            password: "password",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155550000",
        });

        let u3 = await User.register({
            username: "test3",
            password: "password",
            first_name: "Test3",
            last_name: "Testy3",
            phone: "+14155550000",
        });

        let m1 = await Message.create({
            from_username: "test1",
            to_username: "test2",
            body: "test1 to test2"
        });

        let m2 = await Message.create({
            from_username: "test1",
            to_username: "test3",
            body: "test1 to test3"
        });

        let m3 = await Message.create({
            from_username: "test2",
            to_username: "test1",
            body: "test2 to test1"
        });

        let m4 = await Message.create({
            from_username: "test3",
            to_username: "test1",
            body: "test3 to test1"
        });

    });

    /** GET / - get list of users.
     * VALIDATION: ensure logged in
     * => {users: [{username, first_name, last_name, phone}, ...]}
     **/

    describe("GET /users/", function () {
        test("can return all users info", async function () {
            let response = await request(app)
                .get("/users")
                .send({
                    _token: u1Token
                });

            console.log("resp.text is", typeof response.text);
            console.log("resp.body is", typeof response.body);
            
            expect(response.body).toEqual({
                users:
                [{
                    username: "test1",
                    first_name: "Test1",
                    last_name: "Testy1",
                    phone: "+14155550000"
                },
                {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000"
                },
                {
                    username: "test3",
                    first_name: "Test3",
                    last_name: "Testy3",
                    phone: "+14155550000"
                }]
            });
        });
    });



/** GET /:username - get detail of users.
 * VALIDATION: ensure correct user
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 **/

    describe("GET /users/:username", function () {
        // test for does not return user info if not signed in
        test("can return a user's info", async function () {
            let response = await request(app)
                .get("/users/test1")
                .send({
                    _token: u1Token
                });
   
            // console.log("response.body.user.join_at: ", response.body.user.join_at);
            
            // let testDate = new Date(response.body.user.join_at);
            // console.log("testDate is type: ", typeof testDate);
            //console.log("testDate: ", testDate);

            expect(response.body).toEqual({
                user:
                    {
                        username: "test1",
                        first_name: "Test1",
                        last_name: "Testy1",
                        phone: "+14155550000",
                        join_at: expect.any(String),
                        last_login_at: expect.any(String)
                    }
                });
        });
    });    

    afterAll(async function () {
        await db.end();
    });
});

