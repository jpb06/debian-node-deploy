jest.mock("fs-extra");
jest.mock("ajv");
jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");

import { Console } from "./../../util/console.util";
import { mocked } from "ts-jest/utils";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { logError } from "../../util/logging.util";
import { pathExists, readJSON } from "fs-extra";
import { loadDeployConfig } from "./load.deploy.config.task";
import Ajv from "ajv";

assignConsoleMocks();

describe("Load deploy config task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the path doen't exist", async () => {
    mocked(pathExists).mockImplementationOnce(() => false);

    try {
      await loadDeployConfig("yolo");
    } catch (err) {
      expect(err).toBe("deploy.config.json file is Missing");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Validating deploy config"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
      "deploy.config.json file is Missing"
    );
  });

  it("should throw an error if config is invalid", async () => {
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
      expect(err).toBe("Invalid deploy config");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Validating deploy config"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenNthCalledWith(
      1,
      "Deploy configuration could not be validated:"
    );
    expect(mocked(logError)).toHaveBeenNthCalledWith(
      2,
      'Errors:[{"keyword":"yo","dataPath":"hm","schemaPath":"arg","params":{"keyword":"yolo"}}]'
    );
    expect(mocked(logError)).toHaveBeenNthCalledWith(
      3,
      "Invalid deploy config"
    );
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Validating deploy config"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Deploy config validated"
    );

    expect(mocked(logError)).toHaveBeenCalledTimes(0);
  });
});
