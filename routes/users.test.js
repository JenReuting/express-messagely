"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

describe("User routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
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



  it("Shows a list of all the users", async function () {
    let response = await request(app).get("/users/");

    expect(response.body).toEqual({
      users: [{
        username: "test",
        first_name: "Test",
        last_name: "Testy"
      }, {
        username: "test2",
        first_name: "Test2",
        last_name: "Testy2"
      }]
    }
    );

    expect(response.statusCode).toEqual(200);
  });
});

it("Shows the detail of one user", async function () {
  let response = await request(app).get("/users/test");

  expect(response.body).toEqual({
    user: {
      username: "test",
      first_name: "Test",
      last_name: "Testy",
      phone: "+14155550000",
      last_login_at: expect.any(String),
      join_at: expect.any(String)
    }
  });

  expect(response.statusCode).toEqual(200);
});


it("Shows the messages sent to a user", async function () {
  let response = await request(app).get("/users/test/to");

  expect(response.body).toEqual({
    messages: [{
      id: expect.any(Number),
      from_user: {
        username: "test2",
        first_name: "Test2",
        last_name: "Testy2",
        phone: "+14155552222",
      },
      body: "new",
      sent_at: expect.any(String),
      read_at: null,
    }]
  });

  expect(response.statusCode).toEqual(200);


}


);
it("Shows the messages sent from a user", async function () {
  let response = await request(app).get("/users/test/from");

  expect(response.body).toEqual({
    messages: [{
      id: expect.any(Number),
      to_user: {
        username: "test2",
        first_name: "Test2",
        last_name: "Testy2",
        phone: "+14155552222",
      },
      body: "new",
      sent_at: expect.any(String),
      read_at: null,
    }]
  });

  expect(response.statusCode).toEqual(200);


}


);



afterAll(async function () {
  await db.end();
});



