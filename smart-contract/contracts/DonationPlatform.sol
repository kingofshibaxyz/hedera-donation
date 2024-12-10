// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./hedera/system/SafeHederaTokenService.sol";

/**
 * @title DonationPlatform
 * @dev A donation platform on Hedera blockchain for organizing campaigns, approving, donating, and withdrawing.
 */
contract DonationPlatform is AccessControl, ReentrancyGuard, SafeHederaTokenService {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WORKER_ROLE = keccak256("WORKER_ROLE");
    bool public useErc20Mode = true;

    struct Campaign {
        string title;
        address organizer;
        address token;
        uint256 goal;
        uint256 currentAmount;
        bool approved;
        bool isClosed;
    }

    Campaign[] public campaigns;
    mapping(uint256 => uint256) public donationsPerCampaign;
    mapping(uint256 => mapping(address => uint256)) public donationsByUser;

    event CampaignPublished(
        uint256 indexed offChainId,
        uint256 indexed campaignId,
        address organizer,
        address token,
        uint256 goal
    );
    event DonationReceived(uint256 campaignId, address indexed donor, uint256 amount, uint256 totalDonationTokens);
    event CampaignClosed(uint256 campaignId, address indexed organizer, uint256 totalDonationTokens);
    event CampaignApprovalChanged(uint256 campaignId, bool approved);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    modifier onlyWorker() {
        require(hasRole(WORKER_ROLE, msg.sender), "Caller is not a worker");
        _;
    }

    function publishAndApproveCampaign(
        uint256 _offChainId,
        string memory _title,
        address _token,
        uint256 _goal,
        address organizer
    ) external onlyWorker {
        require(_goal > 0, "Goal must be greater than 0");
        require(bytes(_title).length > 0, "Title must not be empty");
        require(organizer != address(0), "Organizer address must not be zero");
        require(_token != address(0), "Token address must not be zero");

        campaigns.push(
            Campaign({
                title: _title,
                organizer: organizer,
                token: _token,
                goal: _goal,
                currentAmount: 0,
                approved: true,
                isClosed: false
            })
        );

        uint256 campaignId = campaigns.length - 1;

        emit CampaignPublished(_offChainId, campaignId, organizer, _token, _goal);
    }

    function changeCampaignApproval(uint256 _campaignId, bool _approved) external onlyAdmin {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.approved != _approved, "Campaign is already in the desired state");
        campaign.approved = _approved;
        emit CampaignApprovalChanged(_campaignId, _approved);
    }

    function donate(uint256 _campaignId, uint256 _amount) external nonReentrant {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.approved, "Campaign is not approved");
        require(!campaign.isClosed, "Campaign is closed");
        require(_amount > 0, "Amount must be greater than 0");

        if (useErc20Mode) {
            IERC20 token = IERC20(campaign.token);
            require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        } else {
            safeTransferToken(campaign.token, msg.sender, address(this), _amount);
        }

        campaign.currentAmount += _amount;
        donationsByUser[_campaignId][msg.sender] += _amount;
        donationsPerCampaign[_campaignId] += _amount;
        emit DonationReceived(_campaignId, msg.sender, _amount, campaign.currentAmount);
    }

    function withdrawFunds(uint256 _campaignId) external nonReentrant {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.organizer == msg.sender, "Only the organizer can withdraw funds");
        require(!campaign.isClosed, "Campaign is already closed");
        require(campaign.currentAmount > 0, "No funds to withdraw");

        uint256 amountToWithdraw = campaign.currentAmount;
        campaign.isClosed = true;

        if (useErc20Mode) {
            IERC20 token = IERC20(campaign.token);
            require(token.transfer(msg.sender, amountToWithdraw), "Token transfer failed");
        } else {
            safeTransferToken(campaign.token, address(this), msg.sender, amountToWithdraw);
        }

        emit CampaignClosed(_campaignId, msg.sender, amountToWithdraw);
    }

    function getCampaign(uint256 _campaignId) external view returns (Campaign memory) {
        require(_campaignId < campaigns.length, "Campaign does not exist");
        return campaigns[_campaignId];
    }
}
