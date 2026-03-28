import type { Request, Response } from "express";
import { getPlaceById, getPlaces } from "../services/placeService";
import { HttpError } from "../utils/httpError";
import { parsePlaceFilters } from "../utils/placeFilters";

export async function listPlacesController(req: Request, res: Response) {
  const filters = parsePlaceFilters(req.query);
  const result = await getPlaces(filters);

  res.status(200).json({
    data: result.data,
    meta: {
      ...result.meta,
      source: result.source
    }
  });
}

export async function getPlaceController(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const result = await getPlaceById(id);

  if (!result.data) {
    throw new HttpError(404, "Place not found.");
  }

  res.status(200).json({
    data: result.data,
    meta: {
      source: result.source
    }
  });
}
