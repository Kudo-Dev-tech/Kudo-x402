// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentHistory {
    enum Status {
        LATE,
        PAID
    }

    struct Payment {
        bytes32 requestHash;
        bytes32 covenantId;
        Status status;
    }

    // Events
    event PaymentValidated(address indexed agent, uint256 covenantId, uint8 score);
    event PaymentMarkedLate(address indexed agent, uint256 covenantId);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event KudoSet(address indexed kudo);

    /**
     * @notice Set the Kudo contract address (only owner can call)
     * @param _kudo The address of the Kudo contract
     */
    function setKudo(address _kudo) external;

    /**
     * @notice Add a new validator address (only owner can call)
     * @param validator The address to add as a validator
     */
    function addValidator(address validator) external;

    /**
     * @notice Remove a validator address (only owner can call)
     * @param validator The address to remove as a validator
     */
    function removeValidator(address validator) external;

    /**
     * @notice Transfer ownership to a new owner
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external;

    /**
     * @notice Validate a payment for a specific agent/covenant with NFT ID
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
    ) external;

    /**
     * @notice Mark a list of payments as late
     * @param agent The address of the agent
     * @param covenantIds Array of covenant IDs to mark as late
     */
    function markLatePayments(address agent, uint256[] calldata covenantIds) external;

    /**
     * @notice Get all verified payments for an agent
     * @param agent The agent address
     * @return Array of Payment structs
     */
    function getVerifiedPayments(address agent) external view returns (Payment[] memory);

    /**
     * @notice Get the score for an agent based on their payment history
     * @param agent The agent address
     * @return The agent's score (0-100)
     */
    function getAgentScore(address agent) external view returns (uint8);
}
