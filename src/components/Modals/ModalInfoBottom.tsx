import React from "react";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../redux/hooks";
import { dispatchModalInfoBottomIsOpen, selectRoute, selectStop } from "../../redux/actions";
import BottomBarComponent from "../ModalBottom/BottomBarComponent";
import { store } from "../../redux/store";
import { DISPATCH_ZOOM, FETCH_DIRECTIONS, GET_ACTIVE_BUSES, GET_POLYLINES_STOPS } from "../../redux/actionTypes";

const ModalInfoBottom = ({ showModalInfoBottom }: { showModalInfoBottom: boolean }): JSX.Element => {
  const dispatch: Dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location?.pathname;
  // console.info({ pathName });

  const [modalHeader, setModalHeader] = React.useState<string>("");
  // console.info({ modalHeader });

  //* New Site - location
  React.useEffect(() => {
    if (pathName.endsWith("/app")) {
      setModalHeader("Available_Routes");
    } else if (pathName.includes("stop")) {
      setModalHeader("Timetable");
    } else if (pathName.includes("route")) {
      setModalHeader("Directions_Stops");
    } else if (pathName.includes("vehicle")) {
      setModalHeader("Next_Stops");
    } else {
      setModalHeader("");
    }
  }, [pathName]);

  //* Close this modal
  const closeModalInfoBottom = () => {
    dispatch(dispatchModalInfoBottomIsOpen(false));
  };

  const goToRoutesView = () => {
    navigate("/app");
    dispatch(selectRoute(""));
    dispatch(selectStop({} as StopInfo, false));
    store.dispatch({ type: DISPATCH_ZOOM, payload: {} });
    store.dispatch({ type: GET_POLYLINES_STOPS, payload: {} });
    store.dispatch({
      type: FETCH_DIRECTIONS,
      payload: {
        directionsArray: [],
        directionsNumber: null,
        stopsWithInfo: [],
      },
    });
    store.dispatch({ type: GET_ACTIVE_BUSES, payload: { buses: [] } });
  };

  return (
    <React.Fragment>
      <Modal
        show={showModalInfoBottom}
        fullscreen={true}
        onHide={closeModalInfoBottom}
        dialogClassName="custom-modal-bottom"
        contentClassName=""
        centered={false}
        backdrop={false}
        keyboard={true}
        scrollable={true}
        id="customModal"
      >
        <Modal.Header closeButton={true} closeLabel={`${t("Close")}`}>
          <Modal.Title style={{ color: "inherit" }}>{modalHeader ? t(modalHeader) : "Info"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <BottomBarComponent />
        </Modal.Body>

        <Modal.Footer>
          <ButtonGroup>
            <Button
              disabled={pathName === "/app" ? true : false}
              variant="secondary"
              onClick={goToRoutesView}
              className={"btn-secondary"}
              style={{ minWidth: "4.5rem" }}
            >
              {t("Routes")}
            </Button>
            <Button
              disabled={false}
              variant="primary"
              onClick={closeModalInfoBottom}
              className={"btn-primary"}
              style={{ minWidth: "4.5rem" }}
            >
              {t("Ok")}
            </Button>
            {/* //* Proposal only! */}
            {/* <button onClick={() => navigate(-1)}>Go back</button>
            <button onClick={() => navigate(1)}>Go forward</button> */}
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ModalInfoBottom;
