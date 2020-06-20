import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { pathExists } from "fs-extra";

export const checkNginxConfig = async (): Promise<void> => {
  try {
    Console.StartTask("Checking Nginx config");

    const configFileExists = await pathExists("./nginx.config");
    if (!configFileExists) throw "nginx.config file is Missing";

    Console.Success("Nginx config checked");
  } catch (err) {
    await logError(err);
    throw "Missing Nginx config (nginx.config)";
  }
};
