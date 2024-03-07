import axios from "axios";
import * as turf from "@turf/turf";

import {
  ACTIVE_STOP,
  DISPATCH_MODAL_INFO_BOTTOM,
  DISPATCH_MODAL_SETTINGS,
  DISPATCH_ZOOM,
  FETCH_DIRECTIONS,
  FETCH_ID,
  GET_ACTIVE_BLOCKS,
  GET_ACTIVE_BUSES,
  GET_ALL_BUSES,
  GET_ALL_POLYLINES_STOPS,
  GET_LINES_LIST,
  GET_LOCALE,
  GET_POLYLINES_STOPS,
  SELECT_ROUTE,
  SELECT_STOP,
  SET_GRAYSCALE_MAP,
  SET_LOADING,
  SHOW_LIVE_BUSES,
  SHOW_SCHEDULED_BUSES,
} from "./actionTypes";
import { api_key, api_key2, key_siri, listPositionForAgency, prefixURL } from "./../config";
import { store } from "../redux/store";
import { cutAgencyName, dynamicTexColor, getAcronym, removeDuplicateStops } from "../utils/helpers";

export const fetchAgencyID = () => async (dispatch: Dispatch) => {
  await axios
    .get(`${prefixURL}/api/where/agencies-with-coverage.json?key=${api_key}`)
    .then(({ data }) => {
      // console.log("data:", data);
      const statusCode = data.code;
      const currentTime = data.currentTime;

      if (listPositionForAgency || listPositionForAgency === 0) {
        const agencyId = data.data.list[listPositionForAgency].agencyId;
        const lat = data.data.list[listPositionForAgency].lat;
        const latSpan = data.data.list[listPositionForAgency].latSpan;
        const lon = data.data.list[listPositionForAgency].lon;
        const lonSpan = data.data.list[listPositionForAgency].lonSpan;
        const initialMapRange = { lat, latSpan, lon, lonSpan };
        // console.log({ code, currentTime, agencyId,initialMapRange  });
        dispatch({ type: FETCH_ID, payload: { statusCode, agencyId, currentTime, initialMapRange } });
      } else {
        //* Area for a few agencies
        const agencyArray: { agencyId: string; agencyName: string }[] = [];
        const agencyId = data.data.list[0].agencyId;
        for (let i = 0; i < data.data.references.agencies.length; i++) {
          const agencyObject = {
            agencyId: data.data.references.agencies[i].id,
            agencyName: data.data.references.agencies[i].name,
          };
          agencyArray.push(agencyObject);
        }
        const areaArray = [];
        for (let i = 0; i < data.data.list.length; i++) {
          const singleAreaArray = [
            [data.data.list[i].lat - data.data.list[i].latSpan / 2, data.data.list[i].lon - data.data.list[i].lonSpan / 2],
            [data.data.list[i].lat + data.data.list[i].latSpan / 2, data.data.list[i].lon + data.data.list[i].lonSpan / 2],
          ];
          areaArray.push(singleAreaArray);
        }
        const flatAreaArray = areaArray.flat(1);
        // console.log("flatAreaArray:", flatAreaArray);

        const multiPoint = turf.multiPoint(flatAreaArray);
        const bBox = turf.bbox(multiPoint);
        const bboxPolygon = turf.bboxPolygon(bBox);
        const areaPolygon = bboxPolygon?.bbox;
        // console.log("areaPolygon:", areaPolygon);
        const lat = (areaPolygon![0] + areaPolygon![2]) / 2;
        const lon = (areaPolygon![1] + areaPolygon![3]) / 2;
        const latSpan = Math.abs(areaPolygon![2] - areaPolygon![0]);
        const lonSpan = Math.abs(areaPolygon![3] - areaPolygon![1]);
        const initialMapRange = { lat, latSpan, lon, lonSpan };
        // console.log({ code, currentTime, agencyId,initialMapRange  });
        dispatch({ type: FETCH_ID, payload: { statusCode, agencyId, currentTime, initialMapRange, agencyArray } });
      }
    })
    .catch((error) => {
      if (error.response) {
        console.error("error.response.status:", error.response.status);
      }
      console.error("error.config:", error.config);
    });
};

export const fetchLinesList = (agencyId: string) => async (dispatch: Dispatch) => {
  await axios
    .get(`${prefixURL}/api/where/route-ids-for-agency/${agencyId}.json?key=${api_key}`)
    .then(({ data }) => {
      // console.log("data:", data.data);
      let unsortedList = data?.data?.list;
      // console.log({ list });
      // console.log({ agencyId });
      unsortedList = unsortedList.map((item: string) => cutAgencyName(item, agencyId));
      // console.log({ list });

      let numbersList = unsortedList.filter((item: number) => !isNaN(item));
      numbersList = numbersList.map((item: string) => Number(item));
      numbersList = numbersList.sort(function (a: number, b: number) {
        return a - b;
      });
      // console.log({numbersList});

      let stringList = unsortedList.filter((item: number) => isNaN(item));
      stringList = stringList.sort();
      // console.log({stringList});

      const list = [].concat(stringList, numbersList) as (number | string)[];
      // console.log({ list });
      dispatch({ type: GET_LINES_LIST, payload: { list } });
    })
    .catch((error) => {
      console.log("error:", error);
    });
};

export const selectRoute = (routeNumber: number | string) => async (dispatch: Dispatch) => {
  // console.log({ routeNumber });
  try {
    dispatch({ type: SELECT_ROUTE, payload: { routeNumber } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const fetchPolylines_Stops = (agencyId: string, routeNumber: string) => async (dispatch: Dispatch) => {
  // console.log({ agencyId, routeNumber });
  await axios
    .get(`${prefixURL}/api/where/stops-for-route/${agencyId}_${routeNumber}.json?includePolylines=true&key=${api_key}`)
    .then(({ data }) => {
      // console.log({ routeNumber });
      dispatch({ type: GET_POLYLINES_STOPS, payload: data.data });
    })
    .catch((error) => {
      if (error.response) {
        console.error("error.response.status:", error.response.status);
      }
      console.error("error.config:", error.config);
    });
};

export const getActiveBuses = (agencyId: string, routeNumber: number | string) => async (dispatch: Dispatch) => {
  // console.log({ agencyId, routeNumber });
  await axios
    .get(`${prefixURL}/siri/vehicle-monitoring?key=${key_siri}&OperatorRef=${agencyId}&LineRef=${routeNumber}&type=json`)
    .then(({ data }) => {
      // console.log("data:", data);
      const dataToFetch = data?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery["0"].VehicleActivity;
      // console.log("dataToFetch:", dataToFetch);
      dispatch({ type: GET_ACTIVE_BUSES, payload: { buses: dataToFetch } });
    })
    .catch((error) => {
      console.log("error:", error);
    });
};

export const getStopInfo = (stopId: string, time: string) => async (dispatch: Dispatch) => {
  // console.log({ stopId, time });
  const now = Date.now();
  // console.log({ now });
  await axios
    .get(`${prefixURL}/api/where/arrivals-and-departures-for-stop/${stopId}.json?minutesAfter=${time}&key=${api_key}`)
    .then(({ data }) => {
      const dataToFetch = data?.data?.entry?.arrivalsAndDepartures;
      const dataToSet = dataToFetch.sort(
        (a: { scheduledDepartureTime: number }, b: { scheduledDepartureTime: number }) =>
          a.scheduledDepartureTime - b.scheduledDepartureTime
      );
      const dataToSetFiltered = dataToSet.filter(
        (set: { scheduledDepartureTime: number }) => set.scheduledDepartureTime < now + 24 * 60 * 60 * 1000
      );
      // console.log("dataToSetFiltered:", dataToSetFiltered);
      dispatch({ type: ACTIVE_STOP, payload: { arrivalsDepartures: dataToSetFiltered } });
    })
    .catch((error) => {
      console.log("error:", error);
    });
};

export const getActiveBlocks = () => async (dispatch: Dispatch) => {
  const agencyId = store.getState()?.agency?.agencyId;
  const { lat, latSpan, lon, lonSpan } = store.getState()?.agency?.initialMapRange;

  await axios
    .get(
      `${prefixURL}/api/where/trips-for-location.json?lat=${lat}&lon=${lon}&latSpan=${latSpan}&lonSpan=${lonSpan}&key=${api_key}`
    )
    .then(({ data }) => {
      // console.log("data:", data);
      const dataToFetch = data?.data?.references?.routes;
      // console.log("dataToFetch:", dataToFetch);
      const dataToSet = dataToFetch.map((elem: { id: string }) => elem.id);
      // console.log("dataToSet:", dataToSet);
      const activeBlocks = dataToSet.map((elem: string) => cutAgencyName(elem, agencyId));
      // console.log("activeBlocks:", activeBlocks);
      dispatch({ type: GET_ACTIVE_BLOCKS, payload: { activeBlocks: activeBlocks } });
    })
    .catch((error) => {
      console.log("error:", error);
    });
};

export const setLoadingAction = (setLoading: boolean) => async (dispatch: Dispatch) => {
  // console.log({ setLoading });
  try {
    dispatch({ type: SET_LOADING, payload: { setLoading } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const getLocale = (selectedLanguage: string) => async (dispatch: Dispatch) => {
  // console.log({ selectedLanguage });
  try {
    dispatch({ type: GET_LOCALE, payload: { selectedLanguage } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const dispatchZoom = (zoom: number) => async (dispatch: Dispatch) => {
  // console.log({ zoom });
  try {
    dispatch({ type: DISPATCH_ZOOM, payload: { zoom } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const getDirections = (agencyId: string, routeNumber: number | string) => async (dispatch: Dispatch) => {
  // console.log({ routeNumber });
  await axios
    .get(`${prefixURL}/api/where/stops-for-route/${agencyId}_${routeNumber}.json?key=${api_key2}&type=JSON`)
    .then(({ data }) => {
      const stopsWithInfo = data?.data?.references?.stops;
      const dataToDispatch = data?.data?.entry?.stopGroupings[0]?.stopGroups;
      let directionsArray: { id: number; name: string; stops: string[] }[] = [];
      dataToDispatch.forEach((direction: { stopIds: string[]; id: string; name: { name: string } }) => {
        directionsArray.push({
          id: Number(direction.id),
          name: direction.name.name,
          stops: direction.stopIds,
        });
      });
      directionsArray = directionsArray.sort((a, b) => a.id - b.id);
      // console.log("directionsArray", directionsArray);
      dispatch({
        type: FETCH_DIRECTIONS,
        payload: {
          directionsArray: directionsArray,
          directionsNumber: directionsArray.length,
          stopsWithInfo: stopsWithInfo,
        },
      });
    })
    .catch((error) => {
      console.log("error:", error);
    });
};

export const selectStop = (stop: StopInfo, zoomTo: boolean) => async (dispatch: Dispatch) => {
  // console.log({ stop });
  try {
    dispatch({ type: SELECT_STOP, payload: { zoomed: zoomTo, stop: stop } });
  } catch (error) {
    console.log("error:", error);
  }
};

//* New Start Site - Get all polylines, stops and buses
export const getAllPolylinesStops = () => async (dispatch: Dispatch) => {
  const list = store.getState()?.list;
  const agencyId = store.getState()?.agency?.agencyId;
  // console.log("list:", list);
  // console.log("agencyId:", agencyId);

  if (list && list?.list && agencyId) {
    // console.log("list:", list);
    const endpoints = list?.list?.map(
      (routeNumber: number) =>
        `${prefixURL}/api/where/stops-for-route/${agencyId}_${routeNumber}.json?includePolylines=true&key=${api_key}`
    );
    // console.log("endpoints:", endpoints);
    const promises = endpoints.map((endpoint: string) => axios.get(endpoint));
    // console.log("promises:", promises);

    await Promise.allSettled(promises)
      .then((responses) => {
        // console.log("responses:", responses);
        const polylinesStops = [] as AllPolylinesStops[];
        const allRoutesTable = [] as RouteInfo[];
        const allStopsTable = [] as StopInfo[];

        const fulfilledResponse = responses.filter((response) => response.status === "fulfilled");
        fulfilledResponse.forEach((element) => {
          // console.log({ element });
          if (element?.status === "fulfilled") {
            polylinesStops.push({
              routeName_0:
                element?.value?.data?.data?.entry?.stopGroupings[0]?.stopGroups?.filter(
                  (elem: { id: string }) => elem.id === "0"
                )[0]?.name?.name || "",
              routeName_1:
                element?.value?.data?.data?.entry?.stopGroupings[0]?.stopGroups?.filter(
                  (elem: { id: string }) => elem.id === "1"
                )[0]?.name?.name || "",
              routeId: element?.value?.data?.data?.entry?.routeId,
              polylines: element?.value?.data?.data?.entry?.polylines,
              stops: element?.value?.data?.data?.references?.stops,
              addedBusIcon: "",
            });
            allRoutesTable.push(element?.value?.data?.data?.references?.routes);
            allStopsTable.push(element?.value?.data?.data?.references?.stops);
          }
        });
        const allRoutesTableFlat = allRoutesTable.flat(1);
        const allRoutesTableReduced = removeDuplicateStops(allRoutesTableFlat, "id");

        //* Adding white textColor if doesn't exist
        for (let i = 0; i < allRoutesTableReduced.length; i++) {
          if (allRoutesTableReduced[i].textColor === "" || !allRoutesTableReduced[i].textColor) {
            allRoutesTableReduced[i].textColor = "ffffff";
          }
        }
        //* Adding black color if doesn't exist
        for (let i = 0; i < allRoutesTableReduced.length; i++) {
          if (allRoutesTableReduced[i].color === "" || !allRoutesTableReduced[i].color) {
            allRoutesTableReduced[i].color = "000000";
          }
        }

        for (let i = 0; i < allRoutesTableReduced.length; i++) {
          allRoutesTableReduced[i].textColor = dynamicTexColor(allRoutesTableReduced[i].color);
        }

        //* Add acronyms - if needed!
        if (agencyId === ("add_agencyId_here" as string)) {
          for (let i = 0; i < allRoutesTableReduced.length; i++) {
            if (!allRoutesTableReduced[i].shortName) {
              allRoutesTableReduced[i].shortName = getAcronym(allRoutesTableReduced[i].longName);
            }
          }
        }

        const allStopsTableFlat = allStopsTable.flat(1) as StopInfo[];
        const allStopsTableReduced = removeDuplicateStops(allStopsTableFlat, "id") as StopInfo[];

        // console.log("polylinesStops:", polylinesStops, polylinesStops.length);

        dispatch({
          type: GET_ALL_POLYLINES_STOPS,
          payload: { polylinesStops, allRoutesTableReduced, allStopsTableReduced },
        });
      })
      .catch((error) => {
        console.log("error:", error);
      });
  }
};

export const getAllBuses = () => async (dispatch: Dispatch) => {
  const activeBlocks = store.getState()?.activeBlocks;
  const agencyId = store.getState()?.agency?.agencyId;
  // console.log("activeBlocks:", activeBlocks);

  if (activeBlocks && activeBlocks?.activeBlocks) {
    // console.log("activeBlocks:", activeBlocks);
    const endpoints = activeBlocks?.activeBlocks?.map(
      (routeNumber: number) =>
        `${prefixURL}/siri/vehicle-monitoring?key=${key_siri}&OperatorRef=${agencyId}&LineRef=${routeNumber}&type=json`
    );
    // console.log("endpoints:", endpoints);
    const promises = endpoints.map((endpoint: string) => axios.get(endpoint));
    // console.log("promises:", promises);

    await Promise.allSettled(promises)
      .then((responses) => {
        // console.log("responses:", responses);
        let activeBlocksBuses = [] as BusInfo[];

        const fulfilledResponse = responses.filter((response) => response.status === "fulfilled");
        fulfilledResponse.forEach((element) => {
          if (element?.status === "fulfilled") {
            activeBlocksBuses.push(
              element?.value?.data?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery["0"].VehicleActivity
            );
          }
        });
        activeBlocksBuses = activeBlocksBuses.flat(1);
        activeBlocksBuses = activeBlocksBuses.filter((activeBlock) => activeBlock !== undefined);
        // console.log("activeBlocksBuses:", activeBlocksBuses, activeBlocksBuses.length);
        dispatch({ type: GET_ALL_BUSES, payload: { activeBlocksBuses } });
      })
      .catch((error) => {
        console.log("error:", error);
      });
  }
};

//* New Mobile Layout
export const dispatchModalSettingsIsOpen = (isModalSettingsOpen: boolean) => async (dispatch: Dispatch) => {
  // console.log({ isModalSettingsOpen });
  try {
    dispatch({ type: DISPATCH_MODAL_SETTINGS, payload: { isModalSettingsOpen } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const dispatchModalInfoBottomIsOpen = (isModalInfoBottomOpen: boolean) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: DISPATCH_MODAL_INFO_BOTTOM, payload: { isModalInfoBottomOpen } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const dispatchShowLiveBuses = (showLiveBuses: boolean) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: SHOW_LIVE_BUSES, payload: { showLiveBuses } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const dispatchShowScheduledBuses = (showScheduledBuses: boolean) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: SHOW_SCHEDULED_BUSES, payload: { showScheduledBuses } });
  } catch (error) {
    console.log("error:", error);
  }
};

export const setGrayscaleMap = (grayscaleMap: boolean) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: SET_GRAYSCALE_MAP, payload: { grayscaleMap } });
  } catch (error) {
    console.log("error:", error);
  }
};
