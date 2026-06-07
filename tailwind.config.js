/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./media/index.html", "./src/webview/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Semantic colors mapped to VS Code theme variables, usable as
      // e.g. `bg-button text-button-fg` or via arbitrary values.
      colors: {
        fg: "var(--vscode-foreground)",
        focus: "var(--vscode-focusBorder)",
        button: {
          DEFAULT: "var(--vscode-button-background)",
          fg: "var(--vscode-button-foreground)",
          hover: "var(--vscode-button-hoverBackground)",
        },
      },
    },
  },
  plugins: [],
};
