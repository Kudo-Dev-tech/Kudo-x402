// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

/// @notice Interface for IdentityRegistry contract
interface IIdentityRegistry {
    /// @notice Returns the owner of an agent identity NFT
    /// @param agentId The ID of the agent
    /// @return The address of the agent owner
    function ownerOf(uint256 agentId) external view returns (address);

    /// @notice Returns whether an operator is approved for all of an owner's assets
    /// @param owner The address of the owner
    /// @param operator The address of the operator
    /// @return Whether the operator is approved for all assets
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}
