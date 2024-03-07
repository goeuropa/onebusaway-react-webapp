import { combineReducers } from "redux";

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

const initialState: RootState = {};

// Reducers
const getAgencyID = function (state = initialState, action: Dispatch) {
  // console.log("action.payload:", action.payload);
  switch (action.type) {
    case FETCH_ID:
      return { ...state, ...action.payload };
    case SELECT_ROUTE:
      return { ...state, ...action.payload };
    case GET_LOCALE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const getLinesList = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case GET_LINES_LIST:
      return { ...action.payload };

    default:
      return state;
  }
};

const getPolylines_Stops = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case GET_POLYLINES_STOPS:
      return { ...action.payload };

    default:
      return state;
  }
};

const getBuses = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case GET_ACTIVE_BUSES:
      return { ...action.payload };

    default:
      return state;
  }
};

const getStopsInfo = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case ACTIVE_STOP:
      return { ...action.payload };

    default:
      return state;
  }
};

const getActiveBlocks = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case GET_ACTIVE_BLOCKS:
      return { ...action.payload };

    default:
      return state;
  }
};

const setLoading = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case SET_LOADING:
      return { ...action.payload };

    default:
      return state;
  }
};

const setZoom = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case DISPATCH_ZOOM:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const getDirections = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case FETCH_DIRECTIONS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const setBusStation = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case SELECT_STOP:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

//* New Start Site - Get all polylines, stops and buses
const getAllData = function (state = initialState, action: Dispatch) {
  switch (action.type) {
    case GET_ALL_POLYLINES_STOPS:
      return { ...state, ...action.payload };
    case GET_ALL_BUSES:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

//* New Mobile Layout - ModalSettings
const appSettings = function (
  state = {
    ...initialState,
    isModalSettingsOpen: false,
    //Todo Is it unnecessary?
    // isModalInfoBottomOpen: false
    showLiveBuses: true,
    showScheduledBuses: true,
    grayscaleMap: false,
  },
  action: Dispatch
) {
  switch (action.type) {
    case DISPATCH_MODAL_SETTINGS:
      return { ...state, ...action.payload };
    case DISPATCH_MODAL_INFO_BOTTOM:
      return { ...state, ...action.payload };
    case SHOW_LIVE_BUSES:
      return { ...state, ...action.payload };
    case SHOW_SCHEDULED_BUSES:
      return { ...state, ...action.payload };
    case SET_GRAYSCALE_MAP:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// CombineReducer
const rootReducer = combineReducers({
  appSettings: appSettings,
  allData: getAllData,
  selectedStop: setBusStation,
  directions: getDirections,
  zoom: setZoom,
  loading: setLoading,
  agency: getAgencyID,
  list: getLinesList,
  polylines_Stops: getPolylines_Stops,
  buses: getBuses,
  stops: getStopsInfo,
  activeBlocks: getActiveBlocks,
});

export default rootReducer;
