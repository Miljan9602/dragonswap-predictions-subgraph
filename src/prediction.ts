import {
  BetBear as BetBearEvent,
  BetBull as BetBullEvent,
  Claim as ClaimEvent,
  EndRound as EndRoundEvent,
  LockRound as LockRoundEvent,
  StartRound as StartRoundEvent,
} from "../generated/templates/Prediction/Predictions"
import {Epoch, Game,} from "../generated/schema"
import {Address, BigDecimal, BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";

export function handleBetBear(event: BetBearEvent): void {

  getOrCreateEpoch(event.address, event.params.epoch, event.block);

  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);
  epoch.bearBetAmount = epoch.bearBetAmount.plus(event.params.amount)
  epoch.bearBetsCount = epoch.bearBetsCount.plus(BigInt.fromI32(1))
  epoch.totalBetAmount = epoch.totalBetAmount.plus(event.params.amount)
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.save()

  let gameId = event.address.toHexString().concat('-').concat(event.params.sender.toHexString()).concat('').concat(event.params.epoch.toString())
  let entity = new Game(gameId)
  entity.instance = event.address.toHexString()
  entity.sender = event.params.sender
  entity.amount = event.params.amount
  entity.isClaimed = false
  entity.epoch = event.params.epoch
  entity.isBullBet = false
  entity.claimedAmount = BigInt.zero()
  entity.lastUpdatedAtTimestamp = event.block.timestamp
  entity.placeBetTxHash = event.transaction.hash.toHexString()
  entity.placeBetTimestamp = event.block.timestamp
  entity.save()
}

export function handleBetBull(event: BetBullEvent): void {

  getOrCreateEpoch(event.address, event.params.epoch, event.block);

  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);
  epoch.bullBetAmount = epoch.bullBetAmount.plus(event.params.amount)
  epoch.bullBetsCount = epoch.bullBetsCount.plus(BigInt.fromI32(1))
  epoch.totalBetAmount = epoch.totalBetAmount.plus(event.params.amount)
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.save()

  let gameId = event.address.toHexString().concat('-').concat(event.params.sender.toHexString()).concat('').concat(event.params.epoch.toString())

  let entity = new Game(gameId)
  entity.instance = event.address.toHexString()
  entity.sender = event.params.sender
  entity.amount = event.params.amount
  entity.isClaimed = false
  entity.epoch = event.params.epoch
  entity.isBullBet = true
  entity.claimedAmount = BigInt.zero()
  entity.lastUpdatedAtTimestamp = event.block.timestamp
  entity.placeBetTxHash = event.transaction.hash.toHexString()
  entity.placeBetTimestamp = event.block.timestamp
  entity.save()
}

export function handleClaim(event: ClaimEvent): void {

  let gameId = event.address.toHexString().concat('-').concat(event.params.sender.toHexString()).concat('').concat(event.params.epoch.toString())

  let entity = Game.load(gameId)

  if (entity === null) {
    throw new Error('Game not found for claim with gameId: ' + event.params.epoch.toString() + ' instance: ' + event.address.toHexString() + ' sender: ' + event.params.sender.toHexString())
  }

  entity.isClaimed = true
  entity.claimedAmount = event.params.amount
  entity.claimTimestamp = event.block.timestamp
  entity.claimTxHash = event.transaction.hash.toHexString()
  entity.save()
}

export function handleStartRound(event: StartRoundEvent): void {
  getOrCreateEpoch(event.address, event.params.epoch, event.block);
}

export function handleLockRound(event: LockRoundEvent): void {

  getOrCreateEpoch(event.address, event.params.epoch, event.block);

  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);

  epoch.startPrice = event.params.price.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(8)))
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.save()
}

export function handleEndRound(event: EndRoundEvent): void {

  getOrCreateEpoch(event.address, event.params.epoch, event.block);
  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);

  epoch.closePrice = event.params.price.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(8)))
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.isBullWin = epoch.closePrice > epoch.startPrice
  epoch.isBearWin = epoch.closePrice < epoch.startPrice
  epoch.isFinished = true

  epoch.save()
}

function getOrCreateEpoch(instance: Address, epoch: BigInt, block: ethereum.Block) : Epoch {

  const epochId = instance.toHexString().concat("-").concat(epoch.toHexString())

  var entitiy = Epoch.load(epochId)

  if (entitiy !== null) {
    return entitiy
  }

  entitiy = new Epoch(epochId)
  entitiy.instance = instance.toHexString()

  entitiy.bullBetsCount = BigInt.zero()
  entitiy.bearBetsCount = BigInt.zero()
  entitiy.bullBetAmount = BigInt.zero()
  entitiy.bearBetAmount = BigInt.zero()
  entitiy.totalBetAmount = BigInt.zero()
  entitiy.startPrice = BigDecimal.zero()
  entitiy.closePrice = BigDecimal.zero()

  entitiy.isBullWin = false
  entitiy.isBearWin = false
  entitiy.isFinished = false

  entitiy.createdAtBlockNumber = block.number
  entitiy.createdAtBlockTimestamp = block.timestamp
  entitiy.lastUpdatedAtTimestamp = block.timestamp
  entitiy.epoch = epoch
  entitiy.save()

  return entitiy
}

function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}