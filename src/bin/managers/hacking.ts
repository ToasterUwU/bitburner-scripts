import { NS } from "@ns"
import { TermLogger } from "/lib/helpers"
import { Navigation, RecursiveDictionary } from '/lib/navigation'


// returns true if rooted, false if not
async function rootIfPossible(ns: NS, host: string) {
    const crackers = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject]

    for (const cracker of crackers) {
        try {
            cracker(host)
        } catch (error) {
            // ignore cracker issues
        }
    }

    try {
        ns.nuke(host)
    } catch (error) {
        return false
    }

    try {
        await ns.singularity.installBackdoor()
    } catch (error) {
        //ignore missing source file or missing RAM
    }

    return true
}

function deployWorm(ns: NS, logger: TermLogger, host: string) {
    if (ns.fileExists("rebooting_worm.txt", host)) {
        return
    }

    ns.scp(["bin/deployables/worm.js", "/lib/helpers.js", "/lib/navigation.js"], host)

    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam("bin/deployables/worm.js", host))

    if (threads > 0) {
        if (ns.exec("bin/deployables/worm.js", host, threads) > 0) {
            logger.successToast("Started worm.js on", host)
        }
    }
}

async function recursiveRoot(ns: NS, logger: TermLogger, computerMap: RecursiveDictionary, startHost: string) {
    for (const host in computerMap) {
        ns.singularity.connect(host)

        if (!ns.hasRootAccess(host) && ns.getServerRequiredHackingLevel(host) <= ns.getPlayer().skills.hacking) {
            if (await rootIfPossible(ns, host)) {
                logger.successToast("Rooted", host)
                deployWorm(ns, logger, host)
            }
        } else if (ns.hasRootAccess(host) && !ns.scriptRunning("bin/deployables/worm.js", host)) {
            deployWorm(ns, logger, host)
        }

        await recursiveRoot(ns, logger, computerMap[host], host)

        ns.singularity.connect(startHost)
    }
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const LOGGER = new TermLogger(ns)
    LOGGER.success("Started Hacking Manager")

    while (true) {
        try {
            ns.singularity.purchaseTor()
            ns.singularity.purchaseProgram("BruteSSH.exe")
            ns.singularity.purchaseProgram("FTPCrack.exe")
            ns.singularity.purchaseProgram("relaySMTP.exe")
            ns.singularity.purchaseProgram("HTTPworm.exe")
            ns.singularity.purchaseProgram("SQLInject.exe")
        } catch (error) {
            // couldnt buy Crackers, dont care.. maybe next time
        }

        for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
            if (ns.getPlayer().money > ns.getPurchasedServerCost(2)) {
                const NAME = ns.purchaseServer("PS", 8)
                if (NAME) {
                    LOGGER.successToast("Bought new Server: ", NAME)
                }
            }
        }

        for (const name of ns.getPurchasedServers()) {
            const NEW_RAM = Math.pow(2, (Math.log(ns.getServerMaxRam(name)) / Math.log(2)) + 1)
            if (ns.getPlayer().money > (ns.getPurchasedServerUpgradeCost(name, NEW_RAM) * 3)) {
                if (ns.upgradePurchasedServer(name, NEW_RAM)) {
                    LOGGER.infoToast("Upgraded Server: ", name)
                }
            }
        }
        await ns.sleep(5000)

        const COMPUTER_MAP: RecursiveDictionary = Navigation.recursiveScan(ns, "home", true)
        await recursiveRoot(ns, LOGGER, COMPUTER_MAP, "home")
        await ns.sleep(5000)
    }
}