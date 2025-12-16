# ADR-005: Scroll ZK Blockchain Integration

## Status
Accepted

## Context
Arcadia's micropayment system (x402) requires a blockchain infrastructure that can handle frequent, small transactions cost-effectively. Ethereum mainnet gas fees make micropayments impractical, requiring a Layer 2 solution.

## Decision
Use Scroll ZK as the blockchain infrastructure for payment processing with the following implementation:

- **Network**: Scroll ZK rollup for Ethereum compatibility with lower costs
- **Smart Contracts**: Custom payment contracts for escrow and automatic releases
- **Gas Optimization**: Batched transactions and gas-efficient contract design
- **Developer Experience**: Web3.js integration with familiar Ethereum tooling
- **Wallet Integration**: Support major wallets through standard Ethereum RPC

## Implementation Details

### Smart Contract Architecture
```solidity
// PaymentEscrow.sol
contract PaymentEscrow {
    struct Payment {
        address brand;
        address creator;
        uint256 amount;
        bytes32 contentHash;
        bool released;
        uint256 timestamp;
    }

    mapping(bytes32 => Payment) public payments;

    function createPayment(
        address _creator,
        bytes32 _contentHash
    ) external payable returns (bytes32 paymentId) {
        paymentId = keccak256(abi.encodePacked(msg.sender, _creator, block.timestamp));

        payments[paymentId] = Payment({
            brand: msg.sender,
            creator: _creator,
            amount: msg.value,
            contentHash: _contentHash,
            released: false,
            timestamp: block.timestamp
        });

        emit PaymentCreated(paymentId, msg.sender, _creator, msg.value);
    }

    function releasePayment(bytes32 _paymentId, bytes calldata _contentProof) external {
        // Verify content delivery and release payment
        require(verifyContentDelivery(_paymentId, _contentProof), "Invalid content proof");

        Payment storage payment = payments[_paymentId];
        require(!payment.released, "Payment already released");

        payment.released = true;
        payable(payment.creator).transfer(payment.amount);

        emit PaymentReleased(_paymentId, payment.creator, payment.amount);
    }
}
```

### Gas Optimization Strategies
```typescript
// Gas-efficient batch operations
async function batchPayments(payments: PaymentRequest[]) {
  const batchContract = new ethers.Contract(BATCH_ADDRESS, BATCH_ABI, signer);

  const calls = payments.map(payment => ({
    target: ESCROW_ADDRESS,
    callData: escrowContract.interface.encodeFunctionData('createPayment', [
      payment.creator,
      payment.contentHash
    ]),
    value: payment.amount
  }));

  return await batchContract.multicall(calls);
}
```

## Scroll ZK Benefits

### Technical Advantages
- **Cost**: 90%+ reduction in gas fees vs Ethereum mainnet
- **Speed**: 2-3 second transaction finality
- **Compatibility**: Full Ethereum tooling and wallet support
- **Security**: Inherits Ethereum's security through ZK proofs

### User Experience
- **Familiar**: Works with existing Ethereum wallets
- **Fast**: Near-instant transaction confirmations
- **Cheap**: Micropayments viable with sub-$0.10 fees
- **Reliable**: High throughput without congestion

## Consequences

### Positive
- **Economics**: Makes micropayments economically viable
- **Performance**: High throughput for concurrent payments
- **Security**: ZK-proof security with Ethereum settlement
- **Ecosystem**: Access to existing Ethereum developer tools

### Negative
- **Complexity**: ZK rollup adds implementation complexity
- **Dependency**: Reliance on Scroll network uptime and performance
- **Finality**: Slight delay for final settlement on Ethereum mainnet
- **Adoption**: Users need to bridge funds to Scroll network

## Integration Components

### Smart Contract Deployment
- Payment escrow contract for secure fund holding
- Content verification contract for proof of delivery
- Batch payment contract for gas optimization
- Upgrade proxy for contract evolution

### Frontend Integration
```typescript
// Scroll ZK network configuration
const scrollConfig = {
  chainId: 534352, // Scroll mainnet
  name: 'Scroll',
  currency: 'ETH',
  explorerUrl: 'https://scrollscan.com',
  rpcUrl: 'https://rpc.scroll.io/'
};

// Wallet connection with Scroll network
async function connectScrollWallet() {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [scrollConfig]
  });
}
```

## Monitoring and Operations

### Key Metrics
- Transaction success rate (target: >99.5%)
- Average confirmation time (target: <5 seconds)
- Gas costs per transaction (target: <$0.10)
- Smart contract security (monthly audits)

### Operational Procedures
- Regular contract security audits
- Gas price optimization monitoring
- Network health monitoring
- Emergency pause mechanisms

## Migration Strategy
1. **Phase 1**: Deploy contracts to Scroll testnet
2. **Phase 2**: Security audit and testing
3. **Phase 3**: Mainnet deployment with limited beta
4. **Phase 4**: Full production rollout
5. **Phase 5**: Advanced features (batch payments, recurring payments)

## Risk Mitigation
- Multi-signature wallet for contract administration
- Time-locked upgrades for security
- Circuit breaker for emergency stops
- Insurance coverage for smart contract risks