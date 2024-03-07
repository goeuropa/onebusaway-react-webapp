import React from "react";
import { useMap } from "react-leaflet";

import { useAppSelector } from "../redux/hooks";
import { zoomForSelectedBusStation } from "../config";

const MapHooks: React.FC = () => {
  const [selectedStop]: [StopInfo] = useAppSelector((state: RootState) => [state?.selectedStop?.stop]);
  const leafletMap = useMap();
  // console.log("leafletMap:", leafletMap);

  React.useEffect(() => {
    if (selectedStop && Object.keys(selectedStop).length >= 1) {
      // console.log("selectedStop:", selectedStop);
      const lat = selectedStop?.lat;
      const lon = selectedStop?.lon!;
      const zoom = zoomForSelectedBusStation;

      const mapZoomTo = (lat: number, lon: number, zoom: number) => {
        setTimeout(() => {
          leafletMap && leafletMap.setView([lat, lon], zoom, { animate: false });
        }, 500);
      };
      mapZoomTo(lat, lon, zoom);
    }
  }, [leafletMap, selectedStop]);

  return null;
};

export default MapHooks;
