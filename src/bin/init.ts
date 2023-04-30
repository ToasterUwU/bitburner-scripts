import { NS } from "@ns"
import { TermLogger } from "/lib/helpers"

const MANAGER_PRIOS: Record<string, number> = { "hacknet.js": 0, "watcher.js": 1, "hacking.js": 2 }

function compareManagerPrios(manager1: string, manager2: string) {
    const NAME1 = manager1.split("/")[-1]
    const NAME2 = manager2.split("/")[-1]

    if (NAME1 in MANAGER_PRIOS && !(NAME2 in MANAGER_PRIOS)) {
        return -1
    } else if (!(NAME1 in MANAGER_PRIOS) && NAME2 in MANAGER_PRIOS) {
        return 1
    } else {
        return MANAGER_PRIOS[NAME1] - MANAGER_PRIOS[NAME2]
    }
}

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const LOGGER = new TermLogger(ns)

    for (const manager of ns.ls("home", "/bin/managers").sort(compareManagerPrios).reverse()) {
        while (ns.getScriptRam(manager) > ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) { // while not enough free RAM currently
            ns.singularity.upgradeHomeRam()
            await ns.sleep(500)
        }

        const pid = ns.run(manager)
        if (pid > 0) {
            LOGGER.info(manager, "with PID", pid.toString())
        } else {
            LOGGER.err(manager, "couldnt be started")
        }

        await ns.sleep(3000)
    }
}
