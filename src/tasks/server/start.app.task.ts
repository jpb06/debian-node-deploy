import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const execAppStart = async (
  config: DeployConfig,
  main: string
): Promise<void> => {
  Console.StartTask("Launching the app ...");

  try {
    const connection = await connect(config);

    await connection.execCommand(`pm2 start ${main} --name ${config.appName}`, {
      cwd: `${config.deployPath}/${config.appName}`,
    });

    connection.dispose();
    Console.Success("App launched");
  } catch (err) {
    await logError(err);
    throw "Failed to launch the app";
  }
};
