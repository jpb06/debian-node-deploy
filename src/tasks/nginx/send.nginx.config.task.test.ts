jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

import { mocked } from "ts-jest/utils";
import { Console } from "../../util/console.util";
import { connect, exec } from "../../util/ssh.util";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import {
  mockSSHConnect,
  dispose,
  putFile,
} from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { sendNginxConfigToDeployServer } from "./send.nginx.config.task";

assignConsoleMocks();

const consoleStart = "Sending Nginx config to deploy server";
const consoleSuccess = "Nginx config set up on deploy server";
const exceptionMessage = "An error occured while setting up Nginx config";

describe("Reloading nginx task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await sendNginxConfigToDeployServer(config);
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
      await sendNginxConfigToDeployServer(config);
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
      await sendNginxConfigToDeployServer(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith("Command error");
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if the putFile command failed", async () => {
    mockSSHConnect(false, false, true);
    mockSSHExec(false, "stdout");

    try {
      await sendNginxConfigToDeployServer(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);

    expect(mocked(logError)).toHaveBeenCalledWith("putFile error");
    expect(mocked(putFile)).toHaveBeenCalledTimes(1);
    expect(mocked(exec)).toHaveBeenCalledTimes(0);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "stdout");

    expect(await sendNginxConfigToDeployServer(config)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);

    expect(mocked(putFile)).toHaveBeenCalledTimes(1);
    expect(mocked(exec)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
