import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env";
import router from "./routes";
import { HttpError } from "./utils/httpError";

const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());

app.use("/api", router);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Route not found."));
});

app.use((error: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message =
    error instanceof HttpError ? error.message : "Something went wrong on the server.";

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message
  });
});

export default app;

