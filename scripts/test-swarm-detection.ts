
import { analyzeSwarmActivity } from '../web/lib/polymarket-analyzer';

// Known active markets (Super Bowl 2026 teams)
const TEST_MARKETS = [
    "0xc319ae3e39f6a0b441fd02d37058ee8af4133967a205c88c9243972deceddbee", // Arizona Cardinals
    "0x6167c4ce9a850c0b5fa34f375a2d9cecfff94ce2c81c9f15ae962d40d0a1230b", // Atlanta Falcons
];

async function main() {
    console.log("Running Swarm Detection Test...");

    for (const conditionId of TEST_MARKETS) {
        console.log(`Analyzing Market: ${conditionId}`);
        try {
            const swarm = await analyzeSwarmActivity(conditionId);

            if (swarm.detected) {
                console.log(`[!] SWARM DETECTED`);
                console.log(`Intensity: ${swarm.intensity}`);
                console.log(`Size: ${swarm.swarmSize} unique wallets`);
                console.log(`Side: ${swarm.side}`);
                console.log(`Confidence: ${swarm.confidence}%`);
                console.log(`Description: ${swarm.description}`);
            } else {
                console.log(`[-] No swarm detected. Max density: ${swarm.swarmSize}`);
            }
            console.log("-----------------------------------");
        } catch (e) {
            console.error("Test Error:", e);
        }
    }
}

main();
