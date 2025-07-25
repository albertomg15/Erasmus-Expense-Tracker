import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 🧾 Importar traducciones por módulo
import budgetEn from "./locales/en/budget.json";
import budgetEs from "./locales/es/budget.json";

import profileEn from "./locales/en/profile.json";
import profileEs from "./locales/es/profile.json";

import transactionEn from "./locales/en/transactions.json";
import transactionEs from "./locales/es/transactions.json";

import authEn from "./locales/en/auth.json";
import authEs from "./locales/es/auth.json";

import categoriesEn from "./locales/en/categories.json";
import categoriesEs from "./locales/es/categories.json";

import commonEn from "./locales/en/common.json";
import commonEs from "./locales/es/common.json";

import dashBoardEn from "./locales/en/dashboard.json";
import dashBoardEs from "./locales/es/dashboard.json";

import tripsEn from "./locales/en/trips.json";
import tripsEs from "./locales/es/trips.json";


import statisticsEn from "./locales/en/statistics.json";
import statisticsEs from "./locales/es/statistics.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        budget: budgetEn,
        profile: profileEn,
        transactions: transactionEn,
        statistics: statisticsEn,
        auth: authEn,
        categories: categoriesEn,
        common: commonEn,
        dashboard: dashBoardEn,
        trips: tripsEn
      },
      es: {
        budget: budgetEs,
        profile: profileEs,
        transactions: transactionEs,
        statistics: statisticsEs,
        auth: authEs,
        categories: categoriesEs,
        common: commonEs,
        dashboard: dashBoardEs,
        trips: tripsEs
      }
    },
    fallbackLng: "en",
    defaultNS: "common", // Puedes dejarlo así si lo cambias dinámicamente
    ns: ["budget", "profile", "transactions", "tags", "statistics","auth", "categories", "common", "dashboard", "trips"],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
