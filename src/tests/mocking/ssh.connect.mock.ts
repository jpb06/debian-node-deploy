/* istanbul ignore file */
jest.mock("../../util/ssh.util");

import { connect } from "../../util/ssh.util";
import { DeployConfig } from "../../types/deploy.config";
import { mocked } from "ts-jest/utils";

export const dispose = jest.fn();
export const mkdir = jest.fn();
export const putFile = jest.fn();

export const mockSSHConnect = (
  shouldThrow: boolean,
  mkdirShouldThrow: boolean = false,
  putFileShouldThrow: boolean = false
) => {
  if (shouldThrow) {
    mocked(connect).mockRejectedValueOnce(new Error("Connection failed"));
  } else {
    mocked(connect).mockImplementationOnce((config: DeployConfig) => {
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
