import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const enableNginxSite = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Enabling site on Nginx");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(
      connection,
      `echo ${config.password} | sudo -S ln -sf /etc/nginx/sites-available/${config.websiteDomain} /etc/nginx/sites-enabled/`
    );

    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("Site enabled");
  } catch (err) {
    await logError(err);
    throw "Failed to enable the site";
  } finally {
    if (connection) connection.dispose();
  }
};
