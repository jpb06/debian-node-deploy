jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("fs-extra");

import { Console } from "./../../util/console.util";
import { mocked } from "ts-jest/utils";
import { loadPackageFile } from "./load.package.file.task";
import { assignConsoleMocks } from "../../tests/console.mock";
import { logError } from "../../util/logging.util";
import { pathExists, readJSON } from "fs-extra";

assignConsoleMocks();

describe("Load package task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the path doen't exist", async () => {
    mocked(pathExists).mockImplementationOnce(() => false);

    try {
      await loadPackageFile();
    } catch (err) {
      expect(err).toBe("The package.json file could not be located");
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Checking package.json"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
      "The package.json file could not be located"
    );
  });

  it("should throw an error if package.json is missing properties", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my great package",
        version: "1.0.0",
      };
    });

    try {
      await loadPackageFile();
    } catch (err) {
      expect(err).toBe(
        "the package.json file has missing properties: name, version and main must be defined."
      );
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Checking package.json"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(
      "the package.json file has missing properties: name, version and main must be defined."
    );
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(pathExists).mockImplementationOnce(() => true);
    mocked(readJSON).mockImplementationOnce(() => {
      return {
        name: "my great package",
        version: "1.0.0",
        main: "Yolo",
      };
    });

    expect(await loadPackageFile()).resolves;

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Checking package.json"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "package.json content extracted"
    );
  });
});
