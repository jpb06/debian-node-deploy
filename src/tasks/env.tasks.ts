import fs from "fs-extra";

import { Console } from "../util/console.util";
import { logError } from "../util/logging.util";

export const setEnv = async (
  destPath: string,
  envFile?: string
): Promise<void> => {
  if (envFile && envFile.startsWith(".env")) {
    Console.StartTask("Setting up env");

    try {
      await fs.copyFile(envFile, `${destPath}/.env`);
      Console.Success("Env setup complete");
    } catch (err) {
      await logError(err);
      throw "Env setup failure";
    }
  }
};
