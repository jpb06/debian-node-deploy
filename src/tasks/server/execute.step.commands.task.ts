import { DeployConfig } from "../../types/deploy.config";
import { Console } from "../../util/console.util";
import { logError } from "../../util/logging.util";
import { connect } from "../../util/ssh.util";
import { DeployStep } from "../../types/deploy.step";
import { getCommandsFor } from "../../config/get.commands";

export const execCommands = async (
  config: DeployConfig,
  step: DeployStep
): Promise<void> => {
  const context = getCommandsFor(step, config);
  if (context.commands.length === 0) return;

  Console.StartTask(context.startText);

  try {
    const connection = await connect(config);

    for (const command in context.commands) {
      const result = await connection.execCommand(command);
      await logError(result.stderr);
    }

    Console.Success(context.successTest);
    connection.dispose();
  } catch (err) {
    await logError(err);
    throw context.errorText;
  }
};
