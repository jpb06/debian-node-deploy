import { DeployConfig } from "../types/deploy.config";
import { DeployStep } from "../types/deploy.step";
import { getCommandsFor } from "../config/get.commands";
import { Console } from "./../util/console.util";
import { logError } from "../util/logging.util";
import { connect } from "../util/ssh.util";

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
    Console.Success("Archive uploaded");
  } catch (err) {
    await logError(err);
    throw "Unable to send the archive";
  }
};

export const execAppStop = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Stopping the app in production ...");

  try {
    const connection = await connect(config);

    const result = await connection.execCommand(`pm2 delete ${config.appName}`);
    await logError(result.stderr);
    connection.dispose();
    Console.Success("Production app stopped");
  } catch (err) {
    await logError(err);
    throw "Failed to stop the app in production";
  }
};

export const execNpmInstall = async (config: DeployConfig): Promise<void> => {
  Console.StartTask("Running npm install ...");

  try {
    const connection = await connect(config);

    await connection.execCommand("npm install", {
      cwd: `${config.deployPath}/${config.appName}`,
    });

    connection.dispose();
    Console.Success("Node modules installed");
  } catch (err) {
    await logError(err);
    throw "Failed to install node modules";
  }
};

export const execAppStart = async (
  config: DeployConfig,
  main: string
): Promise<void> => {
  Console.StartTask("Launching the app ...");

  try {
    const connection = await connect(config);

    await connection.execCommand(`pm2 start ${main} --name ${config.appName}`, {
      cwd: `${config.deployPath}/${config.appName}`,
    });

    connection.dispose();
    Console.Success("App launched");
  } catch (err) {
    await logError(err);
    throw "Failed to launch the app";
  }
};

export const execCommands = async (
  config: DeployConfig,
  step: DeployStep
): Promise<void> => {
  const context = getCommandsFor(config, step);
  if (context.commands.length === 0) return;

  Console.StartTask(context.startText);

  try {
    const connection = await connect(config);

    for (const command in context.commands) {
      const result = await connection.execCommand(command);
      await logError(result.stderr);
    }

    Console.Success(context.successTest);
    connection.dispose();
  } catch (err) {
    await logError(err);
    throw context.errorText;
  }
};
