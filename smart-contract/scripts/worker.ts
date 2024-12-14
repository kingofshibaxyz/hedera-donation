import { AccountId, AccountInfoQuery, Client, PrivateKey } from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import { ethers, LogDescription } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { Pool, PoolClient, QueryResult } from "pg";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

enum CampaignStatus {
    NEW = "NEW",
    PENDING = "PENDING",
    PUBLISHED = "PUBLISHED",
    CLOSED = "CLOSED",
}

interface LogEntry {
    topics: string[];
    data: string;
    transaction_hash: string; // Include transaction hash in the log entry type
}

interface DecodedLog {
    eventName: string;
    signature: string;
    args: Record<string, string>;
    transactionHash: string; // Add transaction hash to decoded log
}

interface User {
    id: number;
    username: string | null;
    email: string | null;
    is_active: boolean;
    date_joined: string;
    wallet_address: string;
}

interface Donation {
    campaignId: number; // Foreign key ID for Campaign
    userId: number; // Foreign key ID for HederaUser
    amount: number; // Donation amount
    transactionHash: string | null; // Unique transaction hash
    date?: string; // Optional for updates
}

interface Campaign {
    id: number;
    title: string;
    description: string;
    image: string | null;
    goal: number;
    current_amount: number;
    percentage_completed: number;
    organizer_id: number;
    campaign_type_id: number | null;
    token_id: number | null;
    video_link: string | null;
    project_url: string | null;
    created_at: string;
    updated_at: string;
    approved_by_admin: boolean;
    onchain_id: number | null;
    status: CampaignStatus;
}

interface DonationUpsert {
    campaignId: number; // Foreign key to Campaign
    userId: number; // Foreign key to HederaUser
    transactionHash: string; // Unique transaction hash
    amount: number; // Donation amount
}

interface ApprovedCampaignJoin {
    id: number; // ID of the campaign
    title: string; // Campaign title
    description: string; // Campaign description
    image: string | null; // Campaign image URL
    goal: number; // Campaign goal amount
    current_amount: number; // Current amount raised
    percentage_completed: number; // Percentage of goal completed
    status: CampaignStatus; // Status of the campaign
    created_at: string; // Campaign creation timestamp
    updated_at: string; // Campaign update timestamp
    onchain_id: number | null; // On-chain ID (if available)
    approved_by_admin: boolean; // Admin approval status
    token_name: string; // Name of the associated token
    token_symbol: string; // Symbol of the associated token
    token_address: string; // Address of the associated token
    token_decimal: number; // Decimal places for the token
    campaign_type_name: string; // Name of the campaign type
    organizer_username: string; // Username of the organizer
    organizer_wallet_address: string; // Wallet address of the organizer
}

// ABI and Bytecode Paths
const donationPlatformAbiPath = path.join(__dirname, "../contract-flattens/DonationPlatform/DonationPlatform.abi");
const donationPlatformBytecodePath = path.join(__dirname, "../contract-flattens/DonationPlatform/DonationPlatform.bin");

// Hedera Client
const client = Client.forTestnet();
client.setOperator(
    AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
    PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!),
);

// Load Contract ABI and Bytecode
const abi = JSON.parse(fs.readFileSync(donationPlatformAbiPath, "utf8"));
const bytecode = fs.readFileSync(donationPlatformBytecodePath, "utf8");

// Hedera contract ID
const contractId = process.env.HEDERA_CONTRACT_ID || "0.0.5224129";
const contractAddress = process.env.CONTRACT_ADDRESS! || "0x0c4424e55aa698a22d8c32edef530fd071a6d2b2";

// PostgreSQL configuration
const pool: Pool = new Pool({
    user: process.env.PG_USER || "hedera_hackathon",
    host: process.env.PG_HOST || "localhost",
    database: process.env.PG_DATABASE || "hedera_hackathon",
    password: process.env.PG_PASSWORD || "hedera_hackathon",
    port: Number(process.env.PG_PORT) || 5432,
});

// Mirror Node API URL
const fetchLogs = async (fromTimestamp: string | null, toTimestamp: string): Promise<LogEntry[]> => {
    try {
        const url = fromTimestamp
            ? `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}/results/logs?timestamp=gte:${fromTimestamp}&timestamp=lte:${toTimestamp}`
            : `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}/results/logs?timestamp=lte:${toTimestamp}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching logs: ${response.statusText}`);
        }
        const data = await response.json();
        return data.logs.map((log: any) => ({
            topics: log.topics,
            data: log.data,
            transaction_hash: log.transaction_hash, // Include transaction hash
        }));
    } catch (error) {
        console.error("Error fetching logs:", error);
        return [];
    }
};

const decodeLogs = (logs: LogEntry[]): DecodedLog[] => {
    const iface = new ethers.Interface(abi);
    const decodedLogs: DecodedLog[] = []; // Array to store decoded logs

    logs.forEach((log: LogEntry) => {
        try {
            const decodedLog: LogDescription = iface.parseLog({
                topics: log.topics,
                data: log.data,
            }) as LogDescription;

            const jsonLog: DecodedLog = {
                eventName: decodedLog.name,
                signature: decodedLog.signature,
                args: decodedLog.args.reduce((acc: Record<string, string>, value, index) => {
                    const inputName = decodedLog.fragment.inputs[index]?.name || `arg${index}`;
                    acc[inputName] = value.toString(); // Convert BigInt or other complex types to string
                    return acc;
                }, {}),
                transactionHash: log.transaction_hash, // Add transaction hash to decoded log
            };

            decodedLogs.push(jsonLog); // Add decoded log to the array
        } catch (error) {
            console.error("Error decoding log:", error);
        }
    });

    return decodedLogs; // Return the array of decoded logs
};

export async function evmAddressToAccountId(address: string): Promise<AccountId> {
    const client = Client.forTestnet();
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);
    client.setOperator(operatorId, operatorKey);

    const accountInfo = await new AccountInfoQuery()
        .setAccountId(AccountId.fromEvmAddress(0, 0, address))
        .execute(client);

    const accountId = accountInfo.accountId;
    return accountId;
}

export function accountIdToSolidityAddress(accountId: string): string {
    try {
        const account = AccountId.fromString(accountId);
        const evmAddress = account.toSolidityAddress();
        console.log(`Solidity Address for Account ID ${accountId}: 0x${evmAddress}`);
        return `0x${evmAddress}`;
    } catch (error) {
        console.error(`Error converting Account ID to EVM address:`, error);
        throw error;
    }
}

export async function accountIdToEvmAddress(accountId: string): Promise<string> {
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`;
    try {
        const response = await axios.get(mirrorNodeUrl);
        if (response.data && response.data.evm_address) {
            const evmAddress = response.data.evm_address;
            console.log(`EVM Address for Account ID ${accountId}: ${evmAddress}`);
            return evmAddress;
        } else {
            throw new Error(`EVM address not found for account ID ${accountId}`);
        }
    } catch (error) {
        console.error(`Error fetching EVM address for Account ID ${accountId}:`, error);
        throw error;
    }
}

const getApprovedCampaignJoins = async (): Promise<ApprovedCampaignJoin[]> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();

        const query = `
            SELECT 
                c.id,
                c.title,
                c.description,
                c.image,
                c.goal,
                c.current_amount,
                c.percentage_completed,
                c.status,
                c.created_at,
                c.updated_at,
                c.onchain_id,
                c.approved_by_admin,
                t.name AS token_name,
                t.symbol AS token_symbol,
                t.address AS token_address,
                t.decimal AS token_decimal,
                ct.name AS campaign_type_name,
                u.username AS organizer_username,
                u.wallet_address AS organizer_wallet_address
            FROM donation_app_campaign c
            INNER JOIN donation_app_token t ON c.token_id = t.id
            INNER JOIN donation_app_campaigntype ct ON c.campaign_type_id = ct.id
            INNER JOIN donation_app_hederauser u ON c.organizer_id = u.id
            WHERE c.approved_by_admin = true AND (c.status = $1 OR c.status = $2) AND c.onchain_id IS NULL
        `;

        const result: QueryResult<ApprovedCampaignJoin> = await client.query(query, [
            CampaignStatus.NEW,
            CampaignStatus.PENDING,
        ]);

        console.log(`${result.rows.length} campaigns found.`);
        return result.rows;
    } catch (error) {
        console.error("Error fetching campaigns with joins:", error);
        return [];
    } finally {
        if (client) client.release();
    }
};

const updateCampaignIdOnchainAndStatus = async (
    campaignId: number,
    onchainId: number,
    status: CampaignStatus,
): Promise<boolean> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log(`Updating campaign ID ${campaignId} to PUBLISHED with onchain_id ${onchainId}`);

        const result: QueryResult = await client.query(
            "UPDATE donation_app_campaign SET status = $1, onchain_id = $2, updated_at = NOW() WHERE id = $3",
            [status, onchainId, campaignId],
        );

        if (Number(result?.rowCount) > 0) {
            console.log(`Campaign ID ${campaignId} successfully updated.`);
            return true;
        } else {
            console.log(`Campaign ID ${campaignId} not found.`);
            return false;
        }
    } catch (error) {
        console.error("Error updating campaign:", error);
        return false;
    } finally {
        if (client) client.release();
    }
};

const getCampaignByOnchainId = async (onchainId: number): Promise<Campaign | null> => {
    let client: PoolClient | undefined;

    try {
        client = await pool.connect();
        console.log(`Searching for campaign with onchain_id: ${onchainId}`);

        const result: QueryResult<Campaign> = await client.query(
            "SELECT * FROM donation_app_campaign WHERE onchain_id = $1 LIMIT 1",
            [onchainId],
        );

        if (result.rows.length === 0) {
            console.log(`No campaign found with onchain_id: ${onchainId}`);
            return null;
        }

        const campaign = result.rows[0];
        console.log(`Campaign found:`, campaign);
        return campaign;
    } catch (error) {
        console.error("Error fetching campaign by onchain_id:", error);
        return null;
    } finally {
        if (client) {
            client.release();
        }
    }
};

const publishAndApproveCampaign = async (
    campaignDetails: {
        offChainId: number;
        title: string;
        token: string;
        goal: string;
        organizer: string;
    },
    workerSigner: ethers.Signer,
    contractAddress: string,
    abi: any, // Provide the ABI type if available
): Promise<number | null> => {
    const contract = new ethers.Contract(contractAddress, abi, workerSigner);

    try {
        // Call the contract method
        const tx = await contract.publishAndApproveCampaign(
            campaignDetails.offChainId,
            campaignDetails.title,
            campaignDetails.token,
            campaignDetails.goal,
            campaignDetails.organizer,
        );

        // Wait for the transaction to complete
        const receipt = await tx.wait();
        console.log("Campaign published and approved. Transaction receipt:", receipt);

        // Check for events in receipt.logs
        const iface = new ethers.Interface(abi);
        const event = receipt.logs
            .map((log: { topics: ReadonlyArray<string>; data: string }) => {
                try {
                    return iface.parseLog(log);
                } catch (e) {
                    // Log may not belong to this contract, skip
                    return null;
                }
            })
            .find((parsedLog: { name: string }) => parsedLog?.name === "CampaignPublished");

        if (event) {
            console.log(event);
            const onchainId = Number(event.args[1]); //campaignId onchain
            console.log(`Campaign ID ${onchainId} retrieved from the event.`);
            return onchainId;
        } else {
            console.error("No CampaignPublished event found in the transaction.");
            return null;
        }
    } catch (error) {
        console.error("Error executing publishAndApproveCampaign:", error);
        return null;
    }
};

const processNewCampaigns = async (): Promise<void> => {
    const pendingCampaigns = await getApprovedCampaignJoins();

    if (pendingCampaigns.length === 0) {
        console.log("No pending campaigns found.");
        return;
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://testnet.hashio.io/api");
    const workerSigner = new ethers.Wallet(process.env.WORKER_PRIVATE_KEY! || "", provider);

    for (const campaign of pendingCampaigns) {
        console.log(`Processing campaign: ${campaign.title}`);
        const evmAddress = await accountIdToEvmAddress(campaign.organizer_wallet_address);
        console.log({ evmAddress });
        const campaignDetails = {
            offChainId: campaign.id,
            title: campaign.title,
            token: campaign.token_address, // Replace with actual token field
            goal: ethers.parseUnits(campaign.goal.toString(), 0).toString(),
            organizer: evmAddress, // Replace with actual organizer wallet field
        };

        const onchainId = await publishAndApproveCampaign(campaignDetails, workerSigner, contractAddress, abi);

        if (onchainId !== null) {
            const success = await updateCampaignIdOnchainAndStatus(campaign.id, onchainId, CampaignStatus.PUBLISHED);
            if (success) {
                console.log(`Campaign ID ${campaign.id} updated to PUBLISHED with onchain_id ${onchainId}`);
            } else {
                console.error(`Failed to update campaign ID ${campaign.id}.`);
            }
        }
    }
};

const getUserByWalletAddress = async (walletAddress: string): Promise<User | null> => {
    let client: PoolClient | undefined;

    try {
        client = await pool.connect();
        console.log(`Searching for user with wallet address: ${walletAddress}`);

        const result: QueryResult<User> = await client.query(
            "SELECT * FROM donation_app_hederauser WHERE wallet_address = $1",
            [walletAddress],
        );

        if (result.rows.length === 0) {
            console.log(`No user found with wallet address: ${walletAddress}`);
            return null;
        }

        const user = result.rows[0];
        console.log(`User found:`, user);
        return user;
    } catch (error) {
        console.error("Error fetching user by wallet address:", error);
        return null;
    } finally {
        if (client) {
            client.release();
        }
    }
};

const upsertDonationsInBatch = async (donations: DonationUpsert[]): Promise<void> => {
    let client: PoolClient | undefined;

    try {
        client = await pool.connect();
        console.log("Starting batch upsert transaction...");

        // Begin transaction
        await client.query("BEGIN");

        const upsertQuery = `
            INSERT INTO donation_app_donation (campaign_id, user_id, transaction_hash, amount, date)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (campaign_id, user_id, transaction_hash)
            DO UPDATE SET
                amount = EXCLUDED.amount,
                date = NOW()
        `;

        for (const donation of donations) {
            await client.query(upsertQuery, [
                donation.campaignId,
                donation.userId,
                donation.transactionHash,
                donation.amount,
            ]);
            console.log(
                `Upserted donation: campaignId=${donation.campaignId}, userId=${donation.userId}, transactionHash=${donation.transactionHash}`,
            );
        }

        // Commit transaction
        await client.query("COMMIT");
        console.log("Batch upsert transaction committed successfully.");
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK"); // Rollback transaction on error
            console.error("Batch upsert transaction rolled back due to an error:", error);
        } else {
            console.error("Error during batch upsert transaction:", error);
        }
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
};

const processLogs = async (): Promise<void> => {
    const KEY_CRAWL = "crawl_onchain";
    while (true) {
        let client: PoolClient | undefined;

        try {
            client = await pool.connect();
            console.log("Connected to PostgreSQL successfully!");

            // Query for the key existence dynamically
            const result: QueryResult = await client.query(
                "SELECT key, start_at, value FROM donation_app_lastindexcrawl WHERE key = $1 LIMIT 1",
                [KEY_CRAWL],
            );

            if (result.rows.length === 0) {
                console.log("No matching keys found in the database. Skipping this iteration.");
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
                continue;
            }

            const { key, start_at, value } = result.rows[0];
            const nowTimestamp = Math.floor(Date.now() / 1000).toString();

            let fromTimestamp: string | null = null;

            if (!value) {
                fromTimestamp = start_at || null; // Use start_at if provided, otherwise start from the beginning
            } else {
                fromTimestamp = value; // Continue from the last crawled timestamp
            }

            console.log(`Crawling logs for key "${key}" from: ${fromTimestamp} to: ${nowTimestamp}`);

            const donors: DonationUpsert[] = [];
            // Fetch and decode logs
            const logs = await fetchLogs(fromTimestamp, nowTimestamp);
            const jsonLogs = decodeLogs(logs);
            for (const jsonLog of jsonLogs) {
                console.log(jsonLog);

                if (jsonLog.eventName === "DonationReceived") {
                    const transactionHash = jsonLog.transactionHash;
                    const amount = jsonLog.args.amount;

                    const accountId = (await evmAddressToAccountId(jsonLog.args.donor)).toString();
                    const user = await getUserByWalletAddress(accountId);
                    const campaign = await getCampaignByOnchainId(Number(jsonLog.args.campaignId));

                    if (!user || !campaign) continue;

                    console.log(`Transaction Hash: ${jsonLog.transactionHash}`);
                    console.log(`Donor Account ID: ${accountId}`);
                    console.log(`User Info:`, user);
                    console.log(`Campaign Info:`, campaign);
                    console.log(`Amount:`, amount);

                    donors.push({
                        campaignId: campaign?.id || 0,
                        userId: user?.id || 0,
                        amount: Number(amount),
                        transactionHash: transactionHash,
                    });
                } else if (jsonLog.eventName === "CampaignClosed") {
                    const campaign = await getCampaignByOnchainId(Number(jsonLog.args.campaignId));
                    if (campaign && campaign.onchain_id) {
                        await updateCampaignIdOnchainAndStatus(campaign.id, campaign.onchain_id, CampaignStatus.CLOSED);
                    }
                }
            }
            await upsertDonationsInBatch(donors);
            await processNewCampaigns();

            // Update the value with the latest timestamp (now)
            await client.query("UPDATE donation_app_lastindexcrawl SET value = $1, updated_at = NOW() WHERE key = $2", [
                Number(nowTimestamp) - 100,
                key,
            ]);
            console.log(`Database updated for key "${key}" with the latest timestamp.`);
        } catch (error) {
            console.error("Error processing logs:", error);
        } finally {
            if (client) {
                client.release();
            }
        }

        // Sleep for a few seconds before the next iteration
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
};
// function get user by address wallet
// Execute the processLogs function
processLogs().catch((error) => {
    console.error("Fatal error in processLogs:", error);
});
