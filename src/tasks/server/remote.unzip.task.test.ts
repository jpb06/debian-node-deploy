jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect, exec } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { unzipOnRemote } from "./remote.unzip.task";
import { mockSSHConnect, dispose } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";

assignConsoleMocks();

const consoleStart = "Unzipping files";
const consoleSuccess = "Archive unzipped on deploy server";
const exceptionMessage = "Unable to unzip the deployment archive";

describe("Remote unzip task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await unzipOnRemote(config, "yolo.zip", false);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(
      1,
      new Error("Connection failed")
    );
    expect(mocked(dispose)).toBeCalledTimes(0);
    expect(mocked(exec)).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the mkdir command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "command 1 error");

    try {
      await unzipOnRemote(config, "yolo.zip", true);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 1 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the cleanup command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "command 1 error");

    try {
      await unzipOnRemote(config, "yolo.zip", false);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 1 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the cleanup command failed and we're deploying a spa", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "", "command 2 error");

    try {
      await unzipOnRemote(config, "yolo.zip", true);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 2 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(exec)).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if the unzip command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "", "command 2 error");

    try {
      await unzipOnRemote(config, "yolo.zip", false);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 2 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(exec)).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if the chown command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "", "command 3 error");

    try {
      await unzipOnRemote(config, "yolo.zip", false);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 3 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(exec)).toHaveBeenCalledTimes(3);
  });

  it("should complete gracefully if unzipping node app succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");

    expect(await unzipOnRemote(config, "yolo.zip", false)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);

    expect(mocked(exec)).toHaveBeenCalledTimes(3);
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(logError)).toBeCalledTimes(0);
  });

  it("should complete gracefully if unzipping spa succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");

    expect(await unzipOnRemote(config, "yolo.zip", true)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);

    expect(mocked(exec)).toHaveBeenCalledTimes(4);
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(logError)).toBeCalledTimes(0);
  });
});
