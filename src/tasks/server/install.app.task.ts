import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const execNpmInstall = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Running npm install ...");

  try {
    const connection = await connect(config);

    await connection.execCommand("npm install", {
      cwd: `${config.deployPath}/${config.appName}`,
    });

    connection.dispose();
    Console.Success("Node modules installed");
  } catch (err) {
    await logError(err);
    throw "Failed to install node modules";
  }
};
