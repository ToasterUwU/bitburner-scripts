import { NS } from "@ns";
import { Navigation, RecursiveDictionary } from "/lib/navigation";


function recursiveKillAll(ns: NS, computerMap: RecursiveDictionary, depth = 0) {
    for (const host in computerMap) {
        ns.killall(host, true)

        recursiveKillAll(ns, computerMap[host], depth + 1)
    }
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const COMPUTER_MAP = Navigation.recursiveScan(ns, ns.getHostname(), true)

    ns.killall("home")

    recursiveKillAll(ns, COMPUTER_MAP)
}