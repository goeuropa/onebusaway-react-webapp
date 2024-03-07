import Leaflet from "leaflet";

import iconUrlGray from "../assets/Icons/busGray.svg";
import iconUrlBlue from "../assets/Icons/busBlue.svg";
import iconUrlBlueCircle from "../assets/Icons/busCircleBlue.svg";
import iconUrlGrayCircle from "../assets/Icons/busCircleGray.svg";
import iconUrlMapLocation from "../assets/Icons/locationMapIcon.svg";

export const busIconGray = new Leaflet.Icon({
  iconUrl: iconUrlGray,
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
  iconSize: [22, 22],
  tooltipAnchor: [11, 0],
  className: "bus_icon",
});

export const busIconBlue = new Leaflet.Icon({
  iconUrl: iconUrlBlue,
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
  iconSize: [22, 22],
  tooltipAnchor: [11, 0],
  className: "bus_icon",
});

export const busIconBlueCircle = new Leaflet.Icon({
  iconUrl: iconUrlBlueCircle,
  iconAnchor: [6, 6],
  // popupAnchor: [0, -6],
  iconSize: [12, 12],
  tooltipAnchor: [0, -6],
  className: "bus_icon_circle",
});

export const busIconGrayCircle = new Leaflet.Icon({
  iconUrl: iconUrlGrayCircle,
  iconAnchor: [6, 6],
  // popupAnchor: [0, -6],
  iconSize: [12, 12],
  tooltipAnchor: [0, -6],
  className: "bus_icon_circle",
});

export const locationMapIcon: Leaflet.Icon = new Leaflet.Icon({
  iconUrl: iconUrlMapLocation,
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  // tooltipAnchor: [0, 0],
  iconSize: [28, 28],
  className: "bus_icon",
});
