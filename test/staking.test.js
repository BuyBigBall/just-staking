const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Staking",  function () {
  let staking  
  let token
  let user, user1, user2;
  const ONE = ethers.utils.parseEther('1')

  before(async () => {
    const signers = await ethers.getSigners()
//    [user0, user1, user2] = signers
    user = signers[0]
    user1 = signers[1]
    user2 = signers[2]
    const MockToken = await ethers.getContractFactory("MockToken")
    token = await MockToken.deploy()
    const Staking = await ethers.getContractFactory("Staking")
    staking = await Staking.deploy(token.address, 2)
    await staking.deployed()
    await token.mint()
    await token.connect(user1).mint()
    await token.connect(user2).mint()
  })
  
  describe("Deposits", async () => {
    it("Single ", async function () {
      await token.increaseAllowance(staking.address, ONE)
      await staking.deposit(ONE)
      expect(await token.balanceOf(staking.address)).to.equal(ONE)  
      expect(await staking.stake(user.address)).to.equal(ONE)  
      expect(await staking.withdrawableOf(user.address)).to.equal(ONE)  
    });
    it("Multiple ", async function () {
      await token.connect(user1).increaseAllowance(staking.address, ONE)
      await staking.connect(user1).deposit(ONE)
      expect(await token.balanceOf(staking.address)).to.equal(ONE.mul(2))  
      expect(await staking.stake(user1.address)).to.equal(ONE)  
      expect(await staking.withdrawableOf(user1.address)).to.equal(ONE)      
    });
  })

  describe("Rewards", async () => {
  
    it("Distribute once", async function () {
      const AMOUNT = ONE.mul(10)
      const totalStake = await staking.totalStake();

      await token.increaseAllowance(staking.address, ONE.mul(1000000))
      await staking.distribute(AMOUNT)

      expect(await staking.rewardsPerUnitNow())
        .to.equal(AMOUNT.mul(ONE).div(totalStake))
    });
    it("Distribute twice", async function () {
      const AMOUNT = ONE.mul(2)
      const rewardsBefore = await staking.rewardsPerUnitNow()
      const totalStake = await staking.totalStake();
      await staking.distribute(AMOUNT)
      
      const rewardsDelta = AMOUNT.mul(ONE).div(totalStake)           
      expect(await staking.rewardsPerUnitNow())
        .to.equal(rewardsBefore.add(rewardsDelta))
    });

  })

  describe("Unstake", async () => {
    it("Single partial", async function () {
      const contractBefore = await staking.withdrawableOf(user.address)
      const walletBefore = await token.balanceOf(user.address)
      await staking.unstake(ONE)
      expect(await token.balanceOf(user.address)).to.equal(walletBefore.add(ONE))  
      expect(await staking.withdrawableOf(user.address))
        .to.equal(contractBefore.sub(ONE))  
    });
    it("Multiple partial", async function () {
      const AMOUNT = ONE.div('2')
      const contractBefore = await staking.withdrawableOf(user1.address)
      const walletBefore = await token.balanceOf(user1.address)
      await staking.connect(user1).unstake(AMOUNT)
      const walletAfter = await token.balanceOf(user1.address)
      const contractAfter = await staking.withdrawableOf(user1.address)
      expect(walletAfter).to.equal(walletBefore.add(AMOUNT))  
      expect(contractAfter).to.equal(contractBefore.sub(AMOUNT))
    });
    it("Multiple full", async function () {
      const contractBefore = await staking.withdrawableOf(user.address)
      const AMOUNT = contractBefore
      const contractBefore1 = await staking.withdrawableOf(user1.address)
      const AMOUNT1 = contractBefore1
      await staking.unstake(AMOUNT)
      await staking.connect(user1).unstake(AMOUNT1)
        
      expect(await staking.withdrawableOf(user.address)).to.equal('0')
      expect(await staking.withdrawableOf(user1.address)).to.equal('0')
      expect(await staking.totalStake()).to.equal('0')
      expect(await token.balanceOf(staking.address)).to.equal('0')
    });

  })
});
