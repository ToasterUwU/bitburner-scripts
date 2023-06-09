import { NS } from '@ns'
import { Navigation, RecursiveDictionary } from '/lib/navigation'


function findPath(ns: NS, target: string, computerMap: RecursiveDictionary, hostList: Array<string> = [], isFound = false): [Array<string>, boolean] {
    for (const host in computerMap) {
        if (host === target) {
            hostList.push(host)
            return [hostList, true]
        }

        hostList.push(host)

        const RESULT = findPath(ns, target, computerMap[host], hostList, isFound)
        hostList = RESULT[0]
        isFound = RESULT[1]

        if (isFound) {
            return [hostList, isFound]
        }

        hostList.pop()
    }
    return [hostList, false]
}

export async function main(ns: NS): Promise<void> {
    const TO_FIND = (ns.args.length > 0 && typeof ns.args[0] == "string") ? ns.args[0] : "n00dles" // if there is at least one arg and the first arg is a number, use that number, else use 1

    const RESULT = findPath(ns, TO_FIND, Navigation.recursiveScan(ns, "home", true))

    for (const host of RESULT[0]) {
        ns.singularity.connect(host)
    }
}