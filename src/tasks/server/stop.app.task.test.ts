jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { exec, connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { execAppStop } from "./stop.app.task";
import { mockSSHConnect, dispose } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";

assignConsoleMocks();

describe("Stop app task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(exec)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if app launched check fails (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(exec)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if app launched check fails (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "Command 1 error");

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith("Command 1 error");
    expect(mocked(exec)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if there is no app to stop", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[]");

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "No app found in production"
    );

    expect(mocked(logError)).toHaveBeenCalledTimes(0);
    expect(mocked(exec)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if app stop fails (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[15]");
    mockSSHExec(true);

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(exec)).toBeCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if app stop fails (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[15]");
    mockSSHExec(false, "", "Command 2 error");

    try {
      await execAppStop(config);
    } catch (err) {
      expect(err).toBe("Failed to stop the app in production");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith("Command 2 error");
    expect(mocked(exec)).toBeCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "[15]");
    mockSSHExec(false);

    expect(await execAppStop(config)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Stopping the app in production ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Production app stopped"
    );

    expect(mocked(exec)).toHaveBeenCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
