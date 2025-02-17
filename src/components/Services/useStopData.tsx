import React from "react";
import axios from "axios";
import { shallowEqual } from "react-redux";

import { apiBaseURL, apiKey, axiosConfig } from "../../config";
import { dateToString } from "../../utils/helpers";
import { useAppSelector } from "../../redux/hooks";

type UseDataType = {
  busStopDataModified: StationTimeTableModified[] | null;
  fetchData: () => void;
};

const useStopData = (agencyId: string, parsedDate: Date, stop_Id: string): UseDataType => {
  const [allRoutesTableFromRedux]: [RouteInfo[]] = useAppSelector(
    (state: RootState) => [state?.allData?.allRoutesTableReduced],
    shallowEqual
  );

  const [stationData, setStationData] = React.useState<Array<StationTimeTable> | null>(null);
  const [busStopData, setBusStopData] = React.useState<Array<StationTimeTable> | null>(null);
  const [busStopDataModified, setBusStopDataModified] = React.useState<Array<StationTimeTableModified> | null>(null);

  //* Fetch departures/arrivals data onLoad/ onDateChange
  const fetchData = React.useCallback(async (): Promise<void> => {
    const dateToSend: string = dateToString(parsedDate);

    await axios
      .get(`${apiBaseURL}/api/where/schedule-for-stop/${stop_Id}.json?date=${dateToSend}&key=${apiKey}`, axiosConfig)
      .then(({ data }) => {
        const busStopDataFromApi = data?.data?.entry?.stopRouteSchedules;
        // console.log("busStopDataFromApi:", busStopDataFromApi);
        setStationData(busStopDataFromApi);
      })
      .catch((error) => {
        console.log("error:", error);
      });
  }, [parsedDate, stop_Id]);

  React.useEffect(() => {
    if (stop_Id && parsedDate) {
      fetchData();
    }
  }, [fetchData, parsedDate, stop_Id]);

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

  return { busStopDataModified, fetchData };
};

export default useStopData;
