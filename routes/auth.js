const express = require("express");

const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config')
const ExpressError = require("../expressError")

const router = new express.Router();



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
   
        if (await User.authenticate(username, password) === true) {

            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token });

        }
        throw new ExpressError("Invaild user/password", 400);
    } catch (error) {
        return next(error);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        await User.register({ username, password, first_name, last_name, phone })
        let token = jwt.sign({ username }, SECRET_KEY);

        return res.json({ token });

    } catch (err) {
        return next(err);
    }
});


module.exports = router;