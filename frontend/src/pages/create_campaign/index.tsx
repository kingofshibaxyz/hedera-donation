import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useUploadFile } from "@/services/apis/auth";
import {
  useCampaignTypes,
  useCreateCampaign,
  useTokens,
} from "@/services/apis/core";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const CreateCampaignPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { data: campaignTypes, isLoading: isTypesLoading } = useCampaignTypes();
  const { data: tokens, isLoading: isTokensLoading } = useTokens();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { mutate: uploadFile, isPending: isPendingUploadFile } =
    useUploadFile();

  const [uploadedImage, setUploadedImage] = useState<string>("");

  const handleImageUpload = (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);

    uploadFile(uploadData, {
      onSuccess: (data) => {
        setUploadedImage(`${data.file_url}`);
      },
      onError: (error: any) => {
        alert(`Error uploading image: ${error.message}`);
      },
    });
  };

  const onSubmit = (data: any) => {
    data.image = uploadedImage; // Set uploaded image URL
    data.campaign_type_id = Number(data.campaign_type_id);
    data.token_id = Number(data.token_id);
    createCampaign(data, {
      onSuccess: () => {
        alert("Campaign created successfully!");
        reset();
        setUploadedImage(""); // Reset uploaded image
      },
      onError: (error) => {
        alert(`Error creating campaign: ${error.message}`);
      },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar />
      <div className="flex justify-center items-center flex-1 py-16 px-6">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-3xl">
          <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center">
            Create a Campaign
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Campaign Title */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Campaign Title
              </label>
              <input
                type="text"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter campaign title"
                {...register("title", {
                  required: "Campaign title is required",
                })}
              />
              {errors.title?.message && (
                <p className="text-red-500">{String(errors.title.message)}</p>
              )}
            </div>

            {/* Campaign Type */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Campaign Type
              </label>
              <select
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                {...register("campaign_type_id", {
                  required: "Campaign type is required",
                })}
                disabled={isTypesLoading}
              >
                <option value="" disabled>
                  {isTypesLoading ? "Loading..." : "Select campaign type"}
                </option>
                {campaignTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.campaign_type_id?.message && (
                <p className="text-red-500">
                  {String(errors.campaign_type_id.message)}
                </p>
              )}
            </div>

            {/* Campaign Description */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Describe your campaign"
                rows={5}
                {...register("description", {
                  required: "Description is required",
                })}
              ></textarea>
              {errors.description?.message && (
                <p className="text-red-500">
                  {String(errors.description.message)}
                </p>
              )}
            </div>

            {/* Donation Goal */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Donation Goal
              </label>
              <div className="flex items-center mt-2 space-x-4">
                {/* Token Type Selector */}
                <select
                  className="w-1/3 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  {...register("token_id", {
                    required: "Token type is required",
                  })}
                  disabled={isTokensLoading}
                >
                  <option value="" disabled>
                    {isTokensLoading ? "Loading..." : "Select token"}
                  </option>
                  {tokens?.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                {/* Goal Amount */}
                <input
                  type="number"
                  className="w-2/3 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter goal amount"
                  {...register("goal", { required: "Goal amount is required" })}
                />
              </div>
              {errors.token_id?.message && (
                <p className="text-red-500">
                  {String(errors.token_id.message)}
                </p>
              )}
              {errors.goal?.message && (
                <p className="text-red-500">{String(errors.goal.message)}</p>
              )}
            </div>

            {/* Campaign Image */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Campaign Image
              </label>
              <input
                type="file"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
              {isPendingUploadFile ? (
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-700">
                    Uploading...
                  </h4>
                  <div className="animate-pulse flex flex-col space-y-4">
                    <div className="h-48 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              ) : (
                uploadedImage && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-700">
                      Preview:
                    </h4>
                    <p className="text-green-500 mt-2">
                      Image uploaded successfully!
                    </p>
                    <img
                      src={uploadedImage}
                      alt="Uploaded Preview"
                      className="w-full h-auto rounded-md shadow-md mt-2"
                    />
                  </div>
                )
              )}
            </div>

            {/* Campaign Video Link */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Campaign Video Link (Optional)
              </label>
              <input
                type="url"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter YouTube or Vimeo link"
                {...register("video_link")}
              />
            </div>

            {/* Project URL */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Project URL (Optional)
              </label>
              <input
                type="url"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter link to the project website"
                {...register("project_url")}
              />
            </div>
            <div className="text-center text-red-600 text-sm mb-4">
              <p>
                Campaigns require admin approval. Please wait for the admin to
                review and approve your campaign. Once approved, your campaign
                will be published. *
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-400 text-blue-800 py-3 px-6 rounded-full font-semibold shadow-md hover:bg-yellow-500 hover:shadow-lg transition-all duration-300 mt-8"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Campaign"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateCampaignPage;
