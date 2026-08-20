import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
  },
});
