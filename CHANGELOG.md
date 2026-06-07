# Change Log

All notable changes to the "neo-developer-kit" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

- **Neo Developer Kit panel** in the Activity Bar with a home screen to pick a
  tool (`neo.openPanel` command / `neo.kitView` webview).
- **Test Invoke** tool: read-only `invokefunction` against a Neo N3 node, with
  an inline result view (state, gas consumed, full VM result as JSON).
- **ABI loading**: paste a contract hash and load its manifest
  (`getcontractstate`) to get a method picker with auto-generated, typed
  parameter inputs instead of typing method names by hand.
- RPC helpers (`src/rpc.ts`): `invokeFunction` and `getContractState`, with
  error handling and typed results.
- Jest test suite covering the RPC helpers, the invoke/ABI core, and the webview
  message handlers / HTML generation.