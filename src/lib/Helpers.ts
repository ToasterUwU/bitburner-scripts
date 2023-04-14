import { NS } from "@ns"

export interface RecursiveDictionary {
    [Key: string]: RecursiveDictionary;
}

const ReadText = {
    readLines(ns: NS, file: string): string[] {
        return (ns.read(file) as string).split(/\r?\n/)
    },

    readNonEmptyLines(ns: NS, file: string): string[] {
        return ReadText.readLines(ns, file).filter(
            (x) => x.trim() != ""
        )
    },
}

const DownloadFiles = {
    async getfileToHome(ns: NS, source: string, dest: string) {
        const logger = new TermLogger(ns)
        logger.info(`Downloading ${source} -> ${dest}`)

        if (!(await ns.wget(source, dest, "home"))) {
            logger.err(`\tFailed retrieving ${source} -> ${dest}`)
        }
    },
}

const Navigation = {
    recursiveScan(ns: NS, from = "home", includeNonRooted = false, _alreadyFound: Array<string> = []) {
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

class TermLogger {
    static INFO_LITERAL = "INFO     >"
    static WARN_LITERAL = "WARN     >"
    static ERR_LITERAL = "ERROR    >"
    static SUCCESS_LITERAL = "SUCCESS  >"
    ns: NS

    constructor(ns: NS) {
        this.ns = ns
    }

    infoToast(...messageParts: string[]) {
        this.ns.toast(`${messageParts.join(" ")}`, "info")
        this.info(...messageParts)
    }

    info(...messageParts: string[]) {
        this.ns.tprintf(`${TermLogger.INFO_LITERAL} ${messageParts.join(" ")}`)
    }

    warnToast(...messageParts: string[]) {
        this.ns.toast(`${messageParts.join(" ")}`, "warning")
        this.warn(...messageParts)
    }

    warn(...messageParts: string[]) {
        this.ns.tprintf(`${TermLogger.WARN_LITERAL} ${messageParts.join(" ")}`)
    }

    errToast(...messageParts: string[]) {
        this.ns.toast(`${messageParts.join(" ")}`, "error")
        this.err(...messageParts)
    }

    err(...messageParts: string[]) {
        this.ns.tprintf(`${TermLogger.ERR_LITERAL} ${messageParts.join(" ")}`)
    }

    successToast(...messageParts: string[]) {
        this.ns.toast(`${messageParts.join(" ")}`, "success")
        this.success(...messageParts)
    }

    success(...messageParts: string[]) {
        this.ns.tprintf(`${TermLogger.SUCCESS_LITERAL} ${messageParts.join(" ")}`)
    }
}

export { ReadText, TermLogger, DownloadFiles, Navigation }
