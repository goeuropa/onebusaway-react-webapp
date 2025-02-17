import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Placement } from "react-bootstrap/esm/types";

import variableColors from "../_App.module.scss";
import { getIconsNumber } from "./helpers";
import { ReusableTooltip } from "./UIStyledComponents";

const { secondaryColor, darkColor, appBackgroundColor, textColor, dangerColor } = variableColors;

const iconSize: string = "24px";

const OccupancyStatusIconWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  gap: 0.5rem;
  span {
    margin: 0;
    color: inherit;
  }
  div.icons-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    border: none;
    border-radius: 0.5rem;
    background: ${appBackgroundColor};
  }
  svg {
    width: ${iconSize};
    height: ${iconSize};
  }
`;

const OccupancyStatusIcon = ({
  selectedBus,
  showTooltip,
  placement = "right",
}: {
  selectedBus: SelectedBus;
  showTooltip: boolean;
  placement?: string;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {showTooltip ? (
        <ReusableTooltip
          id={`occupancy_status_${selectedBus?.VehicleRef}`}
          title={t("Occupancy Status")}
          text={
            selectedBus?.occupancyStatusData?.occupancyStatus
              ? `${t(selectedBus?.occupancyStatusData?.occupancyStatus)}`
              : `${t("n/a")}`
          }
          placement={placement as Placement}
          children={
            <div>
              <OccupancyStatusComponent selectedBus={selectedBus} />
            </div>
          }
        />
      ) : (
        <OccupancyStatusComponent selectedBus={selectedBus} />
      )}
    </React.Fragment>
  );
};

export default OccupancyStatusIcon;

//* Component inside Tooltip
const OccupancyStatusComponent = ({ selectedBus }: { selectedBus: SelectedBus }): JSX.Element => {
  const occupancyStatus = selectedBus?.occupancyStatusData?.occupancyStatus as string;
  // console.log("occupancyStatus:", occupancyStatus);
  const iconsNumber: number = getIconsNumber(occupancyStatus);
  // console.log({ iconsNumber });

  const occupancyStatusBaseSVGArray: string[] = [
    "EMPTY",
    "MANY_SEATS_AVAILABLE",
    "FEW_SEATS_AVAILABLE",
    "STANDING_ROOM_ONLY",
    "CRUSHED_STANDING_ROOM_ONLY",
    "FULL",
  ];

  return (
    <OccupancyStatusIconWrapper>
      {occupancyStatusBaseSVGArray?.includes(occupancyStatus) && iconsNumber > 0 ? (
        <div className="icons-row">
          {(Array.from({ length: iconsNumber })?.fill(iconsNumber) as number[])?.map(
            (_: number, index: number): JSX.Element => (
              <OccupancyStatusBaseSVG fillColor={darkColor} key={index} />
            )
          )}
        </div>
      ) : occupancyStatus === "NOT_ACCEPTING_PASSENGERS" || occupancyStatus === "NOT_BOARDABLE" ? (
        <OccupancyStatusNoBoardingSVG fillColor={dangerColor} />
      ) : occupancyStatus === "NO_DATA_AVAILABLE" ? (
        <OccupancyStatusNoDataSVG fillColor={textColor} />
      ) : (
        <OccupancyStatusNoDataSVG fillColor={secondaryColor} />
      )}
    </OccupancyStatusIconWrapper>
  );
};

//* SVG Icons
const OccupancyStatusBaseSVG = ({ fillColor }: { fillColor: string }): JSX.Element => {
  return (
    <React.Fragment>
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <path
          d="M17.7543 13.9997C18.9963 13.9997 20.0032 15.0065 20.0032 16.2486V17.167C20.0032 17.7404 19.8239 18.2994 19.4906 18.7659C17.9447 20.9292 15.4204 22.0008 12.0001 22.0008C8.57915 22.0008 6.05619 20.9287 4.51403 18.7643C4.18207 18.2984 4.00366 17.7406 4.00366 17.1685V16.2486C4.00366 15.0065 5.01052 13.9997 6.25254 13.9997H17.7543ZM12.0001 2.00439C14.7615 2.00439 17.0001 4.24297 17.0001 7.00439C17.0001 9.76582 14.7615 12.0044 12.0001 12.0044C9.2387 12.0044 7.00012 9.76582 7.00012 7.00439C7.00012 4.24297 9.2387 2.00439 12.0001 2.00439Z"
          fill={fillColor}
        />
      </svg>
    </React.Fragment>
  );
};

const OccupancyStatusNoDataSVG = ({ fillColor }: { fillColor: string }): JSX.Element => {
  return (
    <React.Fragment>
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <path
          d="M12.0224 13.9991C11.3753 15.0095 11.0001 16.2108 11.0001 17.4998C11.0001 19.1301 11.6003 20.6202 12.5919 21.7613C11.7963 21.9214 10.9314 22.0008 10.0001 22.0008C6.57915 22.0008 4.05619 20.9287 2.51403 18.7643C2.18207 18.2984 2.00366 17.7406 2.00366 17.1685V16.2486C2.00366 15.0065 3.01052 13.9997 4.25254 13.9997L12.0224 13.9991ZM17.5001 11.9998C20.5377 11.9998 23.0001 14.4622 23.0001 17.4998C23.0001 20.5373 20.5377 22.9998 17.5001 22.9998C14.4626 22.9998 12.0001 20.5373 12.0001 17.4998C12.0001 14.4622 14.4626 11.9998 17.5001 11.9998ZM17.5001 19.7507C17.1552 19.7507 16.8756 20.0303 16.8756 20.3753C16.8756 20.7202 17.1552 20.9998 17.5001 20.9998C17.845 20.9998 18.1246 20.7202 18.1246 20.3753C18.1246 20.0303 17.845 19.7507 17.5001 19.7507ZM17.5002 13.8738C16.4522 13.8738 15.6359 14.6912 15.6468 15.8281C15.6494 16.1043 15.8754 16.326 16.1516 16.3233C16.4277 16.3207 16.6494 16.0947 16.6467 15.8185C16.6412 15.2395 17.0064 14.8738 17.5002 14.8738C17.9725 14.8738 18.3536 15.2657 18.3536 15.8233C18.3536 16.0156 18.2983 16.1656 18.1296 16.3848L18.0356 16.5007L17.9366 16.614L17.6712 16.9041L17.5348 17.0612C17.1515 17.518 17.0002 17.8537 17.0002 18.3713C17.0002 18.6475 17.224 18.8713 17.5002 18.8713C17.7763 18.8713 18.0002 18.6475 18.0002 18.3713C18.0002 18.1681 18.0587 18.0124 18.239 17.7811L18.3239 17.677L18.4249 17.5615L18.6906 17.271L18.8252 17.116C19.2035 16.6651 19.3536 16.3327 19.3536 15.8233C19.3536 14.7196 18.5312 13.8738 17.5002 13.8738ZM10.0001 2.00439C12.7615 2.00439 15.0001 4.24297 15.0001 7.00439C15.0001 9.76582 12.7615 12.0044 10.0001 12.0044C7.2387 12.0044 5.00012 9.76582 5.00012 7.00439C5.00012 4.24297 7.2387 2.00439 10.0001 2.00439Z"
          fill={fillColor}
        />
      </svg>
    </React.Fragment>
  );
};

const OccupancyStatusNoBoardingSVG = ({ fillColor }: { fillColor: string }): JSX.Element => {
  return (
    <React.Fragment>
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <path
          d="M17.5001 11.9998C20.5377 11.9998 23.0001 14.4622 23.0001 17.4998C23.0001 20.5373 20.5377 22.9998 17.5001 22.9998C14.4626 22.9998 12.0001 20.5373 12.0001 17.4998C12.0001 14.4622 14.4626 11.9998 17.5001 11.9998ZM12.0224 13.9991C11.3753 15.0095 11.0001 16.2108 11.0001 17.4998C11.0001 19.1439 11.6106 20.6455 12.6172 21.7903C11.815 21.9311 10.9421 22.0008 10.0001 22.0008C7.11062 22.0008 4.87181 21.3442 3.30894 20.0006C2.48032 19.2882 2.00366 18.2498 2.00366 17.157V16.2497C2.00366 15.0071 3.01102 13.9997 4.25366 13.9997L12.0224 13.9991ZM15.0932 14.9661L15.0239 15.0239L14.9661 15.0932C14.8479 15.2637 14.8479 15.4913 14.9661 15.6618L15.0239 15.731L16.7935 17.5005L15.0265 19.2673L14.9687 19.3365C14.8505 19.507 14.8505 19.7346 14.9687 19.9051L15.0265 19.9744L15.0958 20.0322C15.2663 20.1503 15.4939 20.1503 15.6644 20.0322L15.7336 19.9744L17.5005 18.2075L19.2695 19.9766L19.3388 20.0345C19.5093 20.1526 19.7369 20.1526 19.9074 20.0345L19.9766 19.9766L20.0345 19.9074C20.1526 19.7369 20.1526 19.5093 20.0345 19.3388L19.9766 19.2695L18.2075 17.5005L19.9794 15.7311L20.0372 15.6618C20.1554 15.4913 20.1554 15.2637 20.0372 15.0932L19.9794 15.024L19.9101 14.9661C19.7396 14.848 19.512 14.848 19.3415 14.9661L19.2723 15.024L17.5005 16.7935L15.731 15.0239L15.6618 14.9661C15.5156 14.8648 15.3275 14.8503 15.1694 14.9227L15.0932 14.9661ZM10.0001 2.00439C12.7615 2.00439 15.0001 4.24297 15.0001 7.00439C15.0001 9.76582 12.7615 12.0044 10.0001 12.0044C7.2387 12.0044 5.00012 9.76582 5.00012 7.00439C5.00012 4.24297 7.2387 2.00439 10.0001 2.00439Z"
          fill={fillColor}
        />
      </svg>
    </React.Fragment>
  );
};
