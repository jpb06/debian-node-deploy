/* istanbul ignore file */
import { Console } from "../../util/console.util";

export const assignConsoleMocks = () => {
  Console.StartTask = jest.fn();
  Console.Success = jest.fn();
};
