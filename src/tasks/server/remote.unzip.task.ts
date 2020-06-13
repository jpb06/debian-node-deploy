import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";

export const unzipOnRemote = async (
  config: DeployConfig,
  fileName: string
): Promise<void> => {
  Console.StartTask("Unzipping files");

  let connection = undefined;
  try {
    connection = await connect(config);

    const deployPath = `${config.deployPath}/${config.appName}`;

    const cleanResult = await exec(connection, `rm -rf ${deployPath}`);
    if (cleanResult.code !== 0) throw cleanResult.err;

    const unzipOutput = await exec(
      connection,
      `unzip -qq ${config.filesRestoryPath}/${config.appName}/${fileName} -d ${deployPath}`
    );
    if (unzipOutput.code !== 0) throw unzipOutput.err;

    const chownOutput = await exec(
      connection,
      `chown -R ${config.user} ${deployPath}`
    );
    if (chownOutput.code !== 0) throw chownOutput.err;

    Console.Success("Archive unzipped on deploy server");
  } catch (err) {
    await logError(err);
    throw "Unable to unzip the deployment archive";
  } finally {
    if (connection) connection.dispose();
  }
};
