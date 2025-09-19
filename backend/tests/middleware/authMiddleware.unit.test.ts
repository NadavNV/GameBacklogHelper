import {
  authMiddleware,
  AuthRequest,
} from "../../src/middleware/authMiddleware";
import * as jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";

describe("authMiddleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("responds 401 if no authorization header", () => {
    authMiddleware(req as AuthRequest, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing authorization header",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 if authorization header is malformed", () => {
    req.headers = { authorization: "invalidtoken" };

    authMiddleware(req as AuthRequest, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid authorization header",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 if token is invalid", () => {
    req.headers = { authorization: "Bearer faketoken" };
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(req as AuthRequest, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.userId and calls next if token is valid", () => {
    req.headers = { authorization: "Bearer validtoken" };
    jest.spyOn(jwt, "verify").mockReturnValue({ userId: "123" } as any);

    authMiddleware(req as AuthRequest, res as Response, next as NextFunction);

    expect(req.userId).toBe("123");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
