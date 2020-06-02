import { pathExists } from "fs-extra";
import path from "path";
import { Console } from "../util/console.util";
import { logError } from "../util/logging.util";

export const getProjectRoot = async (
  currentDir = __dirname.split(path.sep)
): Promise<string> => {
  Console.StartTask("Locating application root");
  if (!currentDir.length) {
    const error = "Could not find project root.";
    await logError(error);
    throw error;
  }

  const nodeModulesPath = currentDir.concat(["node_modules"]).join(path.sep);
  const exists = await pathExists(nodeModulesPath);
  if (exists && !currentDir.includes("node_modules")) {
    Console.Success("Project root located");
    return currentDir.join(path.sep);
  }

  return await getProjectRoot(currentDir.slice(0, -1));
};
