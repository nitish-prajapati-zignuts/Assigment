import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "./config";

// Use JWT_SECRET or fallback to generate 32-byte key for AES-256-GCM
const SECRET = config.JWT_SECRET || "default_fallback_secret_key_change_in_production";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(SECRET).digest();
const ALGORITHM = "aes-256-gcm";

export interface ShareTokenPayload {
  meetingId: string;
  createdAt: number;
}

/**
 * Encrypts a meetingId into a URL-safe Base64 token with AES-256-GCM authentication tag.
 */
export const encryptShareToken = (meetingId: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  const payload: ShareTokenPayload = {
    meetingId,
    createdAt: Date.now(),
  };

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Combine iv (12 bytes) + tag (16 bytes) + ciphertext into single buffer
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64url");
};

/**
 * Decrypts a URL-safe token back to ShareTokenPayload. Returns null if invalid or tampered.
 */
export const decryptShareToken = (token: string): ShareTokenPayload | null => {
  try {
    const combined = Buffer.from(token, "base64url");
    if (combined.length < 28) return null; // 12 iv + 16 tag minimum

    const iv = combined.subarray(0, 12);
    const tag = combined.subarray(12, 28);
    const encryptedText = combined.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8")) as ShareTokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Hashes a share password using bcrypt
 */
export const hashSharePassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a raw password with a hashed share password
 */
export const compareSharePassword = async (
  rawPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(rawPassword, hashedPassword);
};
