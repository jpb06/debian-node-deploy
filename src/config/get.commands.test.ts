import { getCommandsFor } from "./get.commands";
import { DeployStep } from "../types/deploy.step";
import { config } from "../tests/test.config";

describe("Get commands switch", () => {
  it("should return pre start commands", () => {
    expect(getCommandsFor(DeployStep.PreStart, config)).toStrictEqual({
      commands: config.appPreStartCommands,
      startText: "Executing pre start commands",
      errorText: "Pre start commands execution failure",
      successTest: "Pre start commands execution success",
    });
  });
  it("should return pre stop commands", () => {
    expect(getCommandsFor(DeployStep.PreStop, config)).toStrictEqual({
      commands: config.appPreStopCommands,
      startText: "Executing pre stop commands",
      errorText: "Pre stop commands execution failure",
      successTest: "Pre stop commands execution success",
    });
  });
  it("should return post start commands", () => {
    expect(getCommandsFor(DeployStep.PostStart, config)).toStrictEqual({
      commands: config.appPostStartCommands,
      startText: "Executing post start commands",
      errorText: "Post start commands execution failure",
      successTest: "Post start commands execution success",
    });
  });
  it("should return post stop commands", () => {
    expect(getCommandsFor(DeployStep.PostStop, config)).toStrictEqual({
      commands: config.appPostStopCommands,
      startText: "Executing post stop commands",
      errorText: "Post stop commands execution failure",
      successTest: "Post stop commands execution success",
    });
  });
});
