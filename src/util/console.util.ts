import chalk from "chalk";
import ora from "ora";

enum TaskResult {
  Success,
  Failure,
  Info,
}

export abstract class Console {
  private static barColor = "white";
  private static taskBarColor = "orange";
  private static currentTask: ora.Ora | null = null;

  public static Initialize(
    text: string,
    barColor?: string,
    taskBarColor?: string
  ) {
    if (barColor) this.barColor = barColor;
    if (taskBarColor) this.taskBarColor = taskBarColor;

    console.info(chalk.bgKeyword(this.barColor)(" "));
    console.info(
      chalk.bgKeyword(this.barColor)(" ") +
        " " +
        chalk.keyword(this.taskBarColor).bold(text)
    );
    console.info(chalk.bgKeyword(this.barColor)(" "));
  }

  public static StartTask(taskDescription: string) {
    if (this.currentTask === null) {
      this.currentTask = ora({
        prefixText: chalk.bgKeyword(this.taskBarColor)(" "),
        spinner: "simpleDots",
        text: chalk.keyword("cyan").bold(taskDescription),
      }).start();
    }
  }

  private static EndTask(message: string, result: TaskResult) {
    if (this.currentTask) {
      switch (result) {
        case TaskResult.Success:
          this.currentTask.succeed(chalk.greenBright(message));
          break;
        case TaskResult.Failure:
          this.currentTask.fail(chalk.red(message));
          this.End(false);
          break;
        case TaskResult.Info:
          this.currentTask.warn(chalk.yellowBright(message));
          break;
      }

      this.currentTask = null;
    }
  }

  public static Success = (message: string) =>
    Console.EndTask(message, TaskResult.Success);
  public static Failure = (message: string) =>
    Console.EndTask(message, TaskResult.Failure);
  public static Info = (message: string) =>
    Console.EndTask(message, TaskResult.Info);

  public static End(succeeded: boolean) {
    console.info(chalk.bgKeyword(this.barColor)(" "));
    console.info(
      chalk.bgKeyword(this.barColor)(" ") +
        " " +
        chalk
          .keyword(this.taskBarColor)
          .bold(succeeded ? "Deploy complete!" : "Deploy failed.")
    );
    console.info(chalk.bgKeyword(this.barColor)(" "));
  }
}
