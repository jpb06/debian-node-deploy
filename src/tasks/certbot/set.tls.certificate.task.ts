import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const setTlsCertificate = async (
  config: DeployConfig
): Promise<void> => {
  Console.StartTask("Managing certificate for TLS ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(
      connection,
      `echo ${config.password} | sudo -S certbot certonly --nginx -n -d ${config.websiteDomain} -d www.${config.websiteDomain}`
    );
    if (result.code !== 0) {
      throw result.err;
    }

    Console.Success("TLS certificate generated");
  } catch (err) {
    await logError(err);
    throw "Failed to generate the TLS certificate";
  } finally {
    if (connection) {
      connection.dispose();
    }
  }
};
