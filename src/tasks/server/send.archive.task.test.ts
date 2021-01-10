jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mkdir, mockSSHConnect, putFile } from "../../tests/mocking/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";
import { sendFileToDeployServer } from "./send.archive.task";

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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();

    expect(mkdir).toHaveBeenCalledTimes(0);
    expect(putFile).toHaveBeenCalledTimes(0);
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should throw if mkdir failed", async () => {
    mockSSHConnect(false, true);

    try {
      await sendFileToDeployServer(config, "source.zip");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();

    expect(mkdir).toHaveBeenCalled();
    expect(putFile).toHaveBeenCalledTimes(0);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should throw if putFile failed", async () => {
    mockSSHConnect(false, false, true);

    try {
      await sendFileToDeployServer(config, "source.zip");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();

    expect(mkdir).toHaveBeenCalledTimes(1);
    expect(putFile).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false, false, false);

    expect(await sendFileToDeployServer(config, "source.zip")).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(
      "Archive uploaded to deploy server"
    );

    expect(logError).toHaveBeenCalledTimes(0);

    expect(mkdir).toHaveBeenCalledTimes(1);
    expect(putFile).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
