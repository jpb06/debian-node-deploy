import * as fs from "fs-extra";
import Ajv from "ajv";
import * as DeployConfigSchema from "../types/deploy.config.schema.json";
import { DeployConfig } from "../types/deploy.config";

const validateConfig = (data: any) => {
  const ajv = new Ajv();

  const validate = ajv.compile(DeployConfigSchema);
  const isValid = validate(data);
  if (!isValid) {
    console.log("Invalid deploy configuration");
    console.log("Errors:", validate.errors);
  }

  return isValid;
};

export const loadDeployConfig = async (appName: string) => {
  const data = await fs.readJSON("./deploy.config.json");

  const isValid = validateConfig(data);
  if (!isValid) throw new Error("Invalid deploy config");

  data.appName = appName;
  return data as DeployConfig;
};
