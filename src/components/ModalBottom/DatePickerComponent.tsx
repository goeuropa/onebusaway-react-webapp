import React from "react";
import styled from "styled-components";
import DatePicker from "react-date-picker";

import { setNewDate } from "../../utils/helpers";
import busTimetable from "../../assets/Icons/busTimetable.svg";
import { timeTableCalendarDatesSettings } from "../../config";

// Calendar - date picker container
const DatePickerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin-bottom: 1rem;
  button.react-date-picker__calendar-button.react-date-picker__button {
    padding: 1px 6px;
  }
`;

const IconCalendar = (): JSX.Element => (
  <React.Fragment>
    <img src={busTimetable} alt="Timetable icon" width="23" height="23" />
  </React.Fragment>
);

const DatePickerComponent = ({
  selectedDate,
  setSelectedDate,
  selectedLanguage,
  onCalendarClose,
}: {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedLanguage: string;
  onCalendarClose: () => void;
}): JSX.Element => {
  return (
    <React.Fragment>
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
          minDate={setNewDate(-timeTableCalendarDatesSettings[0])}
          maxDate={setNewDate(timeTableCalendarDatesSettings[1])}
          dayPlaceholder={String(new Date().getDate())}
          monthPlaceholder={String(new Date().getMonth() + 1)}
          yearPlaceholder={String(new Date().getFullYear())}
        />
      </DatePickerContainer>
    </React.Fragment>
  );
};

export default DatePickerComponent;
