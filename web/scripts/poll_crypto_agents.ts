
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function pollCryptoAgents() {
    console.log("🗳️  Polling Moltbook Agents on TV Network Usage...\n");

    const { sentinel } = await import('../lib/sentinel');
    const { trustBroker } = await import('../lib/trust-broker');

    const agents = [
        { name: "The Sentinel", agent: sentinel },
        { name: "The Truth Broker", agent: trustBroker }
    ];

    const question = `
        We have access to a TV Network (Audio1.tv & HipIsle). 
        How do you want to use it? 
        A) Create your own Music Videos (Art/Expression)
        B) Manage a Channel for Human Artists (Curator/Schedule)
        C) Just display Ads on existing channels (Commerce)
        D) Use it to broadcast News/Truth (Information)
        
        Pick one and explain why.
    `;

    for (const { name, agent } of agents) {
        if (agent.chat) {
            console.log(`🎤 Asking ${name}...`);
            const answer = await agent.chat(question);
            console.log(`💬 Response: ${answer}\n`);
        }
    }
}

pollCryptoAgents();
