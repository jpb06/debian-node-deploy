jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mockSSHConnect } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { config } from "../../tests/test.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
import { enableNginxSite } from "./enable.nginx.site.task";

assignConsoleMocks();

const consoleStart = "Enabling site on Nginx";
const consoleSuccess = "Site enabled";
const exceptionMessage = "Failed to enable the site";

describe("Enabling nginx site task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await enableNginxSite(config);
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
      await enableNginxSite(config);
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
      await enableNginxSite(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith("Command error");
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should complete gracefully if task succeeds", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "stdout");

    expect(await enableNginxSite(config)).resolves;

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toBeCalledTimes(1);
  });
});
