import React from "react";
import styled from "styled-components";
import { Tab, Tabs } from "react-bootstrap";

import { convertTimestampToLocalTime, cutAgencyName } from "../../utils/helpers";
import TimeTableBoardTabContent from "./TimeTableBoardTabContent";
import { globalTimetableHours } from "../../config";
import { TabsTitle } from "../../utils/UIStyledComponents";

const TimeTableContainer = styled.div`
  color: initial;
  table {
    thead {
      tr {
        th {
          padding: 0 !important;
        }
      }
    }
  }
`;

const TimeTableBoard = ({
  busStopDataModified,
  agencyId,
}: {
  busStopDataModified: StationTimeTableModified[];
  agencyId: string;
}): JSX.Element => {
  const [stopRoutes, setStopsRoutes] = React.useState<string[]>([]);
  const [stopHoursArray, setStopHoursArray] = React.useState<number[]>([]);
  const [stopRouteDeparturesArray, setStopRoutesDeparturesArray] = React.useState<RouteDeparturesData[]>([]);
  const [tabKey, setTabKey] = React.useState<string | undefined>(undefined);

  //* Init set data to localState
  React.useEffect((): void => {
    if (busStopDataModified) {
      //* 1. Set routes for the current stop
      const routes: string[] = busStopDataModified
        ?.map((busStop: StationTimeTableModified) => busStop?.routeId)
        ?.map((route: string) => cutAgencyName(route, agencyId));
      setStopsRoutes(routes);

      //* 2. Set working hours for the current stop
      const globalDeparturesTimes: number[] = busStopDataModified
        ?.map((busStop: StationTimeTableModified) => busStop?.departuresArray)
        ?.flat(1)
        ?.map((elem: TimeTableRow) => elem?.departureTime);

      const globalDeparturesHoursMinutes: string[] = globalDeparturesTimes?.map((time: number) =>
        convertTimestampToLocalTime(time)
      );
      const globalDeparturesHoursOnly: number[] = [
        ...new Set(globalDeparturesHoursMinutes?.map((time: string) => time?.split(":")?.[0])),
      ]
        ?.sort((a: string, b: string) => a.localeCompare(b))
        ?.map((str: string) => Number(str));
      // console.log("globalDeparturesHoursOnly:", globalDeparturesHoursOnly);

      const [globalMinHour, globalMaxHour]: number[] = [
        Math.min(...globalDeparturesHoursOnly),
        Math.max(...globalDeparturesHoursOnly),
      ];
      // console.log("globalMinHour, globalMaxHour:", globalMinHour, globalMaxHour);

      const finalHours: number[] = [
        Math.min(globalMinHour, globalTimetableHours[0]),
        Math.max(globalMaxHour, globalTimetableHours[1]),
      ];
      // console.log("finalHours:", finalHours);

      const hoursArray: number[] = Array.from(
        { length: finalHours[1] - finalHours[0] + 1 },
        (_: number, i: number) => finalHours[0] + i
      );
      // console.log("hoursArray:", hoursArray);

      setStopHoursArray(hoursArray);
    }

    //* 3. Set departures data for the current stop
    const routeDeparturesArray: RouteDeparturesData[] = busStopDataModified
      ?.map((busStop: StationTimeTableModified) => {
        return {
          routeId: cutAgencyName(busStop?.routeId, agencyId),
          color: busStop?.color,
          longNameAdded: busStop?.longNameAdded,
          shortNameAdded: busStop?.shortNameAdded,
          departures: busStop?.departuresArray
            ?.map((elem: TimeTableRow) => elem?.departureTime)
            ?.sort((a: number, b: number) => a - b)
            ?.map((time: number) => convertTimestampToLocalTime(time)),
        };
      })
      ?.sort((a: RouteDeparturesData, b: RouteDeparturesData) => a?.routeId?.localeCompare(b?.routeId));
    setStopRoutesDeparturesArray(routeDeparturesArray);
  }, [agencyId, busStopDataModified]);

  //* Set Initial Tab
  React.useEffect(() => {
    if (stopRoutes?.length) {
      setTabKey(stopRoutes?.[0]);
    }
  }, [stopRoutes]);

  //* Tabs nav content
  const routesTabs: JSX.Element[] = stopRoutes?.map((route: string, index: number): JSX.Element => {
    const routeDeparturesData: RouteDeparturesData = stopRouteDeparturesArray?.filter(
      (data: RouteDeparturesData) => data?.routeId === route
    )?.[0];

    return (
      <Tab eventKey={route} title={<TabsTitle routeDeparturesData={routeDeparturesData} />} key={`${route}_${index}`}>
        <TimeTableBoardTabContent stopHoursArray={stopHoursArray} routeDeparturesData={routeDeparturesData} />
      </Tab>
    );
  });

  return (
    <React.Fragment>
      {busStopDataModified?.length && stopRoutes?.length && stopRouteDeparturesArray?.length ? (
        <TimeTableContainer>
          {stopRoutes?.length === 1 ? (
            //* Only one route - table
            <TimeTableBoardTabContent stopHoursArray={stopHoursArray} routeDeparturesData={stopRouteDeparturesArray?.[0]} />
          ) : (
            //* More than one route - tabs with table
            <Tabs
              id="routes-timetable-board"
              activeKey={tabKey}
              onSelect={(key) => setTabKey(key as string)}
              className="mb-3"
              fill={true}
              justify={true}
              variant="underline"
            >
              {routesTabs}
            </Tabs>
          )}
        </TimeTableContainer>
      ) : null}
    </React.Fragment>
  );
};

export default TimeTableBoard;
