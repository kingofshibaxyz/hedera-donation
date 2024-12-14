import React from "react";
import { Route, Routes } from "react-router-dom";
import { UrlMapping } from "./commons/url-mapping.common";
import ProtectedRoute from "./components/ProtectedRoute";
import AllCampaignsPage from "./pages/all_campaigns";
import CampaignDetailsPage from "./pages/campaign_details";
import CreateCampaignPage from "./pages/create_campaign";
import FaucetTokenPage from "./pages/faucet";
import HomePage from "./pages/home";
import HowToUsePage from "./pages/how_to_use";
import InfoPage from "./pages/info";
import LoginPage from "./pages/LoginPage";
import UserInfoPage from "./pages/user_info";

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path={UrlMapping.login} element={<LoginPage />} />

      <Route path={UrlMapping.home} element={<HomePage />} />

      <Route
        path={`${UrlMapping.campaign_detail}/:id`}
        element={<CampaignDetailsPage />}
      />

      <Route
        path={UrlMapping.create_campaign}
        element={<CreateCampaignPage />}
      />

      <Route path={UrlMapping.info} element={<InfoPage />} />

      <Route path={UrlMapping.how_to_use} element={<HowToUsePage />} />

      <Route path={UrlMapping.all_campaign} element={<AllCampaignsPage />} />
      <Route path={UrlMapping.faucet} element={<FaucetTokenPage />} />
      <Route
        path={UrlMapping.user_info}
        element={<ProtectedRoute component={UserInfoPage} />}
      />
    </Routes>
  );
};

export default Router;
