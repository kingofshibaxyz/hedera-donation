import {
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicId,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

interface HederaAccount {
    id: string;
    key: PrivateKey;
}

// Load credentials for multiple accounts
const loadAccounts = (): HederaAccount[] => [
    {
        id: process.env.HEDERA_ACCOUNT_ID!,
        key: PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!),
    },
    {
        id: process.env.HEDERA_ACCOUNT_ID_1!,
        key: PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY_1!),
    },
];

// Create Hedera clients for each account
const createClients = (accounts: HederaAccount[]): Client[] => {
    return accounts.map((account) => {
        const client = Client.forTestnet(); // Use `Client.forMainnet()` for production
        client.setOperator(account.id, account.key);
        return client;
    });
};

// Create a new topic
const createTopic = async (client: Client): Promise<TopicId> => {
    const transaction = await new TopicCreateTransaction().execute(client);
    const receipt = await transaction.getReceipt(client);
    if (!receipt.topicId) throw new Error("Failed to create topic");
    return receipt.topicId;
};

// Subscribe to a topic
const subscribeToTopic = (client: Client, topicId: TopicId, accountName: string): void => {
    console.log(`${accountName} is subscribing to the topic...`);
    new TopicMessageQuery().setTopicId(topicId).subscribe(client, null, (message) => {
        const receivedMessage = Buffer.from(message.contents).toString();
        console.log(`${accountName} received message: ${receivedMessage}`);
    });
};

// Submit a message to a topic
const submitMessage = async (client: Client, topicId: TopicId, message: string, accountName: string): Promise<void> => {
    const transaction = await new TopicMessageSubmitTransaction({
        topicId,
        message,
    }).execute(client);

    const receipt = await transaction.getReceipt(client);
    console.log(`${accountName} submitted message with status: ${receipt.status}`);
};

(async function main() {
    try {
        const accounts = loadAccounts();
        const clients = createClients(accounts);

        // 1. Account 1 creates a new topic
        const topicId = await createTopic(clients[0]);
        console.log(`Topic created by Account 1. Topic ID: ${topicId}`);

        // 2. Account 2 subscribes to the topic
        subscribeToTopic(clients[1], topicId, "Account 2");

        // 3. Account 1 submits a message to the topic
        await submitMessage(clients[0], topicId, "Hello from Account 1!", "Account 1");

        // 4. Account 2 submits another message
        await submitMessage(clients[1], topicId, "Hello from Account 2!", "Account 2");
    } catch (error) {
        console.error("Error:", error);
    }
})();
