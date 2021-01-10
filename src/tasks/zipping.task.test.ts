import archiver from "archiver";
import events from "events";
import { createWriteStream, ensureDir } from "fs-extra";
import { PassThrough } from "stream";
import { mocked } from "ts-jest/utils";

import { assignConsoleMocks } from "../tests/mocking/console.mock";
import { Console } from "../util/console.util";
import { logError } from "../util/logging.util";
import { zip } from "./zipping.task";

jest.mock("fs-extra");
jest.mock("./../util/console.util");
jest.mock("archiver");
jest.mock("../util/logging.util");

class Archiver extends events.EventEmitter {
  constructor() {
    super();
  }

  directory: jest.Mock;
  pipe: jest.Mock;
  finalize: jest.Mock;
}

const ensureDirMock = mocked(ensureDir);
const createWriteStreamMock = mocked(createWriteStream);
const mockedArchiver = mocked(archiver);
const logErrorMock = mocked(logError);
assignConsoleMocks();

const consoleStart = "Zipping codebase";
const exceptionMessage = "Failed to zip codebase";

describe("Zipping tasks", () => {
  afterEach(() => {
    jest.resetAllMocks();
    mocked(Console.StartTask).mockReset();
    mocked(Console.Success).mockReset();
  });

  it("Should zip", async () => {
    const mockWriteable = new PassThrough();
    createWriteStreamMock.mockReturnValue(mockWriteable as any);
    setTimeout(() => {
      mockWriteable.emit("close");
    }, 100);
    const archiveMock = new Archiver();
    mocked(archiver).mockImplementationOnce(
      jest.fn().mockImplementation(() => {
        archiveMock.directory = jest.fn().mockImplementation(() => archiveMock);
        archiveMock.on = jest.fn().mockImplementation(() => archiveMock);
        archiveMock.pipe = jest.fn().mockImplementation(() => mockWriteable);
        archiveMock.finalize = jest.fn();
        return archiveMock;
      })
    );

    await zip("./dist", "./release/test.zip");

    expect(mockedArchiver).toHaveBeenCalledTimes(1);

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);
    expect(ensureDirMock).toHaveBeenCalledTimes(1);
    expect(createWriteStreamMock).toHaveBeenCalledTimes(1);

    expect(archiveMock.directory).toHaveBeenCalledTimes(1);
    expect(archiveMock.pipe).toHaveBeenCalledTimes(1);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith("Codebase zipping complete");

    expect(archiveMock.finalize).toHaveBeenCalledTimes(1);

    expect(logErrorMock).toHaveBeenCalledTimes(0);
  });

  it("should reject if stream is errored", async () => {
    const mockWriteable = new PassThrough();
    createWriteStreamMock.mockReturnValue(mockWriteable as any);
    setTimeout(() => {
      mockWriteable.emit("error");
    }, 100);
    const archiveMock = new Archiver();
    mocked(archiver).mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => {
        archiveMock.directory = jest.fn().mockImplementation(() => archiveMock);
        archiveMock.pipe = jest.fn().mockImplementation(() => mockWriteable);
        archiveMock.finalize = jest.fn();

        return archiveMock;
      })
    );
    try {
      await zip("./dist", "./release/test.zip");
    } catch (err) {
      expect(mockedArchiver).toHaveBeenCalledTimes(1);

      expect(Console.StartTask).toHaveBeenCalledTimes(1);
      expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);
      expect(ensureDirMock).toHaveBeenCalledTimes(1);
      expect(createWriteStreamMock).toHaveBeenCalledTimes(1);

      expect(archiveMock.directory).toHaveBeenCalledTimes(1);
      expect(archiveMock.pipe).toHaveBeenCalledTimes(1);

      expect(Console.Success).toHaveBeenCalledTimes(0);

      expect(archiveMock.finalize).toHaveBeenCalledTimes(1);

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(err).toEqual(exceptionMessage);
    }
  });

  it("should reject if archive is errored", async () => {
    const mockWriteable = new PassThrough();
    createWriteStreamMock.mockReturnValue(mockWriteable as any);
    const archiveMock = new Archiver();
    mocked(archiver).mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => {
        archiveMock.directory = jest.fn().mockImplementation(() => archiveMock);
        archiveMock.pipe = jest.fn().mockImplementation(() => mockWriteable);
        archiveMock.finalize = jest.fn();
        setTimeout(() => {
          archiveMock.emit("error");
        }, 100);
        return archiveMock;
      })
    );

    try {
      await zip("./dist", "./release/test.zip");
    } catch (err) {
      expect(mockedArchiver).toHaveBeenCalledTimes(1);

      expect(Console.StartTask).toHaveBeenCalledTimes(1);
      expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);
      expect(ensureDirMock).toHaveBeenCalledTimes(1);
      expect(createWriteStreamMock).toHaveBeenCalledTimes(1);

      expect(archiveMock.directory).toHaveBeenCalledTimes(1);
      expect(archiveMock.pipe).toHaveBeenCalledTimes(1);

      expect(Console.Success).toHaveBeenCalledTimes(0);

      expect(archiveMock.finalize).toHaveBeenCalledTimes(1);

      expect(logErrorMock).toHaveBeenCalledTimes(1);
      expect(err).toEqual(exceptionMessage);
    }
  });
});
