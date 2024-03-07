import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import { persistor, store } from "./redux/store";
import i18n from "./i18n";
import { reactRouterBaseLine } from "./config";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router basename={reactRouterBaseLine}>
            <App />
          </Router>
        </PersistGate>
      </Provider>
    </I18nextProvider>
  </React.StrictMode>
);
