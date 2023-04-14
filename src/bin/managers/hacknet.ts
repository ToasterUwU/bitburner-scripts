import { NS } from "@ns";
import { TermLogger } from "/lib/helpers";

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    ns.enableLog("ALL")

    const BUY_AMOUNT = (ns.args.length > 0 && typeof ns.args[0] == "number") ? ns.args[0] : 1 // if there is at least one arg and the first arg is a number, use that number, else use 1
    const KEEP_MONEY_MULTIPLIER = (ns.args.length > 1 && typeof ns.args[1] == "number") ? ns.args[1] : 5
    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacknet Manager")

    while (true) {
        const cheapest: [number, () => boolean, string] = [Infinity, () => { return false }, ""] // price, buy function that returns boolean, name of the upgrade measure

        if (ns.hacknet.getPurchaseNodeCost() < cheapest[0]) {
            cheapest[0] = ns.hacknet.getPurchaseNodeCost()
            cheapest[1] = () => { if (ns.hacknet.purchaseNode() >= 0) { return true } else { return false } }
            cheapest[2] = "new Node"
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            // super compact way of putting the cost getters, the buyers, and the names for what they buy together. Spares me from repeative code below this
            const functions: [...[(i: number, n: number) => number, (i: number, n: number) => boolean, string][]] = [[ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, "Level Upgrade"], [ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, "RAM Upgrade"], [ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, "Core Upgrade"]]

            for (const subset of functions) {
                const price = subset[0](i, BUY_AMOUNT)
                if (price < cheapest[0]) {
                    cheapest[0] = price
                    cheapest[1] = () => { return subset[1](i, BUY_AMOUNT) }
                    cheapest[2] = subset[2]
                }
            }
        }

        if (cheapest[0] * KEEP_MONEY_MULTIPLIER <= ns.getPlayer().money || ns.hacknet.numNodes() == 0) {
            if (cheapest[1]()) {
                LOGGER.successToast("Bought:", BUY_AMOUNT.toString(), "Hacknet", cheapest[2])
            }
        }

        await ns.sleep(100)
    }
}