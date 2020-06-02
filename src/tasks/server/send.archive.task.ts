import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";

export const sendFileToDeployServer = async (
  config: DeployConfig,
  sourceFileName: string,
  destPath: string
): Promise<void> => {
  Console.StartTask("Sending the archive to deploy server");

  try {
    const connection = await connect(config);

    await connection.mkdir(destPath);
    await connection.putFile(
      `./release/${sourceFileName}`,
      `${destPath}/${sourceFileName}`
    );

    connection.dispose();
    Console.Success("Archive uploaded to deploy server");
  } catch (err) {
    await logError(err);
    throw "Unable to send the archive";
  }
};
