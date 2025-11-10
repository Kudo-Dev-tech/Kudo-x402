// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

/// @notice Interface for ValidationRegistry contract
interface IValidationRegistry {
    /// @notice Creates a validation request for an agent
    /// @param validatorAddress The address of the validator
    /// @param agentId The ID of the agent being validated
    /// @param requestUri URI containing validation request details
    /// @param requestHash Hash of the validation request
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestUri,
        bytes32 requestHash
    ) external;

    /// @notice Submits a validation response
    /// @param requestHash Hash of the validation request
    /// @param response Response score (0-100)
    /// @param responseUri URI containing validation response details
    /// @param responseHash Hash of the validation response
    /// @param tag Additional tag for categorization
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseUri,
        bytes32 responseHash,
        bytes32 tag
    ) external;
}
