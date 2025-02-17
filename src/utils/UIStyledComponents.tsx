import React from "react";
import styled from "styled-components";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/types";
import { OverlayTriggerType } from "react-bootstrap/esm/OverlayTrigger";

import { dynamicTexColor } from "./helpers";
import { routeListButtonWidth } from "../config";
import variableColors from "../_App.module.scss";

const { darkColor, colorLightgrey } = variableColors;

const TimeTableHeaderDiv = styled.div<{ $routeColor: string }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  font-size: calc(100% + 2px);
  text-align: center;
  gap: 1rem;
  background-color: ${colorLightgrey};
  div.routeId-div {
    background-color: ${(props) => `#${props?.$routeColor}`};
    color: ${(props) => `#${dynamicTexColor(props?.$routeColor)}`};
    font-weight: bolder;
    padding: 2px 0.5rem;
    flex: 0 1 auto;
    min-width: ${`calc(${routeListButtonWidth} * 1.6)`};
  }
  div.routeName-div {
    flex: 1;
    color: ${darkColor};
  }
`;

const TabsTitleHeader = styled.div<{ $routeColor: string }>`
  min-width: ${routeListButtonWidth};
  width: 100%;
  text-align: center;
  background-color: ${(props) => `#${props?.$routeColor}`};
  color: ${(props) => `#${dynamicTexColor(props?.$routeColor)}`};
  font-weight: bold;
  padding: 2px auto;
`;

export const TimeTableHeader = ({ routeDeparturesData }: { routeDeparturesData: RouteDeparturesData }): JSX.Element => {
  const { routeId, color: routeColor, longNameAdded, shortNameAdded } = routeDeparturesData || {};

  return (
    <React.Fragment>
      <TimeTableHeaderDiv $routeColor={routeColor}>
        <div className="routeId-div">
          <big>{shortNameAdded || routeId}</big>
        </div>
        <div className="routeName-div">{longNameAdded}</div>
      </TimeTableHeaderDiv>
    </React.Fragment>
  );
};

export const TabsTitle = ({ routeDeparturesData }: { routeDeparturesData: RouteDeparturesData }): JSX.Element => {
  const { routeId, color: routeColor, shortNameAdded } = routeDeparturesData || {};

  return (
    <React.Fragment>
      <TabsTitleHeader $routeColor={routeColor}>
        {/* // Todo: Is this className necessary? */}
        <div className="routeId-div">
          <big>{shortNameAdded || routeId}</big>
        </div>
      </TabsTitleHeader>
    </React.Fragment>
  );
};

//* Reusable Tooltip
export const ReusableTooltip = ({
  id,
  children,
  title,
  text,
  placement = "right",
  trigger = ["hover", "focus"],
}: {
  id: string;
  children: JSX.Element;
  title?: string | null;
  text: string | JSX.Element;
  placement?: Placement;
  trigger?: OverlayTriggerType[];
}) => {
  return (
    <React.Fragment>
      <OverlayTrigger
        trigger={trigger}
        placement={placement}
        overlay={
          <Tooltip id={id}>
            {title ? <h6>{title}</h6> : null}
            {text}
          </Tooltip>
        }
      >
        {children}
      </OverlayTrigger>
    </React.Fragment>
  );
};
