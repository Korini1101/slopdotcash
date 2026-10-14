// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IERC20} from "./ProjectEscrow.sol";

interface IFeeSwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

/// @notice Converts already-collected fees only. Contributor payouts never call this contract.
/// @dev Route and recipient are immutable. An external quote authority approves exact trade limits;
/// anyone may execute them. The authority cannot withdraw tokens or change the route or recipient.
contract FeeConverter {
    IERC20 public immutable inputToken;
    IERC20 public immutable usdc;
    IFeeSwapRouter public immutable router;
    address public immutable recipient;
    address public immutable quoteAuthority;
    uint256 public nextOrderId;
    uint256 public pendingOrderId;
    uint256 public pendingAmount;
    uint256 public minimumOutput;
    uint256 public deadline;
    uint256 public totalInputConverted;
    uint256 public totalUsdcReceived;
    bool private entered;

    error InvalidInput();
    error Unauthorized();
    error TransferFailed();
    error ReentrantCall();
    event ConversionApproved(uint256 indexed orderId, uint256 amountIn, uint256 minimumOut, uint256 expiresAt);
    event ConversionRequoted(uint256 indexed orderId, uint256 minimumOut, uint256 expiresAt);
    event Converted(uint256 indexed orderId, uint256 amountIn, uint256 usdcReceived);

    constructor(IERC20 input_, IERC20 usdc_, IFeeSwapRouter router_, address recipient_, address quoteAuthority_) {
        if (
            address(input_).code.length == 0 || address(usdc_).code.length == 0 || usdc_.decimals() != 6
                || (address(input_) != address(usdc_) && address(router_).code.length == 0) || recipient_ == address(0)
                || recipient_ == address(this) || quoteAuthority_ == address(0)
        ) revert InvalidInput();
        inputToken = input_;
        usdc = usdc_;
        router = router_;
        recipient = recipient_;
        quoteAuthority = quoteAuthority_;
    }

    modifier nonReentrant() {
        if (entered) revert ReentrantCall();
        entered = true;
        _;
        entered = false;
    }

    /// @notice Pin one exact fee amount. Failed execution keeps this same order pending.
    function approveConversion(uint256 amount, uint256 minimumOut, uint256 expiresAt) external nonReentrant {
        if (msg.sender != quoteAuthority) revert Unauthorized();
        if (pendingOrderId != 0 || amount == 0 || amount > inputToken.balanceOf(address(this))) revert InvalidInput();
        validateQuote(minimumOut, expiresAt);
        pendingOrderId = ++nextOrderId;
        pendingAmount = amount;
        minimumOutput = minimumOut;
        deadline = expiresAt;
        emit ConversionApproved(pendingOrderId, amount, minimumOut, expiresAt);
    }

    /// @notice Replace expired/unfillable limits without creating another conversion or another fee.
    function requote(uint256 orderId, uint256 minimumOut, uint256 expiresAt) external nonReentrant {
        if (msg.sender != quoteAuthority) revert Unauthorized();
        if (orderId == 0 || orderId != pendingOrderId) revert InvalidInput();
        validateQuote(minimumOut, expiresAt);
        minimumOutput = minimumOut;
        deadline = expiresAt;
        emit ConversionRequoted(orderId, minimumOut, expiresAt);
    }

    function execute(uint256 orderId) external nonReentrant {
        if (orderId == 0 || orderId != pendingOrderId || block.timestamp > deadline) revert InvalidInput();
        uint256 amount = pendingAmount;
        uint256 beforeInput = inputToken.balanceOf(address(this));
        uint256 beforeRecipient = usdc.balanceOf(recipient);
        if (address(inputToken) == address(usdc)) {
            callToken(abi.encodeCall(IERC20.transfer, (recipient, amount)));
        } else {
            callToken(abi.encodeWithSignature("approve(address,uint256)", address(router), 0));
            callToken(abi.encodeWithSignature("approve(address,uint256)", address(router), amount));
            address[] memory path = new address[](2);
            path[0] = address(inputToken);
            path[1] = address(usdc);
            router.swapExactTokensForTokens(amount, minimumOutput, path, recipient, deadline);
            callToken(abi.encodeWithSignature("approve(address,uint256)", address(router), 0));
        }
        uint256 received = usdc.balanceOf(recipient) - beforeRecipient;
        if (inputToken.balanceOf(address(this)) != beforeInput - amount || received < minimumOutput) {
            revert TransferFailed();
        }
        pendingOrderId = 0;
        pendingAmount = 0;
        minimumOutput = 0;
        deadline = 0;
        totalInputConverted += amount;
        totalUsdcReceived += received;
        emit Converted(orderId, amount, received);
    }

    function validateQuote(uint256 minimumOut, uint256 expiresAt) private view {
        if (minimumOut == 0 || expiresAt <= block.timestamp) revert InvalidInput();
    }

    function callToken(bytes memory data) private {
        (bool ok, bytes memory result) = address(inputToken).call(data);
        if (!ok || (result.length != 0 && (result.length != 32 || !abi.decode(result, (bool))))) {
            revert TransferFailed();
        }
    }
}
