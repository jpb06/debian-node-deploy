jest.mock("fs-extra");
jest.mock("ajv");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import Ajv from "ajv";
import { pathExists, readJSON } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { loadDeployConfig } from "./load.deploy.config.task";

assignConsoleMocks();

const consoleStart = "Validating deploy config";
const consoleSuccess = "Deploy config validated";
const exceptionMessage = "deploy.config.json file is Missing";

describe("Load deploy config task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the path doen't exist", async () => {
    mocked(pathExists).mockImplementationOnce(() => false);

    try {
      await loadDeployConfig("yolo");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(exceptionMessage);
  });

  it("should throw an error if config is invalid", async () => {
    const exceptionMessage = "Invalid deploy config";

    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(Ajv).mockReturnValueOnce({
      ...new Ajv(),
      compile: jest.fn().mockImplementationOnce(() => {
        const validate = (data: any) => false;
        validate.errors = [
          {
            keyword: "yo",
            dataPath: "hm",
            schemaPath: "arg",
            params: { keyword: "yolo" },
          },
        ];
        return validate;
      }),
    });

    try {
      await loadDeployConfig("yolo");
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenNthCalledWith(
      1,
      "Deploy configuration could not be validated:"
    );
    expect(logError).toHaveBeenNthCalledWith(
      2,
      'Errors:[{"keyword":"yo","dataPath":"hm","schemaPath":"arg","params":{"keyword":"yolo"}}]'
    );
    expect(logError).toHaveBeenNthCalledWith(3, exceptionMessage);
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(Ajv).mockReturnValueOnce({
      ...new Ajv(),
      compile: jest.fn().mockImplementationOnce(() => (data: any) => true),
    });
    mocked(readJSON).mockImplementationOnce(async (path: string) => ({
      envFile: ".yolo.env",
      host: "192.168.0.1",
      port: 22,
      user: "user",
      sshKey: "/path/to/key",
      filesRestoryPath: "/path/to/repo",
      deployPath: "/var/deploy",
      appPreStopCommands: [],
      appPostStopCommands: [],
      appPreStartCommands: [],
      appPostStartCommands: [],
    }));

    const data = await loadDeployConfig("yolo");
    expect(data).toStrictEqual({
      envFile: ".yolo.env",
      host: "192.168.0.1",
      port: 22,
      user: "user",
      sshKey: "/path/to/key",
      filesRestoryPath: "/path/to/repo",
      deployPath: "/var/deploy",
      appPreStopCommands: [],
      appPostStopCommands: [],
      appPreStartCommands: [],
      appPostStartCommands: [],
      appName: "yolo",
    });

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);

    expect(logError).toHaveBeenCalledTimes(0);
  });
});
