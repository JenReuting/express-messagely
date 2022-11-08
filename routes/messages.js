"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const Message = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function (req, res, next) {
  const { id } = req.body;

  const message = await Message.get(id);

  const current_user = res.locals.user.username;
  if (message.from_user.username !== current_user
    && message.to_user.username !== current_user) {
    throw new UnauthorizedError;
  }
  else {
    return res.json({ message });
  }

});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  const from_username = res.locals.user?.username;
  const { to_username, body } = req.body;
  const message = await Message.create({ from_username, to_username, body });
  return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  const current_user = res.locals.user?.username;
  const { id } = req.params;
  const message = await Message.get(id);

  if (message.to_user.username !== current_user) {
    throw new UnauthorizedError;
  }
  else {
    return res.json({ message: await Message.markRead(id) });
  }

});










module.exports = router;