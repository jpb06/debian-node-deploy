import fs from "fs-extra";
import archiver from "archiver";
import { DeployConfig } from "../types/deploy.config";
import { Console } from "./../util/console.util";
import { logError } from "../util/logging.util";
import { connect } from "../util/ssh.util";

export const zip = async (source: string, out: string): Promise<void> => {
  Console.StartTask("Zipping codebase");
  const archive = archiver("zip", { zlib: { level: 9 } });

  await fs.ensureDir("./release");

  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", async (err: any) => {
        await logError(err);
        reject("Failed to zip codebase");
      })
      .pipe(stream);

    stream.on("close", () => {
      Console.Success("Codebase zipping complete");
      resolve();
    });
    stream.on("error", async (err: any) => {
      await logError(err);
      reject("Failed to zip codebase");
    });

    archive.finalize();
  });
};

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

    if (cleanResult.stderr) logError(cleanResult.stderr);
    if (unzipOutput.stderr) logError(unzipOutput.stderr);
    if (chownOutput.stderr) logError(chownOutput.stderr);

    connection.dispose();
    Console.Success("Archive unzipped on deploy server");
  } catch (err) {
    await logError(err);
    throw "Unable to unzip the deployment archive";
  }
};
