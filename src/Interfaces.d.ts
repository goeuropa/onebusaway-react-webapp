// Types and Interfaces

type RootState = ReturnType<typeof store.getState>;
type Dispatch = typeof store.dispatch;
type Fetch = typeof store.fetch;
type Action = typeof store.action;

interface LanLngPoint {
  lat: number;
  lng: number;
}

type Point = [number, number];
type Line = Point[];

interface SelectedBus {
  MonitoredCall?: { Extensions: { Deviation: string } };
  routeNameFromVehicleApi?: string;
  DestinationRef?: string;
  BlockRef?: string;
  VehicleRef: string;
  LineRef: string;
  Monitored: boolean;
  currentRoute?: RouteInfo[];
  Bearing?: number;
  PublishedLineName?: string;
  VehicleLocation?: { Latitude: number; Longitude: number };
  destinationName?: { name: string }[];
}

interface BusInfo {
  MonitoredVehicleJourney: SelectedBus;
}

interface StopInfo {
  order: number;
  code: string;
  routeIds: string[];
  id: string;
  lat: number;
  lon: number;
  name: string;
}

interface ArrivalsDepartures {
  predicted: boolean;
  predictedDepartureTime: number;
  tripStatus: {
    scheduleDeviation: number;
    vehicleId: string;
  };
  acronym: string;
  routeLongName: string;
  stopId?: string;
  color?: string;
  textColor?: string;
  scheduledArrivalTime?: number;
  scheduledDepartureTime?: number;
  routeShortName?: string;
  tripHeadsign: string;
  arrivalTime?: number;
  departureTime?: number;
  tripId?: string;
  routeId?: string;
  vehicleId: string;
}

interface BusInMotion {
  tripId?: string;
  lineNumber: string;
  route: string;
  vehicleRef: string;
  updatedTime: string;
  direction: number;
  onwardCall: {
    OnwardCall: {
      map: (RootState) => JSX.Element;
    };
  };
  monitored: boolean;
}

interface BusInfoItem {
  StopPointRef: string;
  ExpectedArrivalTime: string;
  StopPointName: string;
  Extensions: { Distances: { PresentableDistance: string } };
}

interface TimeTableRow {
  tripHeadsignAdded?: string;
  arrivalTime: number;
  departureTime: number;
  tripId: string;
}

interface StationTimeTable {
  shortNameAdded: string | number;
  longNameAdded?: string;
  textColor?: string;
  color?: string;
  stopRouteDirectionSchedules: { scheduleStopTimes: TimeTableRow[]; tripHeadsign: string }[];
  routeId: string;
}

interface StationTimeTableModified {
  shortNameAdded: string;
  departuresArray: TimeTableRow[];
  longNameAdded: string;
  textColor: string;
  color: string;
  routeId: string;
}

interface Direction {
  id: number;
  name: string;
  stops: string[];
}

interface StopDepartureBoard {
  id: string;
  name: string;
}

interface StopDepartureBoardTimes {
  color: [{ color: string }];
  departureTime: string;
  direction: string;
  lineNumber: string;
  MonitoredVehicleJourney: { LineRef: string; DestinationName: string; MonitoredCall: { ExpectedDepartureTime: string } };
}

interface StopDepartureData {
  lineNumber: string;
  direction: string;
  departureTime: string;
  color: RouteInfo[];
}

interface StopData {
  stopInfo: StopDepartureBoard[];
  stopId: string;
  stopDepartureData: StopDepartureData[];
}

//* New Start Site - Get all polylines, stops and buses
interface AllPolylinesStops {
  addedBusIcon?: string;
  routeName_0: string;
  routeName_1: string;
  polylinesDecodedReduced?: Line[];
  routeId: string;
  polylines: {
    length: number;
    points: string;
  }[];
  stops: StopInfo[];
  polylinesDecoded?: Line[];
}

interface RouteInfo {
  fromList?: string;
  agencyId?: string;
  color: string;
  id: string;
  longName: string;
  shortName: string | number;
  textColor: string;
}
