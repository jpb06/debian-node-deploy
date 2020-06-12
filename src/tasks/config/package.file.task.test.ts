jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("fs-extra");

import { Console } from "./../../util/console.util";
import { mocked } from "ts-jest/utils";
import { logError } from "../../util/logging.util";
import { assignConsoleMocks } from "../../tests/console.mock";
import { generatePackage } from "./package.file.task";
import { readFile, writeFile } from "fs-extra";
import * as fs from "fs";

assignConsoleMocks();

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

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Generating bare package.json"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith(new Error("Read file error"));
  });

  it("should complete gracefully if task succeeds", async () => {
    mocked(readFile).mockReturnValueOnce(
      Promise.resolve(fs.readFileSync("./package.json"))
    );

    expect(await generatePackage()).resolves;

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Generating bare package.json"
    );

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "package.json generated"
    );

    expect(mocked(readFile)).toHaveBeenCalled();
    expect(mocked(writeFile)).toHaveBeenCalled();
  });
});
