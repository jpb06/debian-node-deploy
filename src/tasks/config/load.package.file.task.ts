import { readJSON } from "fs-extra";
import { logError } from "../../util/logging.util";
import { Console } from "../../util/console.util";
import { pathExists } from "fs-extra";

export const loadPackageFile = async (isSpa: boolean): Promise<any> => {
  try {
    Console.StartTask("Checking package.json");
    const packageFile = "./package.json";

    if (!pathExists(packageFile))
      throw "The package.json file could not be located";

    const json = await readJSON(packageFile);

    if (!json.name || !json.version || (!isSpa && !json.main)) {
      const message = "the package.json file has missing properties:";
      const requiredProps = isSpa
        ? "name and version"
        : "name, version and main";
      throw `${message} ${requiredProps} must be defined.`;
    }

    Console.Success("package.json content extracted");

    return json;
  } catch (err) {
    await logError(err);
    throw err;
  }
};
