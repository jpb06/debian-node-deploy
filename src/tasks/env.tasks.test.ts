import { copyFile } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../tests/mocking/console.mock";
import { Console } from "../util/console.util";
import { setEnv } from "./env.tasks";

jest.mock("fs-extra");
jest.mock("./../util/console.util");

const copyFileMock = mocked(copyFile);
assignConsoleMocks();

const consoleStart = "Setting up env";

describe("Env tasks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shouldn't do anything if passed undefined", async () => {
    await setEnv((undefined as unknown) as string);

    expect(copyFileMock).toHaveBeenCalledTimes(0);
    expect(Console.StartTask).toHaveBeenCalledTimes(0);
  });

  it("should't do anything if passed a file that isn't an env file", async () => {
    await setEnv("yolo.jpeg");

    expect(copyFileMock).toHaveBeenCalledTimes(0);
    expect(Console.StartTask).toHaveBeenCalledTimes(0);
  });

  it("should initialize env", async () => {
    await setEnv("dev.env", `.env`);

    expect(copyFileMock).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);
    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith("Env setup complete");
  });

  it("should throw a string if file is not found", async () => {
    copyFileMock.mockRejectedValueOnce(new Error("File not found") as never);

    try {
      await setEnv("./dist", ".env.notFound");
    } catch (err) {
      expect(err).toEqual("Env setup failure");
      expect(copyFileMock).toHaveBeenCalledTimes(1);
      expect(Console.StartTask).toHaveBeenCalledTimes(1);
      expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);
      expect(Console.Success).toHaveBeenCalledTimes(0);
    }
  });
});
