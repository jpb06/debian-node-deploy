import fs from "fs-extra";
import archiver from "archiver";
import { Console } from "./../util/console.util";
import { logError } from "../util/logging.util";

export const zip = async (source: string, out: string): Promise<void> => {
  Console.StartTask("Zipping codebase");
  const archive = archiver("zip", { zlib: { level: 9 } });

  await fs.ensureDir("./release");

  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", async (err: any) => {
        await logError(err);
        reject("Failed to zip codebase");
      })
      .pipe(stream);

    stream.on("close", () => {
      Console.Success("Codebase zipping complete");
      resolve();
    });
    stream.on("error", async (err: any) => {
      await logError(err);
      reject("Failed to zip codebase");
    });

    archive.finalize();
  });
};
