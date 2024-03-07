import React from "react";
import styled from "styled-components";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  ScaleControl,
  CircleMarker,
  Tooltip,
  Rectangle,
  FeatureGroup,
} from "react-leaflet";
import * as turf from "@turf/turf";
import L, { LeafletMouseEvent, Map } from "leaflet";
import { useTranslation } from "react-i18next";
import { Nav } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import MarkerClusterGroup from "react-leaflet-cluster";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import decodeString from "../utils/decodePolyline";
import { busIconGray, busIconBlue, busIconBlueCircle, busIconGrayCircle } from "../utils/mapIcons";
import { dispatchModalInfoBottomIsOpen, dispatchZoom, setLoadingAction } from "../redux/actions";
import BusInfoComponent from "./BusInfoComponent";
import {
  clustersZoom,
  minLinesAtStop,
  reducePolylinesPoints,
  showDepartureBoardLink,
  showOnlyTheLongest,
  zoomBusOnlyCircle,
  zoomEnableSwitch,
  zoomForSelectedBusStation,
  zoomFullIcons,
  zoomRange,
  showDevInfo,
} from "../config";
import directionIconBlue from "../assets/Icons/directionBlue.svg";
import directionIconDim from "../assets/Icons/directionDim.svg";
import { cutAgencyName, dynamicTexColor, infoNotify, removeDuplicateStops } from "../utils/helpers";
import directionIconGreen from "../assets/Icons/directionGreen.svg";
import MapHooks from "./MapHooks";
import AvailableRoutes from "./AvailableRoutes";
import UseShowLocation from "./Services/UseShowLocation";
import useNetworkStatus from "./Services/useNetworkStatus";

const MapWrapper = styled.div<{ $isModalInfoBottomOpen: boolean }>`
  height: ${(props) => (props.$isModalInfoBottomOpen ? "calc((100vh  / 2) - var(--constantHeaderHeight))" : "100%")};
  width: 100%;
`;

const BusTooltip = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  gap: 0.25rem;
  &.selected {
    border: 2px solid blue;
    background-color: lightcyan;
    font-weight: bold;
    font-size: 120%;
    padding: 0.25rem;
  }
`;

const rectangleOptions = {
  color: "gray",
  stroke: false,
  fillOpacity: 0.15,
  interactive: false,
  bubblingMouseEvents: false,
};

const StopInfoDiv = styled.div`
  font-size: small;
  p {
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    align-content: center;
    gap: 0.25rem;
  }
`;

const MapComponent = ({ showTooltips }: { showTooltips: boolean }): JSX.Element => {
  const { isMobile } = useNetworkStatus();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location?.pathname;
  // console.log({ showTooltips });

  const dispatch: Dispatch = useAppDispatch();

  const [
    isModalInfoBottomOpen,
    polylines,
    routeNumber,
    buses,
    stops,
    zoom,
    zoomToSelectedBusStation,
    selectedStop,
    allPolylinesStopsFromRedux,
    allBusesFromRedux,
    agencyId,
    initialMapRange,
    loadingState,
    showLiveBuses,
    showScheduledBuses,
    grayscaleMap,
    allRoutesTableFromRedux,
  ]: [
    boolean,
    { points: string }[],
    string,
    BusInfo[],
    StopInfo[],
    number,
    boolean,
    StopInfo,
    AllPolylinesStops[],
    BusInfo[],
    string,
    { lat: number; lon: number; latSpan: number; lonSpan: number },
    boolean,
    boolean,
    boolean,
    boolean,
    RouteInfo[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.appSettings?.isModalInfoBottomOpen,
      state?.polylines_Stops?.entry?.polylines,
      state?.agency?.routeNumber,
      state?.buses.buses,
      state?.polylines_Stops?.references?.stops,
      state?.zoom?.zoom,
      state?.selectedStop?.zoomed,
      state?.selectedStop?.stop,
      state?.allData?.polylinesStops,
      state?.allData?.activeBlocksBuses,
      state?.agency?.agencyId,
      state?.agency?.initialMapRange,
      state?.loading.setLoading,
      state?.appSettings?.showLiveBuses,
      state?.appSettings?.showScheduledBuses,
      state?.appSettings?.grayscaleMap,
      state?.allData?.allRoutesTableReduced,
    ],
    shallowEqual
  );
  // console.info({ allRoutesTableFromRedux });

  const [polylinesToDraw, setPolylinesToDraw] = React.useState<Line[]>([]);
  const [busesToShow, setBusesToShow] = React.useState<Array<BusInfo>>([]);
  const [displayStops, setDisplayStops] = React.useState<Array<StopInfo>>([]);

  const [range1, setRange1] = React.useState<LanLngPoint>(
    !initialMapRange
      ? { lat: 0, lng: 0 }
      : {
          lat: initialMapRange.lat - initialMapRange.latSpan / 2,
          lng: initialMapRange.lon - initialMapRange.lonSpan / 2,
        }
  );
  const [range2, setRange2] = React.useState<LanLngPoint>(
    !initialMapRange
      ? { lat: 0, lng: 0 }
      : {
          lat: initialMapRange.lat + initialMapRange.latSpan / 2,
          lng: initialMapRange.lon + initialMapRange.lonSpan / 2,
        }
  );

  const [mapView, setMapView] = React.useState<Map | null>(null);
  const [loading, setLoading] = React.useState<boolean>(loadingState ? loadingState : true);

  // * New Start Site - Get all polylines, stops and buses
  const [allData, setAllData] = React.useState<AllPolylinesStops[]>([]);
  const [allPolylines, setAllPolylines] = React.useState<AllPolylinesStops[]>([]);
  const [allStops, setAllStops] = React.useState<StopInfo[]>([]);
  const [appPath, setAppPath] = React.useState<string[]>(["/"]);
  const [allActiveBuses, setAllActiveBuses] = React.useState<BusInfo[]>([]);
  const [allActiveBusesMonitored, setAllActiveBusesMonitored] = React.useState<BusInfo[]>([]);
  const [allActiveBusesNotMonitored, setAllActiveBusesNotMonitored] = React.useState<BusInfo[]>([]);
  const [allRoutesTable, setAllRoutesTable] = React.useState<RouteInfo[] | null>(null);
  // console.info("allPolylines:", allPolylines);

  const markerRefs = React.useRef<Array<any>>([]);

  const bounds = L.latLngBounds([range1, range2]);
  // console.log({ bounds });

  //* New Site - tooltips
  React.useEffect(() => {
    setTimeout(() => {
      // console.log("markerRefs:", markerRefs);
      if (markerRefs && markerRefs.current.length >= 1) {
        // console.log("markerRefs.current:", markerRefs.current);
        // markerRefs.current[0].current.openTooltip();
        if (zoom >= zoomFullIcons) {
          for (let i = 0; i < markerRefs.current.length; i++) {
            markerRefs.current[i].current && markerRefs.current[i].current.openTooltip();
          }
        }
        if (zoom < zoomFullIcons) {
          for (let i = 0; i < markerRefs.current.length; i++) {
            markerRefs.current[i].current && markerRefs.current[i].current.closeTooltip();
          }
        }
      }
    }, 500);
  }, [zoom]);

  //Todo: remove state, check pathName in MapContainer?
  //* New Site - location
  React.useEffect(() => {
    if (!pathName.includes("stop") && !pathName.includes("route") && !pathName.includes("vehicle")) {
      setAppPath(["app"]);
    }
    if (pathName.includes("stop")) {
      setAppPath(["stop"]);
    }
    if (pathName.includes("route")) {
      setAppPath(["route"]);
    }
    if (pathName.includes("vehicle")) {
      // console.log({ pathName });
      const currentPath = pathName.replace("/app/", "");
      const currentPathArray = currentPath.split("/");
      // console.log({ currentPathArray });
      setAppPath([currentPathArray[currentPathArray.length - 2], currentPathArray[currentPathArray.length - 1]]);
    }
  }, [pathName]);

  //* New Site - zoomToBounds
  React.useEffect(() => {
    if (initialMapRange && Object.keys(initialMapRange).length >= 1 && mapView && appPath[0] === "app") {
      mapView.closePopup();
      const range1 = {
        lat: initialMapRange.lat - initialMapRange.latSpan / 2,
        lng: initialMapRange.lon - initialMapRange.lonSpan / 2,
      };
      const range2 = {
        lat: initialMapRange.lat + initialMapRange.latSpan / 2,
        lng: initialMapRange.lon + initialMapRange.lonSpan / 2,
      };
      const zoomToBounds = (range1: { lat: number; lng: number }, range2: { lat: number; lng: number }) => {
        setTimeout(() => {
          mapView.fitBounds(
            [
              [range1?.lat, range1?.lng],
              [range2?.lat, range2?.lng],
            ],
            { animate: false }
          );
        }, 500);
      };
      zoomToBounds(range1, range2);
    }
  }, [appPath, initialMapRange, mapView]);

  // setLoading -> Loader - Spinner
  React.useEffect(() => {
    setTimeout(() => {
      dispatch(setLoadingAction(false));
      setLoading(false);
    }, 500);
  }, [dispatch]);

  React.useEffect(() => {
    if (polylines) {
      // console.log({ polylinesStrings });
      let polylinesDecoded: Line[] = [];
      const polylinesStrings: string[] = [];
      polylines.forEach((polyline: { points: string }) => {
        polylinesStrings.push(polyline.points);
        polylinesDecoded = polylinesStrings.map((polyline: string) => decodeString(polyline));
        // console.log("polylinesDecoded:", polylinesDecoded, polylinesDecoded.length);
        polylinesDecoded.sort(function (line_A: Line, line_B: Line) {
          return line_A.length - line_B.length;
        });
        // console.log("polylinesDecoded:", polylinesDecoded, polylinesDecoded.length);
        setPolylinesToDraw(polylinesDecoded);
      });
    }
  }, [polylines]);

  React.useEffect(() => {
    if (polylinesToDraw.length) {
      const multiLine = turf.multiLineString(polylinesToDraw);
      // console.log({multiLine});

      // Map range
      const bbox = turf.bbox(multiLine);
      // console.log({ bbox });
      setRange1({ lat: bbox?.[0] - zoomRange, lng: bbox?.[1] - zoomRange });
      setRange2({ lat: bbox?.[2] + zoomRange, lng: bbox?.[3] + zoomRange });
    }
  }, [polylinesToDraw]);

  // Dispatching zoom to the redux state onLoad
  React.useEffect(() => {
    if (mapView) {
      const zoom = mapView?.getZoom();
      // console.info({ zoom });
      dispatch(dispatchZoom(zoom as number));
    }
  }, [dispatch, mapView]);

  // Dispatching zoom to the redux state on zoom_on/zoom_of
  React.useEffect(() => {
    if (!mapView) return;
    mapView.on("zoomend", function () {
      const zoom = mapView?.getZoom();
      //  console.info({ zoom });
      dispatch(dispatchZoom(zoom as number));
    });
  }, [dispatch, mapView]);

  React.useEffect(() => {
    if (buses) {
      // console.log({ buses }, buses.length);
      setBusesToShow(buses);
    }
  }, [buses]);

  React.useEffect(() => {
    if (stops) {
      setDisplayStops(stops);
    }
  }, [stops]);

  // * New Start Site - All Data - local State
  React.useEffect(() => {
    if (allPolylinesStopsFromRedux) {
      const allDataToSet = JSON.parse(JSON.stringify(allPolylinesStopsFromRedux));
      setAllData(allDataToSet);
    }
  }, [allPolylinesStopsFromRedux]);

  // * New Start Site - Get all polylines, stops and buses
  React.useEffect(() => {
    if (allData && allData?.length && displayStops) {
      for (let i = 0; i < allData?.length; i++) {
        let polylinesDecoded = allData[i]?.polylines?.map((polyline) => decodeString(polyline?.points));
        polylinesDecoded?.sort(function (line_A, line_B) {
          return line_B.length - line_A.length;
        });
        //* Render only first (the longest) part of route
        if (showOnlyTheLongest) {
          polylinesDecoded = polylinesDecoded.slice(0, 1);
        }
        //* Put polylinesDecoded into allData
        allData[i].polylinesDecoded = polylinesDecoded;
      }

      //* Deselect selected route (currently all routes switched off)
      // const stopsRoutesToSet = allData.filter((item) => cutAgencyName(item.routeId, agencyId) !== routeNumber);
      // console.log("stopsRoutesToSet:", stopsRoutesToSet);

      //* Reduce number of polyline points: reducePolylinesPoints factor for route parts length >= 4!
      for (let i = 0; i < allData?.length; i++) {
        const polylinesDecodedReduced = [] as Line[];
        for (let j = 0; j < allData[i]?.polylinesDecoded!.length; j++) {
          const singleReducedPolyline = [] as Point[];
          if (allData[i]?.polylinesDecoded![j]?.length >= 4) {
            for (let k = 0; k < allData[i]?.polylinesDecoded![j]?.length; k += reducePolylinesPoints) {
              singleReducedPolyline.push(allData[i]?.polylinesDecoded![j][k]);
            }
            // Add last point of the polyline
            singleReducedPolyline.push(allData[i]?.polylinesDecoded![j][allData[i]?.polylinesDecoded![j]?.length - 1]);
            singleReducedPolyline && singleReducedPolyline.length && polylinesDecodedReduced.push(singleReducedPolyline);
          } else {
            //* if length < 4 don't reduce
            for (let k = 0; k < allData[i]?.polylinesDecoded![j]?.length; k++) {
              singleReducedPolyline.push(allData[i]?.polylinesDecoded![j][k]);
            }
            singleReducedPolyline && singleReducedPolyline.length && polylinesDecodedReduced.push(singleReducedPolyline);
          }
        }
        allData[i].polylinesDecodedReduced = polylinesDecodedReduced;
      }

      //* Remove duplicates of points
      for (let i = 0; i < allData?.length; i++) {
        for (let j = 0; j < allData[i].polylinesDecodedReduced!.length; j++) {
          allData[i].polylinesDecodedReduced![j] = [...new Set(allData[i].polylinesDecodedReduced![j])];
        }
      }
      // console.log("allData:", allData);

      //* AllStopsArray
      const selectedRouteStopsIds = displayStops.map((stop) => stop.id);
      // console.log("selectedRouteStopsIds:", selectedRouteStopsIds, selectedRouteStopsIds.length);
      let stopsArray = [];
      for (let i = 0; i < allData.length; i++) {
        stopsArray.push(allData[i].stops);
      }
      stopsArray = stopsArray.flat(1) as StopInfo[];
      // console.log("stopsArray:", stopsArray);
      const stopsArrayFiltered = removeDuplicateStops(stopsArray, "id");
      // console.log("stopsArrayFiltered:", stopsArrayFiltered);
      const stopsArrayReduced = stopsArrayFiltered.filter((item) => item?.routeIds?.length >= minLinesAtStop);
      // console.log("stopsArrayReduced:", stopsArrayReduced);
      const stopsArrayReducedFiltered = stopsArrayReduced.filter((item) => !selectedRouteStopsIds.includes(item.id));
      // console.log("stopsArrayReducedFiltered:", stopsArrayReducedFiltered);

      setAllPolylines(allData);
      setAllStops(stopsArrayReducedFiltered);
    }
  }, [allData, displayStops]);

  React.useEffect(() => {
    if (allBusesFromRedux && agencyId) {
      const busesToSet = allBusesFromRedux.filter(
        (bus: BusInfo) => cutAgencyName(bus.MonitoredVehicleJourney.LineRef, agencyId) !== routeNumber
      );
      // console.info("busesToSet:", busesToSet, busesToSet.length);
      setAllActiveBuses(busesToSet);
      const busesToSetMonitored = busesToSet.filter((bus) => bus.MonitoredVehicleJourney.Monitored === true);
      const busesToSetNotMonitored = busesToSet.filter((bus) => bus.MonitoredVehicleJourney.Monitored === false);
      // console.info("busesToSetMonitored:", busesToSetMonitored, busesToSetMonitored.length);
      // console.info("busesToSetNotMonitored:", busesToSetNotMonitored, busesToSetNotMonitored.length);
      setAllActiveBusesMonitored(busesToSetMonitored);
      setAllActiveBusesNotMonitored(busesToSetNotMonitored);
    }
  }, [agencyId, allBusesFromRedux, routeNumber]);

  const mapZoomToBus = React.useCallback(
    (lat: number, lon: number, zoom: number) => {
      setTimeout(() => {
        // mapView && mapView.flyTo([lat, lon], zoom, { animate: true, duration: 1.5 });
        mapView && mapView.setView([lat, lon], zoom, { animate: false });
      }, 500);
    },
    [mapView]
  );

  React.useEffect(() => {
    if (appPath[0] === "vehicle" && allBusesFromRedux && allBusesFromRedux.length >= 1) {
      const vehicleId = appPath[1];
      const selectedVehicle = allBusesFromRedux.filter(
        (bus) => cutAgencyName(bus?.MonitoredVehicleJourney?.VehicleRef, agencyId) === vehicleId
      );
      // console.log("selectedVehicle:", selectedVehicle);
      const lat = selectedVehicle[0]?.MonitoredVehicleJourney?.VehicleLocation?.Latitude;
      const lon = selectedVehicle[0]?.MonitoredVehicleJourney?.VehicleLocation?.Longitude;
      mapZoomToBus(lat!, lon!, zoomForSelectedBusStation);
    }
  }, [agencyId, allBusesFromRedux, appPath, mapZoomToBus, mapView]);

  //* Adding colors to lines numbers
  React.useEffect(() => {
    if (allRoutesTableFromRedux) {
      setAllRoutesTable(allRoutesTableFromRedux);
    }
  }, [allRoutesTableFromRedux]);

  //* index can be here -> polylinesToDraw are sorted earlier - Polyline - selected line!
  const mapPolylines: JSX.Element[] = polylinesToDraw.map((elem: Line, index) => (
    <Polyline
      key={index}
      pathOptions={{
        weight: index === polylinesToDraw.length - 1 ? 6 : 4,
        color: `#${
          allRoutesTable?.filter((route) => cutAgencyName(route?.id, agencyId) === routeNumber)[0]?.color as string
        }`,
      }}
      positions={elem}
      children={
        <Popup>
          {t("Route_Id")}:{" "}
          <span
            className="span_bold"
            style={{
              padding: "0.25rem",
              textAlign: "center",
              verticalAlign: "middle",
              minWidth: "2rem",
              backgroundColor: `#${
                allRoutesTable?.filter((route) => cutAgencyName(route?.id, agencyId) === routeNumber)[0]?.color as string
              }`,
              color: `#${dynamicTexColor(
                allRoutesTable?.filter((route) => cutAgencyName(route?.id, agencyId) === routeNumber)[0]?.color as string
              )}`,
            }}
          >
            {allRoutesTable?.filter((route) => cutAgencyName(route?.id, agencyId) === routeNumber)[0]?.shortName ||
              routeNumber}
          </span>{" "}
          ({polylinesToDraw.length})
        </Popup>
      }
    />
  ));

  const onBusClick = async (busId: string, _lat: number, _lon: number, _lineRef: string) => {
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    const busIdShort = await cutAgencyName(busId, agencyId);
    // console.info({ busIdShort });
    await navigate(`/app/vehicle/${busIdShort}`);
    //* This is not necessary, mapZoomToBus in React.useEffect above
    // await mapZoomToBus(_lat, _lon, zoomForSelectedBusStation);
  };

  // Buses Icons - selected + all together
  const BusesIconsComponent = (busesIcons: BusInfo[], monitoredIcon: string): JSX.Element => {
    return (
      <React.Fragment>
        {appPath[0] !== "/" &&
          busesIcons.map((elem: BusInfo, index: number) => {
            markerRefs.current[index] = React.createRef();
            return (
              <Marker
                ref={markerRefs.current[index]}
                key={elem?.MonitoredVehicleJourney?.VehicleRef}
                position={{
                  lat: elem?.MonitoredVehicleJourney?.VehicleLocation?.Latitude as number,
                  lng: elem?.MonitoredVehicleJourney?.VehicleLocation?.Longitude as number,
                }}
                icon={
                  elem?.MonitoredVehicleJourney?.Monitored
                    ? busIconBlue
                    : !elem?.MonitoredVehicleJourney?.Monitored
                    ? busIconGray
                    : busIconGray
                }
                eventHandlers={{
                  click: () =>
                    onBusClick(
                      elem.MonitoredVehicleJourney.VehicleRef as string,
                      elem.MonitoredVehicleJourney.VehicleLocation?.Latitude as number,
                      elem.MonitoredVehicleJourney.VehicleLocation?.Longitude as number,
                      elem.MonitoredVehicleJourney.LineRef as string
                    ),
                }}
              >
                <Popup minWidth={205}>
                  <BusInfoComponent
                    vehicleRef={elem.MonitoredVehicleJourney.VehicleRef}
                    publishedLineName={elem.MonitoredVehicleJourney.PublishedLineName || ""}
                  />
                </Popup>
                <Tooltip permanent={showDevInfo ? true : false}>
                  <BusTooltip
                    className={
                      appPath[0] === "vehicle" &&
                      appPath[1] === cutAgencyName(elem.MonitoredVehicleJourney.VehicleRef, agencyId)
                        ? "selected"
                        : ""
                    }
                  >
                    <img
                      width={16}
                      height={16}
                      src={elem?.MonitoredVehicleJourney?.Monitored ? monitoredIcon : directionIconDim}
                      alt="Direction Icon"
                      style={{ transform: `rotate(${elem.MonitoredVehicleJourney.Bearing!}deg)` }}
                    />
                    <span
                      className="span_bold"
                      style={{
                        padding: "0.25rem",
                        textAlign: "center",
                        verticalAlign: "middle",
                        minWidth: "2.5rem",
                        backgroundColor: `#${
                          allRoutesTable?.filter(
                            (route) =>
                              cutAgencyName(route.id, agencyId) ===
                              cutAgencyName(elem.MonitoredVehicleJourney.LineRef, agencyId)
                          )[0]?.color as string
                        }`,
                        color: `#${dynamicTexColor(
                          allRoutesTable?.filter(
                            (route) =>
                              cutAgencyName(route.id, agencyId) ===
                              cutAgencyName(elem.MonitoredVehicleJourney.LineRef, agencyId)
                          )[0]?.color as string
                        )}`,
                      }}
                    >
                      {allRoutesTable?.filter((route) => route?.id === elem?.MonitoredVehicleJourney?.LineRef)[0]
                        ?.shortName || elem?.MonitoredVehicleJourney?.PublishedLineName}
                    </span>
                    <span style={{ color: "orangered", fontSize: "small" }}>
                      {showDevInfo ? cutAgencyName(elem?.MonitoredVehicleJourney?.VehicleRef, agencyId) : null}
                      {showDevInfo ? " | " : null}
                      {/* //* Deviation in minutes! */}
                      {showDevInfo ? Number(elem?.MonitoredVehicleJourney?.MonitoredCall?.Extensions?.Deviation) * -1 : null}
                    </span>
                  </BusTooltip>
                </Tooltip>
              </Marker>
            );
          })}
      </React.Fragment>
    );
  };

  const BusesIconsOnlyCircle = (busesIcons: BusInfo[]): JSX.Element => {
    return (
      <React.Fragment>
        {appPath[0] !== "/" &&
          busesIcons.map((elem: BusInfo) => (
            <Marker
              key={elem?.MonitoredVehicleJourney?.VehicleRef}
              position={{
                lat: elem.MonitoredVehicleJourney.VehicleLocation?.Latitude as number,
                lng: elem.MonitoredVehicleJourney.VehicleLocation?.Longitude as number,
              }}
              icon={elem?.MonitoredVehicleJourney?.Monitored ? busIconBlueCircle : busIconGrayCircle}
              eventHandlers={{
                click: () => infoNotify("info", `${t("Zoom_in_on_the_map_please")}`),
              }}
            >
              <Tooltip direction="top">
                <span className="span_bold" style={{ color: elem?.MonitoredVehicleJourney?.Monitored ? "blue" : "dimgray" }}>
                  {allRoutesTable?.filter((route) => route?.id === elem?.MonitoredVehicleJourney?.LineRef)[0]?.shortName ||
                    elem.MonitoredVehicleJourney?.PublishedLineName}
                </span>
              </Tooltip>
            </Marker>
          ))}
      </React.Fragment>
    );
  };

  const onStopClick = async (stopId: string) => {
    // await console.log({ stopId });
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    await navigate(`/app/stop/${stopId}`);
  };

  const clusterOptions = {
    color: "Indigo",
    weight: 1.0,
    fillOpacity: 0.5,
    interactive: false,
    bubblingMouseEvents: false,
  };

  // Stops Icons - selected + all together
  const StopsComponent = (stopsSet: StopInfo[], circleColor: string): JSX.Element => {
    return (
      <React.Fragment>
        <MarkerClusterGroup
          chunkedLoading={true}
          showCoverageOnHover={true}
          zoomToBoundsOnClick={false}
          animate={true}
          maxClusterRadius={60}
          polygonOptions={clusterOptions}
          disableClusteringAtZoom={clustersZoom}
          removeOutsideVisibleBounds={true}
          spiderfyOnMaxZoom={false}
        >
          {stopsSet &&
            stopsSet.length >= 1 &&
            stopsSet.map((elem: StopInfo, index: number) => (
              <CircleMarker
                key={elem.id + index}
                center={{
                  lat: elem.lat,
                  lng: elem.lon,
                }}
                pathOptions={
                  !showTooltips
                    ? { fillColor: circleColor, color: circleColor, fillOpacity: 1 }
                    : { fillColor: "Violet", color: "Violet", fillOpacity: 1 }
                }
                radius={isMobile ? 4 : 6}
                eventHandlers={{ click: () => onStopClick(elem.id) }}
              >
                <React.Fragment>
                  {isMobile ? null : (
                    <CircleMarker
                      center={{
                        lat: elem.lat,
                        lng: elem.lon,
                      }}
                      pathOptions={{ fillColor: "whitesmoke", color: "whitesmoke", fillOpacity: 1 }}
                      radius={4}
                      eventHandlers={{ click: () => onStopClick(elem.id) }}
                    />
                  )}

                  <Popup>
                    <StopInfoDiv>
                      <p>
                        {t("Stop_Name")}:{" "}
                        <span className="span_bold" style={{ color: "maroon" }}>
                          {elem.name}
                        </span>
                      </p>
                      <p>
                        {t("Stop_Id")}:{" "}
                        <span className="span_bold" style={{ color: "maroon" }}>
                          {elem.id}
                        </span>
                      </p>
                    </StopInfoDiv>
                    <AvailableRoutes stop={elem} agencyId={agencyId} />
                    {showDepartureBoardLink && (
                      <Nav.Link
                        to={`/stopIds/${elem.id}`}
                        as={NavLink}
                        style={{ marginLeft: "auto", marginRight: 0 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("Departure_board")}
                      </Nav.Link>
                    )}
                  </Popup>
                  {/* //* Development Tooltip */}
                  {showDevInfo ? (
                    <Tooltip permanent={false} direction={index % 2 === 0 ? "right" : "left"}>
                      <span className="span_bold" style={{ color: "orangered" }}>
                        {cutAgencyName(elem.id, agencyId)}
                      </span>
                    </Tooltip>
                  ) : null}
                  {/* //* Production Tooltip */}
                  {process.env.NODE_ENV !== "development" && zoom && zoom >= zoomEnableSwitch && showTooltips ? (
                    <Tooltip permanent={true} direction={index % 2 === 0 ? "right" : "left"}>
                      <span className="span_bold">{elem.name}</span>
                    </Tooltip>
                  ) : null}
                </React.Fragment>
              </CircleMarker>
            ))}
        </MarkerClusterGroup>
      </React.Fragment>
    );
  };

  //* Selected Stop Component
  const SelectedStop = (): JSX.Element => {
    return (
      <React.Fragment>
        <CircleMarker
          center={[selectedStop.lat, selectedStop.lon]}
          eventHandlers={{
            click: () => onStopClick(selectedStop.id),
          }}
          pathOptions={{ fillColor: "#814196", color: "#814196", fillOpacity: 0.2, weight: 12, opacity: 0.6 }}
          radius={15}
        >
          <Tooltip permanent={true} direction="bottom" offset={[0, 20]}>
            <p style={{ textAlign: "center", marginBottom: 0, fontWeight: "bold" }}>{selectedStop.name}</p>
          </Tooltip>
          <Popup>
            <StopInfoDiv>
              <p>
                {t("Stop_Name")}:{" "}
                <span className="span_bold" style={{ color: "maroon" }}>
                  {selectedStop.name}
                </span>
              </p>
              <p>
                {t("Stop_Id")}:{" "}
                <span className="span_bold" style={{ color: "maroon" }}>
                  {selectedStop.id}
                </span>
              </p>
            </StopInfoDiv>
            <AvailableRoutes stop={selectedStop} agencyId={agencyId} />
            {showDepartureBoardLink && (
              <Nav.Link
                to={`/stopIds/${selectedStop.id}`}
                as={NavLink}
                style={{ marginLeft: "auto", marginRight: 0 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Departure_board")}
              </Nav.Link>
            )}
          </Popup>
        </CircleMarker>
      </React.Fragment>
    );
  };

  const onPolylineDblClick = async (routeId: string) => {
    // await console.log({ routeId });
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    const route = await cutAgencyName(routeId, agencyId);
    // await console.info({ route });
    navigate(`/app/route/${route}`);
  };

  // * New Start Site - Show all polylines, stops and buses
  const allPathOptions = { weight: 4, smoothFactor: 3 };

  //* All Polylines - the longest for a Line route
  const MapPolyline = ({ array }: { array: AllPolylinesStops }): JSX.Element => {
    return (
      <React.Fragment>
        {/* //* index can be here -> polylinesToDraw are sorted earlier */}
        {array?.polylinesDecodedReduced?.map((elem: Line, index: number) => {
          return (
            <Polyline
              key={index}
              pathOptions={{
                ...allPathOptions,
                color: `#${allRoutesTable?.filter((route) => route.id === array.routeId)[0].color as string}`,
              }}
              positions={elem}
              children={
                <React.Fragment>
                  <Popup>
                    {t("Route_Id")}:{" "}
                    <span
                      className="span_bold"
                      style={{
                        padding: "0.25rem",
                        textAlign: "center",
                        verticalAlign: "middle",
                        minWidth: "2rem",
                        backgroundColor: `#${
                          allRoutesTable?.filter((route) => route.id === array.routeId)[0].color as string
                        }`,
                        color: `#${dynamicTexColor(
                          allRoutesTable?.filter((route) => route.id === array.routeId)[0].color as string
                        )}`,
                      }}
                    >
                      {allRoutesTable?.filter((route) => route?.id === array?.routeId)[0]?.shortName ||
                        cutAgencyName(array.routeId, agencyId)}
                    </span>{" "}
                    ({array.polylinesDecoded!.length})
                  </Popup>
                </React.Fragment>
              }
            />
          );
        })}
      </React.Fragment>
    );
  };

  const AllPolylinesMap = (): JSX.Element => {
    return (
      <React.Fragment>
        {allRoutesTableFromRedux &&
          allPolylines &&
          allPolylines.length >= 1 &&
          allPolylines.map((elem: AllPolylinesStops) => {
            return (
              <FeatureGroup
                key={elem.routeId}
                eventHandlers={{
                  click: (event: LeafletMouseEvent) => event.target.bringToFront(),
                  dblclick: () => onPolylineDblClick(elem.routeId),
                  mouseover: (event: LeafletMouseEvent) => {
                    event.target.setStyle({ weight: 8 });
                    event.target.bringToFront();
                  },
                  mouseout: (event: LeafletMouseEvent) => event.target.setStyle({ weight: 4 }),
                }}
              >
                <MapPolyline array={elem} key={elem.routeId} />
              </FeatureGroup>
            );
          })}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {!initialMapRange || loading ? null : (
        <MapWrapper $isModalInfoBottomOpen={isModalInfoBottomOpen}>
          <MapContainer
            className={grayscaleMap ? "leaflet-grayscale" : ""}
            zoomSnap={0.1}
            zoomDelta={0.2}
            maxZoom={18}
            minZoom={5}
            ref={setMapView}
            bounds={bounds}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
            //* Disable below, but <ZoomControl position="topright" /> enable
            zoomControl={false}
            doubleClickZoom={false}
            tap={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />

            <Rectangle
              className="rectangleClass"
              bounds={[
                [
                  initialMapRange.lat - initialMapRange.latSpan / 2 - zoomRange,
                  initialMapRange.lon - initialMapRange.lonSpan / 2 - zoomRange,
                ],
                [
                  initialMapRange.lat + initialMapRange.latSpan / 2 + zoomRange,
                  initialMapRange.lon + initialMapRange.lonSpan / 2 + zoomRange,
                ],
              ]}
              pathOptions={rectangleOptions}
            />

            {/* //* Custom Hooks */}
            <MapHooks />
            <UseShowLocation />

            <React.Suspense fallback={null}>
              {allRoutesTable && mapPolylines}
              {zoom >= zoomBusOnlyCircle
                ? BusesIconsComponent(busesToShow, directionIconBlue)
                : BusesIconsOnlyCircle(busesToShow)}
              {StopsComponent(displayStops, "#004896")}
              {zoomToSelectedBusStation && SelectedStop()}
            </React.Suspense>

            {/* //* New Start Site - Get all polylines and stops */}
            {!pathName.includes("route") && !pathName.includes("vehicle") && (
              <React.Suspense fallback={null}>
                {allRoutesTableFromRedux && allPolylines && <AllPolylinesMap />}
                {zoom >= zoomFullIcons && allPolylines ? StopsComponent(allStops, "#004896") : null}

                {/* //^ Monitored Buses */}
                {allActiveBuses && showLiveBuses ? (
                  <React.Fragment>
                    {zoom >= zoomBusOnlyCircle
                      ? BusesIconsComponent(allActiveBusesMonitored, directionIconGreen)
                      : BusesIconsOnlyCircle(allActiveBusesMonitored)}
                  </React.Fragment>
                ) : null}

                {/* //^ Not-Monitored Buses */}
                {allActiveBuses && showScheduledBuses ? (
                  <React.Fragment>
                    {zoom >= zoomBusOnlyCircle
                      ? BusesIconsComponent(allActiveBusesNotMonitored, directionIconGreen)
                      : BusesIconsOnlyCircle(allActiveBusesNotMonitored)}
                  </React.Fragment>
                ) : null}
              </React.Suspense>
            )}
          </MapContainer>
        </MapWrapper>
      )}
    </React.Fragment>
  );
};

export default MapComponent;
