import fs from "fs-extra";
import { Console } from "./../util/console.util";
import { logError } from "../util/logging.util";

export const setEnv = async (envFile?: string): Promise<void> => {
  if (envFile && envFile !== ".env") {
    Console.StartTask("Setting up env");

    try {
      await fs.copyFile(envFile, ".env");
      Console.Success("Env setup complete");
    } catch (err) {
      await logError(err);
      throw "Env setup failure";
    }
  }
};
