import { NS, NodeStats } from "@ns";
import { TermLogger } from "/lib/helpers";

interface Deal {
    gainPerDollar: number
    upgradePrice: number
    buyFunction: () => bool
    upgradeType: string
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const BUY_AMOUNT = (ns.args.length > 0 && typeof ns.args[0] == "number") ? ns.args[0] : 1 // if there is at least one arg and the first arg is a number, use that number, else use 1
    const KEEP_MONEY_MULTIPLIER = (ns.args.length > 1 && typeof ns.args[1] == "number") ? ns.args[1] : 5
    const HACKNET_PRODUCTION_MULTIPLIER = ns.getPlayer().mults.hacknet_node_money
    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacknet Manager")

    function canAfford(price: number) {
        return price * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money
    }

    function productionDifference(currentStats: NodeStats, levelUpgrades: number, ramUpgrades: number, coreUpgrades: number) {
        const currentProduction = ns.formulas.hacknetNodes.moneyGainRate(currentStats.level, currentStats.ram, currentStats.cores, HACKNET_PRODUCTION_MULTIPLIER)
        const afterUpgradeProduction = ns.formulas.hacknetNodes.moneyGainRate(currentStats.level + levelUpgrades, currentStats.ram + ramUpgrades, currentStats.cores + coreUpgrades, HACKNET_PRODUCTION_MULTIPLIER)

        return afterUpgradeProduction - currentProduction
    }

    while (true) {
        if (ns.hacknet.numNodes() == 0) {
            if (ns.hacknet.purchaseNode() >= 0) {
                LOGGER.successToast("Bought first Hacknet Node")
            }
        }

        if (canAfford(ns.hacknet.getPurchaseNodeCost())) {
            if (ns.hacknet.purchaseNode() >= 0) {
                LOGGER.successToast("Bought new Hacknet Node")
            }
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const STATS = ns.hacknet.getNodeStats(i)

            let bestDeal: Deal = { gainPerDollar: 0, upgradePrice: Infinity, buyFunction: () => { return false }, upgradeType: "" }

            const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i, BUY_AMOUNT)
            const levelUpgradeGain = productionDifference(STATS, BUY_AMOUNT, 0, 0) / levelUpgradeCost
            if (levelUpgradeGain > bestDeal.gainPerDollar) {
                bestDeal = { gainPerDollar: levelUpgradeGain, upgradePrice: levelUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeLevel(i, BUY_AMOUNT) }, upgradeType: "Level" }
            }

            const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i, BUY_AMOUNT)
            const ramUpgradeGain = productionDifference(STATS, 0, BUY_AMOUNT, 0) / ramUpgradeCost
            if (ramUpgradeGain > bestDeal.gainPerDollar) {
                bestDeal = { gainPerDollar: levelUpramUpgradeGainradeGain, upgradePrice: ramUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeRam(i, BUY_AMOUNT) }, upgradeType: "RAM" }
            }

            const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i, BUY_AMOUNT)
            const coreUpgradeGain = productionDifference(STATS, 0, 0, BUY_AMOUNT) / coreUpgradeCost
            if (coreUpgradeGain > bestDeal.gainPerDollar) {
                bestDeal = { gainPerDollar: coreUpgradeGain, upgradePrice: coreUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeCore(i, BUY_AMOUNT) }, upgradeType: "Core" }
            }

            if (canAfford(bestDeal.upgradePrice)) {
                if (bestDeal.buyFunction()) {
                    LOGGER.info(`Bought ${BUY_AMOUNT} Hacknet ${bestDeal.upgradeType} Upgrade(s)`)
                }
            }
        }

        await ns.sleep(100)
    }
}