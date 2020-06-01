export interface DeployConfig {
  appName: string;
  envFile?: string;
  host: string;
  port: number;
  user: string;
  sshKey: string;
  filesRestoryPath: string;
  deployPath: string;
  appStopCommands: Array<string>;
  appStartCommands: Array<string>;
}
