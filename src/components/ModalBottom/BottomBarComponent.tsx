import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Button, Collapse } from "react-bootstrap";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Switch } from "antd";

import VehicleLegend from "../VehicleLegend";
import { showDepartureBoardLink } from "../../config";
import RoutesList from "./RoutesList";
import DirectionsStops from "./DirectionsStops";
import TimeTableToday from "./TimeTableToday";
import VehicleInfo from "./VehicleInfo";
import TimeTableChangeDate from "./TimeTableChangeDate";
import variableColors from "../../_App.module.scss";

const { primaryColor, secondaryColor } = variableColors;

export const ModalContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: inherit;
  padding: 0 0.5rem;
`;

const InfoContainer = styled.div`
  overflow-y: scroll;
  margin-top: 0.5rem;
`;

const ButtonLinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  margin-bottom: 0.5rem;
`;

const BottomBarComponent = (): JSX.Element => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [openCollapse, setOpenCollapse] = React.useState<boolean>(false);
  const [selectedStopId, setSelectedStopId] = React.useState<string>("");

  React.useEffect(() => {
    if (pathname) {
      if (pathname.includes("stop")) {
        // console.log({ pathname });
        const urlArray = pathname.split("/stop/");
        const stopIdFromURL = urlArray[urlArray.length - 1];
        setSelectedStopId(stopIdFromURL);
      }
    }
  }, [pathname]);

  return (
    <React.Fragment>
      <ModalContainer>
        <ButtonLinkContainer>
          <Switch
            style={{
              backgroundColor: openCollapse ? secondaryColor : !openCollapse ? primaryColor : "",
            }}
            size="default"
            checked={openCollapse}
            onChange={() => {
              setOpenCollapse(!openCollapse);
            }}
            checkedChildren={t("Hide_Legend") as string}
            unCheckedChildren={t("Show_Legend") as string}
            defaultChecked={false}
          />

          {showDepartureBoardLink && pathname && pathname.includes("stop") && (
            <Button variant="light" size="sm" style={{ padding: 0 }}>
              <Link
                to={`/stopIds/${selectedStopId}`}
                rel="noopener noreferrer"
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                {t("Departure_board")}
              </Link>
            </Button>
          )}
        </ButtonLinkContainer>

        <Collapse in={openCollapse}>
          <div id="map_legend_collapse">
            <VehicleLegend />
          </div>
        </Collapse>

        <InfoContainer>
          <Routes>
            <Route path="/" element={<RoutesList />} />
            <Route path="/route/:lineNumber" element={<DirectionsStops />} />
            <Route path="/stop/:stop_Id" element={<TimeTableToday />} />
            <Route path="/vehicle/:vehicleId" element={<VehicleInfo />} />
            <Route path="/date/:timetableDate/stop/:stop_Id" element={<TimeTableChangeDate />} />

            <Route path="*" element={<Navigate to="/not_found" />} />
          </Routes>
        </InfoContainer>
      </ModalContainer>
    </React.Fragment>
  );
};

export default BottomBarComponent;
