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
import { unzipOnRemote } from "./remote.unzip.task";

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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, new Error("Connection failed"));
    expect(dispose).toHaveBeenCalledTimes(0);
    expect(exec).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the mkdir command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "command 1 error");

    try {
      await unzipOnRemote(config, "yolo.zip", true);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, "command 1 error");
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(exec).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the cleanup command failed", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "command 1 error");

    try {
      await unzipOnRemote(config, "yolo.zip", false);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, "command 1 error");
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(exec).toHaveBeenCalledTimes(1);
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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, "command 2 error");
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(exec).toHaveBeenCalledTimes(2);
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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, "command 2 error");
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(exec).toHaveBeenCalledTimes(2);
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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(1, "command 3 error");
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(exec).toHaveBeenCalledTimes(3);
  });

  it("should complete gracefully if unzipping node app succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");

    expect(await unzipOnRemote(config, "yolo.zip", false)).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);

    expect(exec).toHaveBeenCalledTimes(3);
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(logError).toHaveBeenCalledTimes(0);
  });

  it("should complete gracefully if unzipping spa succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");
    mockSSHExec(false, "success");

    expect(await unzipOnRemote(config, "yolo.zip", true)).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);

    expect(exec).toHaveBeenCalledTimes(4);
    expect(dispose).toHaveBeenCalledTimes(1);

    expect(logError).toHaveBeenCalledTimes(0);
  });
});
