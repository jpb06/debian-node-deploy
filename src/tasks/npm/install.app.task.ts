import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const execNpmInstall = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Running npm install ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(connection, "npm install", {
      cwd: `${config.deployPath}/${config.appName}`,
    });
    if (result.code !== 0) throw result.err;

    Console.Success("Node modules installed");
  } catch (err) {
    await logError(err);
    throw "Failed to install node modules";
  } finally {
    if (connection) connection.dispose();
  }
};
