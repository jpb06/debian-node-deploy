import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const reloadNginx = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Reloading Nginx");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(
      connection,
      `echo ${config.password} | sudo -S systemctl reload nginx`
    );

    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("Nginx reloaded");
  } catch (err) {
    await logError(err);
    throw "Failed to reload Nginx";
  } finally {
    if (connection) connection.dispose();
  }
};
