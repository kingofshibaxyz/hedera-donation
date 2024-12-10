import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useCampaigns } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { useNavigate } from "react-router-dom";

const AllCampaignsPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch campaigns data from the API
  const { data: campaigns, isLoading, error } = useCampaigns();

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
          All Campaigns
        </h2>

        {/* Show loading state */}
        {isLoading && (
          <p className="text-center text-gray-600">Loading campaigns...</p>
        )}

        {/* Show error state */}
        {error && (
          <p className="text-center text-red-600">Failed to load campaigns.</p>
        )}

        {/* Campaigns grid */}
        {!isLoading && campaigns && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                <img
                  src={campaign.image || "https://via.placeholder.com/150"}
                  alt={campaign.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-bold text-blue-700">
                      {campaign.title}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        campaign.status || ""
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    {campaign.description}
                  </p>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-red-600 h-full transition-all duration-700 ease-in-out"
                      style={{
                        width: `${campaign.progress || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    {campaign.progress || 0}% funded
                  </p>
                  <div className="text-center">
                    <div className="flex justify-between items-center mt-6">
                      <button
                        onClick={() =>
                          navigate(
                            `${UrlMapping.campaign_detail}/${campaign.id}`
                          )
                        }
                        className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 transition duration-300"
                      >
                        View Campaign
                      </button>
                      <nav className="text-green-500">
                        Created:{" "}
                        {campaign.created_at
                          ? `${formatDistanceToNow(
                              new Date(campaign.created_at),
                              {
                                addSuffix: true,
                              }
                            )}`
                          : "Unknown time ago"}
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllCampaignsPage;
