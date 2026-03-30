import { Router } from "express";
import {
  getPlaceController,
  listPlacesController
} from "../controllers/placeController";
import { asyncHandler } from "../utils/asyncHandler";

const placeRouter = Router();

placeRouter.post("/", asyncHandler(listPlacesController));
placeRouter.get("/:id", asyncHandler(getPlaceController));

export default placeRouter;
