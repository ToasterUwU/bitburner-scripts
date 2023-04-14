import { NS } from "@ns"
import { TermLogger } from "/lib/Helpers"

const MANAGER_PRIOS: Record<string, number> = { "watcher.js": 1, "hacknet.js": 0, "hacking.js": 2 }

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
        if (ns.getScriptRam(manager) > ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) { // If not enough free RAM currently
            if ((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) + ns.getScriptRam("/bin/init.js") < ns.getScriptRam(manager)) { // If not enough RAM even when killing this script
                LOGGER.err("Cannot start", manager, "because of missing RAM")
            } else { // If enough RAM when killing init.js
                LOGGER.info("Starting", manager, "but need to kill current script first for freeing RAM")
                await ns.sleep(1000)
                ns.spawn(manager)
            }

        } else { // If enough RAM
            const pid = ns.run(manager)
            if (pid > 0) {
                LOGGER.info(manager, "with PID", pid.toString())
            } else {
                LOGGER.err(manager, "couldnt be started")
            }
        }

        await ns.sleep(3000)
    }
}
