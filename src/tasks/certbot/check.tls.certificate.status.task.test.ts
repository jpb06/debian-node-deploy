import { assignConsoleMocks } from "../../tests/mocking/console.mock";
import { dispose, mockSSHConnect } from "../../tests/mocking/ssh.connect.mock";
import { mockSSHExec } from "../../tests/mocking/ssh.exec.mock";
import { config } from "../../tests/test.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
import { tlsCertificateExists } from "./check.tls.certificate.status.task";

jest.mock("./../../util/console.util");
jest.mock("../../util/logging.util");
jest.mock("../../util/ssh.util");

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

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(0);
  });

  it("should throw an error if the command failed (exception)", async () => {
    mockSSHConnect(false);
    mockSSHExec(true);

    try {
      await tlsCertificateExists(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if the command failed (invalid error code)", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "", "Command error");

    try {
      await tlsCertificateExists(config);
    } catch (err) {
      expect(err).toBe(exceptionMessage);
    }

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(0);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith("Command error");
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should return false if no certificate could be found", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "Certificate Name: Yolo");

    const result = await tlsCertificateExists(config);
    expect(result).toBe(false);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(
      consoleSuccessCertificateNotFound
    );

    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("should return true if a certificate could be found", async () => {
    mockSSHConnect(false);
    mockSSHExec(false, "Certificate Name: testdomain.com");

    const result = await tlsCertificateExists(config);
    expect(result).toBe(true);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledTimes(1);
    expect(Console.StartTask).toHaveBeenCalledWith(consoleStart);

    expect(Console.Success).toHaveBeenCalledTimes(1);
    expect(Console.Success).toHaveBeenCalledWith(
      consoleSuccessCertificatefound
    );

    expect(exec).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
