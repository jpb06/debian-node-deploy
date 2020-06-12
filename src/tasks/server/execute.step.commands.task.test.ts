jest.mock("../../util/ssh.util");
jest.mock("../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { execCommands } from "./execute.step.commands.task";
import { DeployStep } from "../../types/deploy.step";
import { connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import {
  execCommand,
  dispose,
  mockSSHConnect,
} from "./../../tests/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/console.mock";

assignConsoleMocks();

describe("Execute step commands tasks", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shouldn't do anything if there is no command to execute", () => {
    mockSSHConnect();
    expect(execCommands(config, DeployStep.PreStart)).resolves;

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(0);
    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(connect).mock.calls).toHaveLength(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should fail if connection failed", async () => {
    mockSSHConnect(undefined, "Error!", true);

    try {
      await execCommands(
        { ...config, appPreStopCommands: ["yolo"] },
        DeployStep.PreStop
      );
    } catch (err) {
      expect(err).toBe("Pre stop commands execution failure");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Executing pre stop commands"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should fail if one command failed", async () => {
    mockSSHConnect(undefined, "Error!");

    try {
      await execCommands(
        { ...config, appPreStopCommands: ["yolo"] },
        DeployStep.PreStop
      );
    } catch (err) {
      expect(err).toBe("Pre stop commands execution failure");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Executing pre stop commands"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should succeed if all commands pass", async () => {
    mockSSHConnect("Succeeded");

    expect(
      await execCommands(
        { ...config, appPostStartCommands: ["yolo", "yala"] },
        DeployStep.PostStart
      )
    ).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Executing post start commands"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Post start commands execution success"
    );

    expect(mocked(execCommand)).toHaveBeenCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
