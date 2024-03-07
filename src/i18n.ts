import i18n from "i18next";
import Backend, { HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { defaultLanguage, i18nPrefix } from "./config";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      // Translation files path
      loadPath: `${i18nPrefix}/i18n/{{lng}}.json`,
    },
    lng: defaultLanguage || localStorage.getItem("i18nextLng") || "en",
    fallbackLng: {
      "en-GB": ["en"],
      default: ["en"],
    },
    // Logs in console
    debug: false,
    // You can have multiple namespaces, in case you want to divide a huge translation into smaller pieces and load them on demand
    interpolation: {
      escapeValue: false,
      formatSeparator: ",",
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
