import { isAllowed, isConnected, signTransaction } from "@stellar/freighter-api";

export const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

export interface SignOptions {
  networkPassphrase?: string;
  /** Account expected to sign; Freighter prompts the user to switch if it differs. */
  address?: string;
}

export interface SignedTx {
  signedTxXdr: string;
  signerAddress: string;
}

export class FreighterError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
  ) {
    super(message);
    this.name = "FreighterError";
  }
}

/** Freighter returns errors either as a plain string or a `{ code, message }` object. */
function toFreighterError(err: unknown, fallback: string): FreighterError {
  if (typeof err === "string") return new FreighterError(err);
  if (err && typeof err === "object" && "message" in err) {
    const { message, code } = err as { message?: string; code?: number };
    return new FreighterError(message || fallback, code);
  }
  return new FreighterError(fallback);
}

/**
 * Signs an unsigned transaction XDR with the Freighter extension after
 * verifying the wallet is installed and has authorised this site.
 */
export async function signWithFreighter(
  unsignedXdr: string,
  { networkPassphrase = TESTNET_PASSPHRASE, address }: SignOptions = {},
): Promise<SignedTx> {
  if (!unsignedXdr) throw new FreighterError("Transaction XDR is required");

  const connection = await isConnected();
  if (connection.error) throw toFreighterError(connection.error, "Freighter connection check failed");
  if (!connection.isConnected) throw new FreighterError("Freighter wallet not connected");

  const permission = await isAllowed();
  if (permission.error) throw toFreighterError(permission.error, "Freighter permission check failed");
  if (!permission.isAllowed) throw new FreighterError("Freighter has not authorised this site");

  let result: Awaited<ReturnType<typeof signTransaction>>;
  try {
    result = await signTransaction(unsignedXdr, {
      networkPassphrase,
      ...(address ? { address } : {}),
    });
  } catch (err) {
    throw toFreighterError(
      err instanceof Error ? err.message : err,
      "Freighter failed to sign transaction",
    );
  }

  if (result.error) throw toFreighterError(result.error, "Transaction signing was rejected");
  if (!result.signedTxXdr) throw new FreighterError("Freighter returned an empty signed transaction");

  return { signedTxXdr: result.signedTxXdr, signerAddress: result.signerAddress };
}
