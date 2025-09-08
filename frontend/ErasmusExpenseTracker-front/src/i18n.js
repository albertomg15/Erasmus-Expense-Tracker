import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 🧾 Importar traducciones por módulo
import budgetEn from "./locales/en/budget.json";
import budgetEs from "./locales/es/budget.json";
import budgetFr from "./locales/fr/budget.json";
import budgetVl from "./locales/vl/budget.json";
import budgetPl from "./locales/pl/budget.json";


import profileEn from "./locales/en/profile.json";
import profileEs from "./locales/es/profile.json";
import profileFr from "./locales/fr/profile.json";
import profileVl from "./locales/vl/profile.json";
import profilePl from "./locales/pl/profile.json";


import transactionEn from "./locales/en/transactions.json";
import transactionEs from "./locales/es/transactions.json";
import transactionFr from "./locales/fr/transactions.json";
import transactionVl from "./locales/vl/transactions.json";
import transactionPl from "./locales/pl/transactions.json";


import authEn from "./locales/en/auth.json";
import authEs from "./locales/es/auth.json";
import authFr from "./locales/fr/auth.json";
import authVl from "./locales/vl/auth.json";
import authPl from "./locales/pl/auth.json";


import categoriesEn from "./locales/en/categories.json";
import categoriesEs from "./locales/es/categories.json";
import categoriesFr from "./locales/fr/categories.json";
import categoriesVl from "./locales/vl/categories.json";
import categoriesPl from "./locales/pl/categories.json";

import commonEn from "./locales/en/common.json";
import commonEs from "./locales/es/common.json";
import commonFr from "./locales/fr/common.json";
import commonVl from "./locales/vl/common.json";
import commonPl from "./locales/pl/common.json";


import dashBoardEn from "./locales/en/dashboard.json";
import dashBoardEs from "./locales/es/dashboard.json";
import dashBoardFr from "./locales/fr/dashboard.json";
import dashBoardVl from "./locales/vl/dashboard.json";
import dashBoardPl from "./locales/pl/dashboard.json";


import tripsEn from "./locales/en/trips.json";
import tripsEs from "./locales/es/trips.json";
import tripsFr from "./locales/fr/trips.json";
import tripsVl from "./locales/vl/trips.json";
import tripsPl from "./locales/pl/trips.json";



import statisticsEn from "./locales/en/statistics.json";
import statisticsEs from "./locales/es/statistics.json";
import statisticsFr from "./locales/fr/statistics.json";
import statisticsVl from "./locales/vl/statistics.json";
import statisticsPl from "./locales/pl/statistics.json";


import comparisonEn from "./locales/en/comparison.json";
import comparisonEs from "./locales/es/comparison.json";
import comparisonFr from "./locales/fr/comparison.json";
import comparisonVl from "./locales/vl/comparison.json";
import comparisonPl from "./locales/pl/comparison.json";



i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { budget: budgetEn, profile: profileEn, transactions: transactionEn, statistics: statisticsEn, auth: authEn, categories: categoriesEn, common: commonEn, dashboard: dashBoardEn, trips: tripsEn, comparison: comparisonEn },
      es: { budget: budgetEs, profile: profileEs, transactions: transactionEs, statistics: statisticsEs, auth: authEs, categories: categoriesEs, common: commonEs, dashboard: dashBoardEs, trips: tripsEs, comparison: comparisonEs },
      vl: { budget: budgetVl, profile: profileVl, transactions: transactionVl, statistics: statisticsVl, auth: authVl, categories: categoriesVl, common: commonVl, dashboard: dashBoardVl, trips: tripsVl, comparison: comparisonVl },
      fr: { budget: budgetFr, profile: profileFr, transactions: transactionFr, statistics: statisticsFr, auth: authFr, categories: categoriesFr, common: commonFr, dashboard: dashBoardFr, trips: tripsFr, comparison: comparisonFr },
      pl: { budget: budgetPl, profile: profilePl, transactions: transactionPl, statistics: statisticsPl, auth: authPl, categories: categoriesPl, common: commonPl, dashboard: dashBoardPl, trips: tripsPl, comparison: comparisonPl }
    },
    supportedLngs: ["en", "es", "fr", "pl", "vl"],
    // Si el navegador es 'ca' usa 'vl'
    fallbackLng: (code) =>
   code && code.toLowerCase().startsWith("ca") ? ["vl", "en"] : ["en"],
    defaultNS: "common",
    ns: ["budget", "profile", "transactions", "statistics", "auth", "categories", "common", "dashboard", "trips", "comparison"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng"
    },
    lowerCaseLng: true,
    load: "currentOnly",
    cleanCode: true
  });

export default i18n;
