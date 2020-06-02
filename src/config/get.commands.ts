import { DeployConfig } from "../types/deploy.config";
import { DeployStep } from "../types/deploy.step";

interface CommandsContext {
  commands: Array<string>;
  startText: string;
  errorText: string;
  successTest: string;
}

export const getCommandsFor = (
  config: DeployConfig,
  step: DeployStep
): CommandsContext => {
  switch (step) {
    case DeployStep.PreStart:
      return {
        commands: config.appPreStartCommands,
        startText: "Executing pre start commands",
        errorText: "Pre start commands execution failure",
        successTest: "Pre start commands execution failure",
      };
    case DeployStep.PostStart:
      return {
        commands: config.appPostStartCommands,
        startText: "Executing post start commands",
        errorText: "Post start commands execution failure",
        successTest: "Post start commands execution failure",
      };
    case DeployStep.PreStop:
      return {
        commands: config.appPreStopCommands,
        startText: "Executing pre stop commands",
        errorText: "Pre stop commands execution failure",
        successTest: "Pre stop commands execution failure",
      };
    case DeployStep.PostStop:
      return {
        commands: config.appPostStopCommands,
        startText: "Executing post stop commands",
        errorText: "Post stop commands execution failure",
        successTest: "Post stop commands execution failure",
      };
  }
};
