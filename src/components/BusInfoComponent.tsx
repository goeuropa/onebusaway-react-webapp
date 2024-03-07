import React from "react";
import { Spinner, Table } from "react-bootstrap";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { shallowEqual } from "react-redux";

import { routeListButtonWidth } from "../config";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { cutAgencyName } from "../utils/helpers";
import busBlue from "../assets/Icons/busBlue.svg";
import busGray from "../assets/Icons/busGray.svg";
import { dispatchModalInfoBottomIsOpen } from "../redux/actions";

const VehicleInfoContainer = styled.div`
  width: 100%;
`;

const BusInfoComponent = ({
  vehicleRef,
  publishedLineName,
}: {
  vehicleRef: string;
  publishedLineName: string;
}): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [allBuses, agencyId, allRoutesTableFromRedux]: [BusInfo[], string, RouteInfo[]] = useAppSelector(
    (state: RootState) => [
      state?.allData?.activeBlocksBuses,
      state?.agency?.agencyId,
      state?.allData?.allRoutesTableReduced,
    ],
    shallowEqual
  );
  const vehicleId = cutAgencyName(vehicleRef, agencyId);

  const [selectedBus, setSelectedBus] = React.useState<SelectedBus | null>(null);
  // console.log("selectedBus:", selectedBus);

  React.useEffect(() => {
    if (allBuses && agencyId && vehicleId && allRoutesTableFromRedux) {
      const initialAction = () => {
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
          currentRoute: currentRoute,
        };
        setSelectedBus(busInfoObject);
      };
      initialAction();
    }
  }, [agencyId, allBuses, allRoutesTableFromRedux, vehicleId]);

  const onLineClick = async (lineNumber: string) => {
    await dispatch(dispatchModalInfoBottomIsOpen(true));
    // await console.info({ lineNumber });
    await navigate(`/app/route/${lineNumber}`);
  };

  const BusInfoHeader = (): JSX.Element => {
    const busInfo = selectedBus?.currentRoute![0];
    return (
      <Table borderless={true} size="sm" style={{ marginBottom: 0 }}>
        <thead>
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
              {busInfo?.shortName || publishedLineName || cutAgencyName(selectedBus?.LineRef!, agencyId)}
            </th>
            <th style={{ textAlign: "center" }} className="th_small_padding">
              {busInfo?.longName}
            </th>
          </tr>
          <tr>
            <th className="th_small_padding span_bold d-flex justify-content-center" style={{ verticalAlign: "middle" }}>
              <img
                src={selectedBus?.Monitored ? busBlue : !selectedBus?.Monitored ? busGray : busGray}
                alt="Bus Icon"
                width="25"
                height="25"
              />
            </th>
            <th style={{ textAlign: "center", verticalAlign: "middle" }} className="th_small_padding">
              {cutAgencyName(selectedBus?.VehicleRef!, agencyId)}
            </th>
          </tr>
        </thead>
      </Table>
    );
  };

  return (
    <React.Fragment>
      <VehicleInfoContainer>
        {selectedBus && Object.keys(selectedBus).length > 0 ? (
          BusInfoHeader()
        ) : (
          <React.Fragment>
            <Spinner animation="border" variant="primary" />
          </React.Fragment>
        )}
      </VehicleInfoContainer>
    </React.Fragment>
  );
};

export default BusInfoComponent;
