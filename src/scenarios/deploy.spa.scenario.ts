import { resetErrorLogs } from "../util/logging.util";
import { Console } from "../util/console.util";
import { checkNginxConfig } from "../tasks/nginx/check.nginx.config.task";
import { loadPackageFile } from "../tasks/config/load.package.file.task";
import { loadDeployConfig } from "../tasks/config/load.deploy.config.task";
import { zip } from "../tasks/zipping.task";
import { sendFileToDeployServer } from "../tasks/server/send.archive.task";
import { unzipOnRemote } from "../tasks/server/remote.unzip.task";
import { sendNginxConfigToDeployServer } from "../tasks/nginx/send.nginx.config.task";
import { enableNginxSite } from "../tasks/nginx/enable.nginx.site.task";
import { tlsCertificateExists } from "../tasks/certbot/check.tls.certificate.status.task";
import { setTlsCertificate } from "../tasks/certbot/set.tls.certificate.task";
import { reloadNginx } from "../tasks/nginx/reload.nginx.task";

export const deploySinglePageApplication = async (): Promise<void> => {
  await resetErrorLogs();
  Console.Initialize();
  try {
    Console.NewSection("Checking deploy configuration");

    await checkNginxConfig();
    const packageFile = await loadPackageFile(true);
    const config = await loadDeployConfig(packageFile.name);

    Console.NewSection("Moving single page application files");

    const archiveFileName = `${config.appName}_${packageFile.version}.zip`;
    await zip("./build", `./release/${archiveFileName}`);

    await sendFileToDeployServer(config, archiveFileName);

    Console.NewSection("Configuring TLS");

    const certificatesExists = await tlsCertificateExists(config);
    if (!certificatesExists) {
      await setTlsCertificate(config);
    }

    Console.NewSection(`Deploying ${config.appName}`);

    await sendNginxConfigToDeployServer(config);
    await unzipOnRemote(config, archiveFileName, true);
    await enableNginxSite(config);
    await reloadNginx(config);

    Console.End(true);
    process.exit(0);
  } catch (err) {
    Console.Failure(err);
    process.exit(1);
  }
};
