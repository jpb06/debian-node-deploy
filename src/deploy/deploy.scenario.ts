import { Console } from "../util/console.util";
import { loadDeployConfig } from "../config/loader";
import { setEnv } from "../tasks/env.tasks";
import { generatePackage } from "../tasks/package.file.task";
import { zip, unzipOnRemote } from "../tasks/zipping.task";
import pckg from "../../package.json";
import {
  sendFileToDeployServer,
  execAppStop,
  execAppStart,
  execNpmInstall,
} from "../tasks/server.tasks";
import { resetErrorLogs } from "../util/logging.util";

export const deploy = async (): Promise<void> => {
  await resetErrorLogs();
  const config = await loadDeployConfig(pckg.name);
  const archiveFileName = `${config.appName}_${pckg.version}.zip`;
  Console.Initialize(`Deploying ${config.appName}`);

  try {
    // Env
    await setEnv(config.envFile);

    // Package.json
    await generatePackage();

    // Zipping
    await zip("./dist", `./release/${archiveFileName}`);

    // Sending to deploy server
    await sendFileToDeployServer(
      config,
      archiveFileName,
      `${config.filesRestoryPath}/${config.appName}`
    );

    // Stopping the app
    await execAppStop(config);

    // Unzipping
    await unzipOnRemote(config, archiveFileName);

    // deploying
    await execNpmInstall(config);
    await execAppStart(config, pckg.main);
    Console.End(true);
    process.exit(0);
  } catch (err) {
    Console.Failure(err);
    process.exit(1);
  }
};
