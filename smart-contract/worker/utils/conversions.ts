import { AccountId, AccountInfoQuery } from "@hashgraph/sdk";
import axios from "axios";
import { ENV } from "../config/env";
import { hederaClient } from "../config/hedera";

export async function evmAddressToAccountId(address: string): Promise<AccountId> {
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(AccountId.fromEvmAddress(0, 0, address))
        .execute(hederaClient);

    const accountId = accountInfo.accountId;
    return accountId;
}

export function accountIdToSolidityAddress(accountId: string): string {
    const account = AccountId.fromString(accountId);
    const evmAddress = account.toSolidityAddress();
    console.log(`Solidity Address for Account ID ${accountId}: 0x${evmAddress}`);
    return `0x${evmAddress}`;
}

export async function accountIdToEvmAddress(accountId: string): Promise<string> {
    const mirrorNodeUrl = `${ENV.MIRROR_NODE}/api/v1/accounts/${accountId}`;
    const response = await axios.get(mirrorNodeUrl);
    if (response.data && response.data.evm_address) {
        const evmAddress = response.data.evm_address;
        console.log(`EVM Address for Account ID ${accountId}: ${evmAddress}`);
        return evmAddress;
    } else {
        throw new Error(`EVM address not found for account ID ${accountId}`);
    }
}
