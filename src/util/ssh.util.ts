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
