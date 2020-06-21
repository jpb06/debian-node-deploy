jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { sendFileToDeployServer } from "./send.archive.task";
import {
  mockSSHConnect,
  mkdir,
  putFile,
  dispose,
} from "../../tests/mocking/ssh.connect.mock";

assignConsoleMocks();

const consoleStart = "Sending the archive to deploy server";
const exceptionMessage = "Unable to send the archive";

describe("Send archive task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await sendFileToDeployServer(config, "source.zip");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toBeCalledTimes(0);
    expect(mocked(putFile)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw if mkdir failed", async () => {
    mockSSHConnect(false, true);

    try {
      await sendFileToDeployServer(config, "source.zip");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toHaveBeenCalled();
    expect(mocked(putFile)).toBeCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw if putFile failed", async () => {
    mockSSHConnect(false, false, true);

    try {
      await sendFileToDeployServer(config, "source.zip");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();

    expect(mocked(mkdir)).toBeCalledTimes(1);
    expect(mocked(putFile)).toBeCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false, false, false);

    expect(await sendFileToDeployServer(config, "source.zip")).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

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
