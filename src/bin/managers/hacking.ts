import { NS } from "@ns"
import { TermLogger, Navigation, RecursiveDictionary } from "/lib/helpers"


// returns true if rooted, false if not
async function rootIfPossible(ns: NS, host: string) {
    const crackers = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject]

    for (const cracker of crackers) {
        try {
            cracker(host)
            // eslint-disable-next-line no-empty
        } catch (error) { }
    }

    try {
        ns.nuke(host)
    } catch (error) {
        return false
    }

    try {
        await ns.singularity.installBackdoor()
    } catch (error) {
        // ignore missing source file or missing RAM
    }

    return true
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    function deployWorm(host: string) {
        ns.scp(["/bin/deployables/worm.js", "/lib/helpers.js"], host)

        const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam("/bin/deployables/worm.js", host))

        if (threads > 0) {
            if (ns.exec("/bin/deployables/worm.js", host, threads) > 0) {
                LOGGER.successToast("Started worm.js on", host)
            }
        }
    }

    async function recursiveRoot(computerMap: RecursiveDictionary) {
        for (const host in computerMap) {
            if (!ns.hasRootAccess(host) && ns.getServerRequiredHackingLevel(host) <= ns.getPlayer().skills.hacking) {
                if (await rootIfPossible(ns, host)) {
                    LOGGER.successToast("Rooted", host)
                    deployWorm(host)
                }
            } else if (!ns.scriptRunning("/bin/deployables/worm.js", host)) {
                deployWorm(host)
            }

            await recursiveRoot(computerMap[host])
        }
    }

    ns.enableLog("ALL")

    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacking Manager")

    while (true) {
        const COMPUTER_MAP: RecursiveDictionary = Navigation.recursiveScan(ns, "home", true)

        await recursiveRoot(COMPUTER_MAP)

        await ns.sleep(5000)
    }
}