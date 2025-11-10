// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";
import {IKudo} from "./interfaces/IKudo.sol";

contract PaymentHistory {
    enum Status {
        LATE,
        PAID
    }

    struct Payment {
        bytes32 requestHash;
        uint256 covenantId;
        Status status;
    }

    // Owner of the contract (can manage validators)
    address public owner;

    // References to external contracts
    IValidationRegistry immutable i_validationRegistry;
    IKudo public i_kudo;

    // Store verified payments per agent
    mapping(address => Payment[]) public verifiedPayments;

    // Track approved validators
    mapping(address => bool) public isValidator;

    // Events
    event PaymentValidated(address indexed agent, uint256 covenantId, uint8 score);
    event PaymentMarkedLate(address indexed agent, uint256 covenantId);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event KudoSet(address indexed kudo);

    modifier onlyValidator() {
        require(isValidator[msg.sender], "Only validator can call");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(address validationRegistry, address _owner) {
        i_validationRegistry = IValidationRegistry(validationRegistry);
        owner = _owner;
    }

    /**
     * @notice Set the Kudo contract address (only owner can call)
     * @param _kudo The address of the Kudo contract
     */
    function setKudo(address _kudo) external onlyOwner {
        require(_kudo != address(0), "Invalid Kudo address");
        i_kudo = IKudo(_kudo);
        emit KudoSet(_kudo);
    }

    /**
     * @notice Add a new validator address
     * @param validator The address to add as a validator
     */
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!isValidator[validator], "Already a validator");

        isValidator[validator] = true;
        emit ValidatorAdded(validator);
    }

    /**
     * @notice Remove a validator address
     * @param validator The address to remove as a validator
     */
    function removeValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(isValidator[validator], "Not a validator");

        isValidator[validator] = false;
        emit ValidatorRemoved(validator);
    }

    /**
     * @notice Transfer ownership to a new owner
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @notice Validate a payment for a specific agent/covenant
     * @param agent The address of the agent making the payment
     * @param covenantId The ID of the covenant
     * @param score The validation score (0 or 100)
     * @param requestHash The hash of the validation request
     * @param responseUri Optional URI pointing to proof of payment
     * @param responseHash Hash of the response content
     * @param tag Optional tag for categorization
     */
    function validatePayment(
        address agent,
        uint256 covenantId,
        uint8 score,
        bytes32 requestHash,
        string calldata responseUri,
        bytes32 responseHash,
        bytes32 tag
    ) public onlyValidator {
        require(score == 0 || score == 100, "Score must be 0 or 100");

        if (score == 100) {
            verifiedPayments[agent]
            .push(Payment({requestHash: requestHash, covenantId: covenantId, status: Status.PAID}));

            i_kudo.setCovenantStatus(covenantId, IKudo.CovenantStatus.COMPLETED);
        }

        i_validationRegistry.validationResponse(requestHash, score, responseUri, responseHash, tag);

        emit PaymentValidated(agent, covenantId, score);
    }

    /**
     * @notice Mark a list of payments as late
     * @param agent The address of the agent
     * @param covenantIds Array of covenant IDs to mark as late
     */
    function markLatePayments(address agent, uint256[] calldata covenantIds) external onlyValidator {
        for (uint256 i = 0; i < covenantIds.length; i++) {
            verifiedPayments[agent].push(Payment({requestHash: 0x0, covenantId: covenantIds[i], status: Status.LATE}));
            emit PaymentMarkedLate(agent, covenantIds[i]);
        }
    }

    /**
     * @notice Get all verified payments for an agent
     * @param agent The agent address
     * @return Array of Payment structs
     */
    function getVerifiedPayments(address agent) external view returns (Payment[] memory) {
        return verifiedPayments[agent];
    }

    function getAgentScore(address agent) public view returns (uint8) {
        Payment[] memory payments = verifiedPayments[agent];
        uint256 total = payments.length;

        if (total == 0) {
            return 50; // neutral score if no payments
        }

        uint256 paid = 0;
        for (uint256 i = 0; i < total; i++) {
            if (payments[i].status == Status.PAID) {
                paid++;
            }
        }

        uint256 scoreBase = (paid * 100) / total;

        // History boost
        uint256 N_scale = 10; // adjust as desired
        uint256 H_max = 150; // 150% multiplier represented as 100..150
        uint256 historyBoost = 100 + (total >= N_scale ? H_max - 100 : (total * (H_max - 100)) / N_scale);

        uint256 finalScore = (scoreBase * historyBoost) / 100;
        if (finalScore > 100) finalScore = 100;

        return uint8(finalScore);
    }
}
