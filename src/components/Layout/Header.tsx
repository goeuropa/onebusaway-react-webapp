import React from "react";
import { Dropdown, DropdownButton, Nav, Navbar, OverlayTrigger, Tooltip, Image, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

import LogoContainer from "./LogoContainer";
import {
  dispatchModalInfoBottomIsOpen,
  dispatchModalSettingsIsOpen,
  getLocale,
  selectRoute,
  selectStop,
  setLoadingAction,
} from "../../redux/actions";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { appName, devices, showChangeLanguage } from "../../config";
import { DISPATCH_ZOOM, FETCH_DIRECTIONS, GET_ACTIVE_BUSES, GET_POLYLINES_STOPS } from "../../redux/actionTypes";
import { store } from "../../redux/store";
import polishFlag from "../../assets/flags/polishFlag.svg";
import ukFlag from "../../assets/flags/ukFlag.svg";
import useNetworkStatus from "../Services/useNetworkStatus";
import routesIcon from "../../assets/menuIcons/routesIcon.svg";
import settingsIcon from "../../assets/menuIcons/settingsIcon.svg";

const LanguageContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  gap: 0.5rem;
`;

const H1 = styled.h1`
  color: #ffffff;
  font-size: 100%;
  margin-bottom: 0;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0.5rem;
  @media only screen and ${devices.sm} {
    font-size: calc(1.375rem + 1.5vw);
  }
  @media only screen and ${devices.md} {
    font-size: 2.5rem;
  }
`;

const Header = (): JSX.Element => {
  const { i18n, t } = useTranslation();
  const dispatch: Dispatch = useAppDispatch();
  const { isMobile } = useNetworkStatus();
  // console.log({ isMobile });

  const [isModalInfoBottomOpen]: [boolean] = useAppSelector((state: RootState) => [
    state?.appSettings?.isModalInfoBottomOpen,
  ]);
  // console.info("isModalInfoBottomOpen:", isModalInfoBottomOpen);

  const [activeLanguage, setActiveLanguage] = React.useState<string>(localStorage.getItem("i18nextLng" as string) || "en");
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const toggleExpanded = () => setExpanded(!expanded);
  const hideMenu = () => setExpanded(false);

  // Dispatch selectedLanguage to Redux on StartUp
  React.useEffect(() => {
    let selectedLanguage = localStorage.getItem("i18nextLng");
    if (selectedLanguage === "en") {
      selectedLanguage = "en-gb";
    }
    // console.log({ selectedLanguage });
    dispatch(getLocale(selectedLanguage as string));
  }, [dispatch]);

  // Dispatch selectedLanguage to Redux on Change
  React.useEffect(() => {
    let selectedLanguage = activeLanguage;
    if (selectedLanguage === "en") {
      selectedLanguage = "en-gb";
    }
    // console.log({ selectedLanguage });
    dispatch(getLocale(selectedLanguage as string));
  }, [activeLanguage, dispatch]);

  // Reset language
  React.useEffect(() => {
    if (localStorage.getItem("i18nextLng")?.length! > 2) {
      i18next.changeLanguage("en");
    }
  }, []);

  // Change language
  const handleLanguageChange = (event: string | null): void => {
    i18n.changeLanguage(event as string);
    setActiveLanguage(event as string);
    hideMenu();
  };

  const goHome = () => {
    hideMenu();
    localStorage.removeItem("activeStopId");
    localStorage.removeItem("line");
    dispatch(setLoadingAction(true));
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
    dispatch(dispatchModalInfoBottomIsOpen(false));
  };

  const DropdownLanguage = (): JSX.Element => {
    return (
      <React.Fragment>
        {activeLanguage === "en" ? (
          <LanguageContainer>
            <Image src={ukFlag} roundedCircle={true} alt="UK Flag" height="22" width="22" /> EN
          </LanguageContainer>
        ) : (
          <LanguageContainer>
            <Image src={polishFlag} roundedCircle={true} alt="Polish Flag" height="22" width="22" /> PL
          </LanguageContainer>
        )}
      </React.Fragment>
    );
  };

  const SelectLanguage: React.FC = () => {
    return (
      <DropdownButton
        title={DropdownLanguage()}
        onSelect={handleLanguageChange}
        variant={"secondary"}
        menuVariant="dark"
        align="end"
      >
        <Dropdown.Item eventKey="pl" active={activeLanguage === "pl" ? true : false}>
          <LanguageContainer>
            <Image src={polishFlag} roundedCircle={true} alt="Polish Flag" height="22" />
            Polski
          </LanguageContainer>
        </Dropdown.Item>
        <Dropdown.Item eventKey="en" active={activeLanguage === "en" || activeLanguage === "en-GB" ? true : false}>
          <LanguageContainer>
            <Image src={ukFlag} roundedCircle={true} alt="UK Flag" height="22" width="22" />
            English
          </LanguageContainer>
        </Dropdown.Item>
      </DropdownButton>
    );
  };

  return (
    <React.Fragment>
      <Navbar
        bg={"secondary"}
        variant="dark"
        style={{ padding: 0 }}
        expand="lg"
        expanded={expanded}
        onToggle={toggleExpanded}
      >
        <Navbar.Brand to="/app" style={{ padding: 0 }} as={NavLink} onClick={goHome}>
          <OverlayTrigger
            placement={"bottom"}
            overlay={
              <Tooltip id={"go_to_the-home_page"}>
                <span>{t("Go to the main page")}</span>
              </Tooltip>
            }
          >
            <span>
              <LogoContainer />
            </span>
          </OverlayTrigger>
        </Navbar.Brand>

        {/* //* Moved Header */}
        <H1>
          <Nav.Link onClick={goHome} to="/app" as={NavLink}>
            {appName}
          </Nav.Link>
        </H1>

        <Navbar.Toggle aria-controls="navbar-menu" />

        <Navbar.Collapse id="navbar-menu">
          <Nav className={"ms-auto"}>
            <Button
              className={
                isMobile === false && isModalInfoBottomOpen === true
                  ? "routes-button_clicked"
                  : isMobile === false
                  ? "routes-button"
                  : ""
              }
              variant={isMobile ? "secondary" : "primary"}
              onClick={() => {
                hideMenu();
                dispatch(dispatchModalInfoBottomIsOpen(!isModalInfoBottomOpen));
              }}
            >
              <img src={routesIcon} alt="Routes icon" className="menu-icon" />
              {isModalInfoBottomOpen ? t("Map") : t("Routes")}
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => {
                hideMenu();
                dispatch(dispatchModalSettingsIsOpen(true));
              }}
            >
              <img src={settingsIcon} alt="Settings icon" className="menu-icon" />
              {t("Settings")}
            </Button>
            {showChangeLanguage && <SelectLanguage />}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </React.Fragment>
  );
};

export default Header;
