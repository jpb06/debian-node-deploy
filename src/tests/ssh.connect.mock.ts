import { connect } from "../util/ssh.util";
import { DeployConfig } from "../types/deploy.config";
import { mocked } from "ts-jest/utils";

export const execCommand = jest.fn();
export const dispose = jest.fn();
export const mkdir = jest.fn();
export const putFile = jest.fn();

export const mockSSHConnect = (
  stdout?: string,
  stderr?: string,
  connectionShouldThrow?: boolean
) => {
  execCommand.mockImplementation(() => {
    return {
      code: stderr ? 1 : 0,
      stderr,
      stdout,
    };
  });

  if (connectionShouldThrow) {
    mocked(connect).mockRejectedValueOnce(new Error("Connection failed"));
  } else {
    mocked(connect).mockImplementation((config: DeployConfig) => {
      return {
        execCommand,
        dispose,
        mkdir,
        putFile,
      } as any;
    });
  }
};

export const mockSSHConnectForArchiveSending = (
  mkdirShouldThrow: boolean,
  putFileShouldThrow: boolean,
  connectionShouldThrow?: boolean
) => {
  if (connectionShouldThrow) {
    mocked(connect).mockRejectedValueOnce(new Error("Connection failed"));
  } else {
    mocked(connect).mockImplementation((config: DeployConfig) => {
      return {
        dispose,
        mkdir: mkdirShouldThrow
          ? mkdir.mockRejectedValue("mkdir error")
          : mkdir,
        putFile: putFileShouldThrow
          ? putFile.mockRejectedValue("putFile error")
          : putFile,
      } as any;
    });
  }
};

export const mockSSHConnectWithThreeCommands = (
  stdout?: string,
  stderr?: string,
  failureAt?: number,
  connectionShouldThrow?: boolean
) => {
  execCommand
    .mockImplementationOnce(() => {
      return {
        code: failureAt === 1 ? 1 : 0,
        stderr: failureAt === 1 ? stderr : undefined,
        stdout,
      };
    })
    .mockImplementationOnce(() => {
      return {
        code: failureAt === 2 ? 1 : 0,
        stderr: failureAt === 2 ? stderr : undefined,
        stdout,
      };
    })
    .mockImplementationOnce(() => {
      return {
        code: failureAt === 3 ? 1 : 0,
        stderr: failureAt === 3 ? stderr : undefined,
        stdout,
      };
    });

  if (connectionShouldThrow) {
    mocked(connect).mockRejectedValueOnce(new Error("Connection failed"));
  } else {
    mocked(connect).mockImplementation((config: DeployConfig) => {
      return {
        execCommand,
        dispose,
      } as any;
    });
  }
};

export const mockSSHConnectForAppStop = () => {
  execCommand.mockImplementationOnce(() => {
    return {
      code: 0,
      stderr: undefined,
      stdout: "",
    };
  });

  mocked(connect).mockImplementation((config: DeployConfig) => {
    return {
      execCommand,
      dispose,
      mkdir,
      putFile,
    } as any;
  });
};
