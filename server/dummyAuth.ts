import { RequestHandler } from "express";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // For local development, always allow access and provide a dummy user
  req.user = {
    claims: {
      sub: "dummy_user_id",
      email: "dummy@example.com",
      firstName: "Dummy",
      lastName: "User",
    },
  };
  next();
};