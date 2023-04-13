const axios = require("axios");

const server = axios.create({
  baseURL: "http://localhost:8000",
});

const testUser = {
  email: "test@mail.com",
  globalUsername: "test",
};

describe("create and delete user", () => {
  it("POST /api/user to create a user and return 201 with user data", () => {
    server.post("/api/user", testUser).then((res) => {
      expect(res.data.email).toEqual(testUser.email);
      expect(res.data.globalUsername).toEqual(testUser.globalUsername);
      expect(res.data).toHaveProperty("createdAt");
      expect(res.data).toHaveProperty("updatedAt");
    });
  });
  it("DELETE /api/user/:globalUsername to delete the user and return 200 with user data", () => {
    server.delete(`/api/user/${testUser.globalUsername}`).then((res) => {
      expect(res.data.email).toEqual(testUser.email);
      expect(res.data.globalUsername).toEqual(testUser.globalUsername);
      expect(res.data).toHaveProperty("createdAt");
      expect(res.data).toHaveProperty("updatedAt");
    });
  });
});

describe("test Routes", () => {
  beforeAll(() => {
    server.post("/api/user", testUser)(testUser);
  });

  afterAll(() => {
    server.delete(`/api/user/${testUser.globalUsername}`);
  });

  it("GET /api/user to return the newly created user", () => {
    server.get("/api/user").then((res) => {
      console.log(res.data);
    });
  });
});
