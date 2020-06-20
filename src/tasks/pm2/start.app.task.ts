import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const execAppStart = async (
  config: DeployConfig,
  main: string
): Promise<void> => {
  Console.StartTask("Launching the app ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(
      connection,
      `pm2 start ${main} --name ${config.appName}`,
      {
        cwd: `${config.deployPath}/${config.appName}`,
      }
    );

    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("App launched");
  } catch (err) {
    await logError(err);
    throw "Failed to launch the app";
  } finally {
    if (connection) connection.dispose();
  }
};
