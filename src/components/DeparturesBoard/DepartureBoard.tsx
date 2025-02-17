import React from "react";
import axios from "axios";
import { Params, useParams } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import scrollIntoView from "scroll-into-view-if-needed";
import { Table } from "react-bootstrap";
import { shallowEqual } from "react-redux";

import { apiKey, fetchIntervalStop, siriApiKey, apiBaseURL, axiosConfig } from "../../config";
import { useAppSelector } from "../../redux/hooks";
import { cutAgencyName, timeConverterFromNow } from "../../utils/helpers";
import { logo } from "../../config";
import CurrentTimeDiv from "./CurrentTimeDiv";
import NotFound from "../Layout/NotFound";
import Spinner from "../Layout/Spinner";
import variableColors from "../../_App.module.scss";

const { colorWhite, colorBlack, colorDepartureBackground, appBackgroundColor, colorLightgrey } = variableColors;

const Header = styled.div`
  position: relative;
  top: 0;
  width: 100%;
  height: 90px;
  background: ${colorBlack};
  line-height: 90px;
  color: ${colorWhite};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  div {
    padding-left: 30px;
    padding-right: 30px;
    font-weight: bold;
    font-size: 2.8vw;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  width: 100%;
  background: ${colorBlack};
  font-size: 1em;
  color: ${colorWhite};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  div {
    padding-left: 30px;
    padding-right: 5px;
    font-size: 1.45em;
    line-height: 1.8em;
  }
`;

const BodyDiv = styled.div`
  width: 100%;
  height: calc(100vh - 180px);
  background: ${colorDepartureBackground};
  overflow-y: scroll;
  pointer-events: none;
  -webkit-user-select: none; /* Safari */
  user-select: none; /* Standard syntax */
`;

const Img = styled.img`
  background-color: ${colorWhite};
  width: "auto";
  height: 90px;
`;

const Div = styled.div`
  display: flex;
  flex-direction: row;
  p {
    float: left;
    line-height: 1.25em;
    font-size: 0.75em;
    padding: 0.5em;
    span {
      margin-left: 0.5em;
      margin-right: 0.5em;
    }
  }
`;

const TableDiv = styled.div`
  background-color: ${appBackgroundColor};
  margin: 0;
  width: 100%;
  height: auto;
`;

const NoDeparturesInfo = styled.div`
  background-color: ${appBackgroundColor};
  margin: 0 30px;
  width: calc(100% - 60px);
  padding: 0.9em 0;
  font-size: 1em;
  font-weight: bold;
  line-height: 1.1em;
  h5 {
    margin-bottom: 0;
  }
`;

const HR = styled.hr`
  border-top: 1px solid ${colorDepartureBackground};
  margin: 0;
  visibility: hidden;
`;

const DepartureBoard = (): JSX.Element => {
  // const location = useLocation();
  const params: Readonly<Params<string>> = useParams();
  const { t } = useTranslation();

  const [agencyId, allRoutesTableFromRedux]: [string, RouteInfo[]] = useAppSelector(
    (state: RootState) => [state?.agency?.agencyId, state?.allData?.allRoutesTableReduced],
    shallowEqual
  );
  // console.log("allRoutesTableFromRedux:", allRoutesTableFromRedux);

  const [stopIds, setStopIds] = React.useState<Array<string>>([]);
  const [stopsInfo, setStopsInfo] = React.useState<Array<StopDepartureBoard>>([]);
  const [stopsInfoColors, setStopsInfoColors] = React.useState<Array<any>>([]);
  const [index, setIndex] = React.useState<number>(0);
  const [departureData, setDepartureData] = React.useState<Array<StopDepartureBoardTimes>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showSpinner, setShowSpinner] = React.useState<boolean>(false);
  // console.log("departureData:", departureData, departureData.length);

  const scrollBotom = (): void => {
    const hrBottom = document.getElementById("hrBottom") as HTMLHRElement;
    // console.log({ hrBottom });
    hrBottom &&
      scrollIntoView(hrBottom as HTMLElement, {
        duration: fetchIntervalStop / 10,
        easing: "easeInOut",
      });
  };

  const scrollTop = (): void => {
    const hrTop = document.getElementById("hrTop") as HTMLHRElement;
    // console.log({ hrTop });
    hrTop &&
      scrollIntoView(hrTop as HTMLElement, {
        duration: fetchIntervalStop / 10,
        easing: "easeInOut",
      });
  };

  // setShowSpinner -> Bus stop change - Spinner
  React.useEffect((): void => {
    setTimeout(() => {
      setShowSpinner(false);
    }, 500);
  }, [showSpinner]);

  // setLoading -> Loader - Spinner
  React.useEffect((): void => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  React.useEffect(() => {
    const timerBottom = setTimeout(() => {
      scrollBotom();
      // console.log("Scroll Bottom", new Date().toLocaleTimeString(), stopIds[index]);
    }, fetchIntervalStop / 3);
    return () => {
      // console.log("Scroll Bottom... Cleared");
      clearTimeout(timerBottom);
    };
  });

  React.useEffect(() => {
    const timerTop = setTimeout(() => {
      scrollTop();
      // console.log("Scroll Top", new Date().toLocaleTimeString(), stopIds[index]);
    }, (2 * fetchIntervalStop) / 3);
    return () => {
      // console.log("Scroll Top... Cleared");
      clearTimeout(timerTop);
    };
  });

  React.useEffect(() => {
    // console.log("params.id:", params.id);
    const paramsToSet = params.id!.split(",");
    // console.log({ paramsToSet });
    setStopIds(paramsToSet);
  }, [params]);

  React.useEffect(() => {
    if (stopIds.length >= 1) {
      const controller = new AbortController();

      const stopInfoURLs = stopIds.map((stopInfoId: string) => {
        return `${apiBaseURL}/api/where/stop/${stopInfoId}.json?key=${apiKey}`;
      });
      // console.log({ stopInfoURLs });

      const getStopInfo = (): void => {
        axios
          .all(stopInfoURLs.map((stopInfoURL: string) => axios.get(stopInfoURL, axiosConfig)))
          .then(async (data) => {
            const dataToState = await data.map((array) => array?.data?.data?.entry);
            const dataToStateColors = await data.map((array) => array?.data?.data?.references?.routes);
            await setStopsInfo(dataToState);
            await setStopsInfoColors(dataToStateColors);
            // console.log("dataToStateColors:", dataToStateColors);
          })
          .catch((error) => {
            console.log("error:", error);
          });
      };
      const setFetchInterval = () => {
        getStopInfo();
      };
      setFetchInterval();
      //* Setting up interval for fetching data
      const fetchingInterval = setInterval(setFetchInterval, fetchIntervalStop) as NodeJS.Timer;
      return () => {
        clearInterval(fetchingInterval);
        // console.log("Interval was cleared");
        controller.abort();
      };
    }
  }, [stopIds]);

  React.useEffect(() => {
    if (stopsInfo.length >= 1) {
      const fetchingInterval = setInterval(() => {
        setShowSpinner(true);
        index + 1 >= stopsInfo.length ? setIndex(0) : setIndex(index + 1);
      }, fetchIntervalStop) as NodeJS.Timer;
      return () => clearInterval(fetchingInterval);
    }
  }, [index, stopsInfo.length]);

  React.useEffect(() => {
    const now = Date.now();
    // console.log(stopsInfo.length, now, index);

    const tableColors = stopsInfoColors[index];
    // console.log("tableColors:", tableColors);

    if (stopsInfo.length >= 1) {
      const getDepartureInfo = (): void => {
        axios
          .get(
            `${apiBaseURL}/siri/stop-monitoring?key=${siriApiKey}&_=${now}&OperatorRef=${agencyId}&MonitoringRef=${stopIds[index]}&StopMonitoringDetailLevel=normal&MinimumStopVisitsPerLine=3&type=json`,
            axiosConfig
          )
          .then(({ data }) => {
            const dataToState = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery[0]?.MonitoredStopVisit;
            // console.log("dataToState:", dataToState);

            const dataToStateFiltered = dataToState?.map((array: StopDepartureBoardTimes) => {
              return {
                lineNumber: array.MonitoredVehicleJourney.LineRef,
                direction: array.MonitoredVehicleJourney.DestinationName,
                departureTime: array.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime,
                color: tableColors.filter(
                  (colorsArray: { id: string }) => array.MonitoredVehicleJourney.LineRef === colorsArray.id
                ),
              };
            });
            // console.log("dataToStateFiltered:", dataToStateFiltered);
            setDepartureData(dataToStateFiltered);
          })
          .catch((error) => {
            console.log("error:", error);
          });
      };
      getDepartureInfo();
    }
  }, [agencyId, index, stopIds, stopsInfo, stopsInfoColors]);

  const DeparturesTable = (): JSX.Element => {
    return (
      <Table striped bordered size="lg" style={{ marginBottom: 0 }}>
        <thead className="departure_table">
          <tr style={{ backgroundColor: colorLightgrey }}>
            <th colSpan={2}></th>
            <th style={{ textAlignLast: "center" }}>{t("Route")}</th>
            <th>{t("Connection")}</th>
            <th style={{ textAlignLast: "right" }}>{t("In")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="departure_table">
          {/* //* Departure board: th instead td in the table */}
          {departureData.map((row: StopDepartureBoardTimes, arrayIndex: number) => (
            <tr key={String(row.direction + "_" + timeConverterFromNow(row.departureTime) + "_" + arrayIndex)}>
              <th className="tr_responsive">{""}</th>
              <th style={{ backgroundColor: `#${row.color[0].color}`, width: "15px", height: "100%" }}>{""}</th>
              <th className="departure_table_line">
                {allRoutesTableFromRedux?.filter((route) => route?.id === row?.lineNumber)?.[0]?.shortName ||
                  cutAgencyName(row.lineNumber, agencyId)}
              </th>
              <th className="departure_table_direction">{row.direction}</th>
              <th style={{ textAlign: "right", paddingRight: 0, minWidth: "85px" }} className="departure_table_time">
                {timeConverterFromNow(row.departureTime)}
              </th>
              <th className="tr_responsive">{""}</th>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <React.Fragment>
      {showSpinner || loading ? (
        <Spinner backgroundColor={colorDepartureBackground} variant={"primary"} />
      ) : (
        <React.Fragment>
          {stopsInfo && stopsInfo.length && stopsInfo[index] ? (
            <React.Fragment>
              <Header>
                {agencyId && stopsInfo.length >= 1 && (
                  <React.Fragment>
                    <div>{stopsInfo[index].name}</div>
                    <div>{`#${cutAgencyName(stopsInfo[index].id, agencyId)}`}</div>
                  </React.Fragment>
                )}
              </Header>

              <BodyDiv>
                <HR id="hrTop" />
                <TableDiv>
                  {departureData && departureData.length >= 1 ? (
                    <DeparturesTable />
                  ) : (
                    <NoDeparturesInfo>
                      <h5>{t("No_vehicles_Please_check_later")}</h5>
                    </NoDeparturesInfo>
                  )}
                </TableDiv>
                <HR id="hrBottom" />
              </BodyDiv>

              <Footer>
                <Div>
                  <Img src={logo} alt="logo" />
                  <p>
                    {t("Stop")}
                    <span>{index + 1}</span>
                    {t("of")}
                    <span>{stopsInfo.length}</span>
                  </p>
                </Div>
                <CurrentTimeDiv />
              </Footer>
            </React.Fragment>
          ) : (
            <NotFound />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default DepartureBoard;
