import { AccountId, Client, PrivateKey, TokenId } from "@hashgraph/sdk";
import { Signer } from "ethers";
import * as fs from "fs";
import * as hre from "hardhat";
import * as path from "path";
import { DonationPlatform } from "../typechain-types";
import { approveTokenAllowance, associateToken } from "./token";

const ethers = hre.ethers;
const donationPlatformAbiPath = path.join(__dirname, "../contract-flattens/DonationPlatform/DonationPlatform.abi");
const donationPlatformBytecodePath = path.join(__dirname, "../contract-flattens/DonationPlatform/DonationPlatform.bin");

async function main() {
    const provider = ethers.provider;
    const accounts: Signer[] = await ethers.getSigners();
    const [admin, worker, donor] = accounts;

    console.table({
        admin: await admin.getAddress(),
        worker: await worker.getAddress(),
        donor: await donor.getAddress(),
    });

    const client = Client.forTestnet();
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);
    client.setOperator(operatorId, operatorKey);

    const tokenInfo = {
        address: "0x00000000000000000000000000000000004fa573", // Replace with your token address
        accountId: "0.0.5219699", // Replace with your token Hedera ID
    };

    const EXISTING_CONTRACT_ADDRESS = "0x0c4424E55AA698a22D8c32EdeF530FD071a6d2B2";
    const EXISTING_CONTRACT_ID = "0.0.5224129";

    // Load ABI and Bytecode
    const abi = JSON.parse(fs.readFileSync(donationPlatformAbiPath, "utf8"));
    const bytecode = fs.readFileSync(donationPlatformBytecodePath, "utf8");

    // Deploy DonationPlatform contract
    let donationPlatform: DonationPlatform;
    const DonationPlatformFactory = new ethers.ContractFactory(abi, bytecode, admin);
    if (EXISTING_CONTRACT_ADDRESS) {
        donationPlatform = DonationPlatformFactory.attach(EXISTING_CONTRACT_ADDRESS) as DonationPlatform;
    } else {
        donationPlatform = (await DonationPlatformFactory.deploy()) as DonationPlatform;
        await donationPlatform.waitForDeployment();
        console.log("DonationPlatform deployed at:", donationPlatform.target);
    }

    // // Grant roles
    // const WORKER_ROLE = await donationPlatform.WORKER_ROLE();
    // const ADMIN_ROLE = await donationPlatform.ADMIN_ROLE();

    // await donationPlatform.connect(admin).grantRole(WORKER_ROLE, await worker.getAddress());
    // console.log(`WORKER_ROLE granted to: ${await worker.getAddress()}`);

    // await donationPlatform.connect(admin).grantRole(ADMIN_ROLE, await admin.getAddress());
    // console.log(`ADMIN_ROLE granted to: ${await admin.getAddress()}`);

    // Token Association
    try {
        await associateToken(client, TokenId.fromString(tokenInfo.accountId), operatorId, operatorKey);
        console.log(`Token ${tokenInfo.accountId} associated successfully.`);
    } catch (error) {
        console.error(`Failed to associate token: ${tokenInfo.accountId}`, error);
    }

    // // Create a Campaign
    // const campaignDetails = {
    //     title: "Test Campaign",
    //     token: tokenInfo.address,
    //     goal: ethers.parseUnits("1000", 18), // 1000 tokens
    //     organizer: admin.getAddress(),
    // };

    // await donationPlatform
    //     .connect(worker)
    //     .publishAndApproveCampaign(
    //         0,
    //         campaignDetails.title,
    //         campaignDetails.token,
    //         campaignDetails.goal,
    //         campaignDetails.organizer,
    //     );
    // console.log("Campaign created successfully:", campaignDetails);

    // for donner
    await approveTokenAllowance(
        client,
        TokenId.fromString(tokenInfo.accountId),
        operatorId,
        AccountId.fromString(EXISTING_CONTRACT_ID),
        10000000000 * 10 ** 8,
        operatorKey,
    );

    // await donationPlatform.connect(admin).donate(0, 10000, {
    //     gasLimit: 15_000_000,
    // });

    // for organizer
    await donationPlatform.connect(admin).withdrawFunds(0, {
        gasLimit: 15_000_000,
    });

    // console.log("DonationPlatform deployment and setup completed.");
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });
