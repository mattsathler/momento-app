import { Message } from "discord.js";
import "dotenv/config";
import { createHmac } from "crypto";
import { error } from "../models/Error";

export function validateToken(
  message: Message
): true | error {
  const tokenField = message.embeds[0]?.data.fields?.find(
    (field) => field.name === "token"
  );
  if (!tokenField) {
    return { message: "Campo 'token' não encontrado.", code: 400 };
  }
  const tokenValue = tokenField.value;
  if (!tokenValue) {
    return { message: "Campo 'token' está vazio.", code: 400 };
  }

  if (!isTokenValid(tokenValue)) {
    return { message: "Token inválido ou expirado.", code: 401 };
  }

  return true;
}

function isTokenValid(token: string, maxAgeMs = 1800_000): boolean {
  try {
    const secret = process.env.SECRET_TOKEN;
    if (!secret) {
      throw new Error("SECRET_TOKEN is not defined in .env");
    }

    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [timestampStr, nonce, receivedHmac] = decoded.split(":");
    if (!timestampStr || !nonce || !receivedHmac) return false;
    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) return false;

    const now = Date.now();
    if (timestamp > now || now - timestamp > maxAgeMs) return false; // valida prazo 1 minuto

    const payload = `${timestampStr}:${nonce}`;

    const expectedHmac = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return expectedHmac === receivedHmac;
  } catch {
    return false;
  }
}
