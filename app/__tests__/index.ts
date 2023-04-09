const axios = require("axios");

const server = axios.create({
  baseURL: "http://localhost:8000",
});

describe("test Routes", () => {
  it("GET /api/user", () => {
    server.get("api/user").then((res) => {
      expect(res.status).toBe(200);
      expect(res.data[0]).toMatchObject({
        id: 1,
        email: "markossankey@icloud.com",
        globalUsername: "markossankey",
        createdAt: "2023-04-08T04:36:55.612Z",
        updatedAt: "2023-04-08T04:36:55.612Z",
      });
    });
  });
  it("GET /api/user", () => {
    server.get("api/user").then((res) => {
      expect(res.status).toBe(200);
      expect(res.data[0]).toMatchObject({
        id: 1,
        email: "markossankey@icloud.com",
        globalUsername: "markossankey",
        createdAt: "2023-04-08T04:36:55.612Z",
        updatedAt: "2023-04-08T04:36:55.612Z",
      });
    });
  });
});
