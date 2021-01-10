jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("fs-extra");

import * as fs from "fs";
import { readFile, writeFile } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { generatePackage } from "./package.file.task";

assignConsoleMocks();

const consoleStart = "Generating bare package.json";

describe("Package file task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if the task failed", async () => {
    mocked(readFile).mockRejectedValueOnce(
      new Error("Read file error") as never
    );

    try {
      await generatePackage();
    } catch (err) {
      expect(err).toBe("package.json generation failed");
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(new Error("Read file error"));
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(readFile).mockReturnValueOnce(
      Promise.resolve(fs.readFileSync("./package.json"))
    );

    expect(await generatePackage()).resolves;

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith("package.json generated");

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(1);
  });
});
