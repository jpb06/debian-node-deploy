import { Console } from "./console.util";
import chalk from "chalk";
import ora from "ora";

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
    jest.restoreAllMocks();
    succeedMock.mockReset();
    warnMock.mockReset();
    failMock.mockReset();
  });

  it("should have default colors", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const defaultBarColor = "white";
    const defaultTaskColor = "orange";
    const text = "Testing new section";

    Console.Initialize();
    Console.NewSection(text);
    expect(console.info).toBeCalled();
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
      [chalk.bgKeyword(defaultBarColor)(" ")],
      [
        chalk.bgKeyword(defaultBarColor)(" ") +
          " " +
          chalk.keyword(defaultTaskColor).bold(text),
      ],
      [chalk.bgKeyword(defaultBarColor)(" ")],
    ]);
  });

  it("should have default colors even without calling initialize", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "orange";
    const text = "Testing new section";

    Console.NewSection(text);
    expect(console.info).toBeCalled();
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
      [chalk.bgKeyword(barColor)(" ")],
      [
        chalk.bgKeyword(barColor)(" ") +
          " " +
          chalk.keyword(taskColor).bold(text),
      ],
      [chalk.bgKeyword(barColor)(" ")],
    ]);
  });

  it("should initialize colors properly", () => {
    const spy = jest.spyOn(global.console, "info").mockImplementation();

    const barColor = "white";
    const taskColor = "yellow";
    const text = "Testing new section";

    Console.Initialize(barColor, taskColor);
    Console.NewSection(text);
    expect(console.info).toBeCalled();
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
      [chalk.bgKeyword(barColor)(" ")],
      [
        chalk.bgKeyword(barColor)(" ") +
          " " +
          chalk.keyword(taskColor).bold(text),
      ],
      [chalk.bgKeyword(barColor)(" ")],
    ]);
  });

  it("should report on a task status", () => {
    const taskName = "New task";
    const taskColor = "orange";

    Console.Initialize();
    Console.StartTask(taskName);

    expect(startMock).toHaveBeenCalledTimes(1);

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);
    expect(oraMock.calls[0][0]).toEqual({
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

    expect(startMock).toHaveBeenCalledTimes(1);

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);
  });

  it("should display the task as succeeded", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Success(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(1);
    expect(warnMock).toHaveBeenCalledTimes(0);
    expect(failMock).toHaveBeenCalledTimes(0);

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);
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

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);

    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
      [chalk.bgKeyword(barColor)(" ")],
      [
        chalk.bgKeyword(barColor)(" ") +
          " " +
          chalk.keyword(taskColor).bold("Deploy failed."),
      ],
      [chalk.bgKeyword(barColor)(" ")],
    ]);
  });

  it("should display the task as warning", () => {
    const taskName = "New task";

    Console.Initialize();
    Console.StartTask(taskName);
    Console.Info(taskName);

    expect(succeedMock).toHaveBeenCalledTimes(0);
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(failMock).toHaveBeenCalledTimes(0);

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);
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

    const oraMock = (ora as any).mock;
    expect(oraMock.calls[0]).toHaveLength(1);

    expect(console.info).toBeCalled();
    expect(console.info).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
      [chalk.bgKeyword(barColor)(" ")],
      [
        chalk.bgKeyword(barColor)(" ") +
          " " +
          chalk.keyword(taskColor).bold("Deploy complete!"),
      ],
      [chalk.bgKeyword(barColor)(" ")],
    ]);
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

    const oraMock = (ora as any).mock;
    expect(oraMock.calls).toHaveLength(0);
  });
});
