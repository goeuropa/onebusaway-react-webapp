//* Agency Config
import logoOBA from "./assets/Logo/logoOBA.png"; //* customize here
export const logo = logoOBA;
export const fetchOnStart = true;
export const listPositionForAgency = 0; //* y
export const minLinesAtStop = 4; //* customize here
export const reducePolylinesPoints = 3; //* customize here
export const showChangeLanguage = true; //* customize here
export const prefixURL = ""; //! Add api here!
export const appName = "OneBusAway React WebApp"; //* customize here
export const zoomRange = 0.01; //* customize here
export const api_key = ""; //! Add key here!
export const key_siri = ""; //! Add key here!
export const api_key2 = ""; //! Add key here!
export const zoomEnableSwitch = 14; //* customize here
export const zoomForSelectedBusStation = 14; //* customize here
export const zoomFullIcons = 10.5; //* customize here
export const zoomBusOnlyCircle = 8.8; //* customize here
export const clustersZoom = 9; //* customize here
export const locateMeZoom = 18; //* customize here
export const rootStateStorage = "rootState_OBA"; //* customize here
export const routeListButtonWidth = "42px"; //* customize here
export const showDepartureBoardLink = true; //* customize here
export const defaultLanguage = "en"; //* customize here
export const showOnlyTheLongest = true; //* customize here

//* Common Settings
export const fetchInterval = process.env.NODE_ENV === "development" ? 100 * 1000 : 30 * 1000; //!fetchInterval (15s-30s)
export const fetchIntervalStop = process.env.NODE_ENV === "development" ? 100 * 1000 : 30 * 1000; //!fetchInterval (30s)
export const maximumNumberOfCallsOnwards = 15;
export const i18nPrefix = "";
export const reactRouterBaseLine = "";
export const showDevInfo = process.env.NODE_ENV === "development" ? true : false; //! showDevInfo;

//@ Bootstrap_5 breakpoint: large, lg>=992
//^ Breakpoints
const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "992px",
  xl: "1280px",
  "2xl": "1536px",
};

export const devices = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  "2xl": `(min-width: ${breakpoints["2xl"]})`,
};
