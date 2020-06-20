import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const sendNginxConfigToDeployServer = async (
  config: DeployConfig
): Promise<void> => {
  Console.StartTask("Sending Nginx config to deploy server");

  let connection = undefined;
  try {
    connection = await connect(config);

    const destPath = `${config.filesRestoryPath}/${config.appName}`;

    await connection.putFile("./nginx.config", `${destPath}/nginx.config`);

    const result = await exec(
      connection,
      `echo ${config.password} | sudo -S cp -nf ${destPath}/nginx.config /etc/nginx/sites-available/${config.websiteDomain}`
    );
    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("Nginx config set up on deploy server");
  } catch (err) {
    await logError(err);
    throw "An error occured while setting up Nginx config";
  } finally {
    if (connection) connection.dispose();
  }
};
