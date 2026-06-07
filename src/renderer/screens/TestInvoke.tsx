import { useEffect, useMemo, useState } from "react";
import { useRouter } from "../router";
import { onMessage, postMessage } from "../vscode";
import type { ExtensionMessage, InvokeResult, Method } from "../messages";
import { DEFAULT_RPC_ENDPOINTS } from "../../shared/networks";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import { Field } from "../components/Field";
import { Status } from "../components/Status";
import type { StatusValue } from "../components/Status";

export function TestInvoke() {
  const { navigate } = useRouter();

  const [rpc, setRpc] = useState(DEFAULT_RPC_ENDPOINTS.testnet);
  const [contract, setContract] = useState("");
  const [methods, setMethods] = useState<Method[]>([]);
  const [selected, setSelected] = useState(0);
  const [paramValues, setParamValues] = useState<string[]>([]);
  const [contractInfo, setContractInfo] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusValue>({ text: "", kind: "" });
  const [result, setResult] = useState<InvokeResult | null>(null);

  const method = methods[selected] as Method | undefined;

  const prettyResult = useMemo(
    () => (result ? JSON.stringify(result, null, 2) : ""),
    [result],
  );

  function loadAbi() {
    setMethods([]);
    setContractInfo(null);
    setResult(null);
    setStatus({ text: "Loading ABI…", kind: "pending" });
    postMessage({
      type: "loadAbi",
      rpc: rpc.trim(),
      contract: contract.trim(),
    });
  }

  function invoke() {
    if (!method) {
      return;
    }
    setResult(null);
    setStatus({ text: `Invoking ${method.name}…`, kind: "pending" });
    const params = method.parameters.map((p, i) => ({
      type: p.type,
      value: p.type === "Boolean" ? paramValues[i] === "true" : paramValues[i],
    }));
    postMessage({
      type: "invoke",
      rpc: rpc.trim(),
      contract: contract.trim(),
      method: method.name,
      params: JSON.stringify(params),
    });
  }

  function setParam(index: number, value: string) {
    setParamValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type === "abi") {
        if (!msg.ok) {
          setStatus({ text: "✖ " + msg.error, kind: "error" });
          return;
        }
        setMethods(msg.methods);
        setSelected(0);
        setContractInfo(`${msg.name || "(unnamed)"}  ·  ${msg.hash}`);
        setStatus({
          text: `✔ Loaded ${msg.methods.length} methods`,
          kind: "ok",
        });
      } else if (msg.type === "result") {
        if (!msg.ok) {
          setStatus({ text: "✖ " + msg.error, kind: "error" });
          return;
        }
        const faulted = msg.result.state === "FAULT";
        setStatus({
          text: `${faulted ? "✖" : "✔"} ${msg.result.state} · gas ${msg.result.gasconsumed}`,
          kind: faulted ? "error" : "ok",
        });
        setResult(msg.result);
      }
    });
  }, []);

  useEffect(() => {
    setParamValues(
      method
        ? method.parameters.map((p) => (p.type === "Boolean" ? "true" : ""))
        : [],
    );
  }, [method]);

  return (
    <section>
      <button
        onClick={() => navigate("home")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Tools
      </button>

      <h3 className="font-semibold text-sm">Test Invoke</h3>
      <p className="opacity-70 mb-1 text-xs">
        Read-only <code>invokefunction</code> against a Neo N3 node.
      </p>

      <Field label="RPC endpoint">
        <TextInput value={rpc} onChange={(e) => setRpc(e.target.value)} />
        <div className="flex gap-3 mt-1 text-[0.8em]">
          <button
            className="text-[var(--vscode-textLink-foreground)] hover:underline"
            onClick={() => setRpc(DEFAULT_RPC_ENDPOINTS.testnet)}
          >
            TestNet
          </button>
          <button
            className="text-[var(--vscode-textLink-foreground)] hover:underline"
            onClick={() => setRpc(DEFAULT_RPC_ENDPOINTS.mainnet)}
          >
            MainNet
          </button>
        </div>
      </Field>

      <Field label="Contract hash">
        <div className="flex gap-1.5">
          <TextInput
            value={contract}
            placeholder="0x..."
            onChange={(e) => setContract(e.target.value)}
          />
          <Button
            variant="secondary"
            className="whitespace-nowrap"
            onClick={loadAbi}
          >
            Load ABI
          </Button>
        </div>
      </Field>

      {contractInfo && (
        <div className="opacity-80 mt-2 text-[0.82em]">{contractInfo}</div>
      )}

      {methods.length > 0 && (
        <>
          <Field label="Method">
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="bg-[var(--vscode-input-background)] px-2 py-1.5 border border-[var(--vscode-input-border,transparent)] rounded focus:outline outline-none focus:outline-[var(--vscode-focusBorder)] focus:outline-1 w-full text-[var(--vscode-input-foreground)]"
            >
              {methods.map((m, i) => (
                <option key={m.name} value={i}>
                  {m.name}({m.parameters.map((p) => p.name).join(", ")})
                </option>
              ))}
            </select>
          </Field>

          {method && (
            <div className="opacity-70 mt-1 text-[0.78em]">
              returns: {method.returntype}
              {method.safe ? "  ·  safe" : ""}
            </div>
          )}

          {method?.parameters.map((param, i) => (
            <Field key={param.name} label={`${param.name} : ${param.type}`}>
              {param.type === "Boolean" ? (
                <select
                  value={paramValues[i] ?? "true"}
                  onChange={(e) => setParam(i, e.target.value)}
                  className="bg-[var(--vscode-input-background)] px-2 py-1.5 border border-[var(--vscode-input-border,transparent)] rounded focus:outline outline-none focus:outline-[var(--vscode-focusBorder)] focus:outline-1 w-full text-[var(--vscode-input-foreground)]"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <TextInput
                  value={paramValues[i] ?? ""}
                  placeholder={param.type}
                  onChange={(e) => setParam(i, e.target.value)}
                />
              )}
            </Field>
          ))}

          <Button className="mt-3.5 w-full" onClick={invoke}>
            Invoke
          </Button>
        </>
      )}

      <Status value={status} />

      {prettyResult && (
        <pre className="bg-[var(--vscode-textCodeBlock-background,rgba(127,127,127,0.1))] m-0 p-2 rounded overflow-auto text-[0.85em] break-all whitespace-pre-wrap">
          {prettyResult}
        </pre>
      )}
    </section>
  );
}
