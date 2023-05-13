import { NS, NodeStats } from "@ns"


export const Hacknet = {
    /**
     * Compare two NodeStats objects based on their properties.
     * Returns a negative number if nodeA is "smaller" than nodeB,
     * a positive number if nodeA is "larger" than nodeB,
     * and 0 if they are equal.
     * @param {NodeStats} nodeA - The first NodeStats object to compare.
     * @param {NodeStats} nodeB - The second NodeStats object to compare.
     * @returns {number} The comparison result.
     */
    compareNodeStats(nodeA: NodeStats, nodeB: NodeStats): number {
        if (nodeA.level !== nodeB.level) {
            return nodeA.level - nodeB.level;
        }

        if (nodeA.ram !== nodeB.ram) {
            return nodeA.ram - nodeB.ram;
        }

        if (nodeA.cores !== nodeB.cores) {
            return nodeA.cores - nodeB.cores;
        }

        // Check optional properties if they exist
        if (nodeA.ramUsed && nodeB.ramUsed && nodeA.ramUsed !== nodeB.ramUsed) {
            return nodeA.ramUsed - nodeB.ramUsed;
        }

        if (nodeA.cache && nodeB.cache && nodeA.cache !== nodeB.cache) {
            return nodeA.cache - nodeB.cache;
        }

        if (nodeA.hashCapacity && nodeB.hashCapacity && nodeA.hashCapacity !== nodeB.hashCapacity) {
            return nodeA.hashCapacity - nodeB.hashCapacity;
        }

        // If all properties are the same, return 0
        return 0;
    },

    hacknetProduction(ns: NS): number {
        let production = 0
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const STATS: NodeStats = ns.hacknet.getNodeStats(i)

            production += STATS.production
        }

        return production
    }
}