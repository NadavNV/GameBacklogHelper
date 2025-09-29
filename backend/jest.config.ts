import type { Config } from "jest";
import dotenv = require("dotenv");

dotenv.config({
  path: "./.env",
});

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/?(*.)+(test|spec).ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest", // your TS files
    "^.+\\.m?[jt]sx?$": "babel-jest", // JS/ESM in node_modules
  },
  transformIgnorePatterns: [
    "/node_modules/(?!p-limit|yocto-queue)", // force-transform ESM deps
  ],
};

export default config;
