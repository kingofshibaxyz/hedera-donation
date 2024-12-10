import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import { ENV } from "./env";

export const hederaClient = Client.forTestnet();
hederaClient.setOperator(AccountId.fromString(ENV.HEDERA_ACCOUNT_ID), PrivateKey.fromString(ENV.HEDERA_PRIVATE_KEY));
