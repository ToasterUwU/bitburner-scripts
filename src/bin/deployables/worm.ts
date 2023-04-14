import { NS } from '@ns'
import { TermLogger } from '/lib/helpers'

// Its a worm, it nibbbles. From that multi million transaction, to that guy who pays $10 for gas

export async function main(ns: NS): Promise<void> {

    const HOSTNAME = ns.getHostname()
    const LOGGER = new TermLogger(ns)

    while (true) {
        const maxMoney = ns.getServerMaxMoney(HOSTNAME)
        if (maxMoney > 0) {
            if (ns.getServerSecurityLevel(HOSTNAME) <= ns.getServerMinSecurityLevel(HOSTNAME) * 1.05) {
                if (ns.getServerMoneyAvailable(HOSTNAME) / maxMoney >= 0.95) {
                    const stolenMoney = await ns.hack(HOSTNAME)
                    if (stolenMoney > 0) {
                        LOGGER.successToast("Stole", `$${stolenMoney}`, "from", HOSTNAME)
                    }
                } else {
                    await ns.grow(HOSTNAME)

                    const availableMoney = ns.getServerMoneyAvailable(HOSTNAME)
                    LOGGER.info("Grew Money on", HOSTNAME, `-> $${availableMoney.toLocaleString()}`, "available", "( Ratio:", (availableMoney / maxMoney).toFixed(2), ")")
                }
            } else {
                await ns.weaken(HOSTNAME)

                LOGGER.info("Weakend", HOSTNAME, "-> Security Ratio:", ((ns.getServerSecurityLevel(HOSTNAME) / ns.getServerMinSecurityLevel(HOSTNAME)) - 1).toFixed(2))
            }
        }

        await ns.sleep(1000)
    }
}