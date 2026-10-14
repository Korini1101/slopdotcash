// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {EscrowFactory, IERC20} from "../src/ProjectEscrow.sol";
import {TestDollar} from "../integration/TestDollar.sol";
import {DeploymentVm} from "./DeployBaseSepolia.s.sol";

/// @notice Isolated Robinhood rehearsal only; the test asset is not USDC or a production reward token.
contract DeployRobinhoodTestnet {
    DeploymentVm private constant vm = DeploymentVm(address(uint160(uint256(keccak256("hevm cheat code")))));
    uint64 public constant BINDING_DELAY = 48 hours;

    event TestFactoryDeployed(
        address indexed factory, address token, address registrar, address identityAuthority, address feeRecipient
    );

    function run() external returns (EscrowFactory factory) {
        require(block.chainid == 46630, "Robinhood testnet only");
        address feeRecipient = vm.envAddress("TEST_FEE_RECIPIENT");
        address identityAuthority = vm.envAddress("TEST_IDENTITY_AUTHORITY");
        vm.startBroadcast();
        TestDollar token = new TestDollar();
        factory = new EscrowFactory(IERC20(address(token)), feeRecipient, identityAuthority, BINDING_DELAY);
        vm.stopBroadcast();
        emit TestFactoryDeployed(address(factory), address(token), factory.registrar(), identityAuthority, feeRecipient);
    }
}
