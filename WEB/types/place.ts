export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  cuisines: string[];
  imageUrl: string;
  priceLevel: string;
  rating: number;
  coordinates?: Coordinates;
}

export interface PlacesResponse {
  data: Place[];
  meta: {
    query: string;
    total: number;
    source: string;
  };
}

export interface PlaceResponse {
  data: Place;
  meta: {
    source: string;
  };
}
