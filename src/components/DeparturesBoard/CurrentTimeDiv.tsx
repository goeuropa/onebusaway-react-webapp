import React from "react";

import { useAppSelector } from "../../redux/hooks";
import { currentTime } from "../../utils/helpers";

const CurrentTimeDiv = (): JSX.Element => {
  const selectedLanguage: string = useAppSelector((state: RootState) => state?.agency?.selectedLanguage);

  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <React.Fragment>
      <div style={{ paddingLeft: "5px", paddingRight: "30px" }}>{currentTime(currentDate, selectedLanguage)}</div>
    </React.Fragment>
  );
};

export default CurrentTimeDiv;
