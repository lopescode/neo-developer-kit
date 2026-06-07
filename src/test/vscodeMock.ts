/**
 * Minimal mock of the `vscode` API surface used by the extension, so the
 * commands can be unit-tested with Jest outside the extension host.
 *
 * Tests override these members with `jest.spyOn(...)` as needed.
 */

export const window = {
  showInputBox: async (..._args: unknown[]): Promise<string | undefined> =>
    undefined,
  showInformationMessage: async (..._args: unknown[]): Promise<unknown> =>
    undefined,
  showWarningMessage: async (..._args: unknown[]): Promise<unknown> =>
    undefined,
  showErrorMessage: async (..._args: unknown[]): Promise<unknown> => undefined,
  withProgress: (_options: unknown, task: (...a: unknown[]) => unknown) =>
    task(),
  createOutputChannel: (_name: string) => ({
    appendLine: (_line: string) => undefined,
    show: (_preserveFocus?: boolean) => undefined,
    dispose: () => undefined,
  }),
};

export const ProgressLocation = {
  SourceControl: 1,
  Window: 10,
  Notification: 15,
};

export const commands = {
  registerCommand: (
    _command: string,
    _callback: (...a: unknown[]) => unknown,
  ) => ({
    dispose: () => undefined,
  }),
};
