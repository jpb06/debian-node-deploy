import events from "events";
import archiver from "archiver";
import { mocked } from "ts-jest/utils";
import { ensureDir, createWriteStream } from "fs-extra";
import { Console } from "./../util/console.util";
import { logError } from "../util/logging.util";
import { zip } from "./zipping.task";
import { PassThrough } from "stream";
import { assignConsoleMocks } from "../tests/console.mock";

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
assignConsoleMocks();

describe("Zipping tasks", () => {
  afterEach(() => {
    jest.resetAllMocks();
    mocked(Console.StartTask).mockReset();
    mocked(Console.Success).mockReset();
  });

  it("Should zip", async () => {
    const mockWriteable = new PassThrough();
    mocked(createWriteStream).mockReturnValue(mockWriteable as any);
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

    expect(mockedArchiver.mock.calls).toHaveLength(1);

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
      "Zipping codebase"
    );
    expect(ensureDirMock.mock.calls).toHaveLength(1);
    expect(createWriteStreamMock.mock.calls).toHaveLength(1);

    expect(archiveMock.directory.mock.calls).toHaveLength(1);
    expect(archiveMock.pipe.mock.calls).toHaveLength(1);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      "Codebase zipping complete"
    );

    expect(archiveMock.finalize.mock.calls).toHaveLength(1);
  });

  it("should reject if stream is errored", async () => {
    const mockWriteable = new PassThrough();
    mocked(createWriteStream).mockReturnValue(mockWriteable as any);
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
      expect(mockedArchiver.mock.calls).toHaveLength(1);

      expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
      expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
        "Zipping codebase"
      );
      expect(ensureDirMock.mock.calls).toHaveLength(1);
      expect(createWriteStreamMock.mock.calls).toHaveLength(1);

      expect(archiveMock.directory.mock.calls).toHaveLength(1);
      expect(archiveMock.pipe.mock.calls).toHaveLength(1);

      expect(mocked(Console.Success).mock.calls).toHaveLength(0);

      expect(archiveMock.finalize.mock.calls).toHaveLength(1);

      expect(mocked(logError).mock.calls).toHaveLength(1);
      expect(err).toEqual("Failed to zip codebase");
    }
  });

  it("should reject if archive is errored", async () => {
    const mockWriteable = new PassThrough();
    mocked(createWriteStream).mockReturnValue(mockWriteable as any);
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
      expect(mockedArchiver.mock.calls).toHaveLength(1);

      expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
      expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(
        "Zipping codebase"
      );
      expect(ensureDirMock.mock.calls).toHaveLength(1);
      expect(createWriteStreamMock.mock.calls).toHaveLength(1);

      expect(archiveMock.directory.mock.calls).toHaveLength(1);
      expect(archiveMock.pipe.mock.calls).toHaveLength(1);

      expect(mocked(Console.Success).mock.calls).toHaveLength(0);

      expect(archiveMock.finalize.mock.calls).toHaveLength(1);

      expect(mocked(logError).mock.calls).toHaveLength(1);
      expect(err).toEqual("Failed to zip codebase");
    }
  });
});
