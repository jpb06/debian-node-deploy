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
  execCommands,
} from "../tasks/server.tasks";
import { resetErrorLogs } from "../util/logging.util";
import { DeployStep } from "../types/deploy.step";

export const deploy = async (): Promise<void> => {
  await resetErrorLogs();
  const config = await loadDeployConfig(pckg.name);
  const archiveFileName = `${config.appName}_${pckg.version}.zip`;
  Console.Initialize(`Deploying ${config.appName}`);

  try {
    await setEnv(config.envFile);
    await generatePackage();
    await zip("./dist", `./release/${archiveFileName}`);

    await sendFileToDeployServer(
      config,
      archiveFileName,
      `${config.filesRestoryPath}/${config.appName}`
    );

    // Stopping the app
    await execCommands(config, DeployStep.PreStop);
    await execAppStop(config);
    await execCommands(config, DeployStep.PostStop);

    await unzipOnRemote(config, archiveFileName);
    await execNpmInstall(config);

    // Starting the app
    await execCommands(config, DeployStep.PreStart);
    await execAppStart(config, pckg.main);
    await execCommands(config, DeployStep.PostStart);

    Console.End(true);
    process.exit(0);
  } catch (err) {
    Console.Failure(err);
    process.exit(1);
  }
};
