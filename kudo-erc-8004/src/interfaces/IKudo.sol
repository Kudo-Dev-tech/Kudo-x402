// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
    IAccessControlDefaultAdminRules
} from "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

interface IKudo is IERC721, IERC721Metadata, IAccessControlDefaultAdminRules {
    /// @notice Covenant NFT Status
    enum CovenantStatus {
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    /// @notice Covenant NFT details
    struct CovenantData {
        /// @notice Agent wallet address
        address agentWallet;
        /// @notice Agent identity NFT ID from IdentityRegistry
        uint256 agentId;
        /// @notice The current status of the covenant
        CovenantStatus status;
        /// @notice The Covenant NFT Type
        string nftType;
        /// @notice The description of the ask statement
        string ask;
        /// @notice The description of the promise
        string covenantPromise;
        /// @notice The details of the goal
        string promiseDetail;
        /// @notice The settlement data for covenant ask evaluation
        string askSettlementData;
        /// @notice The settlement data for covenant promise evaluation
        string promiseSettlementData;
        /// @notice The ability score
        uint128 abilityScore;
        /// @notice The debt amount for this covenant
        uint256 debtAmount;
    }

    /// @notice Covenant details for getter functions
    struct CovenantDetails {
        /// @notice covenant nft id
        uint256 nftId;
        /// @notice The agent name
        string agentName;
        /// @notice The agent identifier
        string agentId;
        /// @notice The owner of the covenant
        address owner;
        /// @notice Promise Settlement data
        string promiseSettlementData;
        /// @notice Covenant NFT data
        CovenantData covenantData;
    }

    /// @notice EVALUATOR_CONTRACT_ROLE for access control
    function EVALUATOR_CONTRACT_ROLE() external view returns (bytes32);

    /// @notice Registers a new Covenant NFT
    /// @dev Only agents registered in IdentityRegistry can mint covenant NFTs
    function mintCovenant(
        uint256 agentId,
        uint256 debtAmount,
        string calldata covenantPromise,
        string calldata ask,
        string calldata nftType
    ) external returns (uint256);

    /// @notice Registers a new Covenant NFT on behalf of an agent with signature verification
    /// @param agentAddress The address of the agent minting the covenant
    /// @param agentId The agent's identity NFT ID from IdentityRegistry
    /// @param debtAmount The debt amount for this covenant
    /// @param covenantPromise The promise in the covenant
    /// @param ask The associated ask tied to the covenant
    /// @param nftType The type or category of the NFT
    /// @param signature The signature from the agent authorizing this mint
    function mintCovenantOnBehalfOf(
        address agentAddress,
        uint256 agentId,
        uint256 debtAmount,
        string calldata covenantPromise,
        string calldata ask,
        string calldata nftType,
        bytes calldata signature
    ) external returns (uint256);

    /// @notice Sets the ask settlement data and promise details for a specific NFT
    /// @param nftId The ID of the NFT that the settlement data is being set
    /// @param settlementData Ask settlement data
    /// @param promiseDetail Additional promises of the covenant NFT
    function setAskSettlementData(uint256 nftId, string calldata settlementData, string calldata promiseDetail) external;

    /// @notice Sets settlement data for a specific Covenant NFT and triggers validation request
    /// @param nftId The ID of the Covenant NFT
    /// @param data Settlement data
    /// @param requestUri URI containing validation request details
    function setPromiseSettlementData(uint256 nftId, string calldata data, string calldata requestUri) external;

    /// @notice Evaluates settlement data and submits validation response
    /// @param nftId The ID of the Covenant NFT
    /// @param status The new status of the covenant
    function setCovenantStatus(uint256 nftId, CovenantStatus status) external;

    /// @notice Retrieves desired covenants details
    /// @param nftId The ID of the target NFT for retrieving covenant details
    /// @return CovenantDetails Details of specific NFT
    function getCovenantDetails(uint256 nftId) external view returns (CovenantDetails memory);

    /// @notice Retrieves all of the covenants details
    /// @return CovenantDetails[] Details of all covenant NFT
    function getCovenantsDetails() external view returns (CovenantDetails[] memory);

    /// @notice Retrieves agent assigned covenants details
    /// @param agent Agent wallet address
    /// @return CovenantData[] Details of agent assigned covenant NFT
    function getAgentCovenantsData(address agent) external view returns (CovenantData[] memory);

    /// @notice Retrieves covenants with a specific status
    /// @param status The covenant status to filter by
    /// @return CovenantData[] Array of covenants matching the specified status
    function getCovenantsWithStatus(CovenantStatus status) external view returns (CovenantData[] memory);

    /// @notice Retrieves details of a specific Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @return CovenantData Covenant NFT details
    function getCovenant(uint256 nftId) external view returns (CovenantData memory);

    /// @notice Gets the income score for an agent from IncomeHistory contract
    /// @param agent The agent address
    /// @return incomeScore The income score (0-100)
    function getIncomeScore(address agent) external view returns (uint256);

    /// @notice Gets the payment score for an agent from PaymentHistory contract
    /// @param agent The agent address
    /// @return paymentScore The payment score (0-100)
    function getPaymentScore(address agent) external view returns (uint256);

    /// @notice Gets the combined credit score for an agent
    /// @dev Fetches income and payment scores from their respective contracts and calculates credit score
    /// @param agent The agent address
    /// @return creditScore A credit score between 300 and 850
    function getAgentCreditScore(address agent) external view returns (uint256);

    /// @notice Calculates credit limit based on credit score
    /// @param creditScore The agent's credit score
    /// @param maxLimit The maximum credit limit (in smallest unit)
    /// @return The calculated credit limit
    function calculateCreditLimit(uint256 creditScore, uint256 maxLimit) external pure returns (uint256);

    /// @notice Gets the default credit limit for new covenants
    /// @return The credit limit in smallest unit
    function getCreditLimit() external view returns (uint256);

    /// @notice Gets the agent's credit limit based on their credit score
    /// @param agent The address of the agent
    /// @return The agent's credit limit in smallest unit
    function getAgentCreditLimit(address agent) external view returns (uint256);

    /// @notice Gets the total debt amount for an agent
    /// @param agent The address of the agent
    /// @return The total debt amount in smallest unit
    function getAgentDebt(address agent) external view returns (uint256);

    /// @notice Gets the available credit limit for an agent
    /// @param agent The address of the agent
    /// @return The available credit limit in smallest unit
    function getAgentAvailableCredit(address agent) external view returns (uint256);
}
