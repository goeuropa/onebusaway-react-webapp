import React from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";

import Footer from "./Footer";
import Header from "./Header";

const ButtonDiv = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-items: center;
  align-content: center;
`;

const BodyContainer = styled.div`
  background-color: whitesmoke;
  color: black;
  width: 100%;
  height: calc(100% - var(--constantFooterHeight) - var(--constantHeaderHeight));
`;

const FooterContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
`;

const NotFound = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Header />

      <BodyContainer>
        <h1 style={{ textAlign: "center", paddingTop: "6rem" }}>{t("404, Page Not Found")}</h1>
        <ButtonDiv>
          <Button variant="light">
            <Link to="/app">{t("Go to the main page")}</Link>
          </Button>
        </ButtonDiv>
      </BodyContainer>

      <FooterContainer>
        <Footer />
      </FooterContainer>
    </React.Fragment>
  );
};

export default NotFound;
