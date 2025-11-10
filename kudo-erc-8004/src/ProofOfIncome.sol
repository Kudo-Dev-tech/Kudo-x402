// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IncomeHistory is Ownable {
    event FacilitatorAdded(address indexed facilitator);
    event FacilitatorRemoved(address indexed facilitator);
    event IncomeProven(address indexed agent, uint256 validCount, uint256 monthlyIncomeUSDC, uint8 incomeScore);

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

    mapping(address => bool) public isFacilitator;
    mapping(address => uint256) public monthlyIncomeUSDC;

    // Replay protection: track used nonces per agent
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    // --- Configurable income scoring thresholds ---
    uint256 public incomeMinUSDC;
    uint256 public incomeMaxUSDC;

    constructor(address owner) Ownable(owner) {}

    // --- Admin functions ---
    function addFacilitator(address facilitator) external onlyOwner {
        require(facilitator != address(0), "zero address");
        require(!isFacilitator[facilitator], "already facilitator");
        isFacilitator[facilitator] = true;
        emit FacilitatorAdded(facilitator);
    }

    function removeFacilitator(address facilitator) external onlyOwner {
        require(isFacilitator[facilitator], "not facilitator");
        isFacilitator[facilitator] = false;
        emit FacilitatorRemoved(facilitator);
    }

    // Set both min and max income thresholds for scoring
    function setIncomeThresholds(uint256 _incomeMinUSDC, uint256 _incomeMaxUSDC) external onlyOwner {
        require(_incomeMaxUSDC > _incomeMinUSDC, "max must be > min");
        incomeMinUSDC = _incomeMinUSDC;
        incomeMaxUSDC = _incomeMaxUSDC;
    }

    // --- Helpers ---
    function canonicalReceiptHash(ReceiptInput calldata r) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                r.fromAddress, r.toAddress, r.chainId, r.txHash, r.createdAt, r.amountUSDC, r.fileURI, r.nonce
            )
        );
    }

    function verifyReceipt(ReceiptInput calldata r, uint8 v, bytes32 sigR, bytes32 sigS) public view returns (address) {
        bytes32 digest = canonicalReceiptHash(r);
        address signer = ecrecover(digest, v, sigR, sigS);
        require(signer != address(0), "invalid signature");
        require(isFacilitator[signer], "signer not approved facilitator");
        return signer;
    }

    // --- Main function ---
    function proveIncome(
        ReceiptInput[] calldata receipts,
        uint8[] calldata vs,
        bytes32[] calldata rs,
        bytes32[] calldata ss
    ) external {
        require(receipts.length > 0, "no receipts provided");
        require(
            receipts.length == vs.length && vs.length == rs.length && rs.length == ss.length,
            "signature array length mismatch"
        );

        uint256 totalUSDC = 0;
        uint256 earliest = type(uint256).max;
        uint256 latest = 0;
        uint256 validCount = 0;

        for (uint256 i = 0; i < receipts.length; ++i) {
            ReceiptInput calldata r = receipts[i];

            // Verify facilitator signature first to get the signer address
            address facilitator = verifyReceipt(r, vs[i], rs[i], ss[i]);

            // Check nonce has not been used by this facilitator
            require(!usedNonces[facilitator][r.nonce], "nonce already used");

            // Mark nonce as used for this facilitator
            usedNonces[facilitator][r.nonce] = true;

            validCount++;
            totalUSDC += r.amountUSDC;

            if (r.createdAt < earliest) earliest = r.createdAt;
            if (r.createdAt > latest) latest = r.createdAt;
        }

        uint256 durationSeconds = latest > earliest ? latest - earliest : 30 days;
        uint256 monthlyIncome = (totalUSDC * 30 days) / durationSeconds;

        monthlyIncomeUSDC[msg.sender] = monthlyIncome;

        uint8 incomeScore = getIncomeScore(msg.sender);

        emit IncomeProven(msg.sender, validCount, monthlyIncome, incomeScore);
    }

    function getIsSignatureValid(ReceiptInput calldata receipt, uint8 vs, bytes32 rs, bytes32 ss)
        external
        view
        returns (bool)
    {
        bytes32 digest = canonicalReceiptHash(receipt);
        address signer = ecrecover(digest, vs, rs, ss);

        if (!isFacilitator[signer] || usedNonces[signer][receipt.nonce]) return false;

        return true;
    }

    // --- Income scoring function ---
    function getIncomeScore(address agent) public view returns (uint8) {
        uint256 income = monthlyIncomeUSDC[agent];

        if (income < incomeMinUSDC) return 0;
        if (income >= incomeMaxUSDC) return 100;

        uint256 bucketSize = (incomeMaxUSDC - incomeMinUSDC) / 5;
        uint256 bucket = (income - incomeMinUSDC) / bucketSize + 1;

        if (bucket > 5) bucket = 5;

        return uint8(bucket * 20); // 20 points per bucket
    }
}
