import React from "react";
import axios from "axios";
import { OverlayTrigger, Popover, Spinner, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import DatePicker from "react-date-picker";
import { shallowEqual } from "react-redux";

import { dispatchModalInfoBottomIsOpen, selectStop } from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import busTimetable from "../../assets/Icons/busTimetable.svg";
import { cutAgencyName, dateToString, setNewDate, timeConverter, truncateString } from "../../utils/helpers";
import { apiKey, apiBaseURL, routeListButtonWidth } from "../../config";
import TimeTablePart from "./TimeTablePart";

const DatePickerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin-bottom: 1rem;
`;

const TableHeaderInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  margin-bottom: 0;
  gap: 0.25rem;
  flex-wrap: wrap;
  background-color: lightGray;
`;

const IconCalendar = (): JSX.Element => (
  <React.Fragment>
    <img src={busTimetable} alt="Timetable icon" width="28" height="28" />
  </React.Fragment>
);

const TimeTableChangeDate = (): JSX.Element => {
  const { t } = useTranslation();
  const { timetableDate, stop_Id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch: Dispatch = useAppDispatch();

  const [agencyId, selectedLanguage, allRoutesTableFromRedux, allStopsTableReduced]: [
    string,
    string,
    RouteInfo[],
    StopInfo[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.agency?.agencyId,
      state?.agency?.selectedLanguage,
      state?.allData?.allRoutesTableReduced,
      state?.allData?.allStopsTableReduced,
    ],
    shallowEqual
  );

  // console.log({ timetableDate });
  const parsedDate = new Date(timetableDate!);
  // console.log({parsedDate});
  const dateFromLocalStorage = localStorage.getItem("timetable_Date");
  // console.log({ dateFromLocalStorage });

  const [selectedDate, setSelectedDate] = React.useState<Date>(
    parsedDate ? parsedDate : dateFromLocalStorage ? new Date(dateFromLocalStorage) : new Date()
  );
  const [selectedStop, setSelectedStop] = React.useState<StopInfo | null>(null);
  const [stationData, setStationData] = React.useState<Array<StationTimeTable> | null>(null);
  const [busStopData, setBusStopData] = React.useState<Array<StationTimeTable> | null>(null);
  const [busStopDataModified, setBusStopDataModified] = React.useState<Array<StationTimeTableModified> | null>(null);
  // console.log("busStopDataModified:", busStopDataModified);
  // console.log("busStopData:", busStopData);

  //* Save date to localStorage
  React.useEffect(() => {
    const dateToLocalStorage = dateToString(selectedDate);
    // console.log({ dateToLocalStorage });
    localStorage.setItem("timetable_Date", dateToLocalStorage);
  });

  React.useEffect(() => {
    if (timetableDate) {
      setSelectedDate(new Date(timetableDate!));
    }
  }, [timetableDate]);

  React.useEffect(() => {
    if (selectedDate) {
      const selectedDateString = dateToString(selectedDate);
      // console.log({ selectedDateString });

      const path = location.pathname;
      const pathArray = path.split("/date/");
      const dateStopPart = pathArray[1];
      // console.log({ dateStopPart });
      const dateStopArray = dateStopPart.split("/stop/");
      const dateString = dateStopArray[0];
      // console.log({ dateString});
      // console.log({ selectedDateString});
      if (dateString !== selectedDateString) {
        setTimeout(async () => {
          await dispatch(dispatchModalInfoBottomIsOpen(true));
          await navigate(`/app/date/${selectedDateString}/stop/${stop_Id}`);
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, stop_Id]);

  //* Set Current Stop
  React.useEffect(() => {
    if (stop_Id && allStopsTableReduced && allStopsTableReduced.length >= 1 && timetableDate) {
      const stopsList = allStopsTableReduced.map((stop) => stop.id);
      const initialAction = async () => {
        const stopToSet = await allStopsTableReduced.filter((stop) => stop.id === stop_Id);
        // await console.log("stopToSet:", stopToSet);
        await setSelectedStop(stopToSet[0]);
      };
      // const today = dateToString(new Date());
      // console.log({ today });

      const todayDate = Date.parse(timetableDate);
      // console.log({ todayDate });
      // console.log(Date.now());

      !stopsList.includes(stop_Id) ||
      todayDate > Date.now() + 30 * 24 * 60 * 60 * 1000 ||
      todayDate < Date.now() - 7 * 24 * 60 * 60 * 1000
        ? navigate("/not_found")
        : initialAction();
    }
  }, [stop_Id, allStopsTableReduced, dispatch, navigate, timetableDate]);

  //* Dispatch Current Stop
  React.useEffect(() => {
    if (selectedStop) {
      // console.log("selectedStop:", selectedStop)
      dispatch(selectStop(selectedStop, true));
    }
  }, [dispatch, selectedStop]);

  //* Fetch departures/arrivals data onLoad/ onDateChange
  const fetchData = React.useCallback(() => {
    const dateToSend = dateToString(selectedDate);
    // console.log({ dateToSend });
    // console.log({ id });
    axios
      .get(`${apiBaseURL}/api/where/schedule-for-stop/${stop_Id}.json?date=${dateToSend}&key=${apiKey}`)
      .then(({ data }) => {
        const busStopDataFromApi = data?.data?.entry?.stopRouteSchedules;
        // console.log("busStopDataFromApi:", busStopDataFromApi);
        setStationData(busStopDataFromApi);
      })
      .catch((error) => {
        console.log("error:", error);
      });
  }, [stop_Id, selectedDate]);

  React.useEffect(() => {
    if (stop_Id && selectedDate) {
      fetchData();
    }
  }, [fetchData, selectedDate, stop_Id]);

  React.useEffect(() => {
    if (stationData && allRoutesTableFromRedux && agencyId) {
      for (let i = 0; i < stationData.length; i++) {
        for (let k = 0; k < allRoutesTableFromRedux.length; k++) {
          if (stationData[i].routeId! === allRoutesTableFromRedux[k].id) {
            stationData[i].color = allRoutesTableFromRedux[k].color;
            stationData[i].textColor = allRoutesTableFromRedux[k].textColor;
            stationData[i].longNameAdded = allRoutesTableFromRedux[k].longName;
            stationData[i].shortNameAdded = allRoutesTableFromRedux[k].shortName;
          }
        }
      }

      for (let i = 0; i < stationData.length; i++) {
        for (let k = 0; k < stationData[i].stopRouteDirectionSchedules.length; k++) {
          for (let l = 0; l < stationData[i].stopRouteDirectionSchedules[k].scheduleStopTimes.length; l++) {
            stationData[i].stopRouteDirectionSchedules[k].scheduleStopTimes[l].tripHeadsignAdded =
              stationData[i].stopRouteDirectionSchedules[k].tripHeadsign;
          }
        }
      }
      setBusStopData(stationData);
    }
  }, [agencyId, allRoutesTableFromRedux, stationData]);

  React.useEffect(() => {
    if (stationData && busStopData) {
      const busStopDataModified = [] as StationTimeTableModified[];
      for (let i = 0; i < stationData.length; i++) {
        const busStopDataModifiedObject = {} as StationTimeTableModified;
        busStopDataModifiedObject.color = stationData[i].color!;
        busStopDataModifiedObject.textColor = stationData[i].textColor!;
        busStopDataModifiedObject.longNameAdded = stationData[i].longNameAdded!;
        busStopDataModifiedObject.routeId = stationData[i].routeId;
        busStopDataModifiedObject.shortNameAdded = String(stationData[i].shortNameAdded);
        busStopDataModifiedObject.departuresArray = [] as TimeTableRow[];
        for (let k = 0; k < stationData[i].stopRouteDirectionSchedules.length; k++) {
          for (let l = 0; l < stationData[i].stopRouteDirectionSchedules[k].scheduleStopTimes.length; l++) {
            busStopDataModifiedObject.departuresArray.push(
              stationData[i].stopRouteDirectionSchedules[k].scheduleStopTimes[l]
            );
          }
        }
        busStopDataModified.push(busStopDataModifiedObject);
      }

      for (let i = 0; i < busStopDataModified.length; i++) {
        busStopDataModified[i].departuresArray.sort((a, b) => a.departureTime! - b.departureTime!);
      }

      setBusStopDataModified(busStopDataModified);
    }
  }, [agencyId, allRoutesTableFromRedux, busStopData, stationData]);

  const onCalendarClose = () => {
    if (stop_Id && selectedDate) {
      fetchData();
    }
  };

  const showTheWholeRoute = (str: string) => {
    return (
      <Popover id="show_the_whole_route">
        <Popover.Header as="h3" style={{ background: "lightblue" }}>
          {t("Route")}
        </Popover.Header>
        <Popover.Body as="div">{str}</Popover.Body>
      </Popover>
    );
  };

  const DepartureTablesSet = (): JSX.Element => {
    const TableSet = busStopDataModified?.map((stopSet, index: number) => {
      return (
        <div key={String(stopSet.routeId + index)}>
          <TableHeaderInfo>
            <div
              style={{
                color: `#${stopSet.textColor}`,
                backgroundColor: `#${stopSet.color}`,
                textAlign: "center",
                verticalAlign: "middle",
                minWidth: routeListButtonWidth,
                height: "100%",
                fontWeight: "bold",
                fontSize: "x-large",
              }}
            >
              {stopSet.shortNameAdded || cutAgencyName(stopSet.routeId, agencyId)}
            </div>
            <div
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                height: "100%",
                fontWeight: "bold",
                fontSize: "large",
                marginLeft: "0.75rem",
              }}
            >
              {stopSet.longNameAdded}
            </div>
          </TableHeaderInfo>
          <Table striped bordered hover size="sm" key={String(stopSet.routeId + index)}>
            <thead style={{ background: "lightgray", zIndex: 9 }}>
              <tr>
                <th style={{ fontSize: "small" }} className="th_small_padding">
                  {t("Departures")}
                </th>
                <th style={{ fontSize: "small" }} className="th_small_padding" colSpan={2}>
                  {t("Direction / Headsign")}
                </th>
              </tr>
            </thead>
            <tbody>
              {busStopDataModified &&
                stopSet.departuresArray.map((dataRow: TimeTableRow, index: number) => (
                  <tr key={String(dataRow.departureTime + index)}>
                    <td className="th_small_padding span_bold">{timeConverter(dataRow.departureTime, selectedLanguage)}</td>
                    <td
                      className="th_small_padding"
                      // style={{ fontSize: "normal", verticalAlign: "middle", borderRight: "none" }}
                      //^ V2: 2023-09-13
                      style={{ fontSize: "normal", verticalAlign: "middle" }}
                      colSpan={2}
                    >
                      {dataRow?.tripHeadsignAdded!.length >= 25 ? (
                        <OverlayTrigger
                          trigger={["focus", "hover"]}
                          placement="auto"
                          overlay={showTheWholeRoute(dataRow.tripHeadsignAdded!)}
                        >
                          <div>{truncateString(dataRow.tripHeadsignAdded!)}</div>
                        </OverlayTrigger>
                      ) : (
                        <div>{dataRow.tripHeadsignAdded}</div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      );
    });
    return <React.Fragment>{TableSet}</React.Fragment>;
  };

  return (
    <React.Fragment>
      {agencyId && <TimeTablePart selectedStop={selectedStop} agencyId={agencyId} selectedDate={selectedDate} />}

      <DatePickerContainer>
        <DatePicker
          calendarIcon={<IconCalendar />}
          onChange={setSelectedDate}
          value={selectedDate}
          format="yyyy-MM-dd"
          locale={selectedLanguage}
          minDetail="year"
          onCalendarClose={onCalendarClose}
          required={false}
          minDate={setNewDate(-7)}
          maxDate={setNewDate(90)}
          dayPlaceholder={String(new Date().getDate())}
          monthPlaceholder={String(new Date().getMonth() + 1)}
          yearPlaceholder={String(new Date().getFullYear())}
        />
      </DatePickerContainer>

      {!busStopDataModified ? (
        <Spinner animation="border" variant="primary" />
      ) : busStopDataModified.length === 0 ? (
        <h5 style={{ marginTop: "3rem", textAlign: "center" }}>{t("There are no services on this day for this stop")}</h5>
      ) : (
        <React.Fragment>{DepartureTablesSet()}</React.Fragment>
      )}
    </React.Fragment>
  );
};

export default TimeTableChangeDate;
