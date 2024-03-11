# OneBusAway-React-Webapp

Application showing real-time vehicle data.

## Description

### General Info

The application shows the position of public transport vehicles in real time - if available or according to the timetable. If
there is more than one line, you can select the line you are interested in from the side panel. After clicking on the stop,
he can see the timetable for today or the next days. After clicking on the vehicle icon, we can see the three nearest stops.

## Notes

There is a config file for a few agencies.

## Built With and Credits

- The App is written in [TypeScript](https://www.typescriptlang.org).
- [React-Bootstrap](https://react-bootstrap.github.io), [Sass](https://sass-lang.com) and
  [Styled-Components](https://styled-components.com) are used to customize the UI.
- CRUD operations are performed using [Axios](https://axios-http.com).
- Client-side routing is done using [React Router](https://reactrouter.com/en/main).
- Global state of the App is maintained by [Redux](https://redux.js.org).
- [React](https://reactjs.org) is used to build client-side.
- [Leaflet](https://leafletjs.com) and [React-Leaflet](https://react-leaflet.js.org) are used to render 2D maps of Earth.
- Earth maps are provided by [OpenStreetMap](https://www.openstreetmap.org).
- [i18next](https://www.i18next.com) is used to handle translations.
- [Turf.js](https://turfjs.org) is used for spatial calculations.
- Some icons were taken from [IconFinder](https://www.iconfinder.com).

## Getting Started and Deployment

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1. You must have [node.js](https://nodejs.org/en) installed.
2. Once you download the repository, you need install the dependencies with the command: `npm ci`.
3. Choose the right configuration for your agency: copy `env.example` to `.env` and edit the `.env` file to set an app name, API key, and API server URL. More configuration options are available in `config.ts`.
4. Then you can run: `npm start` or do build: `npm run build`.
5. Finally, there's deployment. Follow this [instruction](https://create-react-app.dev/docs/deployment)

## Routes

1. The main window - route ends with: <code>/app</code>, e.g. `/app`
2. Route view - route ends with <code>/app/route/**_[routeId]_**</code>, e.g. `/app/route/172`
3. Stop view for today (right now) - route ends with <code>/app/stop/**_[stopId]_**</code>, e.g. `/app/stop/1211_399`
4. Stop view for other day (timetable) - route ends with <code>/app/date/**_[selectedDate]_**/stop/**_[stopId]_**</code>,
   e.g. `/app/date/2023-04-04/stop/1211_399`
5. Vehicle view - route ends with <code>/app/vehicle/**_[vehicleId]_**</code>, e.g. `/app/vehicle/359633108368049`
6. Timetable view - route ends with <code>/stopIds/**_[stopId,stopId,stopId]_**</code>, e.g.
   `/stopIds/1211_48,1211_389,1211_999`

## License

[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0)
