import React from "react";
import { Spinner as ReactBootstrapSpinner } from "react-bootstrap";
import styled from "styled-components";

const Div = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;

const Spinner = (): JSX.Element => {
  return (
    <React.Fragment>
      <Div>
        <ReactBootstrapSpinner animation="border" variant="primary" />
      </Div>
    </React.Fragment>
  );
};

export default Spinner;
