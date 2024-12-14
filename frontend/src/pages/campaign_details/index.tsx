import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useHashConnectContext } from "@/contexts/hashconnect";
import env from "@/env";
import { useHederaDonate } from "@/hooks/useHederaDonate";
import { useHederaTokenApproval } from "@/hooks/useHederaTokenApproval";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  CampaignStatus,
  useCampaignDetails,
  useDonationHistoryByCampaign,
} from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const { walletAddress } = useHashConnectContext();

  const navigate = useNavigate();

  const { donate, error, loading, success, transactionHash } =
    useHederaDonate();

  const {
    checkAndApproveToken,
    error: errorCheckAndApproveToken,
    loading: loadingCheckAndApproveToken,
  } = useHederaTokenApproval();

  // Fetch data
  const {
    data: campaignDetails,
    isLoading: isCampaignLoading,
    refetch: refreshCampaign,
  } = useCampaignDetails({
    variables: { id: id! },
  });

  const {
    data: donationHistory,
    isLoading: isHistoryLoading,
    refetch: refreshHistory,
  } = useDonationHistoryByCampaign({
    variables: { campaignId: Number(id) },
  });

  const { getTokenBalance, balance } = useTokenBalance();

  useEffect(() => {
    if (
      campaignDetails?.campaign?.token?.address &&
      campaignDetails?.campaign?.token?.account_id
    ) {
      if (walletAddress)
        getTokenBalance(
          walletAddress,
          campaignDetails?.campaign?.token?.account_id
        );
    }
  }, [campaignDetails, walletAddress]);

  const handleDonate = async () => {
    if (campaignDetails?.campaign?.onchain_id && donationAmount > 0) {
      const isApproved = await checkAndApproveToken(
        campaign.token?.address || "", //need convert evm address to account id
        env.CONTRACT_ID,
        donationAmount
      );

      if (isApproved) {
        console.log("Token allowance approved successfully.");
      } else {
        console.log("Token allowance approval failed.");
      }

      donate(
        env.CONTRACT_ID,
        Number(campaignDetails.campaign.onchain_id),
        donationAmount
      );

      setTimeout(() => {
        refreshCampaign();
        refreshHistory();
      }, 10000);
    } else {
      console.error("Invalid donation amount or onchain ID.");
    }
  };

  const renderDonationHistory = () => {
    if (isHistoryLoading) {
      return <p>Loading donation history...</p>;
    }

    if (!donationHistory || donationHistory.length === 0) {
      return <p>No donations yet.</p>;
    }

    return donationHistory.map((donation, index) => (
      <div
        key={index}
        className="p-3 border rounded-lg shadow-lg flex items-center space-x-6 hover:bg-gray-50 transition ease-in-out duration-300 mt-3"
      >
        <img
          src={donation.user_image || "https://placehold.co/100x100"}
          alt={donation.campaign_title}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div>
          <p className="text-xl font-bold text-blue-800 cursor-pointer">
            {donation.user_name} | {donation.user_username}
          </p>
          <p className="text-gray-600">
            Amount: {donation.amount} {campaign?.token?.symbol}{" "}
          </p>
          <p className="text-gray-600">
            Donated:{" "}
            {donation.date
              ? `${formatDistanceToNow(new Date(donation.date), {
                  addSuffix: true,
                })}`
              : "Unknown time ago"}
          </p>
          <p className="text-gray-600">
            Transaction Hash:{" "}
            {donation.transaction_hash ? (
              <a
                className="text-green-600 hover:underline"
                href={`${env.EXPLORER_SCAN}/transaction/${donation.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenTransactionHash(donation.transaction_hash)}
              </a>
            ) : (
              "Unknown"
            )}
          </p>
        </div>
      </div>
    ));
  };

  const renderRelatedCampaigns = () => {
    if (!campaignDetails?.related_campaigns) return null;

    return campaignDetails.related_campaigns.map((related) => (
      <div
        key={related.id}
        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
      >
        <img
          src={related.image}
          alt={related.title}
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <h4 className="text-2xl font-bold text-blue-700 mb-4">
            {related.title}
          </h4>
          <p className="text-sm text-gray-600 mb-6">{related.description}</p>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${related.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {related.progress}% funded
          </p>
          <div className="text-center">
            <button
              onClick={() =>
                navigate(`${UrlMapping.campaign_detail}/${related.id}`)
              }
              className="bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition duration-300"
            >
              View Campaign
            </button>
          </div>
        </div>
      </div>
    ));
  };

  if (isCampaignLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavigationBar />
        <div className="text-center mt-20">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!campaignDetails) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavigationBar />
        <div className="text-center mt-20">Campaign not found.</div>
        <Footer />
      </div>
    );
  }

  const { campaign } = campaignDetails;

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />
      <main className="container mx-auto py-16 px-6 md:px-20">
        {/* Campaign Title */}
        <section className="text-center mb-12">
          <div className="flex items-center justify-between">
            {/* Campaign Details */}
            <div className="flex-1 text-center">
              <h2 className="text-5xl font-bold text-blue-800 mb-4">
                {campaign.title}
              </h2>
              <p className="text-lg text-gray-600">
                Organizer: {campaign?.organizer?.username || "Unknown"}
              </p>
            </div>

            {/* Campaign Status */}
            <span
              className={`px-3 py-1 rounded-full text-lg font-medium ${getStatusBadgeClass(
                campaign.status || ""
              )}`}
            >
              {campaign.status || "Unknown"}
            </span>
          </div>
        </section>

        {/* Campaign Image */}
        <div className="relative mb-12">
          <img
            src={campaign?.image || "https://via.placeholder.com/150"}
            alt="Campaign"
            className="w-full max-h-[80vh] rounded-lg object-cover shadow-xl p-5"
          />
        </div>

        {/* Campaign Details */}
        <section className="bg-white rounded-xl p-8 shadow-md mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-6">
            Campaign Details
          </h3>
          <p className="text-xl text-gray-700 leading-relaxed mb-10">
            {campaign.description}
          </p>

          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">
              Created Transaction on Hashscan
            </h4>
            <p className="text-lg text-gray-600 mt-2">
              {campaign.transaction_hash_create ? (
                <a
                  href={`${env.EXPLORER_SCAN}/transaction/${campaign.transaction_hash_create}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm hover:underline"
                >
                  {shortenTransactionHash(campaign.transaction_hash_create)}
                </a>
              ) : (
                <span className="text-red-600 text-sm">
                  No transaction hash available for the creation.
                </span>
              )}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">
              Withdrawn Transaction on Hashscan
            </h4>
            <p className="text-lg text-gray-600 mt-2">
              {campaign.transaction_hash_withdrawn ? (
                <a
                  href={`${env.EXPLORER_SCAN}/transaction/${campaign.transaction_hash_withdrawn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm hover:underline"
                >
                  {shortenTransactionHash(campaign.transaction_hash_withdrawn)}
                </a>
              ) : (
                <span className="text-red-600 text-sm">
                  No transaction hash available for the withdrawal.
                </span>
              )}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">Campaign Type</h4>
            <p className="text-lg text-gray-600 mt-2">
              {campaign?.campaign_type?.name}
            </p>
          </div>
          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">Donation Goal</h4>
            <p className="text-lg text-gray-600 mt-2">
              Goal:{" "}
              <b>
                {campaign?.current_amount} / {campaign.goal}{" "}
                {campaign.token?.symbol}
              </b>
            </p>
          </div>
          <div className="mb-10">
            <h4 className="text-2xl font-bold text-blue-700 mb-4">
              Donation Progress
            </h4>
            <div className="flex justify-center items-center">
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mr-3">
                <div
                  className="bg-red-600 h-full transition-all duration-500 ease-in-out"
                  style={{ width: `${campaign.progress}%` }}
                ></div>
              </div>
              <b className="text-lg text-yellow-500 min-w-28">
                {campaign.progress}% funded
              </b>
            </div>
          </div>
          {campaign.video_link && (
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-blue-700">
                Campaign Video
              </h4>
              <p className="text-md text-blue-500 mt-2 underline">
                <a
                  href={campaign.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch the Campaign Video
                </a>
              </p>
            </div>
          )}
          {campaign.project_url && (
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-blue-700">Project URL</h4>
              <p className="text-md text-blue-500 mt-2 underline">
                <a
                  href={campaign.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit the Project Website
                </a>
              </p>
            </div>
          )}
          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">Your Balance</h4>
            <p className="text-lg text-gray-600 mt-2">
              <b>{balance}</b> {campaign.token?.symbol}
              <span className="text-gray-500"> | </span>
              {campaign.token?.name}
              <span className="text-gray-500"> | </span>
              {campaign.token?.account_id}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700">Donate Now</h4>
            <div className="flex items-center space-x-4 mt-4">
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-60 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter amount"
              />
              <button
                onClick={handleDonate}
                disabled={
                  loading ||
                  donationAmount <= 0 ||
                  campaign.status === CampaignStatus.CLOSED
                }
                className={`py-4 px-10 rounded-full font-semibold text-lg shadow-md transition-all duration-300 ${
                  loading ||
                  donationAmount <= 0 ||
                  campaign.status === CampaignStatus.CLOSED
                    ? "bg-yellow-400 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
                } ${!loading && "animate-bounce"}`}
              >
                {loading ? "Processing..." : "Donate"}
              </button>
            </div>
            {donationAmount <= 0 && (
              <p className="text-red-500 mt-4">
                Please set a valid donation amount.
              </p>
            )}

            {(error || errorCheckAndApproveToken) && (
              <p className="text-red-500 mt-4">
                {error || errorCheckAndApproveToken}
              </p>
            )}
            {loadingCheckAndApproveToken && (
              <p className="text-yellow-400 mt-4">Checking approve token</p>
            )}
            {success && (
              <p className="mt-4 text-lg">
                View on explorer:{" "}
                <a
                  href={`${env.EXPLORER_SCAN}/transaction/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm hover:underline"
                >
                  {transactionHash}
                </a>
              </p>
            )}
          </div>
        </section>

        {/* Donation History */}
        <section className="bg-white rounded-xl p-8 shadow-md mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-6">
            Donation History
          </h3>
          <div className="max-h-96 overflow-y-auto">
            {renderDonationHistory()}
          </div>
        </section>

        {/* Related Campaigns */}
        <section className="mt-16">
          <h3 className="text-4xl font-bold text-blue-800 mb-12 text-center">
            Related Campaigns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {renderRelatedCampaigns()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CampaignDetailsPage;
