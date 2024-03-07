import React from "react";
import styled from "styled-components";

import { logo } from "../../config";

const LogoDiv = styled.div`
  margin-right: 10px;
  width: auto;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
`;

const Img = styled.img<{}>`
  background-color: transparent;
  background: rgba(255, 255, 255, 0.4);
  width: auto;
  height: 75px;
`;

const LogoContainer = (): JSX.Element => {
  return (
    <React.Fragment>
      <LogoDiv>
        <Img src={logo} alt="logo" />
        {/* //* Moved to the Header! */}
        {/* <H1>{appName}</H1> */}
      </LogoDiv>
    </React.Fragment>
  );
};

export default LogoContainer;
