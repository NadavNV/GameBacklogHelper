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
};

export default config;
