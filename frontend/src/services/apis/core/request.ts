import api from "../api";
import {
  ICampaign,
  ICampaignDetailResponse,
  ICampaignDonationHistory,
  ICampaignType,
  ICreateCampaignPayload,
  IDonationHistory,
  IToken,
  ITopCampaign,
  ITopDonor,
  IUserInfo,
  IUserUpdatePayload,
} from "./types";

// Fetch user info
export const getUserInfo = async (): Promise<IUserInfo> => {
  const response = await api.get<IUserInfo>("/user/info");
  return response.data;
};

// Fetch campaigns
export const getCampaigns = async (): Promise<ICampaign[]> => {
  const response = await api.get<ICampaign[]>("/campaigns");
  return response.data;
};

// Fetch campaign details
export const getCampaignDetails = async (
  id: string
): Promise<ICampaignDetailResponse> => {
  const response = await api.get<ICampaignDetailResponse>(`/campaigns/${id}`);
  return response.data;
};

// Fetch donation history
export const getDonationHistory = async (): Promise<IDonationHistory[]> => {
  const response = await api.get<IDonationHistory[]>("/user/donation-history");
  return response.data;
};

// Fetch top campaigns
export const getTopCampaigns = async (): Promise<ITopCampaign[]> => {
  const response = await api.get<ITopCampaign[]>("/top-campaigns");
  return response.data;
};

// Fetch top donors
export const getTopDonors = async (): Promise<ITopDonor[]> => {
  const response = await api.get<ITopDonor[]>("/top-donors");
  return response.data;
};

// Fetch campaign types
export const listCampaignTypes = async (): Promise<ICampaignType[]> => {
  const response = await api.get<ICampaignType[]>("/campaign-types");
  return response.data;
};

// Fetch tokens
export const listTokens = async (): Promise<IToken[]> => {
  const response = await api.get<IToken[]>("/tokens");
  return response.data;
};

export const getUserCampaigns = async (): Promise<ICampaign[]> => {
  const response = await api.get<ICampaign[]>("/user/campaigns");
  return response.data;
};

// Fetch donation history by campaign
export const getDonationHistoryByCampaign = async (
  campaignId: number
): Promise<ICampaignDonationHistory[]> => {
  const response = await api.get<ICampaignDonationHistory[]>(
    `/campaigns/${campaignId}/donations`
  );
  return response.data;
};

// Update user
export const updateUser = async (
  payload: IUserUpdatePayload
): Promise<void> => {
  await api.put("/user/update", payload);
};

// Create campaign
export const createCampaign = async (
  payload: ICreateCampaignPayload
): Promise<void> => {
  await api.post("/campaigns", payload);
};
