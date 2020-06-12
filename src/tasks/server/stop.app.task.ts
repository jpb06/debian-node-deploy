import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const execAppStop = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Stopping the app in production ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const runningAppPid = await connection.execCommand(
      `pm2 pid ${config.appName}`
    );
    if (runningAppPid.code !== 0) {
      throw runningAppPid.stderr;
    } else if (runningAppPid.code === 0 && runningAppPid.stdout === "") {
      Console.Success("No app found in production");
      return;
    }

    const result = await connection.execCommand(`pm2 delete ${config.appName}`);
    if (result.code !== 0) throw result.stderr;

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
