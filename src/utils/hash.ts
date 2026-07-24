export async function sha256Hash(message: string): Promise<string> {
  // แปลง string เป็น bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // hash ด้วย SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // แปลง ArrayBuffer เป็น hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}