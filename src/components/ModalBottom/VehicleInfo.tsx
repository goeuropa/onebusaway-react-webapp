import React from "react";
import axios from "axios";
import { OverlayTrigger, Popover, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";

import {
  fetchInterval,
  siriApiKey,
  maximumNumberOfCallsOnwards,
  apiBaseURL,
  routeListButtonWidth,
  showDevInfo,
} from "../../config";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { capitalizeFirstLetter, cutAgencyName, infoNotify, timeFromNow, truncateString } from "../../utils/helpers";
import busBlue from "../../assets/Icons/busBlue.svg";
import busGray from "../../assets/Icons/busGray.svg";
import directionIconGreen from "../../assets/Icons/directionGreen.svg";
import mapIcon from "../../assets/Icons/mapIcon.svg";
import { dispatchModalInfoBottomIsOpen, selectRoute, setLoadingAction } from "../../redux/actions";

const VehicleInfoContainer = styled.div`
  width: 100%;
  padding-bottom: 10px;
`;

const H6 = styled.h6`
  font-weight: bold;
`;

const FixedDiv = styled.div`
  position: sticky;
  top: 0;
`;

const VehicleInfo = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const dispatch: Dispatch = useAppDispatch();

  const [allBuses, agencyId, allRoutesTableFromRedux, selectedLanguage, allStopsTableFromRedux]: [
    BusInfo[],
    string,
    RouteInfo[],
    string,
    StopInfo[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.allData?.activeBlocksBuses,
      state?.agency?.agencyId,
      state?.allData?.allRoutesTableReduced,
      state?.agency?.selectedLanguage,
      state?.allData?.allStopsTableReduced,
    ],
    shallowEqual
  );

  const [selectedBus, setSelectedBus] = React.useState<SelectedBus | null>(null);
  const [infoToDisplay, setInfoToDisplay] = React.useState<BusInMotion | null>(null);
  // console.log("selectedBus:", selectedBus);

  React.useEffect(() => {
    if (allBuses && agencyId && vehicleId && allRoutesTableFromRedux && allStopsTableFromRedux) {
      const activeBusIdsList = allBuses.map((bus: BusInfo) =>
        cutAgencyName(bus?.MonitoredVehicleJourney?.VehicleRef, agencyId)
      );
      // console.log("activeBusIdsList:", activeBusIdsList);

      const notifyAction = async (vehicleId: string) => {
        // await console.log({ vehicleId });
        await infoNotify("warning", `${t("Vehicle")}: ${vehicleId} ${t("finished work or no such vehicle ID")}`);
        await navigate("/app");
      };

      const initialAction = () => {
        // console.log({ vehicleId });
        const selectedBusFromMap = allBuses.filter(
          (bus: BusInfo) => cutAgencyName(bus?.MonitoredVehicleJourney?.VehicleRef, agencyId) === vehicleId
        );
        // console.log("selectedBusFromMap:", selectedBusFromMap);
        const currentRoute = allRoutesTableFromRedux.filter(
          (route: RouteInfo) => route.id === selectedBusFromMap[0]?.MonitoredVehicleJourney?.LineRef
        );
        const busInfoObject = {
          BlockRef: selectedBusFromMap[0]?.MonitoredVehicleJourney?.BlockRef,
          VehicleRef: selectedBusFromMap[0]?.MonitoredVehicleJourney?.VehicleRef,
          LineRef: selectedBusFromMap[0]?.MonitoredVehicleJourney?.LineRef,
          Monitored: selectedBusFromMap[0]?.MonitoredVehicleJourney?.Monitored,
          Bearing: selectedBusFromMap[0]?.MonitoredVehicleJourney?.Bearing,
          PublishedLineName: selectedBusFromMap[0]?.MonitoredVehicleJourney?.PublishedLineName ?? "",
          DestinationRef: selectedBusFromMap[0]?.MonitoredVehicleJourney?.DestinationRef,
          destinationName: allStopsTableFromRedux.filter(
            (stop) => stop.id === selectedBusFromMap[0]?.MonitoredVehicleJourney?.DestinationRef
          ),
          currentRoute: currentRoute,
        };
        setSelectedBus(busInfoObject);
      };
      activeBusIdsList.includes(vehicleId) ? initialAction() : notifyAction(vehicleId);
    }
  }, [agencyId, allBuses, allRoutesTableFromRedux, allStopsTableFromRedux, navigate, t, vehicleId]);

  React.useEffect(() => {
    if (agencyId && selectedBus && Object.keys(selectedBus).length > 0) {
      const blockRef = selectedBus?.BlockRef;
      const vehicleRef = selectedBus?.VehicleRef;
      const controller = new AbortController();
      const vehicleRefShort = cutAgencyName(vehicleRef, agencyId);

      const getBusInfo = () => {
        axios
          .get(
            `${apiBaseURL}/siri/vehicle-monitoring?key=${siriApiKey}&OperatorRef=${agencyId}&VehicleRef=${vehicleRefShort}&MaximumNumberOfCallsOnwards=${maximumNumberOfCallsOnwards}&VehicleMonitoringDetailLevel=calls&TripId=${encodeURIComponent(
              blockRef as string
            )}&type=json`
          )
          .then(({ data }) => {
            // console.log("data:", data);
            const busInfo = data?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery["0"];
            // console.log("busInfo", busInfo);

            if (Object.keys(busInfo).length > 0 && busInfo.VehicleActivity.length >= 1) {
              // console.log("Data was fetched at", new Date().toLocaleTimeString(), "busInfo:", busInfo);
              const dataToShow = {
                lineNumber: busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney.PublishedLineName,
                route: busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.DestinationName,
                vehicleRef: cutAgencyName(busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.VehicleRef, agencyId),
                updatedTime: busInfo?.ResponseTimestamp,
                direction: busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.Bearing,
                onwardCall: busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.OnwardCalls,
                monitored: busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.Monitored,
                tripId:
                  busInfo?.VehicleActivity["0"]?.MonitoredVehicleJourney?.FramedVehicleJourneyRef?.DatedVehicleJourneyRef,
              };
              // console.log("dataToShow:", dataToShow);
              setInfoToDisplay(dataToShow);
            }
          })
          .catch((error) => {
            console.log("error:", error);
          });
      };

      const setFetchInterval = () => {
        getBusInfo();
      };
      setFetchInterval();

      //* Setting up interval for fetching data
      const fetchingInterval = setInterval(setFetchInterval, fetchInterval) as NodeJS.Timer;
      return () => {
        clearInterval(fetchingInterval);
        // console.log("Interval was cleared");
        controller.abort();
      };
    }
  }, [agencyId, selectedBus]);

  React.useEffect(() => {
    if (selectedBus && infoToDisplay) {
      selectedBus.routeNameFromVehicleApi = infoToDisplay.route;
    }
  }, [infoToDisplay, selectedBus]);

  //* Showing route polyline when selected bus
  React.useEffect(() => {
    if (selectedBus) {
      setTimeout(() => {
        const busRoute = cutAgencyName(selectedBus.LineRef!, agencyId);
        // console.log("busRoute:", busRoute);
        dispatch(selectRoute(String(busRoute)));
      }, 600);
    }
  }, [agencyId, dispatch, infoToDisplay, selectedBus]);

  const onLineClick = async (lineNumber: string) => {
    // console.info({ lineNumber });
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    await navigate(`/app/route/${lineNumber}`);
  };

  const showFullName = (str: string) => {
    return (
      <Popover id="show_full_name">
        <Popover.Header as="h3" style={{ background: "lightblue" }}>
          {t("Full_name")}
        </Popover.Header>
        <Popover.Body as="div">{str}</Popover.Body>
      </Popover>
    );
  };

  const BusInfoHeader = (): JSX.Element => {
    const busInfo = selectedBus?.currentRoute![0];
    return (
      <Table hover={true} striped={true} bordered={false} size="sm" style={{ marginBottom: 0 }}>
        <thead style={{ background: "lightgray", zIndex: 9 }}>
          <tr onClick={() => onLineClick(cutAgencyName(selectedBus?.LineRef!, agencyId))} className="link_class">
            <th
              style={{
                color: `#${busInfo?.textColor}`,
                backgroundColor: `#${busInfo?.color}`,
                textAlign: "center",
                verticalAlign: "middle",
                width: routeListButtonWidth,
              }}
              className="th_small_padding span_bold"
            >
              {selectedBus?.currentRoute?.[0]?.shortName ||
                selectedBus?.PublishedLineName ||
                cutAgencyName(selectedBus?.LineRef!, agencyId)}
            </th>
            <th
              className="th_small_padding span_bold"
              style={{
                verticalAlign: "middle",
                width: "20px",
              }}
            >
              <img src={mapIcon} alt="Map Icon" width="20" height="20" />
            </th>
            <th style={{ textAlign: "center" }} className="th_small_padding">
              {selectedBus?.routeNameFromVehicleApi && selectedBus?.routeNameFromVehicleApi.length >= 25 ? (
                <OverlayTrigger
                  trigger={["focus", "hover"]}
                  placement="auto"
                  overlay={showFullName(selectedBus?.routeNameFromVehicleApi)}
                >
                  <div>{truncateString(selectedBus?.routeNameFromVehicleApi)}</div>
                </OverlayTrigger>
              ) : busInfo?.longName && busInfo?.longName.length >= 25 ? (
                <OverlayTrigger trigger={["focus", "hover"]} placement="auto" overlay={showFullName(busInfo?.longName)}>
                  <div>{truncateString(busInfo?.longName)}</div>
                </OverlayTrigger>
              ) : (
                <div>{selectedBus?.routeNameFromVehicleApi || busInfo?.longName}</div>
              )}
            </th>
          </tr>
          <tr>
            <th className="th_small_padding span_bold d-flex justify-content-center" style={{ verticalAlign: "middle" }}>
              <img
                src={selectedBus?.Monitored ? busBlue : !selectedBus?.Monitored ? busGray : busGray}
                alt="Bus Icon"
                width="30"
                height="30"
              />
            </th>
            <th
              className="th_small_padding"
              style={{
                verticalAlign: "middle",
                width: "20px",
              }}
            >
              <img
                src={directionIconGreen}
                alt="Direction Icon"
                width="20"
                height="20"
                style={{ transform: `rotate(${selectedBus?.Bearing!}deg)` }}
              />
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }} className="th_small_padding">
              {cutAgencyName(selectedBus?.VehicleRef!, agencyId)}
            </th>
          </tr>
          <tr>
            <th
              colSpan={3}
              style={{ textAlign: "left", verticalAlign: "middle", fontWeight: "normal" }}
              className="th_small_padding"
            >
              <em>{selectedBus?.destinationName![0]?.name!} </em>
            </th>
          </tr>
        </thead>
      </Table>
    );
  };

  const onStopClick = async (busStop: BusInfoItem) => {
    // await console.info("busStop:", busStop);
    await dispatch(setLoadingAction(true));
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    await navigate(`/app/stop/${busStop.StopPointRef}`);
  };

  const StopsListTable = (): JSX.Element => {
    return (
      <Table hover={true} striped={true} bordered={true} size="sm">
        <thead style={{ background: "lightgray", zIndex: 9, fontSize: "small", textAlign: "left" }}>
          <tr>
            <td className="th_small_padding" colSpan={2}>
              {t("Last_update")}{" "}
              {selectedLanguage && (
                <span className="span_bold">{timeFromNow(infoToDisplay?.updatedTime!, selectedLanguage)}</span>
              )}
            </td>
          </tr>
        </thead>
        <tbody>
          {infoToDisplay?.onwardCall?.OnwardCall?.map((item: BusInfoItem, index: number) => {
            return (
              <tr
                key={item.ExpectedArrivalTime + index}
                className={index === 0 ? "table-info" : ""}
                onClick={() => onStopClick(item)}
                style={{ cursor: "pointer" }}
              >
                <td className="th_small_padding" style={{ verticalAlign: "middle" }}>
                  {capitalizeFirstLetter(item.StopPointName)}{" "}
                  {showDevInfo ? (
                    <span className="span_bold" style={{ fontSize: "small", color: "orangered" }}>
                      ({item.StopPointRef})
                    </span>
                  ) : null}
                </td>
                <td className="th_small_padding" style={{ width: "35%" }}>
                  {selectedLanguage && timeFromNow(item.ExpectedArrivalTime, selectedLanguage)}
                  <br />
                  <span style={{ color: "maroon", fontSize: "small" }}>{item.Extensions.Distances.PresentableDistance}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  return (
    <React.Fragment>
      <VehicleInfoContainer>
        {selectedBus && Object.keys(selectedBus).length > 0 ? (
          <FixedDiv>{BusInfoHeader()}</FixedDiv>
        ) : (
          <React.Fragment>
            <Spinner animation="border" variant="primary" />
          </React.Fragment>
        )}

        {selectedBus && !infoToDisplay ? (
          <React.Fragment>
            <br />
            <H6 style={{ color: "maroon", textAlign: "center" }}>
              {t("Realtime data currently not available for this vehicle")}
            </H6>
          </React.Fragment>
        ) : (
          StopsListTable()
        )}
      </VehicleInfoContainer>
    </React.Fragment>
  );
};

export default VehicleInfo;
