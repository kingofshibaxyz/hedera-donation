import { ENV } from "../config/env";
import { LogEntry } from "../models/interfaces";

export const fetchLogs = async (fromTimestamp: string | null, toTimestamp: string): Promise<LogEntry[]> => {
    try {
        const contractId = ENV.HEDERA_CONTRACT_ID;
        const url = fromTimestamp
            ? `${ENV.MIRROR_NODE}/api/v1/contracts/${contractId}/results/logs?timestamp=gte:${fromTimestamp}&timestamp=lte:${toTimestamp}`
            : `${ENV.MIRROR_NODE}/api/v1/contracts/${contractId}/results/logs?timestamp=lte:${toTimestamp}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching logs: ${response.statusText}`);
        }

        const data = await response.json();
        return data.logs.map((log: any) => ({
            topics: log.topics,
            data: log.data,
            transaction_hash: log.transaction_hash,
        }));
    } catch (error) {
        console.error("Error fetching logs:", error);
        return [];
    }
};
