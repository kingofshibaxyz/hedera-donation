import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationPlatform, ERC20Token } from "../typechain-types";

describe("DonationPlatform", () => {
    let donationPlatform: DonationPlatform;
    let mockToken: ERC20Token;
    let admin: any;
    let worker: any;
    let user: any;

    before(async () => {
        [admin, worker, user] = await ethers.getSigners();
    });

    beforeEach(async () => {
        const TokenFactory = await ethers.getContractFactory("ERC20Token");
        mockToken = await TokenFactory.deploy("Mock Token", "MTK");
        await mockToken.waitForDeployment();

        const DonationPlatformFactory = await ethers.getContractFactory("DonationPlatform");
        donationPlatform = await DonationPlatformFactory.deploy();
        await donationPlatform.waitForDeployment();

        await donationPlatform.grantRole(await donationPlatform.WORKER_ROLE(), worker.address);
        await donationPlatform.grantRole(await donationPlatform.ADMIN_ROLE(), admin.address);
    });

    describe("Donations", () => {
        it("Should allow a user to donate with an ERC20 token", async () => {
            const title = "Test Campaign";
            const description = "This is a test campaign";
            const token = mockToken.target;
            const goal = ethers.parseUnits("1000", 18);
            const donationAmount = ethers.parseUnits("100", 18);

            await donationPlatform.connect(worker).publishAndApproveCampaign(0, title, token, goal, worker.address);
            const campaign = await donationPlatform.getCampaign(0);
            expect(campaign.approved).to.be.true;

            await mockToken.mint(user.address, donationAmount);
            await mockToken.connect(user).approve(donationPlatform.target, donationAmount);
            await donationPlatform.connect(user).donate(0, donationAmount);

            const updatedCampaign = await donationPlatform.getCampaign(0);
            expect(updatedCampaign.currentAmount).to.equal(donationAmount);
        });
    });

    describe("Withdrawals", () => {
        it("Should allow the organizer to withdraw funds (ERC20 token)", async () => {
            const title = "Test Campaign";
            const description = "This is a test campaign";
            const token = mockToken.target;
            const goal = ethers.parseUnits("1000", 18);
            const donationAmount = ethers.parseUnits("100", 18);

            await donationPlatform.connect(worker).publishAndApproveCampaign(0, title, token, goal, worker.address);
            const campaign = await donationPlatform.getCampaign(0);
            expect(campaign.approved).to.be.true;

            await mockToken.mint(user.address, donationAmount);
            await mockToken.connect(user).approve(donationPlatform.target, donationAmount);
            await donationPlatform.connect(user).donate(0, donationAmount);

            const beforeBalance = await mockToken.balanceOf(worker.address);
            await donationPlatform.connect(worker).withdrawFunds(0);
            const afterBalance = await mockToken.balanceOf(worker.address);

            expect(afterBalance - beforeBalance).to.equal(donationAmount);
        });
    });
});
