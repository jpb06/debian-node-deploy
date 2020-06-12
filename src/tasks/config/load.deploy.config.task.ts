import Ajv from "ajv";
import { readJSON } from "fs-extra";
import * as DeployConfigSchema from "../../types/deploy.config.schema.json";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { pathExists } from "fs-extra";
import { DeployConfig } from "../../types/deploy.config";
import { mocked } from "ts-jest/utils";

const validateConfig = async (data: any) => {
  const ajv = new Ajv();

  const validate = ajv.compile(DeployConfigSchema);
  const isValid = validate(data);
  if (!isValid) {
    await logError("Deploy configuration could not be validated:");
    await logError(`Errors:${JSON.stringify(validate.errors)}`);
  }

  return isValid;
};

export const loadDeployConfig = async (
  appName: string
): Promise<DeployConfig> => {
  try {
    Console.StartTask("Validating deploy config");
    const deployFile = "./deploy.config.json";

    const configFileExists = await pathExists(deployFile);
    if (!configFileExists) throw "deploy.config.json file is Missing";

    const data = await readJSON(deployFile);

    const isValid = await validateConfig(data);
    if (!isValid) throw "Invalid deploy config";

    Console.Success("Deploy config validated");

    data.appName = appName;
    return data as DeployConfig;
  } catch (err) {
    await logError(err);
    throw err;
  }
};
