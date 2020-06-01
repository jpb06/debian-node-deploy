import fs from "fs-extra";

const errorLogsPath = "./deploy-errors.log";

export const resetErrorLogs = async () => await fs.remove(errorLogsPath);

export const logError = async (err: any) =>
  await fs.appendFile(errorLogsPath, `${err}\n`);
