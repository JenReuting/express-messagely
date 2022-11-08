"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");


const { authenticateJWT } = require("../middleware/auth.js");
const User = require("../models/user");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const { SECRET_KEY } = require("../config");

/** POST /login: {username, password} => {token} */
/** Handles the login POST route. If successful: Takes in a username and password,
 * updates the Login Timestamp, generates a new token and signs it, returns the
 * token in the body of the response.
 * If unsuccessful: Throws new BadRequestError if body is empty or Unauthorized
 * Error if user/password invalid.
 */
router.post("/login", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;
  console.log(req.body);

  //if verified, put token on res.locals.user
  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ token });
  } else {
    throw new UnauthorizedError("Invalid username and/or password");
  }

});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */








module.exports = router;