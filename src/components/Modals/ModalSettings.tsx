import React from "react";
import { Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import preval from "preval.macro";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  dispatchModalSettingsIsOpen,
  dispatchShowAllRoutesStops,
  dispatchShowLiveBuses,
  dispatchShowScheduledBuses,
  setGrayscaleMap,
  setLoadingAction,
  dispatchOccupancyStatus,
} from "../../redux/actions";
import { ModalContainer } from "../ModalBottom/BottomBarComponent";
import { zoomEnableSwitch, fetchInterval, urlGTFS_RT_OccupancyData } from "../../config";
import { FooterContent } from "../Layout/Footer";
import useNetworkStatus from "../Services/useNetworkStatus";
import infoIcon from "../../assets/Icons/infoIcon.svg";

const P = styled.p`
  margin-bottom: 0.4rem;
`;

const ModalSettingsContainer = styled(ModalContainer)`
  background-color: inherit;
  position: relative;

  p.text-muted {
    font-size: 80%;
    position: absolute;
    bottom: 0;
    margin-bottom: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
    gap: 0.25rem;
    flex-wrap: wrap;
    a {
      text-decoration: none;
      opacity: 0.85;
      padding: 0;
      font-size: inherit;
    }
  }
`;

const ModalSettings = ({
  showModalSettings,
  showStopsNames,
  showTooltips,
}: {
  showModalSettings: boolean;
  showStopsNames: () => void;
  showTooltips: boolean;
}): JSX.Element => {
  const { isMobile } = useNetworkStatus();
  const dispatch: Dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [zoom, showLiveBuses, showScheduledBuses, grayscaleMap, setAllRoutesStops, occupancyStatus]: [
    number,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
  ] = useAppSelector((state: RootState) => [
    state?.zoom?.zoom,
    state?.appSettings?.showLiveBuses,
    state?.appSettings?.showScheduledBuses,
    state?.appSettings?.grayscaleMap,
    state?.appSettings?.setAllRoutesStops,
    state?.appSettings?.occupancyStatus,
  ]);
  // console.log("setAllRoutesStops:", setAllRoutesStops);

  //* Close this modal
  const closeSettingsModal = (): void => {
    dispatch(dispatchModalSettingsIsOpen(false));
  };

  return (
    <React.Fragment>
      <Modal
        show={showModalSettings}
        fullscreen={"lg-down"}
        onHide={closeSettingsModal}
        centered={true}
        backdrop={false}
        keyboard={true}
      >
        <Modal.Header
          closeButton={true}
          closeLabel={`${t("Close")}`}
          className={"settings-modal-class"}
          closeVariant="white"
        >
          <Modal.Title>{t("Settings")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ModalSettingsContainer>
            <Form>
              <OverlayTrigger
                placement="auto"
                overlay={<Tooltip id="real-time-vehicles-tooltip">{t("Show_Real-time_Vehicles")}</Tooltip>}
              >
                <Form.Check
                  className={""}
                  type="switch"
                  id="real-time-vehicles-switch"
                  label={t("Show_Real-time_Vehicles")}
                  checked={showLiveBuses}
                  onChange={() => dispatch(dispatchShowLiveBuses(!showLiveBuses))}
                />
              </OverlayTrigger>

              <OverlayTrigger
                placement="auto"
                overlay={<Tooltip id="scheduled-vehicles-tooltip">{t("Show_Scheduled_Vehicles")}</Tooltip>}
              >
                <Form.Check
                  className={""}
                  type="switch"
                  id="scheduled-vehicles-switch"
                  label={t("Show_Scheduled_Vehicles")}
                  checked={showScheduledBuses}
                  onChange={() => dispatch(dispatchShowScheduledBuses(!showScheduledBuses))}
                />
              </OverlayTrigger>

              <br />

              <OverlayTrigger
                placement="auto"
                overlay={<Tooltip id="show-all-routes-stops-tooltip">{t("Show_all_routes_stops")}</Tooltip>}
              >
                <Form.Check
                  className={""}
                  type="switch"
                  id="show-all-routes-stops-switch"
                  label={t("Show_all_routes_stops")}
                  checked={setAllRoutesStops}
                  onChange={() => dispatch(dispatchShowAllRoutesStops(!setAllRoutesStops))}
                />
              </OverlayTrigger>

              <OverlayTrigger placement="auto" overlay={<Tooltip id="grayscale-map-tooltip">{t("Grayscale_Map")}</Tooltip>}>
                <Form.Check
                  className={""}
                  type="switch"
                  id="grayscale-map-switch"
                  label={t("Grayscale_Map")}
                  checked={grayscaleMap}
                  onChange={async () => {
                    await dispatch(setLoadingAction(true));
                    await dispatch(setGrayscaleMap(!grayscaleMap));
                  }}
                />
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="occupancy_status-tooltip">{t("Occupancy Status")}</Tooltip>}
              >
                <span>
                  <Form.Check
                    className={""}
                    type="switch"
                    id="occupancy_status_switch"
                    label={t("Occupancy Status")}
                    checked={occupancyStatus}
                    onChange={(): void => dispatch(dispatchOccupancyStatus(!occupancyStatus))}
                    disabled={urlGTFS_RT_OccupancyData ? false : true}
                  />
                </span>
              </OverlayTrigger>

              {!isMobile ? (
                <React.Fragment>
                  <br />
                  <P>{t("Change_zoom")}</P>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="show-stops-names-switch">{t("Show_Names_of_Stops")}</Tooltip>}
                  >
                    <span>
                      <Form.Check
                        className={""}
                        type="switch"
                        id="show-stops-names-switch"
                        label={t("Show_Names_of_Stops")}
                        onChange={showStopsNames}
                        checked={showTooltips}
                        disabled={zoom && zoom >= zoomEnableSwitch ? false : true}
                      />
                    </span>
                  </OverlayTrigger>
                </React.Fragment>
              ) : null}
            </Form>
            <br />
            <br />

            {/* //* Attribution info */}
            <p className="text-muted">
              <img src={infoIcon} alt="Info Icon" height={16} width={"auto"} />
              {t("Icons were taken from")}
              <Button variant="link" href="https://www.iconfinder.com" target="_blank" size="sm">
                https://www.iconfinder.com
              </Button>
            </p>
          </ModalSettingsContainer>
        </Modal.Body>

        <Modal.Footer className={"settings-modal-class"}>
          <div className="mx-auto" style={{ transform: "translateX(25px)" }}>
            <FooterContent />
            <p className={"small mb-0"} style={{ color: "inherit" }}>
              <small>
                Build Date: <span className="span_bold">{preval`module.exports = new Date().toLocaleString("pl-PL")`}</span>
              </small>
            </p>
            <p className={"small mb-0 "} style={{ color: "inherit" }}>
              <small>
                {t("Interval")}: <span className="span_bold">{`${fetchInterval / 1000} s`}</span>
              </small>
            </p>
          </div>
          <Button disabled={false} variant={"primary"} onClick={closeSettingsModal} style={{ width: "50px" }}>
            {t("Ok")}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ModalSettings;
