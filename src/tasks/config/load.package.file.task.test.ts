jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("fs-extra");

import { pathExists, readJSON } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { loadPackageFile } from "./load.package.file.task";

assignConsoleMocks();

const consoleStart = "Checking package.json";
const consoleSuccess = "package.json content extracted";

describe("Load package task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the path doen't exist", async () => {
    mocked(pathExists).mockImplementationOnce(() => false);

    try {
      await loadPackageFile(false);
    } catch (err) {
      expect(err).toBe("The package.json file could not be located");
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(
      "The package.json file could not be located"
    );
  });

  it("should throw an error if package.json is missing properties and we're deploying a node app", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my great package",
        version: "1.0.0",
      };
    });

    try {
      await loadPackageFile(false);
    } catch (err) {
      expect(err).toBe(
        "the package.json file has missing properties: name, version and main must be defined."
      );
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(
      "the package.json file has missing properties: name, version and main must be defined."
    );
  });

  it("should throw an error if package.json is missing properties and we're deploying a spa", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my spa",
      };
    });

    try {
      await loadPackageFile(true);
    } catch (err) {
      expect(err).toBe(
        "the package.json file has missing properties: name and version must be defined."
      );
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(
      "the package.json file has missing properties: name and version must be defined."
    );
  });

  it("should complete gracefully if task succeeds and we're deploying a node app", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my great package",
        version: "1.0.0",
        main: "Yolo",
      };
    });

    expect(await loadPackageFile(false)).resolves;

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);
  });

  it("should complete gracefully if task succeeds and we're deploying a spa", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my great package",
        version: "1.0.0",
      };
    });

    expect(await loadPackageFile(true)).resolves;

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(consoleSuccess);
  });
});
