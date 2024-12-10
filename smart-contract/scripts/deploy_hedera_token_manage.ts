import { Signer } from "ethers";
import * as fs from "fs";
import * as hre from "hardhat";
import * as path from "path";
import { HederaERC20TokenManage } from "../typechain-types";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const ethers = hre.ethers;
const tokenManagementAbiPath = path.join(
    __dirname,
    "../contract-flattens/HederaERC20TokenManage/HederaERC20TokenManage.abi",
);
const tokenManagementBytecodePath = path.join(
    __dirname,
    "../contract-flattens/HederaERC20TokenManage/HederaERC20TokenManage.bin",
);

const EXISTING_CONTRACT_ADDRESS = "0x9c8Dd155371608e20e5153D0508635Ed6CE07c9f"; // Replace with actual address if attaching

async function main() {
    const provider = ethers.provider;
    const network = await provider.getNetwork();

    const accounts: Signer[] = await ethers.getSigners();
    const [admin] = accounts;

    console.table({
        Admin: await admin.getAddress(),
    });

    const abi = JSON.parse(fs.readFileSync(tokenManagementAbiPath, "utf8"));
    const bytecode = fs.readFileSync(tokenManagementBytecodePath, "utf8");
    const tokenManagementFactory = new ethers.ContractFactory(abi, bytecode, admin);

    let tokenManagement: HederaERC20TokenManage;

    if (EXISTING_CONTRACT_ADDRESS) {
        // Attach mode
        console.log(`Attaching to existing contract at: ${EXISTING_CONTRACT_ADDRESS}`);
        tokenManagement = tokenManagementFactory.attach(EXISTING_CONTRACT_ADDRESS) as HederaERC20TokenManage;
    } else {
        // Deploy mode
        console.log("Deploying new HederaERC20TokenManage contract...");
        tokenManagement = (await tokenManagementFactory.deploy({
            gasLimit: 10000000,
        })) as HederaERC20TokenManage;
        console.log("HederaERC20TokenManage deployed to:", await tokenManagement.getAddress());

        console.log("Creating tokens...");
        let tx = await tokenManagement.createToken("Hedera Donation Mock USD", "HDM_USD", 8, 0, {
            value: ethers.parseEther("20"),
        });
        await tx.wait();
        console.log("Token Hedera Donation Mock USD created successfully.");

        await sleep(10000); // Adding delay to ensure sequential transactions

        tx = await tokenManagement.createToken("Hedera Donation Mock Ethereum", "HDM_ETH", 8, 0, {
            value: ethers.parseEther("20"),
        });
        await tx.wait();
        console.log("Token Hedera Donation Mock Ethereum created successfully.");
    }

    // Example operations for attach mode (e.g., token association)
    console.log("Associating tokens...");
    let tx = await tokenManagement.tokenAssociate(0, {
        gasLimit: 15_000_000,
    });
    console.log("Token ID 0 associated successfully.");

    tx = await tokenManagement.tokenAssociate(1, {
        gasLimit: 15_000_000,
    });
    console.log("Token ID 1 associated successfully.");

    console.log("Deployment and token setup completed successfully.");

    tx = await tokenManagement.mint(0, "0x42c575262c603d341ef5b7112fc1eb78d909f622", 10000000000, {
        gasLimit: 15_000_000,
    });
}

// Execute the script with proper error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });
