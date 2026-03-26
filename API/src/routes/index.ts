import { Router } from "express";
import { env } from "../config/env";
import placeRouter from "./placeRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    message: "FindAMeal API is running.",
    environment: env.nodeEnv,
    source: "demo"
  });
});

router.use("/places", placeRouter);

export default router;
