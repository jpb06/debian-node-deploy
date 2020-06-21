jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("fs-extra");

import { Console } from "./../../util/console.util";
import { mocked } from "ts-jest/utils";
import { loadPackageFile } from "./load.package.file.task";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { logError } from "../../util/logging.util";
import { pathExists, readJSON } from "fs-extra";

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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);
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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(consoleSuccess);
  });
});
