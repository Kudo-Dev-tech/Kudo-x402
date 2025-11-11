// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {
    ERC721,
    IERC721,
    IERC721Metadata
} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    AccessControlDefaultAdminRules,
    IAccessControlDefaultAdminRules
} from "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";
import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";
import {IPaymentHistory} from "./interfaces/IPaymentHistory.sol";
import {IIncomeHistory} from "./interfaces/IIncomeHistory.sol";

contract Kudo is ERC721, AccessControlDefaultAdminRules {
    bytes32 public constant EVALUATOR_CONTRACT_ROLE =
        keccak256("EVALUATOR_CONTRACT_ROLE");

    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Covenant NFT Status
    enum CovenantStatus {
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    /// @notice Covenant NFT id counter
    uint256 private s_nftId;

    uint256 private s_creditLimit;

    IIncomeHistory i_incomeHistory;

    IPaymentHistory public i_paymentHistory;

    /// @notice Stores agent details mapped by their address
    mapping(address agentAddress => AgentManagement agentManagementInfo)
        private s_agentDetails;

    /// @notice Maps NFT ID to its corresponding Covenant data
    mapping(uint256 nftId => CovenantData cNFTDetails)
        private s_nftIdToCovenantData;

    /// @notice Maps agent address to their total debt amount
    mapping(address agent => uint256 debtAmount) private s_agentDebt;

    /// @notice Emitted when new agent is registered
    /// @param agentWallet Agent registered wallet address
    /// @param agentName Agent registered name
    /// @param agentId Agent registered identifier
    /// @param teeId Agent registered tee identifier
    event AgentSet(
        address indexed agentWallet,
        string agentName,
        string agentId,
        string teeId
    );

    /// @notice Emitted when a new Covenant NFT is registered
    /// @param requestId ID for callback identfier
    /// @param agentWallet The wallet address of the agent who registered the covenant
    /// @param nftId The ID of the newly registered Covenant NFT
    event CovenantRegistered(
        bytes32 requestId,
        address indexed agentWallet,
        uint256 indexed nftId
    );

    /// @notice Emitted when settlement data is set for a Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    event PromiseSettlementSet(uint256 nftId, string promiseSettlement);

    /// @notice Emitted when the status of a Covenant NFT is updated
    /// @param nftId The ID of the Covenant NFT
    /// @param status The new status of the covenant (MINTED, IN_PROGRESS, COMPLETED, or FAILED)
    event CovenantPromiseSet(uint256 indexed nftId, CovenantStatus status);

    /// @notice Emitted when the ask settlement details are set for a specific NFT
    /// @param nftId The ID of the NFT
    /// @param askSettlement The description of the ask settlement.
    /// @param promiseDetails Additional promises of the covenant NFT
    event AskSettlementSet(
        uint256 nftId,
        string askSettlement,
        string promiseDetails
    );

    /// @notice Emitted when the covenant ask status is set
    /// @param nftId The ID of the NFT associated
    /// @param status The new status of the covenant ask.
    event CovenantAskSet(uint256 nftId, CovenantStatus status);

    /// @notice Emitted when a new Covenant NFT is minted
    /// @param nftId The unique identifier of the minted NFT
    /// @param agent The address of the agent who minted the NFT
    /// @param nftType The type or category of the NFT
    /// @param covenantPromise The promise in the covenant
    /// @param ask The associated ask tied to the covenant
    event CovenantMinted(
        uint256 nftId,
        address indexed agent,
        string nftType,
        string covenantPromise,
        string ask
    );

    error InvalidParameter();

    /// @notice Thrown when the caller is not an authorized agent
    error AccessForbidden();

    /// @notice Thrown when an agent is already registered
    error AgentRegistered();

    /// @notice Thrown when a required condition is not met
    error ConditionIsNotMet();

    /// @notice Thrown when covenant status not met requirement
    error InvalidCovenantStatus();

    /// @notice Thrown when signature verification fails
    error InvalidSignature();

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
        /// @notice The settlement data for   covenant promise evaluation
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

    /// @notice Agent's management detail
    struct AgentManagement {
        /// @notice The TEE ID the agent is running in
        string teeId;
        /// @notice The ID of the agent
        string agentId;
        /// @notice The agent name
        string agentName;
        /// @notice The set of agents tasks id;
        uint256[] taskId;
    }

    constructor(
        uint256 creditLimit,
        address incomeHistory,
        address paymentHistory,
        address admin,
        uint48 initialDelay
    )
        ERC721("Covenant NFT", "cNFT")
        AccessControlDefaultAdminRules(initialDelay, admin)
    {
        if (incomeHistory == address(0) || paymentHistory == address(0))
            revert InvalidParameter();

        i_incomeHistory = IIncomeHistory(incomeHistory);
        i_paymentHistory = IPaymentHistory(paymentHistory);
        s_creditLimit = creditLimit;
    }

    /// @notice Registers a new Covenant NFT
    /// @dev Only agents registered in IdentityRegistry can mint covenant NFTs
    function mintCovenant(
        uint256 agentId,
        uint256 debtAmount,
        string calldata covenantPromise,
        string calldata ask,
        string calldata nftType
    ) public returns (uint256) {
        if (getAgentCreditScore(msg.sender) < 300) revert ConditionIsNotMet();

        return
            _handleCovenantRegistration(
                msg.sender,
                agentId,
                covenantPromise,
                ask,
                nftType,
                debtAmount
            );
    }

    /// @notice Registers a new Covenant NFT on behalf of an agent with signature verification
    /// @param recipient The address that will receive the NFT
    /// @param agentAddress The address of the agent minting the covenant
    /// @param agentId The agent's identity NFT ID from IdentityRegistry
    /// @param debtAmount The debt amount for this covenant
    /// @param covenantPromise The promise in the covenant
    /// @param ask The associated ask tied to the covenant
    /// @param nftType The type or category of the NFT
    /// @param v The recovery byte of the signature
    /// @param r Half of the ECDSA signature pair
    /// @param s Half of the ECDSA signature pair
    function mintCovenantOnBehalfOf(
        address recipient,
        address agentAddress,
        uint256 agentId,
        uint256 debtAmount,
        string calldata covenantPromise,
        string calldata ask,
        string calldata nftType,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256) {
        if (getAgentCreditScore(agentAddress) < 300) revert ConditionIsNotMet();

        bytes32 messageHash = keccak256(
            abi.encode(
                covenantPromise,
                ask,
                nftType,
                agentAddress,
                debtAmount,
                recipient
            )
        );

        address recoveredSigner = ecrecover(messageHash, v, r, s);

        if (recoveredSigner != agentAddress) {
            revert InvalidSignature();
        }

        uint256 result = _handleCovenantRegistration(
            agentAddress,
            agentId,
            covenantPromise,
            ask,
            nftType,
            debtAmount
        );

        s_nftIdToCovenantData[s_nftId - 1].agentWallet = agentAddress;

        return result;
    }

    /// @notice Sets the ask settlement data and promise details for a specific NFT
    /// @param nftId The ID of the NFT that the settlement data is being set
    /// @param settlementData Ask settlement data
    /// @param promiseDetail Additional promises of the covenant NFT
    function setAskSettlementData(
        uint256 nftId,
        string calldata settlementData,
        string calldata promiseDetail
    ) public {
        s_nftIdToCovenantData[nftId].askSettlementData = settlementData;
        s_nftIdToCovenantData[nftId].promiseDetail = promiseDetail;

        emit AskSettlementSet(
            nftId,
            s_nftIdToCovenantData[nftId].askSettlementData,
            s_nftIdToCovenantData[nftId].promiseSettlementData
        );
    }

    /// @notice Sets settlement data for a specific Covenant NFT and triggers validation request
    /// @param nftId The ID of the Covenant NFT
    /// @param data Settlement data
    /// @param requestUri URI containing validation request details
    function setPromiseSettlementData(
        uint256 nftId,
        string calldata data,
        string calldata requestUri
    ) public {
        if (s_nftIdToCovenantData[nftId].agentWallet != msg.sender) {
            revert AccessForbidden();
        }

        s_nftIdToCovenantData[nftId].promiseSettlementData = data;

        emit PromiseSettlementSet(
            nftId,
            s_nftIdToCovenantData[nftId].promiseSettlementData
        );
    }

    /// @notice Evaluates settlement data and submits validation response
    /// @param nftId The ID of the Covenant NFT
    /// @param status The new status of the covenant
    function setCovenantStatus(
        uint256 nftId,
        CovenantStatus status
    ) external onlyRole(EVALUATOR_CONTRACT_ROLE) {
        s_nftIdToCovenantData[nftId].status = status;

        if (status == CovenantStatus.COMPLETED) {
            address agent = s_nftIdToCovenantData[nftId].agentWallet;
            uint256 debtAmount = s_nftIdToCovenantData[nftId].debtAmount;

            s_agentDebt[agent] -= debtAmount;

            _burn(nftId);
        }

        emit CovenantPromiseSet(nftId, status);
    }

    /// @notice Handles the registration of a Covenant
    /// @dev Processes covenant-related data and stores agent ID for validation
    function _handleCovenantRegistration(
        address to,
        uint256 agentId,
        string calldata covenantPromise,
        string calldata ask,
        string calldata nftType,
        uint256 debtAmount
    ) internal returns (uint256) {
        // Check if debt would exceed credit limit
        uint256 currentDebt = s_agentDebt[to];
        uint256 creditLimit = getAgentCreditLimit(to);
        if (currentDebt + debtAmount > creditLimit) {
            revert ConditionIsNotMet();
        }

        uint256 nftId = s_nftId;

        s_nftIdToCovenantData[nftId].agentWallet = to;
        s_nftIdToCovenantData[nftId].agentId = agentId;
        s_nftIdToCovenantData[nftId].nftType = nftType;
        s_nftIdToCovenantData[nftId].ask = ask;
        s_nftIdToCovenantData[nftId].covenantPromise = covenantPromise;
        s_nftIdToCovenantData[nftId].debtAmount = debtAmount;

        // Add debt to agent's total debt
        s_agentDebt[to] += debtAmount;

        s_agentDetails[to].taskId.push(nftId);

        _mint(to, nftId);

        emit CovenantMinted(nftId, to, nftType, covenantPromise, ask);

        s_nftId++;

        return nftId;
    }

    /// @notice Retrieves desired covenants details
    /// @param nftId The ID of the target NFT for retrieving covenant details
    /// @return CovenantDetails Details of specific NFT
    function getCovenantDetails(
        uint256 nftId
    ) public view returns (CovenantDetails memory) {
        CovenantDetails memory data = CovenantDetails({
            nftId: nftId,
            agentName: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet]
                .agentName,
            agentId: s_agentDetails[s_nftIdToCovenantData[nftId].agentWallet]
                .agentId,
            owner: _ownerOf(nftId),
            promiseSettlementData: s_nftIdToCovenantData[nftId]
                .promiseSettlementData,
            covenantData: s_nftIdToCovenantData[nftId]
        });

        return data;
    }

    /// @notice Retrieves all of the covenants details
    /// @return CovenantDetails[] Details of all covenant NFT
    function getCovenantsDetails()
        external
        view
        returns (CovenantDetails[] memory)
    {
        CovenantDetails[] memory data = new CovenantDetails[](s_nftId);

        for (uint256 i; i < s_nftId; ++i) {
            address agentWallet = s_nftIdToCovenantData[i].agentWallet;
            data[i].nftId = i;
            data[i].agentName = s_agentDetails[agentWallet].agentName;
            data[i].agentId = s_agentDetails[agentWallet].agentId;
            data[i].owner = _ownerOf(i);
            data[i].covenantData = s_nftIdToCovenantData[i];
        }

        return data;
    }

    /// @notice Retrieves agent assigned covenants details
    /// @param agent Agent wallet address
    /// @return CovenantDetails[] Details of agent assigned covenant NFT
    function getAgentCovenantsData(
        address agent
    ) public view returns (CovenantData[] memory) {
        uint256 agentTaskAmt = s_agentDetails[agent].taskId.length;
        CovenantData[] memory data = new CovenantData[](agentTaskAmt);

        for (uint256 i; i < agentTaskAmt; ++i) {
            data[i] = s_nftIdToCovenantData[s_agentDetails[agent].taskId[i]];
        }

        return data;
    }

    /// @notice Retrieves covenants with a specific status
    /// @param status The covenant status to filter by
    /// @return CovenantData[] Array of covenants matching the specified status
    function getCovenantsWithStatus(
        CovenantStatus status
    ) external view returns (CovenantData[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < s_nftId; ++i) {
            if (s_nftIdToCovenantData[i].status == status) {
                count++;
            }
        }

        CovenantData[] memory data = new CovenantData[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < s_nftId; ++i) {
            if (s_nftIdToCovenantData[i].status == status) {
                data[index] = s_nftIdToCovenantData[i];
                index++;
            }
        }
        return data;
    }

    /// @notice Retrieves details of a specific Covenant NFT
    /// @param nftId The ID of the Covenant NFT
    /// @return CovenantData Covenant NFT details
    function getCovenant(
        uint256 nftId
    ) external view returns (CovenantData memory) {
        return s_nftIdToCovenantData[nftId];
    }

    /// @notice Gets the income score for an agent from IncomeHistory contract
    /// @param agent The agent address
    /// @return incomeScore The income score (0-100)
    function getIncomeScore(address agent) public view returns (uint256) {
        return i_incomeHistory.getIncomeScore(agent);
    }

    /// @notice Gets the payment score for an agent from PaymentHistory contract
    /// @param agent The agent address
    /// @return paymentScore The payment score (0-100)
    function getPaymentScore(address agent) public view returns (uint256) {
        return i_paymentHistory.getAgentScore(agent);
    }

    /// @notice Calculates a credit score based on income and payment history
    /// @dev Combines income history (30% weight) and payment history (70% weight) into a credit score (300-850)
    /// @param incomeHistory Income score (0-100)
    /// @param paymentHistory Payment score (0-100)
    /// @return creditScore A credit score between 300 and 850
    function calculateCreditScore(
        uint256 incomeHistory,
        uint256 paymentHistory
    ) internal pure returns (uint256) {
        // Validate input range (allow 0 for initial scores, just ensure they're not too high)
        if (incomeHistory > 100 || paymentHistory > 100) {
            revert InvalidParameter();
        }

        // Weight constants: income 30%, payment 70%
        uint256 weightIncome = 30;
        uint256 weightPayment = 70;

        // Calculate weighted combined score
        uint256 combinedScore = (incomeHistory *
            weightIncome +
            paymentHistory *
            weightPayment) / 100;

        // Scale to credit score range (300-850)
        uint256 creditScore = 300 + (combinedScore * 550) / 100;

        return creditScore;
    }

    /// @notice Gets the combined credit score for an agent
    /// @dev Fetches income and payment scores from their respective contracts and calculates credit score
    /// @param agent The agent address
    /// @return creditScore A credit score between 300 and 850
    function getAgentCreditScore(address agent) public view returns (uint256) {
        uint256 incomeScore = getIncomeScore(agent);
        uint256 paymentScore = getPaymentScore(agent);
        return calculateCreditScore(incomeScore, paymentScore);
    }

    /// @notice Calculates credit limit based on credit score
    /// @param creditScore The agent's credit score
    /// @param maxLimit The maximum credit limit (in smallest unit)
    /// @return The calculated credit limit
    function calculateCreditLimit(
        uint256 creditScore,
        uint256 maxLimit
    ) public pure returns (uint256) {
        if (creditScore < 300 || creditScore > 850) {
            revert InvalidParameter();
        }

        uint256 scoreRange = creditScore - 300;
        uint256 percentageAboveMin = (scoreRange * 90) / 550;
        uint256 percentage = 10 + percentageAboveMin;

        return (maxLimit * percentage) / 100;
    }

    /// @notice Gets the default credit limit for new covenants
    /// @return The credit limit in smallest unit
    function getCreditLimit() public view returns (uint256) {
        return s_creditLimit;
    }

    /// @notice Gets the agent's credit limit based on their credit score
    /// @param agent The address of the agent
    /// @return The agent's credit limit in smallest unit
    function getAgentCreditLimit(address agent) public view returns (uint256) {
        return calculateCreditLimit(getAgentCreditScore(agent), s_creditLimit);
    }

    /// @notice Gets the total debt amount for an agent
    /// @param agent The address of the agent
    /// @return The total debt amount in smallest unit
    function getAgentDebt(address agent) public view returns (uint256) {
        return s_agentDebt[agent];
    }

    /// @notice Gets the available credit limit for an agent
    /// @param agent The address of the agent
    /// @return The available credit limit in smallest unit
    function getAgentAvailableCredit(
        address agent
    ) public view returns (uint256) {
        uint256 creditLimit = getAgentCreditLimit(agent);
        uint256 debt = s_agentDebt[agent];

        return creditLimit > debt ? creditLimit - debt : 0;
    }

    /// @notice Checks if the contract supports a specific interface
    /// @param interfaceId The ID of the interface to check
    /// @return Returns whether the interface is supported
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlDefaultAdminRules, ERC721)
        returns (bool)
    {
        return
            interfaceId == type(IAccessControlDefaultAdminRules).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId;
    }
}
