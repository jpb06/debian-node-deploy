jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

import { mocked } from "ts-jest/utils";
import { Console } from "../../util/console.util";
import { connect, exec } from "../../util/ssh.util";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { mockSSHConnect, dispose } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { reloadNginx } from "./reload.nginx.task";

assignConsoleMocks();

const consoleStart = "Reloading Nginx";
const consoleSuccess = "Nginx reloaded";
const exceptionMessage = "Failed to reload Nginx";

describe("Reloading nginx task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await reloadNginx(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if the command failed (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await reloadNginx(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if the command failed (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "Command error");

    try {
      await reloadNginx(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith("Command error");
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "stdout");

    expect(await reloadNginx(config)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
