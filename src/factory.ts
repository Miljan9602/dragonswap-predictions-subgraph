import {
  Deployed as DeployedEvent,
} from "../generated/Factory/Factory"
import {
  Prediction,
} from "../generated/schema"

import {Prediction as PredictionTemplate} from "../generated/templates"

export function handleDeployed(event: DeployedEvent): void {

  const key = event.transaction.hash.concatI32(event.logIndex.toI32());
  const prediction = Prediction.load(key)

  if (prediction !== null) {
    return
  }

  let entity = new Prediction(event.transaction.hash.concatI32(event.logIndex.toI32()))

  entity.instance = event.params.instance
  entity.impType = event.params.impType
  entity.token = event.params.token
  entity.oracleAddress = event.params.oracleAddress
  entity.adminAddress = event.params.adminAddress
  entity.operatorAddress = event.params.operatorAddress
  entity.intervalSeconds = event.params.intervalSeconds
  entity.bufferSeconds = event.params.bufferSeconds
  entity.minBetAmount = event.params.minBetAmount
  entity.oracleUpdateAllowance = event.params.oracleUpdateAllowance
  entity.priceFeedId = event.params.priceFeedId
  entity.treasuryFee = event.params.treasuryFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  PredictionTemplate.create(event.params.instance)
}