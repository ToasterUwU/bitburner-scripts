import { NS } from '@ns'
import { TermLogger, Navigation, RecursiveDictionary } from '/lib/helpers'

// Its a worm, it nibbbles. From that multi million transaction, to that guy who pays $10 for gas

async function recursiveHack(ns: NS, logger: TermLogger, computerMap: RecursiveDictionary) {
    for (const host in computerMap) {
        if (ns.hasRootAccess(host) && ns.getServerRequiredHackingLevel(host) <= ns.getPlayer().skills.hacking) {
            const maxMoney = ns.getServerMaxMoney(host)

            if (maxMoney > 0) {
                if (ns.getServerSecurityLevel(host) == ns.getServerMinSecurityLevel(host)) {
                    let availableMoney = ns.getServerMoneyAvailable(host)
                    if (availableMoney == maxMoney || (availableMoney > 1000000 && ns.getServerGrowth(host) <= availableMoney / 100000)) {
                        const stolenMoney = await ns.hack(host)
                        if (stolenMoney > 0) {
                            logger.successToast("Stole", `$${stolenMoney.toLocaleString()}`, "from", host)
                        }
                    } else {
                        await ns.grow(host)

                        availableMoney = ns.getServerMoneyAvailable(host)
                        logger.info("Grew Money on", host, `-> $${availableMoney.toLocaleString()}`, "available", "( Ratio:", (availableMoney / maxMoney).toFixed(2), ")")
                    }
                } else {
                    await ns.weaken(host)

                    logger.info("Weakend", host, "-> Security Ratio:", ((ns.getServerSecurityLevel(host) / ns.getServerMinSecurityLevel(host)) - 1).toFixed(2))
                }
            }
        }

        await recursiveHack(ns, logger, computerMap[host])
    }
}

export async function main(ns: NS): Promise<void> {
    const LOGGER = new TermLogger(ns)

    while (true) {
        const COMPUTER_MAP: RecursiveDictionary = Navigation.recursiveScan(ns, "home", true)

        await recursiveHack(ns, LOGGER, COMPUTER_MAP)

        await ns.sleep(1000)
    }
}