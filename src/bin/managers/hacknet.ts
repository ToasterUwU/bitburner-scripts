import { NS } from "@ns";
import { TermLogger } from "/lib/helpers";

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const BUY_AMOUNT = (ns.args.length > 0 && typeof ns.args[0] == "number") ? ns.args[0] : 1 // if there is at least one arg and the first arg is a number, use that number, else use 1
    const KEEP_MONEY_MULTIPLIER = (ns.args.length > 1 && typeof ns.args[1] == "number") ? ns.args[1] : 5
    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacknet Manager")

    const LEVEL_BATCH_SIZE = 50
    const RAM_BATCH_SIZE = 16
    const CORE_BATCH_SIZE = 3

    while (true) {
        if (ns.hacknet.numNodes() == 0) {
            if (ns.hacknet.purchaseNode() >= 0) {
                LOGGER.successToast("Bought first Hacknet Node")
            }
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const stats = ns.hacknet.getNodeStats(i)

            for (let j = 1; j <= 4; j++) {
                if (stats.level < LEVEL_BATCH_SIZE * j) {
                    if (ns.hacknet.getLevelUpgradeCost(i, BUY_AMOUNT) * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money) {
                        if (ns.hacknet.upgradeLevel(i, BUY_AMOUNT)) {
                            LOGGER.info("Bought Hacknet level upgrade")
                        }
                    }
                    break
                } else if (stats.ram < RAM_BATCH_SIZE * j) {
                    if (ns.hacknet.getRamUpgradeCost(i, BUY_AMOUNT) * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money) {
                        if (ns.hacknet.upgradeRam(i, BUY_AMOUNT)) {
                            LOGGER.info("Bought Hacknet RAM upgrade")
                        }
                    }
                    break
                } else if (stats.cores < CORE_BATCH_SIZE * j) {
                    if (ns.hacknet.getCoreUpgradeCost(i, BUY_AMOUNT) * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money) {
                        if (ns.hacknet.upgradeCore(i, BUY_AMOUNT)) {
                            LOGGER.info("Bought Hacknet Core upgrade")
                        }
                    }
                    break
                }

                if (ns.hacknet.getPurchaseNodeCost() * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money) {
                    if (ns.hacknet.purchaseNode() >= 0) {
                        LOGGER.successToast("Bought new Hacknet Node")
                    }
                }
            }
        }

        await ns.sleep(100)
    }
}