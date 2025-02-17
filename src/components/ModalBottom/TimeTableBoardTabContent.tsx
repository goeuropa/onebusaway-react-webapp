import React from "react";
import { Table } from "react-bootstrap";

import { TimeTableHeader } from "../../utils/UIStyledComponents";
import variableColors from "../../_App.module.scss";

const { darkColor } = variableColors;

const TimeTableBoardTabContent = ({
  stopHoursArray,
  routeDeparturesData,
}: {
  stopHoursArray: number[];
  routeDeparturesData: RouteDeparturesData;
}): JSX.Element => {
  //* Take minutes from the time string
  const getMinutes = (timesArray: string[], rowHour: number): string[] => {
    return timesArray
      ?.filter((time: string) => Number(time?.split(":")?.[0]) === rowHour)
      ?.map((elem: string) => elem?.split(":")?.[1]);
  };

  //* Table body rows
  const timeTableRows: JSX.Element[] = stopHoursArray?.map((hour: number, index): JSX.Element => {
    return (
      <tr key={`${hour}_${index}`} className="th_small_padding">
        <td className="span_bold" style={{ width: "25%" }}>
          {String(hour).padStart(2, "0")}
        </td>
        <td style={{ width: "75%" }}>
          {getMinutes(routeDeparturesData?.departures, hour)?.map(
            (minutes: string, index: number): JSX.Element => (
              <span key={index} style={{ color: darkColor, fontWeight: 500, marginRight: "1rem" }}>
                {minutes}
              </span>
            )
          )}
        </td>
      </tr>
    );
  });

  return (
    <React.Fragment>
      <Table striped={true} bordered={true} hover={true} size="sm" variant="light" responsive={true}>
        <thead>
          <tr>
            <th colSpan={2}>
              <TimeTableHeader routeDeparturesData={routeDeparturesData} />
            </th>
          </tr>
        </thead>
        <tbody>{timeTableRows}</tbody>
      </Table>
    </React.Fragment>
  );
};

export default TimeTableBoardTabContent;
