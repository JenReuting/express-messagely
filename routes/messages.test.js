"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");



describe("Message routes", function () {
  let u3Token;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query(`SELECT setval('messages_id_seq', 1, false)`
    );


    let u = await User.register({
      username: "test",
      password: "password",
      first_name: "Test",
      last_name: "Testy",
      phone: "+14155550000",
    });

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });

    let u3 = await request(app).post("/auth/register").send({
      username: "test3",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });

    u3Token = u3.body;


    let m = await Message.create({
      from_username: "test",
      to_username: "test2",
      body: "new",
    });

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test",
      body: "new",
    });
  });

  it("Shows details about a message", async function () {
    const _token = u3Token.token;

    const resp = await request(app).get("/messages/2").send({ _token });
    console.log("response >>>>>>>", resp.body);




  });








}
);