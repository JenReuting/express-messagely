"use strict";

const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require("../db");
const { BadRequestError } = require('../expressError');

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
      VALUES
        ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`, [username]
    );

    const user = result.rows[0];

    if (user) {
      return (await bcrypt.compare(password, user.password) === true);
    }
    throw new UnauthorizedError("Invalid user/password");
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`, [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {

    const result = await db.query(`
    SELECT username,
    first_name,
    last_name
    FROM users
    ORDER BY last_name, first_name
    `);

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
      SELECT username,
      first_name,
      last_name,
      phone,
      join_at,
      last_login_at
      FROM users
      WHERE username = $1`, [username]
    );

    const user = result.rows[0];

    if (user) {
      return user;
    } else {
      throw new BadRequestError();
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = db.query(`
      SELECT id,
        to_user,
        body,
        sent_at,
        read_at,
      FROM messages AS m
      JOIN users AS fU ON (m.from_username = fU.username)
      WHERE fU.username = $1`, [username]
    )

    return result.rows;

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
