jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import {
  dispose,
  mkdir,
  putFile,
  mockSSHConnectForArchiveSending,
} from "./../../tests/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/console.mock";
import { sendFileToDeployServer } from "./send.archive.task";

assignConsoleMocks();

describe("Send archive task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw if connection failed", async () => {
    mockSSHConnectForArchiveSending(true, false, true);

    try {
      await sendFileToDeployServer(config, "source.zip", "/var/dest");
    } catch (err) {
      expect(err).toBe("Unable to send the archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Sending the archive to deploy server"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toBeCalledTimes(0);
    expect(mocked(putFile)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw if mkdir failed", async () => {
    mockSSHConnectForArchiveSending(true, false);

    try {
      await sendFileToDeployServer(config, "source.zip", "/var/dest");
    } catch (err) {
      expect(err).toBe("Unable to send the archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Sending the archive to deploy server"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toHaveBeenCalled();
    expect(mocked(putFile)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw if putFile failed", async () => {
    mockSSHConnectForArchiveSending(false, true);

    try {
      await sendFileToDeployServer(config, "source.zip", "/var/dest");
    } catch (err) {
      expect(err).toBe("Unable to send the archive");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Sending the archive to deploy server"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toBeCalledTimes(1);
    expect(mocked(putFile)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnectForArchiveSending(false, false);

    expect(await sendFileToDeployServer(config, "source.zip", "/var/dest"))
      .resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Sending the archive to deploy server"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Archive uploaded to deploy server"
    );

    expect(mocked(logError)).toBeCalledTimes(0);

    expect(mocked(mkdir)).toBeCalledTimes(1);
    expect(mocked(putFile)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
