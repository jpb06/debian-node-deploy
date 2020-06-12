import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const unzipOnRemote = async (
  config: DeployConfig,
  fileName: string
): Promise<void> => {
  Console.StartTask("Unzipping files");

  let connection = undefined;
  try {
    connection = await connect(config);

    const deployPath = `${config.deployPath}/${config.appName}`;

    const cleanResult = await connection.execCommand(`rm -rf ${deployPath}`);
    if (cleanResult.code !== 0) throw cleanResult.stderr;

    const unzipOutput = await connection.execCommand(
      `unzip -qq ${config.filesRestoryPath}/${config.appName}/${fileName} -d ${deployPath}`
    );
    if (unzipOutput.code !== 0) throw unzipOutput.stderr;

    const chownOutput = await connection.execCommand(
      `chown -R ${config.user} ${deployPath}`
    );
    if (chownOutput.code !== 0) throw chownOutput.stderr;

    Console.Success("Archive unzipped on deploy server");
  } catch (err) {
    await logError(err);
    throw "Unable to unzip the deployment archive";
  } finally {
    if (connection) connection.dispose();
  }
};
