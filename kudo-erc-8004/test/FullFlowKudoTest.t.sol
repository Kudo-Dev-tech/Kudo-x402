// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Test} from "forge-std/Test.sol";
import {Kudo} from "../src/Kudo.sol";
import {IIdentityRegistry} from "../src/interfaces/IIdentityRegistry.sol";
import {IValidationRegistry} from "../src/interfaces/IValidationRegistry.sol";
import {IdentityRegistryUpgradeable} from "../src/ERC8004/IdentityRegistryUpgradeable.sol";
import {ValidationRegistryUpgradeable} from "../src/ERC8004/ValidationRegistryUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract FullFlowKudoTest is Test {
    Kudo public kudo;
    IdentityRegistryUpgradeable public identityRegistry;
    ValidationRegistryUpgradeable public validationRegistry;

    address public admin = makeAddr("admin");
    address public agent1 = makeAddr("agent1");
    address public agent2 = makeAddr("agent2");
    address public evaluator = makeAddr("evaluator");
    address public validator = makeAddr("validator");

    uint48 constant INITIAL_DELAY = 0;

    event CovenantMinted(
        bytes32 indexed requestId,
        uint256 indexed nftId,
        address indexed agent,
        string nftType,
        string covenantPromise,
        string ask
    );

    function setUp() external {
        IdentityRegistryUpgradeable identityImpl = new IdentityRegistryUpgradeable();
        bytes memory identityInitData = abi.encodeCall(IdentityRegistryUpgradeable.initialize, ());
        ERC1967Proxy identityProxy = new ERC1967Proxy(address(identityImpl), identityInitData);
        identityRegistry = IdentityRegistryUpgradeable(address(identityProxy));

        ValidationRegistryUpgradeable validationImpl = new ValidationRegistryUpgradeable();
        bytes memory validationInitData =
            abi.encodeCall(ValidationRegistryUpgradeable.initialize, (address(identityRegistry)));
        ERC1967Proxy validationProxy = new ERC1967Proxy(address(validationImpl), validationInitData);
        validationRegistry = ValidationRegistryUpgradeable(address(validationProxy));

        kudo = new Kudo(address(identityRegistry), address(validationRegistry), admin, INITIAL_DELAY);

        vm.prank(admin);
        bytes32 evaluatorRole = keccak256("EVALUATOR_CONTRACT_ROLE");
        kudo.grantRole(evaluatorRole, evaluator);

        // Approve Kudo contract as operator for all agents to call ValidationRegistry
        vm.prank(agent1);
        identityRegistry.setApprovalForAll(address(kudo), true);

        vm.prank(agent2);
        identityRegistry.setApprovalForAll(address(kudo), true);
    }

    function test_AgentCanMintCovenant() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        vm.prank(agent1);
        uint256 nftId = kudo.mintCovenant(
            agentId, "I promise to deliver a working feature", "Require code review and testing", "feature"
        );

        Kudo.CovenantData memory covenantData = kudo.getCovenant(0);

        assertEq(nftId, 0);
        assertEq(covenantData.agentWallet, agent1);
        assertEq(covenantData.agentId, agentId);
        assertEq(covenantData.covenantPromise, "I promise to deliver a working feature");
        assertEq(covenantData.ask, "Require code review and testing");
        assertEq(covenantData.nftType, "feature");
    }

    function test_MintCovenantWithOnBehalfOfAgent() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        bytes32 messageHash = keccak256(abi.encodePacked("Promise A", "Ask A", "type_a", agent1));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(keccak256(abi.encodePacked("agent1"))), ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        require(signature.length > 0, "Signature should not be empty");

        vm.prank(admin);
        kudo.mintCovenantOnBehalfOf(agent1, agentId, "Promise A", "Ask A", "type_a", signature);

        Kudo.CovenantData memory covenantData = kudo.getCovenant(0);
        assertEq(covenantData.agentWallet, agent1);
        assertEq(covenantData.agentId, agentId);
    }

    function test_SetsPromiseSettlementData() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        vm.prank(agent1);
        kudo.mintCovenant(agentId, "Promise", "Ask", "type");

        vm.prank(agent1);
        kudo.setPromiseSettlementData(0, "Settlement data: code merged to main", "ipfs://settlement_details");

        Kudo.CovenantData memory covenantData = kudo.getCovenant(0);
        assertEq(covenantData.promiseSettlementData, "Settlement data: code merged to main");
    }

    function test_SetAskSettlementData() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        vm.prank(agent1);
        kudo.mintCovenant(agentId, "Promise", "Ask", "type");

        string memory askSettlement = "Ask resolved: requirements met and approved";
        string memory promiseDetail = "Implementation completed and merged to main branch";

        vm.prank(agent1);
        kudo.setAskSettlementData(0, askSettlement, promiseDetail);

        Kudo.CovenantData memory covenantData = kudo.getCovenant(0);
        assertEq(covenantData.askSettlementData, askSettlement);
        assertEq(covenantData.promiseDetail, promiseDetail);
    }

    function test_SettlementDataCreatesValidationRequest() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        vm.prank(agent1);
        kudo.mintCovenant(agentId, "Promise", "Ask", "type");

        vm.prank(agent1);
        kudo.setPromiseSettlementData(0, "Settlement data", "ipfs://settlement_uri");

        bytes32 expectedRequestHash = keccak256(abi.encodePacked(uint256(0), "Settlement data", address(kudo)));

        (
            address validatorAddress,
            uint256 returnedAgentId,
            uint8 response,
            bytes32 responseHash,
            bytes32 tag,
            uint256 lastUpdate
        ) = validationRegistry.getValidationStatus(expectedRequestHash);

        assertNotEq(validatorAddress, address(0));
        assertEq(returnedAgentId, agentId);
        assertEq(validatorAddress, address(kudo));
        assertEq(response, 0);
        assertEq(responseHash, bytes32(0));
        assertEq(tag, bytes32(0));
        assertGt(lastUpdate, 0);
    }

    function test_EvaluatorEvaluatesSettlement() external {
        vm.prank(agent1);
        uint256 agentId = identityRegistry.register();

        vm.prank(agent1);
        kudo.mintCovenant(agentId, "Promise", "Ask", "type");

        vm.prank(agent1);
        kudo.setPromiseSettlementData(0, "Settlement data", "ipfs://settlement_uri");

        bytes32 requestHash = keccak256(abi.encodePacked(uint256(0), "Settlement data", address(kudo)));

        uint8 expectedScore = 95;

        vm.prank(evaluator);
        kudo.evaluateSettlementData(
            requestHash, 0, Kudo.CovenantStatus.COMPLETED, expectedScore, "ipfs://evaluation_response", bytes32("media")
        );

        // Verify covenant status was updated
        Kudo.CovenantData memory covenantData = kudo.getCovenant(0);
        assertEq(uint256(covenantData.status), uint256(Kudo.CovenantStatus.COMPLETED));

        // Query and verify the score from ValidationRegistry
        (address validatorAddress, uint256 returnedAgentId, uint8 response,, bytes32 tag, uint256 lastUpdate) =
            validationRegistry.getValidationStatus(requestHash);

        assertEq(validatorAddress, address(kudo));
        assertEq(returnedAgentId, agentId);
        assertEq(response, expectedScore);
        assertEq(tag, bytes32("media"));
        assertGt(lastUpdate, 0);
    }
}
