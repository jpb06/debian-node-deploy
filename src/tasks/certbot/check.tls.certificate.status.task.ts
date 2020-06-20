import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const tlsCertificateExists = async (
  config: DeployConfig
): Promise<boolean> => {
  Console.StartTask("Checking TLS certificate ...");

  let connection = undefined;
  try {
    connection = await connect(config);

    const result = await exec(
      connection,
      `echo ${config.password} | sudo -S certbot certificates`
    );
    if (result.code !== 0) {
      throw result.err;
    }

    const exists = result.out.includes(
      `Certificate Name: ${config.websiteDomain}`
    );

    Console.Success(
      exists ? "TLS certificate found" : "No TLS certificate found"
    );
    return exists;
  } catch (err) {
    await logError(err);
    throw "Failed to check TLS certificate";
  } finally {
    if (connection) {
      connection.dispose();
    }
  }
};
