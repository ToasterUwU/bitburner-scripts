import { NS } from "@ns"


export interface RecursiveDictionary {
    [Key: string]: RecursiveDictionary;
}

export const Navigation = {
    recursiveScan(ns: NS, from = "home", includeNonRooted = false, _alreadyFound: Array<string> = []): RecursiveDictionary {
        const computerMap: RecursiveDictionary = {}

        if (_alreadyFound.length == 0) {
            _alreadyFound.push(from)
        }

        for (const host of ns.scan(from)) {
            if (!_alreadyFound.includes(host)) {
                _alreadyFound.push(host)

                computerMap[host] = Navigation.recursiveScan(ns, host, includeNonRooted, _alreadyFound)
            }
        }

        return computerMap
    }
}