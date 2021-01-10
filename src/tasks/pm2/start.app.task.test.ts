jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mockSSHConnect } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { config } from "../../tests/test.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
import { execAppStart } from "./start.app.task";

assignConsoleMocks();

const consoleStart = "Launching the app ...";
const exceptionMessage = "Failed to launch the app";

describe("Start app task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await execAppStart(config, "yolo");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(exec).toHaveBeenCalledTimes(0);
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the task failed (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await execAppStart(config, "yolo");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the task failed (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "command error");

    try {
      await execAppStart(config, "yolo");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith("command error");
    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[PM2] Done.");

    expect(await execAppStart(config, "yolo")).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith("App launched");

    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
