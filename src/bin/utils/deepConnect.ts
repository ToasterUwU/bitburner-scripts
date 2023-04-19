import { NS } from '@ns'


function findPath(ns: NS, target: string, serverName: string, serverList: Array<string> = [], ignore: Array<string> = [], isFound = false): [Array<string>, boolean] {
    ignore.push(serverName)

    const scanResults = ns.scan(serverName)

    for (const server of scanResults) {
        if (ignore.includes(server)) {
            continue
        }

        if (server === target) {
            serverList.push(server)
            return [serverList, true]
        }

        serverList.push(server)

        const RESULT = findPath(ns, target, server, serverList, ignore, isFound)
        serverList = RESULT[0]
        isFound = RESULT[1]

        if (isFound) {
            return [serverList, isFound]
        }

        serverList.pop()
    }
    return [serverList, false]
}

export async function main(ns: NS): Promise<void> {
    const TO_FIND = (ns.args.length > 0 && typeof ns.args[0] == "string") ? ns.args[0] : "n00dles" // if there is at least one arg and the first arg is a number, use that number, else use 1

    const RESULT = findPath(ns, TO_FIND, "home")

    ns.tprint("connect ", RESULT[0].join(";connect "))
}