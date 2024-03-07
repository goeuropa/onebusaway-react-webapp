import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
//* Easy button
import "leaflet-easybutton/src/easy-button.js";
import "leaflet-easybutton/src/easy-button.css";

import locationIcon from "../../assets/Icons/locationIcon.svg";
import { locationAdjust } from "../../utils/helpers";
import { locationMapIcon } from "../../utils/mapIcons";
import { locateMeZoom } from "../../config";

const UseShowLocation: React.FC = () => {
  const leafletMap = useMap();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!leafletMap) return;
    if (leafletMap) {
      L.easyButton(`<img src=${locationIcon} >`, () => {
        leafletMap.locate().on("locationfound", function (event: { accuracy: number; latlng: LanLngPoint }) {
          const radius = event?.accuracy;
          //* ShowLocation: FlyTo
          leafletMap.flyTo(event.latlng, locateMeZoom, {
            duration: 1.5,
            easeLinearity: 0.5,
          });

          const circle = L.circle(event.latlng, radius, {
            stroke: true,
            color: "blueviolet",
            weight: 3,
            opacity: 1,
            fill: true,
            fillOpacity: 0.25,
          });
          circle.addTo(leafletMap);

          const markerHome = L.marker(event.latlng, { icon: locationMapIcon }).addTo(leafletMap);
          markerHome
            .bindPopup(
              `<em>${t("You_are_here")}: </em><br>
          <b>${locationAdjust(event.latlng).latStr}, ${locationAdjust(event.latlng).lngStr}</b></br>
          ${t("Accuracy")}: <b>${radius.toFixed(0)} m</b>`
            )
            .openPopup();

          setTimeout(() => {
            circle.remove();
            markerHome.remove();
          }, 8000);
        });
      })
        .setPosition("bottomright")
        .addTo(leafletMap);
    }
  }, [leafletMap, t]);
  return null;
};
export default UseShowLocation;
