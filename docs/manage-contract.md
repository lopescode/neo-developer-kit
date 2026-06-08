# Manage Contract

Deploy a compiled contract to a network, or **update** one in place. On Neo N3
an update keeps the **same script hash** — it is not a redeploy. Both actions
build, sign and broadcast a transaction with your active wallet account, so that
account needs some GAS.

## Usage

From the home screen choose **Manage Contract**, then pick **Deploy** or
**Update**.

### Deploy

1. **Network**: switch between TestNet and MainNet (or a custom RPC).
2. **Contract files**: click **Select .nef** and pick your compiled `.nef`. The
   matching `.manifest.json` next to it is detected automatically; use **Select
   manifest** if it lives elsewhere.
3. Click **Deploy** and enter your account password when prompted.
4. On success you get the new **contract hash** and the transaction id.

### Update

1. **Network**: choose the network the contract lives on.
2. **Contract hash**: paste the deployed contract's script hash (`0x...`).
3. **Contract files**: select the new `.nef` (and manifest) the same way as for
   deploy.
4. Click **Update** and enter your account password when prompted.

The target contract must expose an `update` method. The script hash is
unchanged after a successful update.
