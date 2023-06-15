import { NS, RunningScript } from '@ns'
import { TermLogger } from '/lib/helpers'
import { Navigation, RecursiveDictionary } from '/lib/navigation'

// Its a worm, it nibbles. From that multi million transaction, to that guy who pays $10 for gas

function flattenRecursiveDict(data: RecursiveDictionary) {
    const flattenedData: Array<string> = []

    for (const host in data) {
        flattenedData.push(host)
        for (const x of flattenRecursiveDict(data[host])) {
            flattenedData.push(x)
        }
    }

    return flattenedData
}

function getUsableThreads(ns: NS, HOSTNAME: string, CURRENT_PROCESS: RunningScript) {
    return Math.floor((ns.getServerMaxRam(HOSTNAME) - (ns.getServerUsedRam(HOSTNAME) - (CURRENT_PROCESS.threads + CURRENT_PROCESS.ramUsage))) / ns.getScriptRam("bin/deployables/worm.js"))
}

export async function main(ns: NS): Promise<void> {
    const LOGGER = new TermLogger(ns)
    const HOSTNAME = ns.getHostname()

    while (true) {
        const COMPUTER_MAP: RecursiveDictionary = Navigation.recursiveScan(ns, "home", true)

        const flattenedComputerMap = flattenRecursiveDict(COMPUTER_MAP)
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value) // shuffle the list

        for (const i in flattenedComputerMap) {
            const CURRENT_PROCESS = ns.getRunningScript()
            if (CURRENT_PROCESS) {
                const USABLE_THREADS = getUsableThreads(ns, HOSTNAME, CURRENT_PROCESS)
                if (CURRENT_PROCESS.threads < USABLE_THREADS) {
                    ns.spawn("bin/deployables/worm.js", USABLE_THREADS)
                }
            }

            const host = flattenedComputerMap[i]

            if (ns.hasRootAccess(host) && ns.getServerRequiredHackingLevel(host) <= ns.getPlayer().skills.hacking) {
                const maxMoney = ns.getServerMaxMoney(host)

                if (maxMoney > 0) {
                    if (ns.getServerSecurityLevel(host) == ns.getServerMinSecurityLevel(host)) {
                        let availableMoney = ns.getServerMoneyAvailable(host)
                        if (availableMoney == maxMoney || (availableMoney > 1000000 && ns.getServerGrowth(host) <= availableMoney / 100000)) {
                            const stolenMoney = await ns.hack(host)
                            if (stolenMoney > 0) {
                                LOGGER.successToast("Stole", `$${stolenMoney.toLocaleString()}`, "from", host)
                            }
                        } else {
                            await ns.grow(host)

                            availableMoney = ns.getServerMoneyAvailable(host)
                            LOGGER.info("Grew Money on", host, `-> $${availableMoney.toLocaleString()}`, "available", "( Ratio:", (availableMoney / maxMoney).toFixed(2), ")")
                        }
                    } else {
                        await ns.weaken(host)

                        LOGGER.info("Weakend", host, "-> Security Ratio:", ((ns.getServerSecurityLevel(host) / ns.getServerMinSecurityLevel(host)) - 1).toFixed(2))
                    }
                }
            }
        }

        await ns.sleep(1000)
    }
}
