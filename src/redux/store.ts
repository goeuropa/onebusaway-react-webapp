import { legacy_createStore as createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";

// Redux-persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import rootReducer from "./reducer";
import { rootStateStorage } from "../config";

const persistConfig = {
  key: rootStateStorage,
  storage,
  // blacklist: ["zoom", "selectedStop"],
  whitelist: ["appSettings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, {}, composeWithDevTools(applyMiddleware(reduxThunk)));
const persistor = persistStore(store);

export { persistor, store };
