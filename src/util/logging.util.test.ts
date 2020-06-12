jest.mock("fs-extra");

import { remove, appendFile } from "fs-extra";
import { resetErrorLogs, logError } from "./logging.util";
import { mocked } from "ts-jest/utils";

const removeMock = mocked(remove);
const appendFileMock = mocked(appendFile);

describe("Logging utils", () => {
  afterEach(() => {
    jest.resetAllMocks();
    appendFileMock.mockReset();
  });

  it("should clear logs", () => {
    resetErrorLogs();

    expect(removeMock.mock.calls).toHaveLength(1);
    expect(removeMock.mock.calls[0][0]).toEqual("./deploy-errors.log");
  });
  it("should log stats (yep)", () => {
    logError("yolo");

    expect(appendFileMock.mock.calls).toHaveLength(1);
    expect(appendFileMock.mock.calls[0][0]).toEqual("./deploy-errors.log");
    expect(appendFileMock.mock.calls[0][1]).toEqual("yolo\n");
  });

  it("shouldn't do anything if passed undefined", () => {
    logError(undefined);

    expect(appendFileMock.mock.calls).toHaveLength(0);
  });
});
