jest.mock("../../util/ssh.util");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { connect } from "../../util/ssh.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { execNpmInstall } from "./install.app.task";
import {
  execCommand,
  dispose,
  mockSSHConnect,
} from "./../../tests/ssh.connect.mock";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/console.mock";

assignConsoleMocks();

describe("Install app task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(undefined, "Error!", true);

    try {
      await execNpmInstall(config);
    } catch (err) {
      expect(err).toBe("Failed to install node modules");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Running npm install ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if the command failed", async () => {
    mockSSHConnect(undefined, "Error!");

    try {
      await execNpmInstall(config);
    } catch (err) {
      expect(err).toBe("Failed to install node modules");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Running npm install ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should complete gracefully if command succeeds", async () => {
    mockSSHConnect("Success");

    expect(await execNpmInstall(config)).resolves;

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Running npm install ..."
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Node modules installed"
    );

    expect(mocked(execCommand)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
