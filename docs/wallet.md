# Wallet

Manage Neo N3 accounts without leaving VS Code. Accounts are NEP-2 encrypted
with your password and kept in the OS secret store — never written to the
workspace in plain text.

The quickest way to hold a dev account, check what it owns, and keep a safe
backup of its key while you build.

## Usage

From the home screen, choose **Wallet**.

### Manage accounts

- **Create**: generates a new account. Give it a label and an encryption
  password.
- **Import**: paste a private key (WIF or hex), then label and encrypt it.
- Pick the **active account** from the list; copy its address with a click.
- **Remove**: deletes the selected account from the wallet (confirm first —
  make sure you have a backup of its key).

### Check balance

1. Select an account.
2. Choose **Check balance**.
3. Switch between **TestNet** and **MainNet** to see NEO, GAS and any NEP-17
   tokens held by the account on that network.

### Backup

Choose **Backup** to export an encrypted **NEP-6** wallet file (`.json`) you can
store safely. The accounts stay encrypted with their passwords inside the file.
