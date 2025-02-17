import React from "react";
import { Button, Collapse, ButtonGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { dateToString } from "../../utils/helpers";
import AvailableRoutes from "../AvailableRoutes";
import { dispatchModalInfoBottomIsOpen } from "../../redux/actions";
import { useAppDispatch } from "../../redux/hooks";
import variableColors from "../../_App.module.scss";
import useNetworkStatus from "../Services/useNetworkStatus";

const { secondaryColor } = variableColors;

const CollapseContainer = styled.div`
  width: 100%;
  margin-bottom: 0.75rem;
`;

const SelectedStopDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
  justify-content: center;
  margin: 0.5rem 0;
  h4 {
    margin-bottom: 0;
    font-weight: 600;
  }
  p {
    font-size: 0.75rem;
    margin-bottom: 0;
    color: ${secondaryColor};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin: 1rem 0;
  width: 100%;
  button {
    width: auto;
  }
`;

const TimeTablePart = ({
  selectedStop,
  agencyId,
  selectedDate,
}: {
  selectedStop: StopInfo | null;
  agencyId: string;
  selectedDate?: Date;
}): JSX.Element => {
  const { t } = useTranslation();
  const { stop_Id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { isMobile } = useNetworkStatus();

  const [openCollapse, setOpenCollapse] = React.useState<boolean>(false);

  const SelectedStop = (): JSX.Element => {
    return (
      <SelectedStopDiv>
        {selectedStop && Object.keys(selectedStop).length >= 1 && (
          <React.Fragment>
            <h4 style={{ color: "inherit" }}>{selectedStop?.name}</h4>
            {isMobile ? null : <p>{selectedStop?.id}</p>}
          </React.Fragment>
        )}
      </SelectedStopDiv>
    );
  };

  const dateToSend = selectedDate ? dateToString(selectedDate) : dateToString(new Date());

  const ButtonTimeTableGroup = (): JSX.Element => {
    return (
      <ButtonGroup aria-label="Button Group Timetable" style={{ width: "100%" }}>
        <Button
          size="sm"
          disabled={pathname.includes("/app/stop/") ? true : false}
          variant={pathname.includes("/app/stop/") ? "primary" : "outline-primary"}
          className={""}
          onClick={async () => {
            await dispatch(dispatchModalInfoBottomIsOpen(true));
            await navigate(`/app/stop/${stop_Id}`);
          }}
        >
          {t("RightNow")}
        </Button>
        {/* //* Old Timetable */}
        <Button
          size="sm"
          disabled={pathname.includes("date") ? true : false}
          variant={pathname.includes("date") ? "primary" : "outline-primary"}
          className={""}
          onClick={async () => {
            await dispatch(dispatchModalInfoBottomIsOpen(true));
            await navigate(`/app/date/${dateToSend}/stop/${stop_Id}`);
          }}
        >
          {t("Timetable")}
        </Button>
        {/* //* New TimetableBoard */}
        <Button
          size="sm"
          disabled={pathname.includes("boardDate") ? true : false}
          variant={pathname.includes("boardDate") ? "primary" : "outline-primary"}
          className={""}
          onClick={async () => {
            await dispatch(dispatchModalInfoBottomIsOpen(true));
            await navigate(`/app/boardDate/${dateToSend}/stop/${stop_Id}`);
          }}
        >
          {t("TimetableBoard")}
        </Button>
        <Button
          size="sm"
          onClick={(): void => setOpenCollapse(!openCollapse)}
          aria-controls="availableLines _collapse"
          aria-expanded={openCollapse}
          variant={openCollapse ? "dark" : "outline-dark"}
          className={""}
        >
          {t("Routes")}
        </Button>
      </ButtonGroup>
    );
  };

  return (
    <React.Fragment>
      {SelectedStop()}

      <ButtonContainer>{ButtonTimeTableGroup()}</ButtonContainer>

      <CollapseContainer>
        <Collapse in={openCollapse}>
          <div id="availableLines _collapse">
            <AvailableRoutes stop={selectedStop!} agencyId={agencyId} />
          </div>
        </Collapse>
      </CollapseContainer>
    </React.Fragment>
  );
};

export default TimeTablePart;
