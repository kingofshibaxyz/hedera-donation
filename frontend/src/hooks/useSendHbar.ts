import { useHashConnectContext } from "@/contexts/hashconnect";
import { AccountId, Hbar, TransferTransaction, Signer } from "@hashgraph/sdk";
import { useState } from "react";

interface UseSendHbarResult {
  sendHbar: (recipientAccountId: string, amount: number) => void;
  error: string | null;
  loading: boolean;
  success: boolean;
  transactionHash: string | null;
}

export const useSendHbar = (): UseSendHbarResult => {
  const { walletAddress, hashconnect } = useHashConnectContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const sendHbar = async (recipientAccountId: string, amount: number) => {
    if (!walletAddress) {
      setError("Wallet is not connected.");
      return null;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);
    setTransactionHash(null);

    try {
      const signer = hashconnect?.getSigner(
        AccountId.fromString(walletAddress) as any
      ) as unknown as Signer;

      const transaction = await new TransferTransaction()
        .addHbarTransfer(walletAddress, new Hbar(-amount)) // Deduct HBAR from sender
        .addHbarTransfer(recipientAccountId, new Hbar(amount)) // Add HBAR to recipient
        .freezeWithSigner(signer);

      const transactionResponse = await transaction.executeWithSigner(signer);
      const transactionId = transactionResponse.transactionId.toString();
      setTransactionHash(transactionId);
      setSuccess(true);

      return transactionId;
    } catch (err) {
      console.error("Failed to send HBAR:", err);
      setError("Failed to send HBAR. Please try again.");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendHbar, error, loading, success, transactionHash };
};
