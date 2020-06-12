jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import {
  execCommand,
  dispose,
  mockSSHConnect,
  mockSSHConnectWithThreeCommands,
  mockSSHConnectForAppStop,
} from "./../../tests/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/console.mock";
import { execAppStop } from "./stop.app.task";

assignConsoleMocks();

describe("Stop app task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(undefined, "Error!", true);

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
    expect(mocked(execCommand)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if app launched check fails", async () => {
    mockSSHConnectWithThreeCommands(undefined, "Error!", 1, false);

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
    expect(mocked(execCommand)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if there is no app to stop", async () => {
    mockSSHConnectForAppStop();

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
    expect(mocked(execCommand)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if app stop fails", async () => {
    mockSSHConnectWithThreeCommands(undefined, "Error!", 2, false);

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
    expect(mocked(execCommand)).toBeCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect("Success");

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

    expect(mocked(execCommand)).toHaveBeenCalledTimes(2);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
