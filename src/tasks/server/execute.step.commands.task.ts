import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect, exec } from "../../util/ssh.util";
import { DeployStep } from "../../types/deploy.step";
import { getCommandsFor } from "../../config/get.commands";

export const execCommands = async (
  config: DeployConfig,
  step: DeployStep
): Promise<void> => {
  const context = getCommandsFor(step, config);
  if (context.commands.length === 0) return;

  Console.StartTask(context.startText);

  let connection = undefined;
  try {
    connection = await connect(config);

    for (const command in context.commands) {
      const result = await exec(connection, command);
      if (result.code !== 0) throw result.err;
    }

    Console.Success(context.successTest);
  } catch (err) {
    await logError(err);
    throw context.errorText;
  } finally {
    if (connection) connection.dispose();
  }
};
