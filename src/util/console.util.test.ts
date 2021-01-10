import chalk from "chalk";
import ora from "ora";

import { Console } from "./console.util";

const succeedMock = jest.fn();
const warnMock = jest.fn();
const failMock = jest.fn();
const startMock = jest.fn().mockImplementation(() => {
  return {
    succeed: succeedMock,
    warn: warnMock,
    fail: failMock,
  };
});

jest.mock("ora", () => {
  return jest.fn().mockImplementation(() => {
    return {
      start: startMock,
    };
  });
});

describe("Console utils", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should have default colors", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const defaultBarColor = "white";
    const defaultTaskColor = "orange";
    const text = "Testing new section";

    Console.Initialize();
    Console.NewSection(text);
    expect(console.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledTimes(3);

    expect(spy).toHaveBeenNthCalledWith(
      1,
      chalk.bgKeyword(defaultBarColor)(" ")
    );
    expect(spy).toHaveBeenNthCalledWith(
      2,
      chalk.bgKeyword(defaultBarColor)(" ") +
        " " +
        chalk.keyword(defaultTaskColor).bold(text)
    );
    expect(spy).toHaveBeenNthCalledWith(
      3,
      chalk.bgKeyword(defaultBarColor)(" ")
    );
  });

  it("should have default colors even without calling initialize", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "orange";
    const text = "Testing new section";

    Console.NewSection(text);
    expect(console.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledTimes(3);

    expect(spy).toHaveBeenNthCalledWith(1, chalk.bgKeyword(barColor)(" "));
    expect(spy).toHaveBeenNthCalledWith(
      2,
      chalk.bgKeyword(barColor)(" ") + " " + chalk.keyword(taskColor).bold(text)
    );
    expect(spy).toHaveBeenNthCalledWith(3, chalk.bgKeyword(barColor)(" "));
  });

  it("should initialize colors properly", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "yellow";
    const text = "Testing new section";

    Console.Initialize(barColor, taskColor);
    Console.NewSection(text);
    expect(console.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledTimes(3);

    expect(spy).toHaveBeenNthCalledWith(1, chalk.bgKeyword(barColor)(" "));
    expect(spy).toHaveBeenNthCalledWith(
      2,
      chalk.bgKeyword(barColor)(" ") + " " + chalk.keyword(taskColor).bold(text)
    );
    expect(spy).toHaveBeenNthCalledWith(3, chalk.bgKeyword(barColor)(" "));
  });

  it("should report on a task status", () => {
    const taskName = "New task";
    const taskColor = "orange";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Info("");

    expect(startMock).toHaveBeenCalledTimes(1);

    expect(ora).toHaveBeenCalledTimes(1);
    expect(ora).toHaveBeenCalledWith({
      prefixText: chalk.bgKeyword(taskColor)(" "),
      spinner: "simpleDots",
      text: chalk.keyword("cyan").bold(taskName),
    });
  });

  it("should only start one task at a time", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.StartTask(taskName);
    Console.StartTask(taskName);
    Console.Info("");

    expect(startMock).toHaveBeenCalledTimes(1);

    expect(ora).toHaveBeenCalledTimes(1);
  });

  it("should display the task as succeeded", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Success(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(1);
    expect(warnMock).toHaveBeenCalledTimes(0);
    expect(failMock).toHaveBeenCalledTimes(0);

    expect(ora).toHaveBeenCalledTimes(1);
  });

  it("should display the task as failed", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "orange";
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Failure(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(0);
    expect(failMock).toHaveBeenCalledTimes(1);

    expect(ora).toHaveBeenCalledTimes(1);

    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, chalk.bgKeyword(barColor)(" "));
    expect(spy).toHaveBeenNthCalledWith(
      2,
      chalk.bgKeyword(barColor)(" ") +
        " " +
        chalk.keyword(taskColor).bold("Deploy failed.")
    );
    expect(spy).toHaveBeenNthCalledWith(3, chalk.bgKeyword(barColor)(" "));
  });

  it("should display the task as warning", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Info(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(failMock).toHaveBeenCalledTimes(0);

    expect(ora).toHaveBeenCalledTimes(1);
  });

  it("should terminate gracefully", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "orange";
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Success(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(1);
    expect(warnMock).toHaveBeenCalledTimes(0);
    expect(failMock).toHaveBeenCalledTimes(0);

    Console.End(true);

    expect(ora).toHaveBeenCalledTimes(1);

    expect(console.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, chalk.bgKeyword(barColor)(" "));
    expect(spy).toHaveBeenNthCalledWith(
      2,
      chalk.bgKeyword(barColor)(" ") +
        " " +
        chalk.keyword(taskColor).bold("Deploy complete!")
    );
    expect(spy).toHaveBeenNthCalledWith(3, chalk.bgKeyword(barColor)(" "));
  });
});

describe("Console utils", () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it("shouldn't do anything when ending a task if none is started", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.Success(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(0);
    expect(failMock).toHaveBeenCalledTimes(0);

    expect(ora).toHaveBeenCalledTimes(0);
  });
});
