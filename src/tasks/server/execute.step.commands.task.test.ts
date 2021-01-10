jest.mock("../../util/ssh.util");
jest.mock("../../util/console.util");
jest.mock("../../util/logging.util");

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mockSSHConnect } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { config } from "../../tests/test.config";
import { DeployStep } from "../../types/deploy.step";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
import { execCommands } from "./execute.step.commands.task";

assignConsoleMocks();

describe("Execute step commands tasks", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shouldn't do anything if there is no command to execute", () => {
    mockSSHConnect(false);

    expect(execCommands(config, DeployStep.PreStart)).resolves;

    expect(Console.StartTask).toHaveBeenCalledTimes(0);
    expect(Console.Success).toHaveBeenCalledTimes(0);

    expect(connect).toHaveBeenCalledTimes(0);
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should fail if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await execCommands(
        { ...config, appPreStopCommands: ["yolo"] },
        DeployStep.PreStop
      );
    } catch (err) {
      expect(err).toBe("Pre stop commands execution failure");
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(
      "Executing pre stop commands"
    );
    expect(Console.Success).toHaveBeenCalledTimes(0);

    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should fail if one command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "err");

    try {
      await execCommands(
        { ...config, appPreStopCommands: ["yolo"] },
        DeployStep.PreStop
      );
    } catch (err) {
      expect(err).toBe("Pre stop commands execution failure");
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(
      "Executing pre stop commands"
    );
    expect(Console.Success).toHaveBeenCalledTimes(0);

    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should succeed if all commands pass", async () => {
    mockSSHConnect(false);
    mockSSHExec(false);
    mockSSHExec(false);

    expect(
      await execCommands(
        { ...config, appPostStartCommands: ["yolo", "yala"] },
        DeployStep.PostStart
      )
    ).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(
      "Executing post start commands"
    );

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(
      "Post start commands execution success"
    );

    expect(exec).toHaveBeenCalledTimes(2);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
