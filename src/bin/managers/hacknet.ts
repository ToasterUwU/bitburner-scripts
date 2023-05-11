import { NS, NodeStats } from "@ns";
import { TermLogger, Hacknet } from "/lib/helpers";

interface Deal {
    nodeIndex: number
    gainPerDollar: number
    upgradePrice: number
    buyFunction: () => boolean
    upgradeType: string
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const BUY_AMOUNT = (ns.args.length > 0 && typeof ns.args[0] == "number") ? ns.args[0] : 1 // if there is at least one arg and the first arg is a number, use that number, else use 1
    const KEEP_MONEY_MULTIPLIER = (ns.args.length > 1 && typeof ns.args[1] == "number") ? ns.args[1] : 3
    const HACKNET_PRODUCTION_MULTIPLIER = ns.getPlayer().mults.hacknet_node_money
    const HACKNET_CORE_COST_MULTIPLIER = ns.getPlayer().mults.hacknet_node_core_cost
    const HACKNET_RAM_COST_MULTIPLIER = ns.getPlayer().mults.hacknet_node_ram_cost
    const HACKNET_LEVEL_COST_MULTIPLIER = ns.getPlayer().mults.hacknet_node_level_cost
    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacknet Manager")

    function canAfford(price: number) {
        return price * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money
    }

    function productionDifference(currentStats: NodeStats, levelUpgrades: number, ramUpgrades: number, coreUpgrades: number) {
        const currentProduction = ns.formulas.hacknetNodes.moneyGainRate(currentStats.level, currentStats.ram, currentStats.cores, HACKNET_PRODUCTION_MULTIPLIER)
        const afterUpgradeProduction = ns.formulas.hacknetNodes.moneyGainRate(currentStats.level + levelUpgrades, Math.pow(2, currentStats.ram + ramUpgrades - 1), currentStats.cores + coreUpgrades, HACKNET_PRODUCTION_MULTIPLIER)

        return afterUpgradeProduction - currentProduction
    }

    function buyableInXSeconds(price: number) {
        return ((price * KEEP_MONEY_MULTIPLIER) - ns.getPlayer().money) / (ns.getTotalScriptIncome()[0] + Hacknet.hacknetProduction(ns))
    }

    while (true) {
        if (ns.hacknet.numNodes() == 0) {
            if (ns.hacknet.purchaseNode() >= 0) {
                LOGGER.successToast("Bought first Hacknet Node")
            }
        } else {
            let bestDeal: Deal = { nodeIndex: 0, gainPerDollar: 0, upgradePrice: 0, buyFunction: () => { return false }, upgradeType: "" }
            let highestExistingStats: NodeStats = ns.hacknet.getNodeStats(0)
            for (let i = 0; i < ns.hacknet.numNodes(); i++) {
                const STATS: NodeStats = ns.hacknet.getNodeStats(i)

                if (STATS.production, highestExistingStats.production) {
                    highestExistingStats = STATS
                }

                ns.print("Level Upgrade")
                const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i, BUY_AMOUNT)
                const levelUpgradeGain = productionDifference(STATS, BUY_AMOUNT, 0, 0) / levelUpgradeCost
                ns.print(levelUpgradeCost, " ", levelUpgradeGain)
                if (levelUpgradeGain > bestDeal.gainPerDollar && buyableInXSeconds(levelUpgradeCost) <= 30) {
                    bestDeal = { nodeIndex: i, gainPerDollar: levelUpgradeGain, upgradePrice: levelUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeLevel(i, BUY_AMOUNT) }, upgradeType: "Level Upgrade" }
                }

                ns.print("RAM Upgrade")
                const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i, BUY_AMOUNT)
                const ramUpgradeGain = productionDifference(STATS, 0, BUY_AMOUNT, 0) / ramUpgradeCost
                ns.print(ramUpgradeCost, " ", ramUpgradeGain)
                if (ramUpgradeGain > bestDeal.gainPerDollar && buyableInXSeconds(ramUpgradeCost) <= 450) {
                    bestDeal = { nodeIndex: i, gainPerDollar: levelUpgradeGain, upgradePrice: ramUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeRam(i, BUY_AMOUNT) }, upgradeType: "RAM Upgrade" }
                }

                ns.print("Core Upgrade")
                const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i, BUY_AMOUNT)
                const coreUpgradeGain = productionDifference(STATS, 0, 0, BUY_AMOUNT) / coreUpgradeCost
                ns.print(coreUpgradeCost, " ", coreUpgradeGain)
                if (coreUpgradeGain > bestDeal.gainPerDollar && buyableInXSeconds(coreUpgradeCost) <= 300) {
                    bestDeal = { nodeIndex: i, gainPerDollar: coreUpgradeGain, upgradePrice: coreUpgradeCost, buyFunction: () => { return ns.hacknet.upgradeCore(i, BUY_AMOUNT) }, upgradeType: "Core Upgrade" }
                }
            }

            ns.print("New Node")
            const NODE_PURCHASE_COST = ns.hacknet.getPurchaseNodeCost()
            const newNodePrice = NODE_PURCHASE_COST
            // newNodePrice += ns.formulas.hacknetNodes.coreUpgradeCost(1, highestExistingStats.cores - 1, HACKNET_CORE_COST_MULTIPLIER)
            // newNodePrice += ns.formulas.hacknetNodes.ramUpgradeCost(1, Math.sqrt(highestExistingStats.ram) - 1, HACKNET_RAM_COST_MULTIPLIER)
            // newNodePrice += ns.formulas.hacknetNodes.coreUpgradeCost(1, highestExistingStats.level - 1, HACKNET_LEVEL_COST_MULTIPLIER)

            const NEW_NODE_GAIN = highestExistingStats.production / newNodePrice
            ns.print(newNodePrice, " ", NEW_NODE_GAIN)
            if (NEW_NODE_GAIN > bestDeal.gainPerDollar && buyableInXSeconds(newNodePrice) <= 120) {
                bestDeal = { nodeIndex: ns.hacknet.numNodes(), gainPerDollar: NEW_NODE_GAIN, upgradePrice: NODE_PURCHASE_COST, buyFunction: () => { return ns.hacknet.purchaseNode() >= 0 }, upgradeType: "Node" }
            }

            if (canAfford(bestDeal.upgradePrice)) {
                if (bestDeal.buyFunction()) {
                    LOGGER.info(`Bought ${BUY_AMOUNT} Hacknet ${bestDeal.upgradeType}(s)`)
                }
            }
        }

        await ns.sleep(100)
    }
}