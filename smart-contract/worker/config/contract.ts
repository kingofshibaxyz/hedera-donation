import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "./env";

// ABI and Bytecode Paths
const donationPlatformAbiPath = path.join(__dirname, "../../contract-flattens/DonationPlatform/DonationPlatform.abi");
const donationPlatformBytecodePath = path.join(
    __dirname,
    "../../contract-flattens/DonationPlatform/DonationPlatform.bin",
);

export const abi = JSON.parse(fs.readFileSync(donationPlatformAbiPath, "utf8"));
export const bytecode = fs.readFileSync(donationPlatformBytecodePath, "utf8");

// Provider and Signer
export const provider = new ethers.JsonRpcProvider(ENV.RPC_URL);
export const workerSigner = new ethers.Wallet(ENV.WORKER_PRIVATE_KEY, provider);

// Contract Address
export const contractAddress = ENV.CONTRACT_ADDRESS;
