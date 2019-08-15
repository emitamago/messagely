
const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const router = new express.Router();


/** GET / - get list of users.
 * VALIDATION: ensure logged in
 * => {users: [{username, first_name, last_name, phone}, ...]}
 **/
router.get('/', ensureLoggedIn, async function(req, res, next){
    try {
        let response = await User.all();
        return res.json({users: response});
    } catch(err) {
        next(err);
    }
});


/** GET /:username - get detail of users.
 * VALIDATION: ensure correct user
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 **/
router.get('/:username', ensureCorrectUser, async function(req, res, next){
    try {
        let response = await User.get(req.params.username);
        return res.json({user: response});
    } catch(err) {
        next(err);
    }
});


/** GET /:username/to - get messages to user
 * VALIDATION: ensure correct user
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 **/
router.get('/:username/to', ensureCorrectUser, async function(req, res, next){
    try {
        let response = await User.messagesTo(req.params.username)
        return res.json({messages: response});
    } catch(err) {
        next(err);
    }
});


/** GET /:username/from - get messages from user
 * VALIDATION: ensure correct user
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async function(req, res, next){
    try {
        let responses = await User.messagesFrom(req.params.username);
        return res.json({messages:responses});
    } catch(err) {
        next(err);
    }
})


module.exports = router;
