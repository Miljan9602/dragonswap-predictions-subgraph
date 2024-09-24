import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Deployed } from "../generated/schema"
import { Deployed as DeployedEvent } from "../generated/Factory/Factory"
import { handleDeployed } from "../src/factory"
import { createDeployedEvent } from "./factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let instance = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let impType = 123
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let oracleAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let adminAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let operatorAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let intervalSeconds = BigInt.fromI32(234)
    let bufferSeconds = BigInt.fromI32(234)
    let minBetAmount = BigInt.fromI32(234)
    let oracleUpdateAllowance = BigInt.fromI32(234)
    let priceFeedId = Bytes.fromI32(1234567890)
    let treasuryFee = BigInt.fromI32(234)
    let newDeployedEvent = createDeployedEvent(
      instance,
      impType,
      token,
      oracleAddress,
      adminAddress,
      operatorAddress,
      intervalSeconds,
      bufferSeconds,
      minBetAmount,
      oracleUpdateAllowance,
      priceFeedId,
      treasuryFee
    )
    handleDeployed(newDeployedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Deployed created and stored", () => {
    assert.entityCount("Deployed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "instance",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "impType",
      "123"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oracleAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "adminAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "operatorAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "intervalSeconds",
      "234"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "bufferSeconds",
      "234"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "minBetAmount",
      "234"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oracleUpdateAllowance",
      "234"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "priceFeedId",
      "1234567890"
    )
    assert.fieldEquals(
      "Deployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "treasuryFee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
