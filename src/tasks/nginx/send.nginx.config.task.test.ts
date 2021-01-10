jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mockSSHConnect, putFile } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { config } from "../../tests/test.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the command failed (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await sendNginxConfigToDeployServer(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the command failed (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "Command error");

    try {
      await sendNginxConfigToDeployServer(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith("Command error");
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the putFile command failed", async () => {
    mockSSHConnect(false, false, true);
    mockSSHExec(false, "stdout");

    try {
      await sendNginxConfigToDeployServer(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);

    expect(logError).toHaveBeenCalledWith("putFile error");
    expect(putFile).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(0);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "stdout");

    expect(await sendNginxConfigToDeployServer(config)).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);

    expect(putFile).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
