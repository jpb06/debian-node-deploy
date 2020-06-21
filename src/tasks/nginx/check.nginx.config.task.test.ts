jest.mock("fs-extra");
jest.mock("ajv");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { mocked } from "ts-jest/utils";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { logError } from "../../util/logging.util";
import { pathExists, readJSON } from "fs-extra";
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
      "nginx.config file is Missing"
    );
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);

    await checkNginxConfig();

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Nginx config checked"
    );

    expect(mocked(logError)).toHaveBeenCalledTimes(0);
  });
});
