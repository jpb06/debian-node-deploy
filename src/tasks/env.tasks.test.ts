jest.mock("fs-extra");
jest.mock("./../util/console.util");

import { copyFile, appendFile } from "fs-extra";
import { Console } from "./../util/console.util";
import { mocked } from "ts-jest/utils";
import { setEnv } from "./env.tasks";
import { assignConsoleMocks } from "../tests/mocking/console.mock";

const copyFileMock = mocked(copyFile);
const appendFileMock = mocked(appendFile);
assignConsoleMocks();

describe("Env tasks", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shouldn't do anything if passed undefined", async () => {
    await setEnv(undefined);

    expect(copyFileMock.mock.calls).toHaveLength(0);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(0);
  });

  it("should't do anything if passed a file that isn't an env file", async () => {
    await setEnv("yolo.jpeg");

    expect(copyFileMock.mock.calls).toHaveLength(0);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(0);
  });

  it("should initialize env", async () => {
    await setEnv("dev.env");

    expect(copyFileMock.mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Setting up env"
    );
    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Env setup complete"
    );
  });
});

describe("Env tasks", () => {
  beforeAll(() => {
    copyFileMock.mockImplementation(() =>
      Promise.reject(new Error("File not found"))
    );
  });

  afterAll(() => {
    copyFileMock.mockReset();
  });

  it("should throw a string if file is not found", async () => {
    try {
      await setEnv("notfound.env");
    } catch (err) {
      expect(err).toEqual("Env setup failure");
      expect(copyFileMock.mock.calls).toHaveLength(1);
      expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
      expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
        "Setting up env"
      );
      expect(mocked(Console.Success).mock.calls).toHaveLength(0);
      expect(appendFileMock.mock.calls).toHaveLength(1);
    }
  });
});
