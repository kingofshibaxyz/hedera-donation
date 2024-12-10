import { createMutation, createQuery } from "react-query-kit";
import {
  createCampaign,
  getCampaignDetails,
  getCampaigns,
  getDonationHistory,
  getDonationHistoryByCampaign,
  getTopCampaigns,
  getTopDonors,
  getUserCampaigns,
  getUserInfo,
  listCampaignTypes,
  listTokens,
  updateUser,
} from "./request";
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

export const useUserInfo = createQuery<IUserInfo>({
  queryKey: ["useUserInfo"],
  fetcher: () => getUserInfo(),
});

export const useCampaigns = createQuery<ICampaign[]>({
  queryKey: ["useCampaigns"],
  fetcher: () => getCampaigns(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useCampaignDetails = createQuery<
  ICampaignDetailResponse,
  { id: string }
>({
  queryKey: ["useCampaignDetails"],
  fetcher: ({ id }) => getCampaignDetails(id),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useDonationHistory = createQuery<IDonationHistory[]>({
  queryKey: ["useDonationHistory"],
  fetcher: () => getDonationHistory(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTopDonors = createQuery<ITopDonor[]>({
  queryKey: ["useTopDonors"],
  fetcher: () => getTopDonors(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTopCampaigns = createQuery<ITopCampaign[]>({
  queryKey: ["useTopCampaigns"],
  fetcher: () => getTopCampaigns(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useCampaignTypes = createQuery<ICampaignType[]>({
  queryKey: ["useCampaignTypes"],
  fetcher: () => listCampaignTypes(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTokens = createQuery<IToken[]>({
  queryKey: ["useTokens"],
  fetcher: () => listTokens(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useUserCampaigns = createQuery<ICampaign[]>({
  queryKey: ["useUserCampaigns"],
  fetcher: () => getUserCampaigns(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useDonationHistoryByCampaign = createQuery<
  ICampaignDonationHistory[],
  { campaignId: number }
>({
  queryKey: ["useDonationHistoryByCampaign"],
  fetcher: ({ campaignId }) => getDonationHistoryByCampaign(campaignId),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useUpdateUser = createMutation<void, IUserUpdatePayload>({
  mutationFn: updateUser,
});

export const useCreateCampaign = createMutation<void, ICreateCampaignPayload>({
  mutationFn: createCampaign,
});
