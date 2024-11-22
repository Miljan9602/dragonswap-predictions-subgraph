import {
  Bet as BetEvent,
  Claim as ClaimEvent,
  EndRound as EndRoundEvent,
  LockRound as LockRoundEvent,
  StartRound as StartRoundEvent,
} from "../generated/templates/Prediction/Predictions"
import {Epoch, Game, PredicitionUserStats, Prediction,} from "../generated/schema"
import {Address, BigDecimal, BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";

export function handleBet(event: BetEvent): void {
  let userStats = getOrCreatePredictionUserStats(event.address.toHexString(), event.params.sender.toHexString())
  let instance = Prediction.load(event.address)

  if (instance === null) {
    throw new Error('Prediction not found for bet with instance: ' + event.address.toHexString())
  }

  if (event.params.bull) {
    instance.totalBullBets = instance.totalBullBets.plus(BigInt.fromI32(1))
  } else {
    instance.totalBearBets = instance.totalBearBets.plus(BigInt.fromI32(1))
  }

  instance.totalBets = instance.totalBets.plus(BigInt.fromI32(1))
  instance.totalVolume = instance.totalVolume.plus(event.params.amount)

  if (userStats.totalBets.equals(BigInt.zero())) {
    instance.numberOfUniqueUsers = instance.numberOfUniqueUsers.plus(BigInt.fromI32(1))
  }

  instance.save()

  if (event.params.bull) {
    userStats.totalBullBets = userStats.totalBullBets.plus(BigInt.fromI32(1))
  } else {
    userStats.totalBearBets = userStats.totalBearBets.plus(BigInt.fromI32(1))
  }

  userStats.totalBets = userStats.totalBets.plus(BigInt.fromI32(1))
  userStats.save()

  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);

  if (event.params.bull) {
    epoch.bullBetsCount = epoch.bullBetsCount.plus(BigInt.fromI32(1))
    epoch.bullBetAmount = epoch.bearBetAmount.plus(event.params.amount)
  } else {
    epoch.bearBetAmount = epoch.bearBetAmount.plus(event.params.amount)
    epoch.bearBetsCount = epoch.bearBetsCount.plus(BigInt.fromI32(1))
  }

  epoch.totalBetAmount = epoch.totalBetAmount.plus(event.params.amount)
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.lastUpdatedAtBlockNumber = event.block.number
  epoch.save()

  let gameId = event.address.toHexString().concat('-').concat(event.params.sender.toHexString()).concat('').concat(event.params.epoch.toString())
  let entity = new Game(gameId)
  entity.instance = event.address.toHexString()
  entity.sender = event.params.sender
  entity.amount = event.params.amount
  entity.isClaimed = false
  entity.epoch = event.params.epoch
  entity.isBullBet = event.params.bull
  entity.claimedAmount = BigInt.zero()
  entity.lastUpdatedAtTimestamp = event.block.timestamp
  entity.lastUpdatedAtBlockNumber = event.block.number
  entity.placeBetTxHash = event.transaction.hash.toHexString()
  entity.placeBetTimestamp = event.block.timestamp
  entity.save()
}

export function handleClaim(event: ClaimEvent): void {

  let gameId = event.address.toHexString().concat('-').concat(event.params.sender.toHexString()).concat('').concat(event.params.epoch.toString())

  let entity = Game.load(gameId)

  if (entity === null) {
    // console.log('Game not found for claim with gameId: '+gameId+' -> data:' + event.params.epoch.toString() + ' instance: ' + event.address.toHexString() + ' sender: ' + event.params.sender.toHexString())
    return;
    // throw new Error('Game not found for claim with gameId: '+gameId+' -> data:' + event.params.epoch.toString() + ' instance: ' + event.address.toHexString() + ' sender: ' + event.params.sender.toHexString())
  }

  let userStats = getOrCreatePredictionUserStats(event.address.toHexString(), event.params.sender.toHexString())
  userStats.totalClaimed = userStats.totalClaimed.plus(event.params.amount)
  userStats.save()

  entity.isClaimed = true
  entity.claimedAmount = event.params.amount
  entity.claimTimestamp = event.block.timestamp
  entity.claimTxHash = event.transaction.hash.toHexString()
  entity.lastUpdatedAtBlockNumber = event.block.number
  entity.save()
}

export function handleStartRound(event: StartRoundEvent): void {
  getOrCreateEpoch(event.address, event.params.epoch, event.block);
}

export function handleLockRound(event: LockRoundEvent): void {
  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);

  epoch.startPrice = event.params.price.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)))
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.lastUpdatedAtBlockNumber = event.block.number
  epoch.save()
}

export function handleEndRound(event: EndRoundEvent): void {

  let epoch = getOrCreateEpoch(event.address, event.params.epoch, event.block);

  epoch.closePrice = event.params.price.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)))
  epoch.lastUpdatedAtTimestamp = event.block.timestamp
  epoch.isBullWin = epoch.closePrice > epoch.startPrice
  epoch.isBearWin = epoch.closePrice < epoch.startPrice
  epoch.isFinished = true
  epoch.lastUpdatedAtBlockNumber = event.block.number

  epoch.save()
}

function getOrCreateEpoch(instance: Address, epoch: BigInt, block: ethereum.Block) : Epoch {

  const epochId = instance.toHexString().concat("-").concat(epoch.toHexString())

  let entitiy = Epoch.load(epochId)

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
  entitiy.lastUpdatedAtBlockNumber = block.number
  entitiy.epoch = epoch
  entitiy.save()

  return entitiy
}

/**
 * Get or create PredictionUserStats
 *
 * @param instance
 * @param user
 */
function getOrCreatePredictionUserStats(instance: string, user: string) : PredicitionUserStats {
  const key = instance.concat("-").concat(user)

  let stats = PredicitionUserStats.load(key)

  if (stats !== null) {
    return stats;
  }

  stats = new PredicitionUserStats(key)
  stats.instance = instance
  stats.user = user
  stats.totalBets = BigInt.zero()
  stats.totalBullBets = BigInt.zero()
  stats.totalBearBets = BigInt.zero()
  stats.totalClaimed = BigInt.zero()
  stats.save()

  return stats
}

function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}