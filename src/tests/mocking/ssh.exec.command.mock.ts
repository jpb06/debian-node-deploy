/* istanbul ignore file */
export const mockDoubleExecCommand = (
  stdout: string = "",
  stderr: string = ""
) =>
  jest
    .fn()
    .mockImplementationOnce(() => {
      return {
        code: null,
        stderr,
        stdout,
      };
    })
    .mockImplementationOnce(() => {
      return {
        code: 0,
        stderr: "",
        stdout: 1,
      };
    });

export const mockExecCommand = (
  code: number | null = null,
  stdout: string = "",
  stderr: string = ""
) =>
  jest.fn().mockImplementationOnce(() => ({
    code,
    stderr,
    stdout,
  }));
