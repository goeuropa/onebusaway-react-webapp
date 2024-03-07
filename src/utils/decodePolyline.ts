import { LatLngTuple, decode } from "@googlemaps/polyline-codec";

const decodeString = (encoded: string): LatLngTuple[] => {
  const decoded = decode(encoded, 5);
  // console.log({ decoded });
  return decoded;
};

export default decodeString;
