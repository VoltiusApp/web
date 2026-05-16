// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CryptoMod = any;

let initPromise: Promise<CryptoMod> | null = null;

function getCrypto(): Promise<CryptoMod> {
  if (!initPromise) {
    initPromise = import("@voltius/crypto-wasm").then(async (mod) => {
      await mod.default();
      return mod;
    });
  }
  return initPromise;
}

export async function deriveAuthKey(password: string, accountId: string): Promise<string> {
  const mod = await getCrypto();
  return mod.derive_auth_key(password, accountId) as string;
}

export async function deriveKek(password: string, accountId: string): Promise<Uint8Array> {
  const mod = await getCrypto();
  return mod.derive_kek(password, accountId) as Uint8Array;
}

export async function wrapUserSecrets(
  kek: Uint8Array,
  dek: Uint8Array,
  x25519Private: Uint8Array,
): Promise<Uint8Array> {
  const mod = await getCrypto();
  return mod.wrap_user_secrets(kek, dek, x25519Private) as Uint8Array;
}

export async function unwrapUserSecretsDek(kek: Uint8Array, wrapped: Uint8Array): Promise<Uint8Array> {
  const mod = await getCrypto();
  return mod.unwrap_user_secrets_dek(kek, wrapped) as Uint8Array;
}

export async function unwrapUserSecretsX25519(kek: Uint8Array, wrapped: Uint8Array): Promise<Uint8Array> {
  const mod = await getCrypto();
  return mod.unwrap_user_secrets_x25519(kek, wrapped) as Uint8Array;
}

export async function randomBytes(n: number): Promise<Uint8Array> {
  const mod = await getCrypto();
  return mod.random_bytes(n) as Uint8Array;
}

export async function generateUserSecrets(): Promise<{
  dek: Uint8Array;
  x25519Private: Uint8Array;
  x25519PublicB64: string;
}> {
  const mod = await getCrypto();
  const dek = mod.random_bytes(32) as Uint8Array;
  const x25519Private = mod.random_bytes(32) as Uint8Array;
  const x25519PublicB64 = mod.generate_user_secrets_public_key() as string;
  return { dek, x25519Private, x25519PublicB64 };
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
