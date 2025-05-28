import { randomBytes, createHmac } from "crypto";
import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

export function getSecureToken(secret) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

  if (!secret) {
    throw new Error("SECRET_TOKEN is not defined in .env");
  }
  const timestamp = Date.now().toString();
  const nonce = randomBytes(8).toString("hex");
  const payload = `${timestamp}:${nonce}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  const token = Buffer.from(`${timestamp}:${nonce}:${hmac}`).toString("base64");

  return token;
}

console.log(getSecureToken(process.env.SECRET_TOKEN));
