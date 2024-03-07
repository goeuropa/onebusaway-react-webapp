import React from "react";
import styled from "styled-components";

const FooterContainer = styled.div`
  width: 100%;
  height: var(--constantFooterHeight);
`;

export const FooterContent = (): JSX.Element => (
  <div>
    &copy; {new Date().getFullYear()} Copyright:{" "}
    <a className={"text-dark"} href="https://goeuropa.eu" target="_blank" rel="noreferrer">
      <span className="span_bold">goEuropa</span>
    </a>
  </div>
);

const Footer = (): JSX.Element => {
  return (
    <React.Fragment>
      <FooterContainer>
        <footer className={"d-flex flex-wrap justify-content-center border-bottom text-white py-3 bg-secondary"}>
          <FooterContent />
        </footer>
      </FooterContainer>
    </React.Fragment>
  );
};

export default Footer;
