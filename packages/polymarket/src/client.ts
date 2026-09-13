import { createPublicClient } from "@polymarket/client";
import type { PublicClient } from "@polymarket/client";

/**
 * Public Gamma/CLOB discovery client. No credentials. Never construct a
 * SecureClient from this module.
 */
export function createGammaPublicClient(): PublicClient {
  return createPublicClient();
}
