// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IIncomeHistory {
    struct ReceiptInput {
        address fromAddress;
        address toAddress;
        uint256 chainId;
        bytes32 txHash;
        uint256 createdAt; // timestamp of payment
        uint256 amountUSDC; // amount in USDC (6 decimals)
        string fileURI;
        uint256 nonce; // nonce signed by facilitator
    }

    // Events
    event FacilitatorAdded(address indexed facilitator);
    event FacilitatorRemoved(address indexed facilitator);
    event IncomeProven(address indexed agent, uint256 validCount, uint256 monthlyIncomeUSDC, uint8 incomeScore);

    /**
     * @notice Add a facilitator who can sign income receipts
     * @param facilitator The address of the facilitator
     */
    function addFacilitator(address facilitator) external;

    /**
     * @notice Remove a facilitator
     * @param facilitator The address of the facilitator to remove
     */
    function removeFacilitator(address facilitator) external;

    /**
     * @notice Set income thresholds for scoring
     * @param _incomeMinUSDC Minimum income for lowest score
     * @param _incomeMaxUSDC Maximum income for highest score
     */
    function setIncomeThresholds(uint256 _incomeMinUSDC, uint256 _incomeMaxUSDC) external;

    /**
     * @notice Compute the canonical hash of a receipt for signature verification
     * @param r The receipt to hash
     * @return The keccak256 hash of the receipt
     */
    function canonicalReceiptHash(ReceiptInput calldata r) external pure returns (bytes32);

    /**
     * @notice Verify a receipt signature and return the signer
     * @param r The receipt to verify
     * @param v The v component of the signature
     * @param sigR The r component of the signature
     * @param sigS The s component of the signature
     * @return The address of the signer (reverts if invalid)
     */
    function verifyReceipt(ReceiptInput calldata r, uint8 v, bytes32 sigR, bytes32 sigS) external view returns (address);

    /**
     * @notice Prove income by submitting signed receipts
     * @param receipts Array of receipt inputs
     * @param vs Array of v components from signatures
     * @param rs Array of r components from signatures
     * @param ss Array of s components from signatures
     */
    function proveIncome(
        ReceiptInput[] calldata receipts,
        uint8[] calldata vs,
        bytes32[] calldata rs,
        bytes32[] calldata ss
    ) external;

    /**
     * @notice Check if a signature is valid (signer is facilitator and nonce not used)
     * @param receipt The receipt being signed
     * @param v The v component of the signature
     * @param r The r component of the signature
     * @param s The s component of the signature
     * @return true if the signature is valid, false otherwise
     */
    function getIsSignatureValid(ReceiptInput calldata receipt, uint8 v, bytes32 r, bytes32 s)
        external
        view
        returns (bool);

    /**
     * @notice Get the monthly income for an agent
     * @param agent The agent address
     * @return The monthly income in USDC
     */
    function monthlyIncomeUSDC(address agent) external view returns (uint256);

    /**
     * @notice Check if an address is a registered facilitator
     * @param facilitator The address to check
     * @return true if the address is a facilitator
     */
    function isFacilitator(address facilitator) external view returns (bool);

    /**
     * @notice Get the income score for an agent
     * @param agent The agent address
     * @return The income score (0-100)
     */
    function getIncomeScore(address agent) external view returns (uint8);

    /**
     * @notice Check if a nonce has been used by a facilitator
     * @param facilitator The facilitator address
     * @param nonce The nonce to check
     * @return true if the nonce has been used
     */
    function usedNonces(address facilitator, uint256 nonce) external view returns (bool);
}
