import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const execAppStop = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Stopping the app in production ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const runningAppPid = await exec(connection, `pm2 id ${config.appName}`);
    if (runningAppPid.code !== 0) {
      throw runningAppPid.err;
    } else if (runningAppPid.out === "[]") {
      Console.Success("No app found in production");
      return;
    }

    const result = await exec(connection, `pm2 delete ${config.appName}`);
    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("Production app stopped");
  } catch (err) {
    await logError(err);
    throw "Failed to stop the app in production";
  } finally {
    if (connection) {
      connection.dispose();
    }
  }
};
