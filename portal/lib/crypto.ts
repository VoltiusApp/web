let initPromise: Promise<typeof import("@voltius/crypto-wasm")> | null = null;

function getCrypto() {
  if (!initPromise) {
    initPromise = import("@voltius/crypto-wasm").then(async (mod) => {
      await mod.default();
      return mod;
    });
  }
  return initPromise;
}

export async function deriveAuthKey(password: string, accountId: string): Promise<string> {
  const { derive_auth_key } = await getCrypto();
  return derive_auth_key(password, accountId);
}
