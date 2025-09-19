import * as request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { Game } from "../src/models/Game";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

describe("App Routes with in-memory MongoDB", () => {
  let token: string;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectTestDB();
    userId = new mongoose.Types.ObjectId();
    token = jwt.sign({ userId: userId.toString() }, JWT_SECRET);
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("Auth routes", () => {
    it("POST /auth/register returns 400 if fields missing", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ username: "user" });
      expect(res.status).toBe(400);
    });

    it("POST /auth/login returns 400 if credentials invalid", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "nonexistent", password: "wrong" });
      expect(res.status).toBe(400);
    });
  });

  describe("Game routes", () => {
    it("POST /api/games adds a game", async () => {
      const res = await request(app)
        .post("/api/games")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Halo Infinite",
          status: "backlog",
          length: "long",
          platform: "Xbox One",
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Halo Infinite");
    });

    it("GET /api/games returns user's games", async () => {
      await Game.create({
        title: "Forza Horizon 5",
        status: "backlog",
        length: "long",
        platform: "PC",
        userId,
      });

      const res = await request(app)
        .get("/api/games")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Forza Horizon 5");
    });

    it("GET /api/games without auth returns 401", async () => {
      const res = await request(app).get("/api/games");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Missing authorization header");
    });

    it("GET /api/games/suggest returns top 5 backlog/abandoned games", async () => {
      await Game.insertMany([
        {
          title: "Short PC",
          status: "backlog",
          length: "short",
          platform: "PC",
          metacriticScore: 90,
          userId,
        },
        {
          title: "Medium PS5",
          status: "backlog",
          length: "medium",
          platform: "PlayStation 5",
          metacriticScore: 88,
          userId,
        },
        {
          title: "Long Xbox",
          status: "abandoned",
          length: "long",
          platform: "Xbox One",
          metacriticScore: 70,
          userId,
        },
        {
          title: "Finished Game",
          status: "finished",
          length: "short",
          platform: "PC",
          metacriticScore: 95,
          userId,
        },
        {
          title: "Low Score",
          status: "backlog",
          length: "long",
          platform: "PC",
          metacriticScore: 40,
          userId,
        },
        {
          title: "Another High Score",
          status: "backlog",
          length: "short",
          platform: "PC",
          metacriticScore: 92,
          userId,
        },
      ]);

      const res = await request(app)
        .get("/api/games/suggest")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      const titles = res.body.map((g: any) => g.title);

      expect(titles).toEqual([
        "Another High Score",
        "Short PC",
        "Medium PS5",
        "Long Xbox",
        "Low Score",
      ]);
    });
  });
});
