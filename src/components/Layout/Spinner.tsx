import React from "react";
import { Spinner as ReactBootstrapSpinner } from "react-bootstrap";
import styled from "styled-components";

const Div = styled.div<{ $backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: ${(props) => (props?.$backgroundColor ? props?.$backgroundColor : "inherit")};
`;

const Spinner = ({ backgroundColor = "inherit", variant }: { backgroundColor?: string; variant: string }): JSX.Element => {
  return (
    <React.Fragment>
      <Div $backgroundColor={backgroundColor}>
        <ReactBootstrapSpinner animation="border" variant={variant || "primary"} />
      </Div>
    </React.Fragment>
  );
};

export default Spinner;
