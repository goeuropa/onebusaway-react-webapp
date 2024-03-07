import React from "react";

import { fetchInterval } from "../../config";

const useNetworkStatus = (): { isMobile: boolean } => {
  const [isMobile, setIsMobile] = React.useState<boolean>(true);

  React.useEffect(() => {
    const isMobileCheck = (): boolean => {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    };

    const setCheckInterval = () => {
      setIsMobile(isMobileCheck());
    };
    setCheckInterval();
    const checkingInterval = setInterval(setCheckInterval, fetchInterval) as NodeJS.Timer;
    return () => {
      clearInterval(checkingInterval);
    };
  }, []);

  return { isMobile };
};

export default useNetworkStatus;
