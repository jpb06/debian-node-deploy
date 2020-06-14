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

import { connect, exec } from "./ssh.util";
import {
  mockExecCommand,
  mockDoubleExecCommand,
} from "../tests/mocking/ssh.exec.command.mock";

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

    expect(connectMock.mock.calls).toHaveLength(1);
    expect(connectMock.mock.calls[0][0]).toEqual({
      host: config.host,
      port: config.port,
      username: config.user,
      privateKey: config.sshKey,
    });
  });

  it("should get the result code when the initial command doesn't give one", async () => {
    execCommand = mockDoubleExecCommand();

    const connection = await connect(config);
    await exec(connection, "yolo");
  });

  it("should return the initial command result code if it has one", async () => {
    execCommand = mockExecCommand(0, "Success");

    const connection = await connect(config);
    await exec(connection, "yolo");
  });
});
