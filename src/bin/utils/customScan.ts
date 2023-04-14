import { NS } from "@ns";
import { Navigation, RecursiveDictionary } from "/lib/Helpers";

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const green = "\u001b[32m";
    const red = "\u001b[31m";
    const reset = "\u001b[0m";

    const COMPUTER_MAP = Navigation.recursiveScan(ns, ns.getHostname(), true)

    ns.print(COMPUTER_MAP)

    function recursivePrint(computerMap: RecursiveDictionary, depth = 0) {
        for (const host in computerMap) {
            let text = ""

            for (let i = 0; i < depth; i++) {
                text += "\t"
            }

            if (ns.hasRootAccess(host)) {
                text += green
            } else {
                text += red
            }
            text += host + reset

            ns.tprint(text)

            recursivePrint(computerMap[host], depth + 1)
        }
    }

    recursivePrint(COMPUTER_MAP)
}