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
        code: stderr.length === 0 ? 0 : 1,
        stderr,
        stdout,
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
