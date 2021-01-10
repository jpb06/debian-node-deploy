let execCommand = jest.fn();
const dispose = jest.fn();
const connectMock = jest.fn().mockImplementation(() => {
  return {
    execCommand,
    dispose,
  } as any;
});

jest.mock("node-ssh", () =>
  jest.fn().mockImplementation(() => ({
    connect: connectMock,
  }))
);

import { mockDoubleExecCommand, mockExecCommand } from "../tests/mocking/ssh.exec.command.mock";
import { connect, exec } from "./ssh.util";

const config = {
  appName: "test",
  host: "127.0.0.1",
  port: 22,
  user: "user",
  sshKey: "key",
  filesRestoryPath: "/var/repository",
  deployPath: "/var/deploy",
  appPreStopCommands: [],
  appPostStopCommands: [],
  appPreStartCommands: [],
  appPostStartCommands: [],
};

describe("SSH utils", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should connect", async () => {
    execCommand = mockExecCommand();

    await connect(config);

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledWith({
      host: config.host,
      port: config.port,
      username: config.user,
      privateKey: config.sshKey,
    });
  });

  it("should get the result code when the initial command doesn't give one", async () => {
    execCommand = mockDoubleExecCommand("result", "error");

    const connection = await connect(config);
    const result = await exec(connection, "yolo");

    expect(result).toStrictEqual({
      code: 1,
      err: "error",
      out: "result",
    });
  });

  it("should return the initial command result code if it has one", async () => {
    execCommand = mockExecCommand(0, "Success");

    const connection = await connect(config);
    const result = await exec(connection, "yolo");

    expect(result).toStrictEqual({
      code: 0,
      err: "",
      out: "Success",
    });
  });
});
