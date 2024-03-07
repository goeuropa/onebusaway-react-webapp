import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { routeListButtonWidth } from "../config";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { cutAgencyName } from "../utils/helpers";
import { dispatchModalInfoBottomIsOpen } from "../redux/actions";

const AvailableRoutesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  gap: 0.25rem;
  margin-top: 0.3rem;
`;

const LineDiv = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const RouteButton = ({ route, agencyId }: { route: RouteInfo; agencyId: string }): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isHover, setIsHover] = React.useState<boolean>(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  return (
    <OverlayTrigger
      key={route.id}
      placement={"bottom"}
      overlay={<Tooltip id={`tooltip-${route.id}`}>{route.longName}</Tooltip>}
    >
      {
        <Button
          disabled={agencyId === route.agencyId ? false : true}
          key={route.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          size="sm"
          style={{
            width: routeListButtonWidth,
            minHeight: "31px",
            borderRadius: "0.2rem",
            textAlign: "center",
            cursor: agencyId === route.agencyId ? "pointer" : "not-allowed",
            color: !isHover ? `#${route.textColor}` : `#${route.color}`,
            backgroundColor: !isHover ? `#${route.color}` : `#${route.textColor}`,
          }}
          onClick={async () => {
            // await console.info({ route });
            await dispatch(dispatchModalInfoBottomIsOpen(true));
            await navigate(`/app/route/${route.id}`);
          }}
          variant={"dark"}
        >
          {route.shortName || route.id}
        </Button>
      }
    </OverlayTrigger>
  );
};

const AvailableRoutes = ({ stop, agencyId }: { stop: StopInfo; agencyId: string }): JSX.Element => {
  const { t } = useTranslation();
  const [allRoutesTableFromRedux]: [RouteInfo[]] = useAppSelector((state: RootState) => [
    state?.allData?.allRoutesTableReduced,
  ]);
  // console.log("allRoutesTableFromRedux:", allRoutesTableFromRedux);

  const [selectedStop, setSelectedStop] = React.useState<RouteInfo[] | null>(null);
  // console.log("selectedStop:", selectedStop);

  React.useEffect(() => {
    if (stop && allRoutesTableFromRedux && agencyId) {
      const stopLines = allRoutesTableFromRedux.filter((item) => stop.routeIds.includes(item.id));
      // console.log("stop.routeIds:", stop.routeIds);
      // console.log("stopLines:", stopLines);

      // * One carrier was filtered - NOT USED!!!
      // stopLines = stopLines.filter((item) => item.agencyId === agencyId);

      const stopLinesShort = stopLines.map((route) => ({
        ...route,
        id: cutAgencyName(route.id, agencyId),
      }));
      // console.log("stopLinesShort:", stopLinesShort);
      setSelectedStop(stopLinesShort);
    }
  }, [agencyId, allRoutesTableFromRedux, stop]);

  const RoutesList = (): JSX.Element => {
    return (
      <React.Fragment>
        {agencyId &&
          selectedStop &&
          selectedStop.map((route: RouteInfo, index: number) => {
            return <RouteButton route={route} key={String(route.id + index)} agencyId={agencyId} />;
          })}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <LineDiv>
        <em>{t("Available_Routes")}</em>
        <AvailableRoutesContainer>{RoutesList()}</AvailableRoutesContainer>
      </LineDiv>
    </React.Fragment>
  );
};

export default AvailableRoutes;
