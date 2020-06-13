jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect, exec } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { execAppStart } from "./start.app.task";
import { mockSSHConnect, dispose } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";

assignConsoleMocks();

describe("Install app task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await execAppStart(config, "yolo");
    } catch (err) {
      expect(err).toBe("Failed to launch the app");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Launching the app ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(exec)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if the task failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await execAppStart(config, "yolo");
    } catch (err) {
      expect(err).toBe("Failed to launch the app");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Launching the app ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(exec)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[PM2] Done.");

    expect(await execAppStart(config, "yolo")).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Launching the app ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual("App launched");

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
