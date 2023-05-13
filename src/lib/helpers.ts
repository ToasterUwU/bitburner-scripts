import { NS } from "@ns"


export const ReadText = {
    readLines(ns: NS, file: string): string[] {
        return (ns.read(file) as string).split(/\r?\n/)
    },

    readNonEmptyLines(ns: NS, file: string): string[] {
        return ReadText.readLines(ns, file).filter(
            (x) => x.trim() != ""
        )
    },
}

export const DownloadFiles = {
    async getfileToHome(ns: NS, source: string, dest: string): Promise<void> {
        const logger = new TermLogger(ns)
        logger.info(`Downloading ${source} -> ${dest}`)

        if (!(await ns.wget(source, dest, "home"))) {
            logger.err(`\tFailed retrieving ${source} -> ${dest}`)
        }
    },
}

export class TermLogger {
    static INFO_LITERAL = "INFO     >"
    static WARN_LITERAL = "WARN     >"
    static ERR_LITERAL = "ERROR    >"
    static SUCCESS_LITERAL = "SUCCESS  >"
    ns: NS

    constructor(ns: NS) {
        this.ns = ns
    }

    infoToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "info")
        this.info(...messageParts)
    }

    info(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.INFO_LITERAL} ${messageParts.join(" ")}`)
    }

    warnToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "warning")
        this.warn(...messageParts)
    }

    warn(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.WARN_LITERAL} ${messageParts.join(" ")}`)
    }

    errToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "error")
        this.err(...messageParts)
    }

    err(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.ERR_LITERAL} ${messageParts.join(" ")}`)
    }

    successToast(...messageParts: string[]): void {
        this.ns.toast(`${messageParts.join(" ")}`, "success")
        this.success(...messageParts)
    }

    success(...messageParts: string[]): void {
        this.ns.tprintf(`${TermLogger.SUCCESS_LITERAL} ${messageParts.join(" ")}`)
    }
}