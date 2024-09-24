import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Deployed,
  ImplementationSet,
  OwnershipTransferred
} from "../generated/Factory/Factory"

export function createDeployedEvent(
  instance: Address,
  impType: i32,
  token: Address,
  oracleAddress: Address,
  adminAddress: Address,
  operatorAddress: Address,
  intervalSeconds: BigInt,
  bufferSeconds: BigInt,
  minBetAmount: BigInt,
  oracleUpdateAllowance: BigInt,
  priceFeedId: Bytes,
  treasuryFee: BigInt
): Deployed {
  let deployedEvent = changetype<Deployed>(newMockEvent())

  deployedEvent.parameters = new Array()

  deployedEvent.parameters.push(
    new ethereum.EventParam("instance", ethereum.Value.fromAddress(instance))
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "impType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(impType))
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "oracleAddress",
      ethereum.Value.fromAddress(oracleAddress)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "adminAddress",
      ethereum.Value.fromAddress(adminAddress)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "operatorAddress",
      ethereum.Value.fromAddress(operatorAddress)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "intervalSeconds",
      ethereum.Value.fromUnsignedBigInt(intervalSeconds)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "bufferSeconds",
      ethereum.Value.fromUnsignedBigInt(bufferSeconds)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "minBetAmount",
      ethereum.Value.fromUnsignedBigInt(minBetAmount)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "oracleUpdateAllowance",
      ethereum.Value.fromUnsignedBigInt(oracleUpdateAllowance)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "priceFeedId",
      ethereum.Value.fromFixedBytes(priceFeedId)
    )
  )
  deployedEvent.parameters.push(
    new ethereum.EventParam(
      "treasuryFee",
      ethereum.Value.fromUnsignedBigInt(treasuryFee)
    )
  )

  return deployedEvent
}

export function createImplementationSetEvent(
  implementation: Address,
  impType: i32
): ImplementationSet {
  let implementationSetEvent = changetype<ImplementationSet>(newMockEvent())

  implementationSetEvent.parameters = new Array()

  implementationSetEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )
  implementationSetEvent.parameters.push(
    new ethereum.EventParam(
      "impType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(impType))
    )
  )

  return implementationSetEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
