// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {IncomeHistory} from "../src/ProofOfIncome.sol";
import {PaymentHistory} from "../src/PaymentHistory.sol";
import {Kudo} from "../src/Kudo.sol";
import {IdentityRegistryUpgradeable} from "../src/ERC8004/IdentityRegistryUpgradeable.sol";
import {ValidationRegistryUpgradeable} from "../src/ERC8004/ValidationRegistryUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "forge-std/console.sol";

contract FullFlowTest is Test {
    IncomeHistory public incomeHistory;
    PaymentHistory public paymentHistory;
    Kudo public kudo;

    IdentityRegistryUpgradeable public identityRegistry;
    ValidationRegistryUpgradeable public validationRegistry;

    address public admin;
    address public validator;
    address public agent;
    address public facilitator;

    uint256 public agentPrivateKey;
    uint256 public facilitatorPrivateKey;

    function setUp() public {
        admin = makeAddr("admin");
        validator = makeAddr("validator");
        agent = makeAddr("agent");
        facilitator = makeAddr("facilitator");

        agentPrivateKey = uint256(keccak256(abi.encodePacked("agent")));
        facilitatorPrivateKey = uint256(keccak256(abi.encodePacked("facilitator")));

        IdentityRegistryUpgradeable identityRegistryImpl = new IdentityRegistryUpgradeable();
        ERC1967Proxy identityRegistryProxy = new ERC1967Proxy(
            address(identityRegistryImpl), abi.encodeWithSelector(IdentityRegistryUpgradeable.initialize.selector)
        );
        identityRegistry = IdentityRegistryUpgradeable(address(identityRegistryProxy));

        ValidationRegistryUpgradeable validationRegistryImpl = new ValidationRegistryUpgradeable();
        ERC1967Proxy validationRegistryProxy = new ERC1967Proxy(
            address(validationRegistryImpl),
            abi.encodeWithSelector(ValidationRegistryUpgradeable.initialize.selector, address(identityRegistry))
        );
        validationRegistry = ValidationRegistryUpgradeable(address(validationRegistryProxy));

        vm.prank(admin);
        incomeHistory = new IncomeHistory(admin);

        vm.prank(validator);
        paymentHistory = new PaymentHistory(address(validationRegistry), admin);

        vm.prank(admin);
        kudo = new Kudo(10000e6, address(incomeHistory), address(paymentHistory), admin, 0);

        // Set Kudo in PaymentHistory
        vm.prank(admin);
        paymentHistory.setKudo(address(kudo));

        bytes32 evaluatorRole = kudo.EVALUATOR_CONTRACT_ROLE();
        vm.prank(admin);
        kudo.grantRole(evaluatorRole, address(paymentHistory));

        vm.prank(admin);
        kudo.grantRole(evaluatorRole, validator);

        vm.prank(admin);
        paymentHistory.addValidator(validator);

        vm.prank(agent);
        identityRegistry.register();

        vm.prank(admin);
        incomeHistory.addFacilitator(facilitator);

        vm.prank(admin);
        incomeHistory.setIncomeThresholds(1000e6, 10000e6);
    }

    function test_FullFlow() public {
        /// Prove Income
        IncomeHistory.ReceiptInput memory receipt = IncomeHistory.ReceiptInput({
            fromAddress: agent,
            toAddress: facilitator,
            chainId: block.chainid,
            txHash: keccak256("full_flow_tx"),
            createdAt: block.timestamp,
            amountUSDC: 5000e6,
            fileURI: "ipfs://full_flow",
            nonce: 1
        });

        bytes32 digest = incomeHistory.canonicalReceiptHash(receipt);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(facilitatorPrivateKey, digest);

        IncomeHistory.ReceiptInput[] memory receipts = new IncomeHistory.ReceiptInput[](1);
        receipts[0] = receipt;
        uint8[] memory vs = new uint8[](1);
        vs[0] = v;
        bytes32[] memory rs = new bytes32[](1);
        rs[0] = r;
        bytes32[] memory ss = new bytes32[](1);
        ss[0] = s;

        vm.prank(agent);
        incomeHistory.proveIncome(receipts, vs, rs, ss);

        /// Mint Covenant
        string memory covenantPromise = "I promise to provide excellent service";
        string memory ask = "Need financial assistance";
        string memory nftType = "ServiceCovenant";

        bytes32 agentCovenantMessageHash = keccak256(abi.encodePacked(covenantPromise, ask, nftType, agent));
        bytes32 agentCovenantEthSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(agentCovenantMessageHash);

        (uint8 av, bytes32 ar, bytes32 as_) = vm.sign(agentPrivateKey, agentCovenantEthSignedMessageHash);
        bytes memory agentSignature = abi.encodePacked(ar, as_, av);

        vm.prank(validator);
        uint256 covenantNftId =
            kudo.mintCovenantOnBehalfOf(agent, 0, 5000e6, covenantPromise, ask, nftType, agentSignature);

        Kudo.CovenantData[] memory inProgressCovenants = kudo.getCovenantsWithStatus(Kudo.CovenantStatus.IN_PROGRESS);

        bytes32 requestHash = keccak256("full_flow_request");
        bytes32 responseHash = keccak256("full_flow_response");
        bytes32 tag = keccak256("full_flow_tag");

        /// Request for payment validation
        vm.prank(agent);
        validationRegistry.validationRequest(address(paymentHistory), 0, "ipfs://request", requestHash);

        uint256 creditLimitBeforePayment = kudo.getAgentCreditLimit(agent);
        uint256 agentDebt = kudo.getAgentDebt(agent);
        uint256 availableCreditBeforePayment = kudo.getAgentAvailableCredit(agent);

        vm.prank(validator);
        paymentHistory.validatePayment(
            agent, covenantNftId, 100, requestHash, "ipfs://full_flow_response", responseHash, tag
        );

        Kudo.CovenantData[] memory completedCovenants = kudo.getCovenantsWithStatus(Kudo.CovenantStatus.COMPLETED);
        console.log("COMPLETED covenants found:", completedCovenants.length);
        assertEq(completedCovenants.length, 1);
        assertEq(uint256(completedCovenants[0].status), uint256(Kudo.CovenantStatus.COMPLETED));

        PaymentHistory.Payment[] memory verifiedPayments = paymentHistory.getVerifiedPayments(agent);
        console.log("Verified payments count:", verifiedPayments.length);

        uint256 incomeScore = kudo.getIncomeScore(agent);
        uint256 paymentScore = kudo.getPaymentScore(agent);
        uint256 creditScore = kudo.getAgentCreditScore(agent);

        console.log("Payment score:", paymentScore);

        assertEq(inProgressCovenants.length, 1);
        assertEq(completedCovenants.length, 1);
        assertEq(incomeScore, 60);
        assertEq(paymentScore, 100);
        assertEq(creditScore, 784);

        // Available credit should equal credit limit when debt is 0
        assertEq(availableCreditBeforePayment, creditLimitBeforePayment - agentDebt);
    }

    function test_ValidateThreePayments() public {
        /// Setup: Prove Income
        IncomeHistory.ReceiptInput memory receipt = IncomeHistory.ReceiptInput({
            fromAddress: agent,
            toAddress: facilitator,
            chainId: block.chainid,
            txHash: keccak256("three_payments_tx"),
            createdAt: block.timestamp,
            amountUSDC: 5000e6,
            fileURI: "ipfs://three_payments",
            nonce: 1
        });

        bytes32 digest = incomeHistory.canonicalReceiptHash(receipt);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(facilitatorPrivateKey, digest);

        IncomeHistory.ReceiptInput[] memory receipts = new IncomeHistory.ReceiptInput[](1);
        receipts[0] = receipt;
        uint8[] memory vs = new uint8[](1);
        vs[0] = v;
        bytes32[] memory rs = new bytes32[](1);
        rs[0] = r;
        bytes32[] memory ss = new bytes32[](1);
        ss[0] = s;

        vm.prank(agent);
        incomeHistory.proveIncome(receipts, vs, rs, ss);

        // Mint 3 covenants (sign once since all have same covenant data)
        string memory covenantPromise = "I promise to provide excellent service";
        string memory ask = "Need financial assistance";
        string memory nftType = "ServiceCovenant";

        bytes32 covenantMessageHash = keccak256(abi.encodePacked(covenantPromise, ask, nftType, agent));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(covenantMessageHash);
        (uint8 av, bytes32 ar, bytes32 as_) = vm.sign(agentPrivateKey, ethSignedMessageHash);
        bytes memory agentSignature = abi.encodePacked(ar, as_, av);

        uint256[] memory nftIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(validator);
            // Mint covenants with 500e6 debt each
            // Credit limit at this point: income 60 + payment 50 = score 353 -> limit ~1867e6
            nftIds[i] = kudo.mintCovenantOnBehalfOf(agent, 0, 500e6, covenantPromise, ask, nftType, agentSignature);
        }

        /// Validate 3 payments (one for each covenant)
        for (uint256 i = 0; i < 3; i++) {
            bytes32 requestHash = keccak256(abi.encodePacked("request_", i));
            bytes32 responseHash = keccak256(abi.encodePacked("response_", i));
            bytes32 tag = keccak256(abi.encodePacked("tag_", i));

            // Request for payment validation
            vm.prank(agent);
            validationRegistry.validationRequest(address(paymentHistory), 0, "ipfs://request", requestHash);

            // Validate payment with score 100 for each covenant
            vm.prank(validator);
            paymentHistory.validatePayment(agent, nftIds[i], 100, requestHash, "ipfs://response", responseHash, tag);
        }

        /// Check verified payments
        PaymentHistory.Payment[] memory verifiedPayments = paymentHistory.getVerifiedPayments(agent);
        console.log("Total verified payments:", verifiedPayments.length);
        assertEq(verifiedPayments.length, 3, "Should have 3 verified payments");

        // Verify each payment is PAID
        for (uint256 i = 0; i < verifiedPayments.length; i++) {
            console.log("Payment", i, "status:", uint256(verifiedPayments[i].covenantId));
            assertEq(uint8(verifiedPayments[i].status), uint8(PaymentHistory.Status.PAID), "Payment should be PAID");
        }

        // Check payment score with 3 payments
        uint256 paymentScore = kudo.getPaymentScore(agent);
        console.log("Payment score with 3 payments:", paymentScore);
        assertEq(paymentScore, 100, "Payment score should be 100 with all paid");

        // Verify all 3 covenants are COMPLETED
        Kudo.CovenantData[] memory completedCovenants = kudo.getCovenantsWithStatus(Kudo.CovenantStatus.COMPLETED);
        console.log("Completed covenants:", completedCovenants.length);
        assertEq(completedCovenants.length, 3, "Should have 3 completed covenants");

        // Test credit limit and available credit getters after 3 covenants
        uint256 creditLimit = kudo.getAgentCreditLimit(agent);
        uint256 agentDebt = kudo.getAgentDebt(agent);
        uint256 availableCredit = kudo.getAgentAvailableCredit(agent);

        console.log("Credit limit after 3 payments:", creditLimit);
        console.log("Agent debt after 3 payments:", agentDebt);
        console.log("Available credit after 3 payments:", availableCredit);

        // All 3 covenants completed, so debt should be cleared
        assertEq(agentDebt, 0, "Debt should be 0 after all covenants completed");
        // Available credit should equal credit limit when debt is 0
        assertEq(availableCredit, creditLimit, "Available credit should equal credit limit when debt is 0");
    }

    function test_DebtLimitValidation() public {
        /// Setup: Prove Income
        IncomeHistory.ReceiptInput memory receipt = IncomeHistory.ReceiptInput({
            fromAddress: agent,
            toAddress: facilitator,
            chainId: block.chainid,
            txHash: keccak256("debt_limit_tx"),
            createdAt: block.timestamp,
            amountUSDC: 5000e6,
            fileURI: "ipfs://debt_limit",
            nonce: 1
        });

        bytes32 digest = incomeHistory.canonicalReceiptHash(receipt);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(facilitatorPrivateKey, digest);

        IncomeHistory.ReceiptInput[] memory receipts = new IncomeHistory.ReceiptInput[](1);
        receipts[0] = receipt;
        uint8[] memory vs = new uint8[](1);
        vs[0] = v;
        bytes32[] memory rs = new bytes32[](1);
        rs[0] = r;
        bytes32[] memory ss = new bytes32[](1);
        ss[0] = s;

        vm.prank(agent);
        incomeHistory.proveIncome(receipts, vs, rs, ss);

        string memory covenantPromise = "I promise to provide excellent service";
        string memory ask = "Need financial assistance";
        string memory nftType = "ServiceCovenant";

        bytes32 covenantMessageHash = keccak256(abi.encodePacked(covenantPromise, ask, nftType, agent));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(covenantMessageHash);
        (uint8 av, bytes32 ar, bytes32 as_) = vm.sign(agentPrivateKey, ethSignedMessageHash);
        bytes memory agentSignature = abi.encodePacked(ar, as_, av);

        // Get initial credit limit
        uint256 creditLimit = kudo.getAgentCreditLimit(agent);
        console.log("Credit limit:", creditLimit);

        // Successfully mint one covenant with debt equal to credit limit
        vm.prank(validator);
        uint256 nftId1 =
            kudo.mintCovenantOnBehalfOf(agent, 0, creditLimit, covenantPromise, ask, nftType, agentSignature);
        console.log("Minted NFT with ID:", nftId1);

        uint256 agentDebt = kudo.getAgentDebt(agent);
        console.log("Agent debt after mint:", agentDebt);
        assertEq(agentDebt, creditLimit);

        // Try to mint another covenant - should fail because debt would exceed limit
        vm.prank(validator);
        vm.expectRevert();
        kudo.mintCovenantOnBehalfOf(agent, 0, 1, covenantPromise, ask, nftType, agentSignature);

        console.log("Debt limit validation works!");
    }
}
