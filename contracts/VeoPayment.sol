// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VeoPayment
 * @dev Smart contract for handling Veo 3.1 prompt generation payments
 * Supports x402 micropayment protocol on Scroll network
 */
contract VeoPayment is ReentrancyGuard, Ownable, Pausable {

    // Payment tier definitions
    enum PaymentTier { BASIC, PREMIUM, ENTERPRISE }

    // Payment structure
    struct Payment {
        address payer;
        uint256 amount;
        PaymentTier tier;
        string paymentId;
        bool completed;
        uint256 timestamp;
    }

    // Events
    event PaymentReceived(
        address indexed payer,
        string indexed paymentId,
        uint256 amount,
        PaymentTier tier,
        uint256 timestamp
    );

    event PaymentRefunded(
        address indexed payer,
        string indexed paymentId,
        uint256 amount
    );

    event TierPriceUpdated(PaymentTier tier, uint256 newPrice);

    // State variables
    mapping(string => Payment) public payments;
    mapping(PaymentTier => uint256) public tierPrices;
    mapping(address => uint256) public userPaymentCount;

    // Payment tracking
    string[] public paymentIds;
    uint256 public totalPaymentsReceived;
    uint256 public totalAmountCollected;

    // Configuration
    address public treasuryWallet;
    uint256 public refundWindow = 24 hours; // 24 hour refund window

    /**
     * @dev Constructor
     * @param _treasuryWallet Address to receive collected payments
     */
    constructor(address _treasuryWallet) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");

        treasuryWallet = _treasuryWallet;

        // Initialize tier prices (in wei)
        tierPrices[PaymentTier.BASIC] = 5000000000000000;      // 0.005 ETH
        tierPrices[PaymentTier.PREMIUM] = 10000000000000000;   // 0.01 ETH
        tierPrices[PaymentTier.ENTERPRISE] = 25000000000000000; // 0.025 ETH
    }

    /**
     * @dev Process payment for Veo prompt generation
     * @param paymentId Unique payment identifier from x402 protocol
     * @param tier Payment tier (BASIC, PREMIUM, ENTERPRISE)
     */
    function processPayment(
        string memory paymentId,
        PaymentTier tier
    ) external payable nonReentrant whenNotPaused {
        require(bytes(paymentId).length > 0, "Invalid payment ID");
        require(msg.value == tierPrices[tier], "Incorrect payment amount");
        require(payments[paymentId].payer == address(0), "Payment ID already exists");

        // Store payment details
        payments[paymentId] = Payment({
            payer: msg.sender,
            amount: msg.value,
            tier: tier,
            paymentId: paymentId,
            completed: true,
            timestamp: block.timestamp
        });

        // Update tracking
        paymentIds.push(paymentId);
        userPaymentCount[msg.sender]++;
        totalPaymentsReceived++;
        totalAmountCollected += msg.value;

        // Transfer to treasury
        (bool success, ) = treasuryWallet.call{value: msg.value}("");
        require(success, "Treasury transfer failed");

        emit PaymentReceived(
            msg.sender,
            paymentId,
            msg.value,
            tier,
            block.timestamp
        );
    }

    /**
     * @dev Request refund within refund window
     * @param paymentId Payment ID to refund
     */
    function requestRefund(string memory paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.payer == msg.sender, "Not your payment");
        require(payment.completed, "Payment not completed");
        require(
            block.timestamp <= payment.timestamp + refundWindow,
            "Refund window expired"
        );

        uint256 refundAmount = payment.amount;
        payment.completed = false; // Mark as refunded

        // Send refund
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit PaymentRefunded(msg.sender, paymentId, refundAmount);
    }

    /**
     * @dev Update tier pricing (only owner)
     * @param tier Payment tier to update
     * @param newPrice New price in wei
     */
    function updateTierPrice(PaymentTier tier, uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tierPrices[tier] = newPrice;
        emit TierPriceUpdated(tier, newPrice);
    }

    /**
     * @dev Update treasury wallet (only owner)
     * @param newTreasury New treasury wallet address
     */
    function updateTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasuryWallet = newTreasury;
    }

    /**
     * @dev Update refund window (only owner)
     * @param newWindow New refund window in seconds
     */
    function updateRefundWindow(uint256 newWindow) external onlyOwner {
        require(newWindow > 0, "Window must be greater than 0");
        refundWindow = newWindow;
    }

    /**
     * @dev Get payment details
     * @param paymentId Payment ID to query
     */
    function getPayment(string memory paymentId) external view returns (
        address payer,
        uint256 amount,
        PaymentTier tier,
        bool completed,
        uint256 timestamp
    ) {
        Payment memory payment = payments[paymentId];
        return (
            payment.payer,
            payment.amount,
            payment.tier,
            payment.completed,
            payment.timestamp
        );
    }

    /**
     * @dev Get user's payment history count
     * @param user User address
     */
    function getUserPaymentCount(address user) external view returns (uint256) {
        return userPaymentCount[user];
    }

    /**
     * @dev Get tier price
     * @param tier Payment tier
     */
    function getTierPrice(PaymentTier tier) external view returns (uint256) {
        return tierPrices[tier];
    }

    /**
     * @dev Get total number of payments
     */
    function getTotalPayments() external view returns (uint256) {
        return paymentIds.length;
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
}