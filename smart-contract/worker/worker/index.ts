import { ethers } from "ethers";
import { abi, contractAddress, workerSigner } from "../config/contract";
import { CampaignStatus } from "../models/enums";
import { CampaignPublishResult } from "../models/interfaces";
import { getApprovedCampaignJoins, updateCampaignIdOnchainAndStatus } from "../services/campaignService";
import { accountIdToEvmAddress } from "../utils/conversions";

async function publishAndApproveCampaign(campaignDetails: {
    offChainId: number;
    title: string;
    token: string;
    goal: string;
    organizer: string;
}): Promise<CampaignPublishResult | null> {
    const contract = new ethers.Contract(contractAddress, abi, workerSigner);

    try {
        const tx = await contract.publishAndApproveCampaign(
            campaignDetails.offChainId,
            campaignDetails.title,
            campaignDetails.token,
            campaignDetails.goal,
            campaignDetails.organizer,
        );

        const receipt = await tx.wait();
        console.log("Campaign published and approved. Transaction receipt:", receipt);

        const iface = new ethers.Interface(abi);
        const event = receipt.logs
            .map((log: { topics: ReadonlyArray<string>; data: string }) => {
                try {
                    return iface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find((parsedLog: { name: string } | null) => parsedLog?.name === "CampaignPublished");

        if (event) {
            const onchainId = Number(event.args[1]);
            console.log(`Campaign ID ${onchainId} retrieved from the event.`);
            return { onchainId, transactionHash: tx.hash };
        } else {
            console.error("No CampaignPublished event found in the transaction.");
            return null;
        }
    } catch (error) {
        console.error("Error executing publishAndApproveCampaign:", error);
        return null;
    }
}

export const processNewCampaigns = async (): Promise<void> => {
    const pendingCampaigns = await getApprovedCampaignJoins();

    if (pendingCampaigns.length === 0) {
        console.log("No pending campaigns found.");
        return;
    }

    for (const campaign of pendingCampaigns) {
        console.log(`Processing campaign: ${campaign.title}`);
        const evmAddress = await accountIdToEvmAddress(campaign.organizer_wallet_address);

        const campaignDetails = {
            offChainId: campaign.id,
            title: campaign.title,
            token: campaign.token_address,
            goal: ethers.parseUnits(campaign.goal.toString(), 0).toString(),
            organizer: evmAddress,
        };

        const publishResult = await publishAndApproveCampaign(campaignDetails);
        if (publishResult !== null) {
            const { onchainId, transactionHash } = publishResult;
            const success = await updateCampaignIdOnchainAndStatus(
                campaign.id,
                onchainId,
                CampaignStatus.PUBLISHED,
                transactionHash,
                campaign.transaction_hash_withdrawn,
            );
            if (success) {
                console.log(`Campaign ID ${campaign.id} updated to PUBLISHED with onchain_id ${onchainId}`);
            } else {
                console.error(`Failed to update campaign ID ${campaign.id}.`);
            }
        }
    }
};
