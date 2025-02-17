import React from "react";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { shallowEqual } from "react-redux";

import { dispatchModalInfoBottomIsOpen, selectStop } from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { dateToString } from "../../utils/helpers";
import TimeTablePart from "./TimeTablePart";
import TimeTableBoard from "./TimeTableBoard";
import DatePickerComponent from "./DatePickerComponent";
import useStopData from "../Services/useStopData";

const TimeTableBoardWrapper = (): JSX.Element => {
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

  //* Navigate to: `/app/boardDate/${selectedDateString}/stop/${stop_Id}`
  React.useEffect(() => {
    if (selectedDate && stop_Id) {
      const selectedDateString: string = dateToString(selectedDate);

      const path = location.pathname;
      const pathArray = path.split("/boardDate/");
      const dateStopPart = pathArray[1];

      const dateStopArray = dateStopPart.split("/stop/");
      const dateString = dateStopArray[0];

      if (dateString !== selectedDateString) {
        setTimeout(async (): Promise<void> => {
          await dispatch(dispatchModalInfoBottomIsOpen(true));
          await navigate(`/app/boardDate/${selectedDateString}/stop/${stop_Id}`);
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
      todayDate > Date.now() + 30 * 24 * 60 * 60 * 1000 ||
      todayDate < Date.now() - 7 * 24 * 60 * 60 * 1000
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
        //* New Timetable Board
        <TimeTableBoard busStopDataModified={busStopDataModified} agencyId={agencyId} />
      )}
    </React.Fragment>
  );
};

export default TimeTableBoardWrapper;
