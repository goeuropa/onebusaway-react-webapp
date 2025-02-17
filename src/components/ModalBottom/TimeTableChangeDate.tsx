import React from "react";
import { OverlayTrigger, Popover, Spinner, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { shallowEqual } from "react-redux";

import { dispatchModalInfoBottomIsOpen, selectStop } from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { cutAgencyName, dateToString, timeConverter, truncateString } from "../../utils/helpers";
import { routeListButtonWidth, timeTableCalendarDatesSettings } from "../../config";
import TimeTablePart from "./TimeTablePart";
import DatePickerComponent from "./DatePickerComponent";
import useStopData from "../Services/useStopData";
import variableColors from "../../_App.module.scss";

const { colorLightgrey, darkColor, colorLightblue } = variableColors;

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
  background-color: ${colorLightgrey};
  color: ${darkColor};
`;

const TimeTableChangeDate = (): JSX.Element => {
  const { t } = useTranslation();
  const { timetableDate, stop_Id } = useParams() as { timetableDate: string; stop_Id: string };
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch: Dispatch = useAppDispatch();

  //* Redux State
  const [agencyId, selectedLanguage, allStopsTableReduced]: [string, string, StopInfo[]] = useAppSelector(
    (state: RootState) => [state?.agency?.agencyId, state?.agency?.selectedLanguage, state?.allData?.allStopsTableReduced],
    shallowEqual
  );

  const parsedDate: Date = new Date(timetableDate as string);
  const dateFromLocalStorage = localStorage.getItem("timetable_Date") as string;

  //* Local State
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    parsedDate ? parsedDate : dateFromLocalStorage ? new Date(dateFromLocalStorage) : new Date()
  );
  const [selectedStop, setSelectedStop] = React.useState<StopInfo | null>(null);

  //* Custom Hook
  const { busStopDataModified, fetchData } = useStopData(agencyId, selectedDate, stop_Id);

  //* Save date to localStorage
  React.useEffect(() => {
    if (selectedDate) {
      const dateToLocalStorage: string = dateToString(selectedDate);
      localStorage.setItem("timetable_Date", dateToLocalStorage);
    }
  }, [selectedDate]);

  //* Set date to local state
  React.useEffect(() => {
    if (timetableDate) {
      setSelectedDate(new Date(timetableDate as string));
    }
  }, [timetableDate]);

  //* Navigate to: `/app/date/${selectedDateString}/stop/${stop_Id}`
  React.useEffect(() => {
    if (selectedDate && stop_Id) {
      const selectedDateString: string = dateToString(selectedDate);

      const path = location.pathname;
      const pathArray = path.split("/date/");
      const dateStopPart = pathArray[1];

      const dateStopArray = dateStopPart.split("/stop/");
      const dateString = dateStopArray[0];

      if (dateString !== selectedDateString) {
        setTimeout(async (): Promise<void> => {
          await dispatch(dispatchModalInfoBottomIsOpen(true));
          await navigate(`/app/date/${selectedDateString}/stop/${stop_Id}`);
        }, 500);
      }
    }
  }, [dispatch, location, navigate, selectedDate, stop_Id]);

  //* Set Current Stop
  React.useEffect(() => {
    if (stop_Id && allStopsTableReduced && allStopsTableReduced.length >= 1 && timetableDate) {
      const stopsList = allStopsTableReduced.map((stop: StopInfo) => stop.id);
      const initialAction = async (): Promise<void> => {
        const stopToSet = await allStopsTableReduced.filter((stop) => stop.id === stop_Id);
        await setSelectedStop(stopToSet[0]);
      };

      const todayDate: number = Date.parse(timetableDate);

      !stopsList.includes(stop_Id) ||
      todayDate > Date.now() + timeTableCalendarDatesSettings[1] * 24 * 60 * 60 * 1000 ||
      todayDate < Date.now() - timeTableCalendarDatesSettings[0] * 24 * 60 * 60 * 1000
        ? navigate("/not_found")
        : initialAction();
    }
  }, [stop_Id, allStopsTableReduced, dispatch, navigate, timetableDate]);

  //* Dispatch Current Stop
  React.useEffect(() => {
    if (selectedStop) {
      dispatch(selectStop(selectedStop, true));
    }
  }, [dispatch, selectedStop]);

  //* Change Calender Date
  const onCalendarClose = (): void => {
    if (stop_Id && selectedDate) {
      fetchData();
    }
  };

  //* Popover
  const ShowTheWholeRoute = (str: string): JSX.Element => {
    return (
      <Popover id="show_the_whole_route">
        <Popover.Header as="h3" style={{ background: colorLightblue }}>
          {t("Route")}
        </Popover.Header>
        <Popover.Body as="div">{str}</Popover.Body>
      </Popover>
    );
  };

  //* The main table
  const DepartureTablesSet = (busStopDataModifiedSet: StationTimeTableModified[]): JSX.Element => {
    const tableSet: JSX.Element[] = busStopDataModifiedSet?.map((stopSet, index: number): JSX.Element => {
      return (
        <div key={String(stopSet.routeId + index)}>
          <TableHeaderInfo>
            <div
              style={{
                color: `#${stopSet.textColor}`,
                backgroundColor: `#${stopSet.color}`,
                textAlign: "center",
                verticalAlign: "middle",
                minWidth: `calc(${routeListButtonWidth} * 1.6)`,
                height: "100%",
                fontWeight: "bold",
                fontSize: "x-large",
                flex: "0 1 auto",
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
                flex: 1,
              }}
            >
              {stopSet.longNameAdded}
            </div>
          </TableHeaderInfo>
          <Table striped bordered hover size="sm" key={String(stopSet.routeId + index)}>
            <thead style={{ background: colorLightgrey, zIndex: 9 }}>
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
              {busStopDataModifiedSet &&
                stopSet.departuresArray.map((dataRow: TimeTableRow, index: number) => (
                  <tr key={String(dataRow.departureTime + index)}>
                    <td className="th_small_padding span_bold">{timeConverter(dataRow.departureTime, selectedLanguage)}</td>
                    <td className="th_small_padding" style={{ fontSize: "normal", verticalAlign: "middle" }} colSpan={2}>
                      {dataRow?.tripHeadsignAdded!.length >= 25 ? (
                        <OverlayTrigger
                          trigger={["focus", "hover"]}
                          placement="auto"
                          overlay={ShowTheWholeRoute(dataRow.tripHeadsignAdded!)}
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
    return <React.Fragment>{tableSet}</React.Fragment>;
  };

  return (
    <React.Fragment>
      {agencyId ? <TimeTablePart selectedStop={selectedStop} agencyId={agencyId} selectedDate={selectedDate} /> : null}

      {/* //* DatePicker */}
      <DatePickerComponent
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedLanguage={selectedLanguage}
        onCalendarClose={onCalendarClose}
      />

      {!busStopDataModified ? (
        <Spinner animation="border" variant="primary" />
      ) : busStopDataModified.length === 0 ? (
        <h5 style={{ marginTop: "3rem", textAlign: "center" }}>{t("There are no services on this day for this stop")}</h5>
      ) : (
        <React.Fragment>
          {/* //* The main Table */}
          {DepartureTablesSet(busStopDataModified)}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default TimeTableChangeDate;
