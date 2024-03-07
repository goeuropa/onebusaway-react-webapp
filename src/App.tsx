import React from "react";
import ReactGA from "react-ga";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { shallowEqual } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.scss";
import MapComponent from "./components/MapComponent";
import { appName, fetchInterval, fetchOnStart } from "./config";
import {
  dispatchModalInfoBottomIsOpen,
  fetchAgencyID,
  fetchLinesList,
  fetchPolylines_Stops,
  getActiveBlocks,
  getActiveBuses,
  getAllBuses,
  getAllPolylinesStops,
  selectRoute,
  setLoadingAction,
} from "./redux/actions";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import Spinner from "./components/Layout/Spinner";
import Layout from "./components/Layout/Layout";
import NotFound from "./components/Layout/NotFound";
import ModalSettings from "./components/Modals/ModalSettings";
import ModalInfoBottom from "./components/Modals/ModalInfoBottom";

//* React.lazy import
const DepartureBoard = React.lazy(() => import("./components/DeparturesBoard/DepartureBoard"));

const TRACKING_ID = process.env.REACT_APP_googleTrackingId as string;
ReactGA.initialize(TRACKING_ID);

function App(): JSX.Element {
  //* Google Analytics
  React.useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  //* Set AppName
  React.useEffect(() => {
    localStorage.removeItem("line");
    document.title = appName;
  }, []);

  const { pathname: pathName } = useLocation();
  const dispatch: Dispatch = useAppDispatch();

  const [isModalInfoBottomOpen, isSettingsModalOpen, routeNumber, statusCode, agencyId, list, loadingState, activeBlocks]: [
    boolean,
    boolean,
    number,
    number,
    string,
    { list: number[] },
    boolean,
    number[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.appSettings?.isModalInfoBottomOpen,
      state?.appSettings?.isModalSettingsOpen,
      state?.agency?.routeNumber,
      state?.agency?.statusCode,
      state?.agency?.agencyId,
      state?.list,
      state?.loading.setLoading,
      state?.activeBlocks.activeBlocks,
    ],
    shallowEqual
  );

  //* New Mobile Layout - ModalInfoBottom
  const pathnameEndsWith_app: string =
    window.location.pathname.endsWith("/app") || window.location.pathname.endsWith("/")
      ? JSON.stringify(true)
      : JSON.stringify(false);
  const openBottomModalOnLoad: boolean = !JSON.parse(pathnameEndsWith_app);

  const [loading, setLoading] = React.useState<boolean>(loadingState ? true : false);
  const [showTooltips, setShowTooltips] = React.useState<boolean>(false);
  //* New Mobile Layout - ModalInfoBottom
  const [showModalSettings, setShowModalSettings] = React.useState<boolean>(false);
  const [showModalInfoBottom, setShowModalInfoBottom] = React.useState<boolean>(openBottomModalOnLoad);
  // console.info({ openBottomModalOnLoad, showModalInfoBottom });

  const showStopsNames = () => {
    setShowTooltips(!showTooltips);
  };

  //** New Mobile Layout - Fixed Navigation
  React.useEffect(() => {
    const paths = ["route", "vehicle", "stop", "date"];
    if (paths.some((path: string) => pathName.includes(path))) {
      dispatch(dispatchModalInfoBottomIsOpen(true));
    }
  }, [dispatch, pathName]);

  //* New Mobile Layout - ModalSettings
  React.useEffect(() => {
    if (isSettingsModalOpen === true || isSettingsModalOpen === false) {
      setShowModalSettings(isSettingsModalOpen);
    }
  }, [isSettingsModalOpen]);

  //* New Mobile Layout - ModalInfoBottom
  React.useEffect(() => {
    if (isModalInfoBottomOpen === true || isModalInfoBottomOpen === false) {
      // console.info({ isModalInfoBottomOpen });
      setShowModalInfoBottom(isModalInfoBottomOpen);
    }
  }, [isModalInfoBottomOpen]);

  // setLoading -> Loader - Spinner
  React.useEffect(() => {
    setLoading(true);
    // Remove activeStopId onLoad
    localStorage.removeItem("activeStopId");
    setTimeout(() => {
      dispatch(setLoadingAction(false));
      setLoading(false);
    }, 400);
  }, [dispatch, routeNumber, loadingState, isModalInfoBottomOpen]);

  //- Initial Fetch
  React.useEffect(() => {
    if (fetchOnStart) {
      dispatch(fetchAgencyID());
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (statusCode && agencyId) {
      // console.log({ statusCode, agencyId });
      dispatch(fetchLinesList(agencyId));
    }
  }, [agencyId, dispatch, statusCode]);

  //* Set the conditionally first line on load
  React.useEffect(() => {
    if (statusCode && agencyId && list?.list?.length >= 1) {
      const initialRouteSet = () => {
        // console.log("list.list:", list.list, list.list.length);
        let initialRoute;
        const lineFromLocalStorage = JSON.parse(localStorage.getItem("line") as string);
        if (lineFromLocalStorage) {
          // console.log({ lineFromLocalStorage });
          initialRoute = lineFromLocalStorage;
        }
        if (list.list.length === 1) {
          initialRoute = list.list[0];
          dispatch(dispatchModalInfoBottomIsOpen(true));
        }
        // console.log({ initialRoute });
        initialRoute && dispatch(selectRoute(String(initialRoute)));
      };
      initialRouteSet();
    }
  }, [activeBlocks, agencyId, dispatch, list.list, statusCode]);

  // Initial fetch: Polylines + Stops - if ONE line (SW)!
  React.useEffect(() => {
    // console.log("list.list:", list.list);
    if (statusCode && agencyId && list?.list?.length >= 1 && routeNumber) {
      // console.log("list.list:", list.list, list.list.length, routeNumber);
      dispatch(fetchPolylines_Stops(agencyId, String(routeNumber)));
    }
  }, [agencyId, dispatch, list, statusCode, routeNumber]);

  // Get active buses - initial fetch - if ONE line (SW)
  React.useEffect(() => {
    // console.log("list.list:", list.list);
    if (statusCode && agencyId && list?.list?.length >= 1 && routeNumber) {
      // console.log("list.list:", list.list, list.list.length, { routeNumber });
      const setFetchInterval = () => {
        // console.log("Data was fetched at", new Date().toLocaleString(), { agencyId, routeNumber });
        dispatch(getActiveBuses(agencyId, routeNumber));
      };
      setFetchInterval();
      //* Setting up interval for fetching data - every fetchInterval
      const fetchingInterval = setInterval(setFetchInterval, fetchInterval) as NodeJS.Timer;
      // console.log({ fetchingInterval });
      return () => {
        clearInterval(fetchingInterval);
      };
    }
  }, [agencyId, dispatch, list, statusCode, routeNumber]);

  //* Fetching activeBlocks -> one endpoint
  React.useEffect(() => {
    if (list && list?.list && agencyId) {
      const setFetchInterval = () => {
        // console.log("Data was fetched at", new Date().toLocaleString(), { agencyId });
        dispatch(getActiveBlocks());
      };
      setFetchInterval();
      //* Setting up interval for fetching data - every fetchInterval
      const fetchingInterval = setInterval(setFetchInterval, fetchInterval) as NodeJS.Timer;
      // console.log({ fetchingInterval });
      return () => {
        clearInterval(fetchingInterval);
        // console.log("Interval was cleared");
      };
    }
  }, [agencyId, dispatch, list]);

  //* New Start Site - Get all buses
  React.useEffect(() => {
    if (list?.list?.length >= 1 && activeBlocks) {
      const setFetchInterval = () => {
        // console.log("Data was fetched at", new Date().toLocaleString());
        dispatch(getAllBuses());
      };
      setFetchInterval();
      //* Setting up interval for fetching data - every fetchInterval
      const fetchingInterval = setInterval(setFetchInterval, fetchInterval) as NodeJS.Timer;
      return () => {
        clearInterval(fetchingInterval);
        // console.log("Interval was cleared");
      };
    }
  }, [activeBlocks, dispatch, list]);

  // * New Start Site - Get all polylines and stops
  React.useEffect(() => {
    if (activeBlocks && list?.list?.length >= 1) {
      setTimeout(() => {
        dispatch(getAllPolylinesStops());
      }, 2000);
    }
  }, [activeBlocks, dispatch, list]);

  //^ New Mobile Layout - ModalBottomInfo - dialog customization
  React.useEffect(() => {
    if (document.getElementById("customModal")) {
      const customModal = document.getElementById("customModal")!.parentElement;
      // console.info({ customModal });
      if (customModal) {
        customModal.classList.add("custom-dialog");
      }
    }
  });

  return (
    <React.Fragment>
      <React.Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/app/*"
              element={
                <React.Fragment>
                  {loading ? <Spinner /> : <MapComponent showTooltips={showTooltips} />}

                  {/* //* Modals */}
                  <ModalSettings
                    showModalSettings={showModalSettings}
                    showStopsNames={showStopsNames}
                    showTooltips={showTooltips}
                  />
                  <ModalInfoBottom showModalInfoBottom={showModalInfoBottom} />
                </React.Fragment>
              }
            />
          </Route>

          <Route
            path="/stopIds/:id"
            element={
              <React.Suspense fallback={null}>
                <DepartureBoard />
              </React.Suspense>
            }
          />

          <Route path="/not_found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/app" />} />
        </Routes>
      </React.Suspense>

      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnFocusLoss={true}
        draggable={false}
        pauseOnHover
        theme="colored"
      />
    </React.Fragment>
  );
}

export default App;
