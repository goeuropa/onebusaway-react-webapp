import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import iconUrlGray from "../assets/Icons/busGray.svg";
import iconUrlBlue from "../assets/Icons/busBlue.svg";

const LegendWrapper = styled.div`
  margin: 1.1rem auto 1.1rem auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  align-content: center;
  gap: 0.6rem;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  gap: 0.5rem;
  p {
    margin-bottom: 0;
    margin-left: 0.8rem;
  }
  img {
    background-color: white;
  }
`;

const VehicleLegend = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <LegendWrapper>
        <ImageWrapper>
          <img src={iconUrlBlue} width="24" height="24" alt="Blue Vehicle Icon" />
          <p
            style={{
              color: "inherit",
            }}
          >
            {t("Real-Time_vehicle")}
          </p>
        </ImageWrapper>
        <ImageWrapper>
          <img src={iconUrlGray} width="24" height="24" alt="Gray Vehicle Icon" />
          <p
            style={{
              color: "inherit",
            }}
          >
            {t("Scheduled_vehicle")}
          </p>
        </ImageWrapper>
      </LegendWrapper>
    </React.Fragment>
  );
};

export default VehicleLegend;
