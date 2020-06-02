import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const unzipOnRemote = async (
  config: DeployConfig,
  fileName: string
): Promise<void> => {
  Console.StartTask("Unzipping files");

  try {
    const connection = await connect(config);

    const deployPath = `${config.deployPath}/${config.appName}`;

    const cleanResult = await connection.execCommand(`rm -rf ${deployPath}`);
    const unzipOutput = await connection.execCommand(
      `unzip -qq ${config.filesRestoryPath}/${config.appName}/${fileName} -d ${deployPath}`
    );
    const chownOutput = await connection.execCommand(
      `chown -R ${config.user} ${deployPath}`
    );

    logError(cleanResult.stderr);
    logError(unzipOutput.stderr);
    logError(chownOutput.stderr);

    connection.dispose();
    Console.Success("Archive unzipped on deploy server");
  } catch (err) {
    await logError(err);
    throw "Unable to unzip the deployment archive";
  }
};
