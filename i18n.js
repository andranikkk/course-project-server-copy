const i18n = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18n
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "ru"],
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: __dirname + "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["cookie", "header"],
      caches: ["cookie"],
    },
  });

module.exports = i18n;
module.exports.middleware = middleware;
