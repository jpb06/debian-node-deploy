import fs from "fs-extra";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";

export const generatePackage = async (): Promise<void> => {
  try {
    Console.StartTask("Generating bare package.json");
    const buffer = await fs.readFile("./package.json");
    const data = JSON.parse(buffer.toString());

    const barePackage = {
      name: data.name,
      version: data.version,
      description: data.description,
      main: data.main,
      types: data.types,
      author: data.author,
      dependencies: data.dependencies,
    };

    await fs.writeFile(
      "./dist/package.json",
      JSON.stringify(barePackage, null, 2),
      "utf8"
    );

    Console.Success("package.json generated");
  } catch (err) {
    await logError(err);
    throw "package.json generation failed";
  }
};
