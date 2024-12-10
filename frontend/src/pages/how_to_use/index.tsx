import NavigationBar from "@/components/NavBar";
import React from "react";

const HowToUsePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
          How to Use Hedera Donations
        </h2>
        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Getting Started
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            To get started, you need to connect your wallet to our platform.
            Click on the "Connect Wallet" button at the top of the page. We
            support multiple wallets, so choose the one that works best for you.
            Once connected, you'll be able to browse campaigns and make
            donations easily.
          </p>
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Creating a Campaign
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            If you want to start your own campaign, click on the "Create
            Campaign" button. Fill out the campaign form with a title,
            description, donation goal, and any images or videos that will help
            communicate your cause. After submitting, your campaign will be
            reviewed and published on the platform.
          </p>
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Donating to a Campaign
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            Browse the list of campaigns by clicking on "All Campaigns." Once
            you find a campaign that resonates with you, click on it to view
            more details. You can then click the "Donate Now" button, specify
            the amount you want to contribute, and complete the transaction
            using your connected wallet.
          </p>
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Tracking Your Donations
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            After donating, you can track the progress of campaigns and see how
            your contribution is making an impact. All donations are recorded on
            the blockchain, so you can verify transactions anytime for complete
            transparency.
          </p>
        </section>
      </main>
    </div>
  );
};

export default HowToUsePage;
