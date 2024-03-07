import React from "react";
import { ListGroup, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { dispatchModalInfoBottomIsOpen, getDirections, selectRoute, selectStop } from "../../redux/actions";
import { capitalizeFirstLetter, cutAgencyName, truncateStringWithoutPopover } from "../../utils/helpers";
import { routeListButtonWidth } from "../../config";

const DirectionsStopsWrapper = styled.div`
  width: 100%;
  padding-bottom: 10px;
`;

const H3 = styled.h3<{}>`
  text-align: left;
  color: darkblue;
  margin: 10px auto 8px 0;
`;

const DirectionsWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const DirectionsStops = (): JSX.Element => {
  const { t } = useTranslation();
  const { lineNumber } = useParams();
  const navigate = useNavigate();
  // console.log({ lineNumber });

  const dispatch: Dispatch = useAppDispatch();

  const [directions, stopsWithInfo, agencyId, routeNumber, list, allRoutesTableFromRedux]: [
    Direction[],
    StopInfo[],
    string,
    number,
    { list: number[] },
    RouteInfo[]
  ] = useAppSelector(
    (state: RootState) => [
      state?.directions?.directionsArray,
      state?.directions?.stopsWithInfo,
      state?.agency?.agencyId,
      state?.agency?.routeNumber,
      state?.list,
      state?.allData?.allRoutesTableReduced,
    ],
    shallowEqual
  );
  // console.log("list:", list);

  const activeStopId = localStorage.getItem("activeStopId");

  const [directionId, setDirectionId] = React.useState<number | null>(null);
  const [listOfStops, setListOfStops] = React.useState<StopInfo[]>([]);
  const [active, setActive] = React.useState<string>(activeStopId ? activeStopId : "");
  const [selectedRoute, setSelectedRoute] = React.useState<RouteInfo[] | null>(null);
  // console.log("selectedRoute:", selectedRoute);

  React.useEffect(() => {
    if (lineNumber && agencyId && list && list?.list) {
      // console.log({ lineNumber });
      const routeList = list?.list.map((route) => String(route));
      const initialAction = async () => {
        await dispatch(dispatchModalInfoBottomIsOpen(true));
        await dispatch(selectRoute(lineNumber));
        await dispatch(getDirections(agencyId, lineNumber));
        await dispatch(selectStop({} as StopInfo, false));
      };
      routeList.includes(lineNumber) ? initialAction() : navigate("/not_found");
    }
  }, [agencyId, dispatch, lineNumber, list, navigate]);

  React.useEffect(() => {
    if (!directions && agencyId && routeNumber) {
      setTimeout(() => {
        dispatch(getDirections(agencyId, routeNumber));
      }, 500);
    }
  });

  React.useEffect(() => {
    if (directions && directions.length === 1) {
      const selectedDirectionId = directions[0].id;
      // console.log({ selectedDirectionId });
      setDirectionId(selectedDirectionId);
    }
  }, [directions]);

  const onListClick = async (stop: StopInfo) => {
    // console.log("stop:", stop);
    //* -> await dispatch(dispatchModalInfoBottomIsOpen(true)) in initialAction() !!
    await navigate(`/app/stop/${stop.id}`);
  };

  React.useEffect(() => {
    const stopsList = () => {
      if (directionId === 0 || directionId === 1) {
        // console.log({ directionId });
        let stopList = directions[directionId]?.stops;
        if (stopList === undefined) {
          stopList = directions[directionId - 1]?.stops;
        }
        // console.log({ stopList });
        let detailedStops = stopsWithInfo.filter((stopWithInfo: StopInfo) => stopList.includes(stopWithInfo.id));
        // console.log("detailedStops:", detailedStops);
        for (let i = 0; i < detailedStops.length; i++) {
          for (let j = 0; j < stopList.length; j++) {
            if (detailedStops[i].id === stopList[j]) {
              detailedStops[i].order = stopList.indexOf(stopList[j]);
            }
          }
        }
        detailedStops = detailedStops.sort((stop1: StopInfo, stop2: StopInfo) => stop1.order - stop2.order);
        // console.log("detailedStops:", detailedStops);
        setListOfStops(detailedStops);
      }
    };
    stopsList();
  }, [directionId, directions, stopsWithInfo]);

  React.useEffect(() => {
    if (allRoutesTableFromRedux && lineNumber) {
      const selectedRoute = allRoutesTableFromRedux.filter((route) => cutAgencyName(route.id, agencyId) === lineNumber);
      // console.log("selectedRoute:", selectedRoute);
      setSelectedRoute(selectedRoute);
    }
  }, [agencyId, allRoutesTableFromRedux, lineNumber]);

  const DirectionList = (): JSX.Element => {
    return (
      <ListGroup>
        {directions &&
          directions.map((direction: Direction) => (
            <ListGroup.Item
              key={direction.id}
              onClick={() => {
                setDirectionId(direction.id);
                // setActive("");
              }}
              className={"direction_row "}
              as="li"
              active={direction.id === directionId ? true : false}
            >
              {truncateStringWithoutPopover(direction.name)}
            </ListGroup.Item>
          ))}
      </ListGroup>
    );
  };

  const RenderedStopsList = (): JSX.Element => {
    return (
      <Table hover={true} striped={true} bordered={false} size="sm" style={{ margin: "0.5rem 0" }}>
        <tbody>
          {listOfStops &&
            listOfStops.length >= 1 &&
            listOfStops.map((stop: StopInfo) => {
              return (
                <tr
                  key={stop.id}
                  onClick={() => {
                    onListClick(stop);
                    setActive(stop.id);
                  }}
                  style={{ cursor: "pointer", background: stop.id === active ? "lightgray" : "" }}
                  className={"detailed_list"}
                >
                  <td className="th_small_padding">
                    {capitalizeFirstLetter(stop.name)}
                    <br />
                    <small style={{ color: "dimgray" }}>{cutAgencyName(stop.id, agencyId)}</small>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    );
  };

  const RouteInfo = (): JSX.Element => {
    return (
      <Table borderless={true} size="sm" style={{ margin: "0.5rem 0" }}>
        {selectedRoute && (
          <thead>
            <tr>
              <td
                style={{
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                className="th_small_padding"
              >
                {t("SelectedRoute")}
              </td>
              <th
                style={{
                  color: `#${selectedRoute[0]?.textColor}`,
                  backgroundColor: `#${selectedRoute[0]?.color}`,
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: routeListButtonWidth,
                }}
                className="th_small_padding span_bold"
              >
                {selectedRoute[0]?.shortName || cutAgencyName(selectedRoute[0]?.id!, agencyId)}
              </th>
              <th style={{ textAlign: "center" }} className="th_small_padding">
                {selectedRoute[0]?.longName}
              </th>
            </tr>
          </thead>
        )}
      </Table>
    );
  };

  return (
    <React.Fragment>
      <DirectionsStopsWrapper>
        {selectedRoute && selectedRoute.length >= 1 && RouteInfo()}

        <H3>{t("Directions")}</H3>
        <DirectionsWrapper>
          <DirectionList />
        </DirectionsWrapper>
        <H3>{t("Stops")}</H3>
        {RenderedStopsList()}
      </DirectionsStopsWrapper>
    </React.Fragment>
  );
};

export default DirectionsStops;
