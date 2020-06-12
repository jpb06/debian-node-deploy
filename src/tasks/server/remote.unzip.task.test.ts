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
  mockSSHConnectWithThreeCommands,
} from "./../../tests/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/console.mock";
import { unzipOnRemote } from "./remote.unzip.task";

assignConsoleMocks();

describe("Remote unzip task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnectWithThreeCommands(undefined, "command 1 error", 1, true);

    try {
      await unzipOnRemote(config, "yolo.zip");
    } catch (err) {
      expect(err).toBe("Unable to unzip the deployment archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Unzipping files"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(
      1,
      new Error("Connection failed")
    );
    expect(mocked(dispose)).toBeCalledTimes(0);
    expect(mocked(execCommand)).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the cleanup command failed", async () => {
    mockSSHConnectWithThreeCommands(undefined, "command 1 error", 1);

    try {
      await unzipOnRemote(config, "yolo.zip");
    } catch (err) {
      expect(err).toBe("Unable to unzip the deployment archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Unzipping files"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 1 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(execCommand)).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the unzip command failed", async () => {
    mockSSHConnectWithThreeCommands(undefined, "command 2 error", 2);

    try {
      await unzipOnRemote(config, "yolo.zip");
    } catch (err) {
      expect(err).toBe("Unable to unzip the deployment archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Unzipping files"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 2 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(execCommand)).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if the chown command failed", async () => {
    mockSSHConnectWithThreeCommands(undefined, "command 3 error", 3);

    try {
      await unzipOnRemote(config, "yolo.zip");
    } catch (err) {
      expect(err).toBe("Unable to unzip the deployment archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Unzipping files"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(1, "command 3 error");
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(execCommand)).toHaveBeenCalledTimes(3);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnectWithThreeCommands("Success");

    expect(await unzipOnRemote(config, "yolo.zip")).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Unzipping files"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Archive unzipped on deploy server"
    );

    expect(mocked(execCommand)).toHaveBeenCalledTimes(3);
    expect(mocked(dispose)).toBeCalledTimes(1);

    expect(mocked(logError)).toBeCalledTimes(0);
  });
});
