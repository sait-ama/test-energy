export async function sha256(str: string) {
  // Browser 95% caniuse or Node >= 16
  if (globalThis.crypto && globalThis.crypto.subtle) {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  return null;
}
