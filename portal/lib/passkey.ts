import {
  ApiError, beginPasskey, finishPasskey, twoFactorMessage,
  type PasskeyCeremony, type PasskeyHandle, type PasskeyResult,
} from "./api";

type Json = Record<string, unknown>;

function fromBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)).buffer;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function descriptors(list: unknown): PublicKeyCredentialDescriptor[] | undefined {
  return (list as { id: string }[] | undefined)?.map(
    (item) => ({ ...item, id: fromBase64Url(item.id) }) as PublicKeyCredentialDescriptor,
  );
}

function creationOptions(publicKey: Json): PublicKeyCredentialCreationOptions {
  const user = publicKey.user as Json;
  return {
    ...(publicKey as unknown as PublicKeyCredentialCreationOptions),
    challenge: fromBase64Url(publicKey.challenge as string),
    user: { ...(user as unknown as PublicKeyCredentialUserEntity), id: fromBase64Url(user.id as string) },
    excludeCredentials: descriptors(publicKey.excludeCredentials),
  };
}

function requestOptions(publicKey: Json): PublicKeyCredentialRequestOptions {
  return {
    ...(publicKey as unknown as PublicKeyCredentialRequestOptions),
    challenge: fromBase64Url(publicKey.challenge as string),
    allowCredentials: descriptors(publicKey.allowCredentials),
  };
}

function responseJson(credential: PublicKeyCredential): Json {
  const response = credential.response;
  const fields =
    response instanceof AuthenticatorAttestationResponse
      ? { attestationObject: toBase64Url(response.attestationObject), transports: response.getTransports?.() }
      : {
          authenticatorData: toBase64Url((response as AuthenticatorAssertionResponse).authenticatorData),
          signature: toBase64Url((response as AuthenticatorAssertionResponse).signature),
        };
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: { ...fields, clientDataJSON: toBase64Url(response.clientDataJSON) },
  };
}

export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && "PublicKeyCredential" in window && Boolean(navigator.credentials);
}

/** What to tell the user about a failed ceremony, whether the browser or the server refused it. */
export function passkeyMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "InvalidStateError") return "This device already holds a passkey for this account.";
    return "The passkey prompt was closed or timed out. Try again.";
  }
  if (err instanceof ApiError) {
    if (err.status === 410 || err.status === 401) return "This request has expired. Start again.";
    if (err.body?.error === "TWO_FACTOR_INVALID") return "That passkey was not accepted.";
    if (err.body?.error === "TWO_FACTOR_UNAVAILABLE") return "This server does not offer passkeys.";
    return twoFactorMessage(err) ?? "The passkey could not be checked. Try again.";
  }
  return err instanceof Error ? err.message : "The passkey could not be checked. Try again.";
}

/** Shows the browser's passkey prompt for a ceremony the server has begun and reports the answer. */
export async function askPasskey(handle: string, ceremony: PasskeyCeremony): Promise<PasskeyResult> {
  const { publicKey } = ceremony.options;
  const credential =
    ceremony.purpose === "register"
      ? await navigator.credentials.create({ publicKey: creationOptions(publicKey) })
      : await navigator.credentials.get({ publicKey: requestOptions(publicKey) });
  if (!(credential instanceof PublicKeyCredential)) throw new Error("The browser returned no passkey.");
  return finishPasskey(handle, responseJson(credential));
}

/** A ceremony whose code stays in this page: opens it, runs it, returns the code. */
export async function inlinePasskeyCode(open: () => Promise<PasskeyHandle>): Promise<string> {
  try {
    const { handle } = await open();
    const { code } = await askPasskey(handle, await beginPasskey(handle));
    if (!code) throw new Error("The passkey could not be checked. Try again.");
    return code;
  } catch (err) {
    throw new Error(passkeyMessage(err));
  }
}
