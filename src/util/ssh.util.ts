import NodeSSH from "node-ssh";

import { DeployConfig } from "../types/deploy.config";

const ssh = new NodeSSH();

export const connect = async (config: DeployConfig) => {
  const connection = await ssh.connect({
    host: config.host,
    port: config.port,
    username: config.user,
    privateKey: config.sshKey,
  });

  return connection;
};

export const exec = async (
  connection: NodeSSH,
  command: string,
  options?: any
) => {
  const result = await connection.execCommand(command, options);
  if (result.code === null) {
    const echoResult = await connection.execCommand("echo $?");
    result.code = parseInt(echoResult.stdout, 10);
  }

  return {
    code: result.code,
    err: result.stderr,
    out: result.stdout,
  };
};
