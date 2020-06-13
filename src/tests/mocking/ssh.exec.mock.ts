jest.mock("../../util/ssh.util");

import { mocked } from "ts-jest/utils";
import { exec } from "../../util/ssh.util";
import NodeSSH from "node-ssh";

export const mockSSHExec = (
  shouldThrow: boolean,
  stdOut: string = "",
  stdErr: string = ""
) => {
  const mock = mocked(exec);

  if (shouldThrow) {
    mock.mockRejectedValueOnce(new Error("Execution error"));
  } else {
    mock.mockImplementationOnce(
      async (connection: NodeSSH, command: string, option?: any) => ({
        code: stdErr.length === 0 ? 0 : 1,
        err: stdErr,
        out: stdOut,
      })
    );
  }
};
