import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const execNpmInstall = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Running npm install ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await connection.execCommand("npm install", {
      cwd: `${config.deployPath}/${config.appName}`,
    });
    if (result.code !== 0) throw result.stderr;

    Console.Success("Node modules installed");
  } catch (err) {
    await logError(err);
    throw "Failed to install node modules";
  } finally {
    if (connection) connection.dispose();
  }
};
