import { readJSON } from "fs-extra";
import { logError } from "../../util/logging.util";
import { Console } from "../../util/console.util";
import { pathExists } from "fs-extra";

export const loadPackageFile = async (): Promise<any> => {
  try {
    Console.StartTask("Checking package.json");
    const packageFile = "./package.json";

    if (!pathExists(packageFile))
      throw "The package.json file could not be located";

    const json = await readJSON(packageFile);

    if (!json.name || !json.version || !json.main) {
      throw "the package.json file has missing properties: name, version and main must be defined.";
    }

    Console.Success("package.json content extracted");

    return json;
  } catch (err) {
    await logError(err);
    throw err;
  }
};
