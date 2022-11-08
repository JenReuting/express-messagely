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
    console.log('user: ', u);
  });



  it("Shows a list of all the users", async function () {
    let response = await request(app).get("/users/");
    console.log('response from TEST ROUTE', response.body);

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


afterAll(async function () {
  await db.end();
});
