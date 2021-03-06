/* istanbul ignore file */
import { Console } from "../util/console.util";
import { setEnv } from "../tasks/env.tasks";
import { generatePackage } from "../tasks/config/package.file.task";
import { zip } from "../tasks/zipping.task";
import { resetErrorLogs } from "../util/logging.util";
import { DeployStep } from "../types/deploy.step";
import { loadPackageFile } from "../tasks/config/load.package.file.task";
import { loadDeployConfig } from "../tasks/config/load.deploy.config.task";
import { sendFileToDeployServer } from "../tasks/server/send.archive.task";
import { execCommands } from "../tasks/server/execute.step.commands.task";
import { execAppStop } from "../tasks/pm2/stop.app.task";
import { unzipOnRemote } from "../tasks/server/remote.unzip.task";
import { execNpmInstall } from "../tasks/npm/install.app.task";
import { execAppStart } from "../tasks/pm2/start.app.task";

export const deployNodeApp = async (): Promise<void> => {
  await resetErrorLogs();
  Console.Initialize();
  try {
    Console.NewSection("Checking deploy configuration");

    const packageFile = await loadPackageFile(false);
    const config = await loadDeployConfig(packageFile.name);

    Console.NewSection("Moving codebase");

    const archiveFileName = `${config.appName}_${packageFile.version}.zip`;

    await setEnv("./dist", config.envFile);
    await generatePackage();
    await zip("./dist", `./release/${archiveFileName}`);

    await sendFileToDeployServer(config, archiveFileName);

    Console.NewSection(`Deploying ${config.appName}`);

    // Stopping the previous version app
    await execCommands(config, DeployStep.PreStop);
    await execAppStop(config);
    await execCommands(config, DeployStep.PostStop);

    // setting up
    await unzipOnRemote(config, archiveFileName, false);
    await execNpmInstall(config);

    // Starting the app
    await execCommands(config, DeployStep.PreStart);
    await execAppStart(config, packageFile.main);
    await execCommands(config, DeployStep.PostStart);

    Console.End(true);
    process.exit(0);
  } catch (err) {
    Console.Failure(err);
    process.exit(1);
  }
};
