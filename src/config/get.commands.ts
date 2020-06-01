import { DeployConfig } from "../types/deploy.config";
import { AppCommands } from "../types/app.commands";

export const getCommandsFor = (config: DeployConfig, type: AppCommands) => {
  let commands: Array<string>;
  switch (type) {
    case AppCommands.Start:
      commands = config.appStartCommands;
      break;
    case AppCommands.Stop:
      commands = config.appStopCommands;
      break;
  }
  return commands;
};
