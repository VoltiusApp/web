let wasmModule: typeof import("@voltius/crypto-wasm") | null = null;

async function getCrypto() {
  if (!wasmModule) {
    const mod = await import("@voltius/crypto-wasm");
    await mod.default();
    wasmModule = mod;
  }
  return wasmModule;
}

export async function deriveAuthKey(password: string, accountId: string): Promise<string> {
  const { derive_auth_key } = await getCrypto();
  return derive_auth_key(password, accountId);
}
