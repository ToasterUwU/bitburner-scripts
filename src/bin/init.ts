import { NS } from "@ns"
import { TermLogger } from "/lib/helpers"


const MANAGER_PRIOS: Record<string, number> = { "/bin/managers/hacknet.js": 0, "/bin/managers/watcher.js": 1, "/bin/managers/hacking.js": 2, "/bin/deployables/worm.js": Infinity }

function compareScriptPrios(manager1: string, manager2: string) {
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

    for (const script of ns.ls("home", "/bin").sort(compareScriptPrios).reverse()) {
        let found = false
        for (const key in MANAGER_PRIOS) {
            if (key == script) {
                found = true
                break
            }
        }

        if (!found) {
            continue
        }

        while (ns.getScriptRam(script) > ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) { // while not enough free RAM currently
            // ns.singularity.upgradeHomeRam()
            await ns.sleep(500)
        }

        let pid: number
        if (MANAGER_PRIOS[script] != Infinity) {
            pid = ns.run(script)
        } else {
            pid = ns.run(script, Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(script)))
        }

        if (pid > 0) {
            LOGGER.info(script, "with PID", pid.toString())
        } else {
            LOGGER.err(script, "couldnt be started")
        }

        await ns.sleep(3000)
    }
}
