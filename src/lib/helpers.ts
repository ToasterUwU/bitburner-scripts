import { NS, NodeStats } from "@ns"

export interface RecursiveDictionary {
    [Key: string]: RecursiveDictionary;
}

export const Hacknet = {
    /**
     * Compare two NodeStats objects based on their properties.
     * Returns a negative number if nodeA is "smaller" than nodeB,
     * a positive number if nodeA is "larger" than nodeB,
     * and 0 if they are equal.
     * @param {NodeStats} nodeA - The first NodeStats object to compare.
     * @param {NodeStats} nodeB - The second NodeStats object to compare.
     * @returns {number} The comparison result.
     */
    compareNodeStats(nodeA: NodeStats, nodeB: NodeStats): number {
        if (nodeA.level !== nodeB.level) {
            return nodeA.level - nodeB.level;
        }

        if (nodeA.ram !== nodeB.ram) {
            return nodeA.ram - nodeB.ram;
        }

        if (nodeA.cores !== nodeB.cores) {
            return nodeA.cores - nodeB.cores;
        }

        // Check optional properties if they exist
        if (nodeA.ramUsed && nodeB.ramUsed && nodeA.ramUsed !== nodeB.ramUsed) {
            return nodeA.ramUsed - nodeB.ramUsed;
        }

        if (nodeA.cache && nodeB.cache && nodeA.cache !== nodeB.cache) {
            return nodeA.cache - nodeB.cache;
        }

        if (nodeA.hashCapacity && nodeB.hashCapacity && nodeA.hashCapacity !== nodeB.hashCapacity) {
            return nodeA.hashCapacity - nodeB.hashCapacity;
        }

        // If all properties are the same, return 0
        return 0;
    },

    hacknetProduction(ns: NS): number {
        let production = 0
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const STATS: NodeStats = ns.hacknet.getNodeStats(i)

            production += STATS.production
        }

        return production
    }
}

export const ReadText = {
    readLines(ns: NS, file: string): string[] {
        return (ns.read(file) as string).split(/\r?\n/)
    },

    readNonEmptyLines(ns: NS, file: string): string[] {
        return ReadText.readLines(ns, file).filter(
            (x) => x.trim() != ""
        )
    },
}

export const DownloadFiles = {
    async getfileToHome(ns: NS, source: string, dest: string): Promise<void> {
        const logger = new TermLogger(ns)
        logger.info(`Downloading ${source} -> ${dest}`)

        if (!(await ns.wget(source, dest, "home"))) {
            logger.err(`\tFailed retrieving ${source} -> ${dest}`)
        }
    },
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

export class TermLogger {
    static INFO_LITERAL = "INFO     >"
    static WARN_LITERAL = "WARN     >"
    static ERR_LITERAL = "ERROR    >"
    static SUCCESS_LITERAL = "SUCCESS  >"
    ns: NS

    constructor(ns: NS) {
        this.ns = ns
    }

    infoToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "info")
        this.info(...messageParts)
    }

    info(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.INFO_LITERAL} ${messageParts.join(" ")}`)
    }

    warnToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "warning")
        this.warn(...messageParts)
    }

    warn(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.WARN_LITERAL} ${messageParts.join(" ")}`)
    }

    errToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "error")
        this.err(...messageParts)
    }

    err(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.ERR_LITERAL} ${messageParts.join(" ")}`)
    }

    successToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "success")
        this.success(...messageParts)
    }

    success(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.SUCCESS_LITERAL} ${messageParts.join(" ")}`)
    }
}