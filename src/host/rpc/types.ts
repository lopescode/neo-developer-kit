export interface InvokeResult {
  script: string;
  state: string;
  gasconsumed: string;
  exception: string | null;
  stack: Array<{ type: string; value?: unknown }>;
  [key: string]: unknown;
}

export interface ContractParameter {
  type: string;
  value?: unknown;
}

export interface ContractMethodParam {
  name: string;
  type: string;
}

export interface ContractMethod {
  name: string;
  parameters: ContractMethodParam[];
  returntype: string;
  safe: boolean;
  offset?: number;
}

export interface ContractManifest {
  name: string;
  abi: {
    methods: ContractMethod[];
    events: unknown[];
  };
  [key: string]: unknown;
}

export interface ContractState {
  id: number;
  hash: string;
  manifest: ContractManifest;
  [key: string]: unknown;
}

export interface Nep17Balance {
  assethash: string;
  amount: string;
  symbol?: string;
  decimals?: string;
  lastupdatedblock?: number;
}

export interface Nep17Balances {
  address: string;
  balance: Nep17Balance[];
}

export interface NeoVersion {
  protocol: {
    network: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
