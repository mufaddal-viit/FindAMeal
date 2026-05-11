import { Router } from "express";
import {
  getPlaceController,
  listPlacesController
} from "../controllers/placeController";
import { asyncHandler } from "../utils/asyncHandler";

const placeRouter = Router();

// Support both POST (with body) and GET (with query params) for listing
placeRouter.post("/", asyncHandler(listPlacesController));
placeRouter.get("/", asyncHandler(listPlacesController));

placeRouter.get("/:id", asyncHandler(getPlaceController));

export default placeRouter;
