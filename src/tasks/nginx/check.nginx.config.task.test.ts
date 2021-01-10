jest.mock("fs-extra");
jest.mock("ajv");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { pathExists } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { checkNginxConfig } from "./check.nginx.config.task";

assignConsoleMocks();

const consoleStart = "Checking Nginx config";

describe("Check Nginx config task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the path doen't exist", async () => {
    mocked(pathExists).mockImplementationOnce(() => false);

    try {
      await checkNginxConfig();
    } catch (err) {
      expect(err).toBe("Missing Nginx config (nginx.config)");
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith("nginx.config file is Missing");
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);

    await checkNginxConfig();

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith("Nginx config checked");

    expect(logError).toHaveBeenCalledTimes(0);
  });
});
