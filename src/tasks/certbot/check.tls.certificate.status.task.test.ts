jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

import { mocked } from "ts-jest/utils";
import { Console } from "../../util/console.util";
import { connect, exec } from "../../util/ssh.util";
import { logError } from "../../util/logging.util";
import { config } from "../../tests/test.config";
import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { mockSSHConnect, dispose } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { tlsCertificateExists } from "./check.tls.certificate.status.task";

assignConsoleMocks();

const consoleStart = "Checking TLS certificate ...";
const consoleSuccessCertificatefound = "TLS certificate found";
const consoleSuccessCertificateNotFound = "No TLS certificate found";
const exceptionMessage = "Failed to check TLS certificate";

describe("Check TLS certificate status task", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if connection failed", async () => {
    mockSSHConnect(true);

    try {
      await tlsCertificateExists(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(0);
  });

  it("should throw an error if the command failed (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await tlsCertificateExists(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalled();
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should throw an error if the command failed (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "Command error");

    try {
      await tlsCertificateExists(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(0);
    expect(mocked(logError)).toHaveBeenCalledWith("Command error");
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should return false if no certificate could be found", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "Certificate Name: Yolo");

    const result = await tlsCertificateExists(config);
    expect(result).toBe(false);

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      consoleSuccessCertificateNotFound
    );

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });

  it("should return true if a certificate could be found", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "Certificate Name: testdomain.com");

    const result = await tlsCertificateExists(config);
    expect(result).toBe(true);

    expect(mocked(connect).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls).toHaveLength(1);
    expect(mocked(Console.StartTask).mock.calls[0][0]).toEqual(consoleStart);

    expect(mocked(Console.Success).mock.calls).toHaveLength(1);
    expect(mocked(Console.Success).mock.calls[0][0]).toEqual(
      consoleSuccessCertificatefound
    );

    expect(mocked(exec)).toHaveBeenCalledTimes(1);
    expect(mocked(dispose)).toBeCalledTimes(1);
  });
});
