/**
 * Generates a cryptographically secure random ID
 * @param length - The length of the ID to generate (default: 16)
 * @returns A random alphanumeric string
 */
export function generateRandomId(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (byte) => {
    // Use alphanumeric characters (a-z, A-Z, 0-9)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return chars[byte % chars.length];
  }).join("");
}
