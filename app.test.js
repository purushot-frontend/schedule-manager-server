const request = require("supertest");
const app = require("./app");

describe("Test the root path", () => {
  test("It should display 'direct access not allowed'", (done) => {
    request(app)
      .get("/")
      .then((response) => {
        expect(response.body.message).toBe("direct access not allowed");
        done();
      });
  });
});
