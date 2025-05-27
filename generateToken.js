import { randomBytes, createHmac } from "crypto";
import "dotenv/config";

function getSecureToken(secret){
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
