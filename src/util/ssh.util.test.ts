const connectMock = jest.fn();
jest.mock("node-ssh", () => {
  return jest.fn().mockImplementation(() => {
    return {
      connect: connectMock,
    };
  });
});

import { connect } from "./ssh.util";

describe("SSH utils", () => {
  it("should connect", async () => {
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

    await connect(config);

    expect(connectMock.mock.calls).toHaveLength(1);
    expect(connectMock.mock.calls[0][0]).toEqual({
      host: config.host,
      port: config.port,
      username: config.user,
      privateKey: config.sshKey,
    });
  });
});
