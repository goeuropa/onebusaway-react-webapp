import moment from "moment";
import "moment/locale/pl";
import { toast } from "react-toastify";

export const timeConverter = (date: string | number, language: string | undefined) => {
  // console.log({ date });
  const dateFormat = new Date(date);
  // console.log({dateFormat});
  if (language === "en-gb") {
    language = undefined;
  }
  // console.log({ language });
  const dateStringFormate = dateFormat.toLocaleString(language, {
    // year: "numeric",
    // month: "2-digit",
    // day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  // console.log({ dateStringFormate });
  return dateStringFormate;
};

export const currentTime = (date: Date, language: string | undefined) => {
  if (language === "en-gb") {
    language = undefined;
  }
  let now = date.toLocaleString(language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
  });
  now = now.replaceAll(".", "/");
  // console.log({ now, language });
  return now;
};

export const timeConverterFromNow = (date: number | string) => {
  // console.log({ locale });
  const now = new Date();

  const start = moment(now);
  const end = moment(date);
  const timeLength = end.diff(start);

  let minutesLength = moment.duration(timeLength).get("minutes") + "m";
  let hoursLength = moment.duration(timeLength).get("hours") + "h:";
  if (moment.duration(timeLength).get("hours") === 0) {
    hoursLength = "";
    minutesLength = moment.duration(timeLength).get("minutes") + " min";
  }

  const dateToSend = `${hoursLength}${minutesLength}`;
  return dateToSend;
};

export const timeFromNow = (time: string, locale: string) => {
  // console.log({ locale });
  const dateToSend = moment(time).locale(locale).fromNow();
  return dateToSend;
};

export const truncateString = (str: string) => {
  if (str.includes("przez")) {
    const splitted = str.split(" przez");
    const firstPart = splitted[0];
    return firstPart + " ...";
  } else if (str.length > 25) {
    // console.log("str.length:", str.length);
    const truncatedString = str.substring(0, 25) + " ...";
    return truncatedString;
  } else {
    // console.log("str.length:", str.length);
    return str;
  }
};

export const truncateStringWithoutPopover = (str: string) => {
  if (str.includes("przez")) {
    const splitted = str.split(" przez");
    const firstPart = splitted[0];
    return firstPart;
  } else if (str.length > 25) {
    const truncatedString = str.substring(0, 25);
    return truncatedString;
  } else {
    return str;
  }
};

export const cutAgencyName = (stringToCut: string, agencyId: string) => {
  // console.log({ stringToCut, agencyId });
  let stringShortWithoutAgencyId = stringToCut.replace(agencyId, "");
  stringShortWithoutAgencyId = stringShortWithoutAgencyId.replace("_", "");
  // console.log({ stringShortWithoutAgencyId });
  return stringShortWithoutAgencyId;
};

export const capitalizeFirstLetter = (str: string) => {
  let splitStr = str.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
};

export const dateToString = (selectedDate: Date) => {
  if (!selectedDate) {
    selectedDate = new Date();
  }
  // console.log("selectedDate:", selectedDate);

  function padTo2Digits(num: number) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date: Date) {
    return [date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join("-");
  }

  const dateToExport = formatDate(selectedDate);
  // console.log("dateToExport:", dateToExport);
  return dateToExport.split("T")[0];
};

export const setNewDate = (num: number): Date => {
  const today = new Date();
  const newDay = today.setDate(today.getDate() + num);
  const newDayDate = new Date(newDay);
  return newDayDate;
};

export const removeDuplicateStops = (array: Array<any>, property: string) => {
  const uniqueIds = [] as typeof array;
  const unique = array.filter((element) => {
    const isDuplicate = uniqueIds.includes(element[property]);
    if (!isDuplicate) {
      uniqueIds.push(element[property]);
      return true;
    }
    return false;
  });
  return unique;
};

// DynamicTextColor -> function taken from: https://wunnle.com/dynamic-text-color-based-on-background
export const dynamicTexColor = (bgcColorShort: string): string => {
  const bgcColor = `#${bgcColorShort}`;

  function getRGB(color: string): number {
    return parseInt(color as string, 16) || (Number(color) as number);
  }

  function getsRGB(color: string): number {
    return getRGB(color) / 255 <= 0.03928
      ? getRGB(color) / 255 / 12.92
      : Math.pow((getRGB(color) / 255 + 0.055) / 1.055, 2.4);
  }

  function getLuminance(hexColor: string): number {
    return (
      0.2126 * getsRGB(hexColor.substr(1, 2)) +
      0.7152 * getsRGB(hexColor.substr(3, 2)) +
      0.0722 * getsRGB(hexColor.substr(-2))
    );
  }

  function getContrast(colorToCheck: string, blackWhite: string): number {
    const L1 = getLuminance(colorToCheck);
    const L2 = getLuminance(blackWhite);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function getTextColor(bgcColor: string): string {
    const whiteContrast = getContrast(bgcColor, "#ffffff");
    const blackContrast = getContrast(bgcColor, "#000000");
    // console.log({ whiteContrast, blackContrast });
    return whiteContrast > blackContrast ? "ffffff" : "000000";
  }
  return getTextColor(bgcColor);
};

export const locationAdjust = (latlng: LanLngPoint): { latStr: string; lngStr: string } => {
  const lat = Number(latlng.lat.toFixed(4));
  const long = Number(latlng.lng.toFixed(4));

  let latStr: string = "";
  let lngStr: string = "";

  if (lat >= 0) {
    latStr = `${lat}° N`;
  } else {
    latStr = `${-1 * lat}° S`;
  }
  if (long >= 0) {
    lngStr = `${long}° E`;
  } else {
    lngStr = `${-1 * long}° W`;
  }
  return { latStr, lngStr };
};

//* getAcronym
export const getAcronym = (words: string): string => {
  const acronym = words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return acronym;
};

// React notify
export const infoNotify = (infoType: string, message: string) => {
  if (infoType === "error") {
    toast.error(message);
  } else if (infoType === "warning") {
    toast.warning(message);
  } else if (infoType === "success") {
    toast.success(message);
  } else if (infoType === "info") {
    toast.info(message);
  } else {
    toast(message);
  }
};
