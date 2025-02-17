import React from "react";
import { OverlayTrigger, Popover, Spinner, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { shallowEqual } from "react-redux";

import { fetchInterval, routeListButtonWidth, showDevInfo } from "../../config";
import { dispatchModalInfoBottomIsOpen, getStopInfo, selectStop } from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  currentOccupationBusData,
  cutAgencyName,
  timeConverter,
  timeConverterFromNow,
  truncateString,
} from "../../utils/helpers";
import TimeTablePart from "./TimeTablePart";
import OccupancyStatusIcon from "../../utils/OccupancyStatusIcon";

const TimeTableToday = (): JSX.Element => {
  const { t } = useTranslation();
  const { stop_Id } = useParams();
  const navigate = useNavigate();

  const dispatch: Dispatch = useAppDispatch();

  const [
    stops,
    selectedLanguage,
    allRoutesTableFromRedux,
    agencyId,
    allStopsTableReduced,
    vehiclePositionsData,
    occupancyStatus,
  ]: [ArrivalsDepartures[], string, RouteInfo[], string, StopInfo[], VehiclePositionsData[], boolean] = useAppSelector(
    (state: RootState) => [
      state?.stops?.arrivalsDepartures,
      state?.agency?.selectedLanguage,
      state?.allData?.allRoutesTableReduced,
      state?.agency?.agencyId,
      state?.allData?.allStopsTableReduced,
      state?.buses?.vehiclePositionsData,
      state?.appSettings?.occupancyStatus,
    ],
    shallowEqual
  );
  // console.log("vehiclePositionsData:", vehiclePositionsData);

  const [stopInfo, setStopInfo] = React.useState<ArrivalsDepartures[]>([]);
  const [selectedStop, setSelectedStop] = React.useState<StopInfo | null>(null);
  // console.log("stopInfo:", stopInfo);

  React.useEffect(() => {
    if (stop_Id && allStopsTableReduced && allStopsTableReduced.length >= 1) {
      const stopsList = allStopsTableReduced.map((stop) => stop.id);
      // console.log("stopsList:", stopsList);
      // console.log("stopsList.includes(Id):", stopsList.includes(Id));

      const initialAction = async () => {
        // await console.log({ Id });
        await dispatch(dispatchModalInfoBottomIsOpen(true));
        await localStorage.setItem("activeStopId", stop_Id);
        await dispatch(getStopInfo(stop_Id, String(6 * 60)));
        const stopToSet = await allStopsTableReduced.filter((stop) => stop.id === stop_Id);
        // await console.log("stopToSet:", stopToSet);
        await setSelectedStop(stopToSet[0]);
      };
      stopsList.includes(stop_Id) ? initialAction() : navigate("/not_found");
    }
  }, [stop_Id, allStopsTableReduced, dispatch, navigate]);

  React.useEffect(() => {
    if (selectedStop) {
      // console.log("selectedStop:", selectedStop)
      dispatch(selectStop(selectedStop, true));
    }
  }, [dispatch, selectedStop]);

  React.useEffect(() => {
    if (stops && allRoutesTableFromRedux) {
      for (let i = 0; i < stops.length; i++) {
        for (let k = 0; k < allRoutesTableFromRedux.length; k++) {
          if (stops[i].routeId === allRoutesTableFromRedux[k].id) {
            stops[i].color = allRoutesTableFromRedux[k].color;
            stops[i].textColor = allRoutesTableFromRedux[k].textColor;
            stops[i].acronym = allRoutesTableFromRedux[k].shortName as string;
          }
        }
      }
      setStopInfo(stops);
    }
  }, [allRoutesTableFromRedux, stops]);

  const showAllStops = (str: string) => {
    return (
      <Popover id="show_all_stops">
        <Popover.Header as="h3" style={{ background: "lightblue" }}>
          {t("All_stops")}
        </Popover.Header>
        <Popover.Body as="div">{str}</Popover.Body>
      </Popover>
    );
  };

  const timeInFuture = (timeFromApi: number) => {
    const now = Date.now();
    const time = timeFromApi + fetchInterval - now;
    // console.log({ time });
    return time > 0 ? true : false;
  };

  const StopTable = (): JSX.Element => {
    return (
      <Table hover={true} striped={true} bordered={false} size="sm">
        <thead style={{ position: "sticky", top: "0", background: "lightgray", zIndex: 9 }}>
          <tr>
            <th style={{ fontSize: "small", textAlign: "center", width: routeListButtonWidth }}>{t("Route")}</th>
            <th style={{ fontSize: "small" }}>{t("Direction / Headsign")}</th>
            <th style={{ fontSize: "small" }} colSpan={2}>
              {t("Departures")}
            </th>
            {showDevInfo ? <th style={{ fontSize: "small", color: "orangered" }}>{t("Bus ID")}</th> : null}
            {occupancyStatus ? <th style={{ fontSize: "small" }}>{t("Occupancy Status")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {stopInfo &&
            stopInfo.map((stop: ArrivalsDepartures, index) => {
              return (
                <React.Fragment key={String(stop?.scheduledDepartureTime! + index)}>
                  {/* // Todo: is it possible to get if a vehicle passed the stop? */}
                  {timeInFuture(stop?.predicted ? stop?.predictedDepartureTime : stop?.scheduledDepartureTime!) ? (
                    <tr
                      key={String(stop.scheduledDepartureTime! + index)}
                      onClick={() => {
                        // console.log("stop:", stop);
                      }}
                    >
                      <td
                        style={{
                          color: `#${stop.textColor}`,
                          backgroundColor: `#${stop.color}`,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                        className="th_small_padding span_bold"
                      >
                        {stop?.acronym || stop?.routeShortName || cutAgencyName(stop?.routeId!, agencyId)}
                      </td>
                      <td className="th_small_padding" style={{ fontSize: "normal", verticalAlign: "middle" }}>
                        {stop.tripHeadsign.length >= 25 ? (
                          <OverlayTrigger
                            trigger={["focus", "hover"]}
                            placement="auto"
                            overlay={showAllStops(stop.tripHeadsign)}
                          >
                            <div>{truncateString(stop.tripHeadsign)}</div>
                          </OverlayTrigger>
                        ) : (
                          <div>{stop.tripHeadsign}</div>
                        )}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        {stop.predicted ? (
                          <span className="span_small">{timeConverter(stop?.predictedDepartureTime, selectedLanguage)}</span>
                        ) : (
                          <span className="span_small">
                            {timeConverter(stop?.scheduledDepartureTime!, selectedLanguage)}
                          </span>
                        )}
                      </td>
                      <td
                        className="th_small_padding"
                        style={{
                          fontStyle: "inherit",
                          fontSize: "normal",
                          verticalAlign: "middle",
                          color: timeInFuture(stop?.predicted ? stop?.predictedDepartureTime : stop?.scheduledDepartureTime!)
                            ? "inherit"
                            : "dimgrey",
                        }}
                      >
                        {stop.predicted ? (
                          <React.Fragment>
                            <em style={{ marginRight: "0.5rem" }}>
                              {t("In")} {timeConverterFromNow(stop?.predictedDepartureTime)}
                            </em>{" "}
                            <span className="span_small">{t("Real-Time")}</span>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <em style={{ marginRight: "0.5rem" }}>
                              {t("In")} {timeConverterFromNow(stop?.scheduledDepartureTime!)}
                            </em>{" "}
                            <span className="span_small">{t("Scheduled")}</span>
                          </React.Fragment>
                        )}{" "}
                        {showDevInfo ? (
                          <span style={{ fontSize: "small", color: "orangered", fontStyle: "italic" }}>
                            {`${(stop?.tripStatus?.scheduleDeviation / -60).toFixed(1)}min`}
                          </span>
                        ) : null}
                      </td>

                      {showDevInfo ? (
                        <th style={{ fontSize: "small", color: "orangered", fontWeight: "bold" }}>
                          {stop?.vehicleId || stop?.tripStatus?.vehicleId}
                        </th>
                      ) : null}
                      {occupancyStatus ? (
                        <td>
                          <OccupancyStatusIcon
                            selectedBus={currentOccupationBusData(
                              stop?.vehicleId || stop?.tripStatus?.vehicleId,
                              vehiclePositionsData,
                              agencyId
                            )}
                            showTooltip={true}
                            placement="left"
                          />
                        </td>
                      ) : null}
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
        </tbody>
      </Table>
    );
  };

  return (
    <React.Fragment>
      {agencyId && <TimeTablePart selectedStop={selectedStop} agencyId={agencyId} />}

      {!stops ? (
        <Spinner animation="border" variant="primary" />
      ) : stopInfo.length === 0 ? (
        <h5 style={{ marginTop: "3rem", textAlign: "center" }}>{t("No courses in the next 24 hours")}</h5>
      ) : (
        <React.Fragment>{StopTable()}</React.Fragment>
      )}
    </React.Fragment>
  );
};

export default TimeTableToday;
