import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const execAppStop = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Stopping the app in production ...");

  let connection = undefined;
  try {
    connection = await connect(config);

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
