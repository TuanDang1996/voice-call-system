import * as config from "@appConfig";

export const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Signaling Services API documentation",
    version: "1.0.0",
  },
  servers: [
    {
      url: `${config.APP_ENDPOINT}${config.API_PREFIX}`,
    },
  ],
};
