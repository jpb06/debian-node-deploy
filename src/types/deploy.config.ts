export interface DeployConfig {
  appName: string;
  envFile?: string;
  host: string;
  port: number;
  user: string;
  sshKey: string;
  filesRestoryPath: string;
  deployPath: string;
  appPreStopCommands: Array<string>;
  appPostStopCommands: Array<string>;
  appPreStartCommands: Array<string>;
  appPostStartCommands: Array<string>;
}
