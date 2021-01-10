jest.mock("fs-extra");

import { appendFile, remove } from "fs-extra";
import { mocked } from "ts-jest/utils";

import { logError, resetErrorLogs } from "./logging.util";

const removeMock = mocked(remove);
const appendFileMock = mocked(appendFile);

describe("Logging utils", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should clear logs", () => {
    resetErrorLogs();

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith("./deploy-errors.log");
  });
  it("should log stats (yep)", () => {
    logError("yolo");

    expect(removeMock).toHaveBeenCalledTimes(0);
    expect(appendFileMock).toHaveBeenCalledTimes(1);
    expect(appendFileMock).toHaveBeenCalledWith(
      "./deploy-errors.log",
      "yolo\n"
    );
  });

  it("shouldn't do anything if passed undefined", () => {
    logError(undefined);

    expect(appendFileMock).toHaveBeenCalledTimes(0);
  });
});
