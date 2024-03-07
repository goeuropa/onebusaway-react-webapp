import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

import Header from "./Header";
import Footer from "./Footer";

const AppContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "grid-header"
    "grid-map"
    "grid-footer";
  & > .grid-header {
    grid-area: grid-header;
  }
  & > .grid-map {
    grid-area: grid-map;
  }
  & > .grid-footer {
    grid-area: grid-footer;
  }
`;

const Layout = (): JSX.Element => {
  return (
    <React.Fragment>
      <AppContainer>
        <div className="grid-header">
          <Header />
        </div>
        <div className="grid-map">
          <Outlet />
        </div>
        <div className="grid-footer">
          <Footer />
        </div>
      </AppContainer>
    </React.Fragment>
  );
};

export default Layout;
