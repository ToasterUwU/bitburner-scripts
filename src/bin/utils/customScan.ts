import { NS } from "@ns";
import { Navigation, RecursiveDictionary } from "/lib/navigation";


const GREEN = "\u001b[32m";
const RED = "\u001b[31m";
const RESET = "\u001b[0m";

function recursivePrint(ns: NS, computerMap: RecursiveDictionary, depth = 0) {
    for (const host in computerMap) {
        let text = ""

        for (let i = 0; i < depth; i++) {
            text += "\t"
        }

        if (ns.hasRootAccess(host)) {
            text += GREEN
        } else {
            text += RED
        }
        text += host + RESET

        ns.tprint(text)

        recursivePrint(ns, computerMap[host], depth + 1)
    }
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const COMPUTER_MAP = Navigation.recursiveScan(ns, ns.getHostname(), true)

    ns.print(COMPUTER_MAP)

    recursivePrint(ns, COMPUTER_MAP)
}