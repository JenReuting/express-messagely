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

  //if verified, put token on res.locals.user
  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    await User.updateLoginTimestamp(username);
    return res.json({ token });
  } else {
    throw new UnauthorizedError("Invalid username and/or password");
  }

});

/** POST /register: registers, logs in, and returns token.
 * Handles the Register POST route. Registers a user with provided data,
 * and on success logs in user and returns a token. Else if not successful
 * throws a bad request error.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { username } = await User.register(req.body);

  if (!username) throw new BadRequestError();

  const token = jwt.sign({ username }, SECRET_KEY);
  User.updateLoginTimestamp(username);

  return res.json({ token });

});






module.exports = router;