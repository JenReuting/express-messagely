"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");

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
  });



  it("Shows a list of all the users", async function () {
    let response = await request(app).get("/users/");

    expect(response.body).toEqual({
      users: [{
        username: "test",
        first_name: "Test",
        last_name: "Testy"
      }]
    }
    );

    expect(response.statusCode).toEqual(200);
  });
});

it("Shows the detail of one user", async function() {
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
})


afterAll(async function () {
  await db.end();
});
