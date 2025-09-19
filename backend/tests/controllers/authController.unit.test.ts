import {
  registerHandler,
  loginHandler,
} from "../../src/controllers/authController";
import { connectTestDB, clearTestDB, closeTestDB } from "../setup";

describe("Auth Controller", () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let res: any;

  beforeAll(async () => await connectTestDB());
  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock };
  });

  afterEach(async () => await clearTestDB());
  afterAll(async () => await closeTestDB());

  it("registers a new user", async () => {
    const req = {
      body: {
        username: "Morkid",
        email: "morkid@example.com",
        password: "password",
      },
    } as any;

    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
      })
    );
  });

  it("disallows duplicate usernames or emails", async () => {
    const req = {
      body: {
        username: "Morkid",
        email: "morkid@example.com",
        password: "password",
      },
    } as any;

    // First call: should succeed
    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 201);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );

    // Clear mocks before second call to isolate results
    statusMock.mockClear();
    jsonMock.mockClear();

    // Second call: should fail with duplicate error
    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Username or email already in use",
      })
    );
  });

  it("lets registered users log in with username", async () => {
    let req = {
      body: {
        username: "Morkid",
        email: "morkid@example.com",
        password: "password",
      },
    } as any;

    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 201);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );

    statusMock.mockClear();
    jsonMock.mockClear();

    req = {
      body: {
        identifier: "Morkid",
        password: "password",
      },
    } as any;

    await loginHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );
  });

  it("lets registered users log in with email", async () => {
    let req = {
      body: {
        username: "Morkid",
        email: "morkid@example.com",
        password: "password",
      },
    } as any;

    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 201);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );

    statusMock.mockClear();
    jsonMock.mockClear();

    req = {
      body: {
        identifier: "morkid@example.com",
        password: "password",
      },
    } as any;

    await loginHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 200);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );
  });

  it("returns an error message on missing credentials", async () => {
    const req = {
      body: {
        tampon: "always",
      },
    } as any;

    await loginHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Missing required fields" })
    );
  });

  it("returns an error message on Invalid credentials", async () => {
    let req = {
      body: {
        username: "Morkid",
        email: "morkid@example.com",
        password: "password",
      },
    } as any;

    await registerHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 201);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        token: expect.any(String),
      })
    );

    statusMock.mockClear();
    jsonMock.mockClear();

    req = {
      body: {
        identifier: "Morkid",
        password: "wrong",
      },
    } as any;

    await loginHandler(req, res, jest.fn());

    expect(statusMock).toHaveBeenNthCalledWith(1, 401);
    expect(jsonMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: "Invalid credentials" })
    );
  });
});
