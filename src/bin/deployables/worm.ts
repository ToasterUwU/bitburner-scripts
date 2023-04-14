import { NS } from '@ns'
import { TermLogger } from '/lib/helpers'

// Its a worm, it nibbbles. From that multi million transaction, to that guy who pays $10 for gas

export async function main(ns: NS): Promise<void> {
    const HOSTNAME = ns.getHostname()
    const LOGGER = new TermLogger(ns)

    while (true) {
        if (ns.hackAnalyzeChance(HOSTNAME) > 0.5) {
            const availableMoney = ns.getServerMoneyAvailable(HOSTNAME)
            if (availableMoney / ns.getServerMaxMoney(HOSTNAME) == 1 || availableMoney >= 150000) {
                const stolenMoney = await ns.hack(HOSTNAME)
                if (stolenMoney > 0) {
                    LOGGER.successToast("Stole", `$${stolenMoney}`, "from", HOSTNAME)
                }
            } else {
                await ns.grow(HOSTNAME)
            }
        } else {
            await ns.weaken(HOSTNAME)
        }

        await ns.sleep(1000)
    }
}