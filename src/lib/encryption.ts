import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;

/**
 * Get the encryption key from environment variables
 * Key must be a 32-byte (64 hex character) string for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns the encrypted string and initialization vector
 */
export function encrypt(
  plaintext: string
): { encrypted: string; iv: string } | null {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Append auth tag to encrypted data
    const authTag = cipher.getAuthTag();
    encrypted += authTag.toString("hex");

    return {
      encrypted,
      iv: iv.toString("hex"),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 * Requires the encrypted string and initialization vector
 */
export function decrypt(encrypted: string, iv: string): string | null {
  try {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, "hex");

    // Extract auth tag from end of encrypted data
    const authTagHex = encrypted.slice(-AUTH_TAG_LENGTH * 2);
    const encryptedData = encrypted.slice(0, -AUTH_TAG_LENGTH * 2);
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Get the last 4 characters of an API key as a hint for identification
 */
export function getKeyHint(apiKey: string): string {
  if (apiKey.length < 4) {
    return apiKey;
  }
  return apiKey.slice(-4);
}

/**
 * Validate Google API key format
 * Google API keys typically start with "AIza" and are 39 characters
 */
export function isValidGoogleApiKey(key: string): boolean {
  if (!key || typeof key !== "string") {
    return false;
  }

  // Remove any whitespace
  const trimmedKey = key.trim();

  // Google API keys are typically 39 characters and start with "AIza"
  if (trimmedKey.length < 30 || trimmedKey.length > 50) {
    return false;
  }

  // Check if it starts with the typical Google API key prefix
  if (!trimmedKey.startsWith("AIza")) {
    return false;
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const validKeyPattern = /^[A-Za-z0-9_-]+$/;
  return validKeyPattern.test(trimmedKey);
}
