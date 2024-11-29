// Web Worker for Hexa Stat simulation
self.onmessage = function(e) {
    const { targetLevel, numSimulations, isSunnySunday, levelCosts } = e.data;
    
    const simulateAttempts = (targetLevel, numSimulations) => {
        let totalResets = 0;
        let totalFragments = 0;
        
        const RESET_THRESHOLDS = {
            6: [
                { totalLevel: 10, minMainStat: 2 },
                { totalLevel: 11, minMainStat: 3 },
                { totalLevel: 15, minMainStat: 4 },
                { totalLevel: 19, minMainStat: 5 }
            ],
            7: [
                { totalLevel: 10, minMainStat: 3 },
                { totalLevel: 12, minMainStat: 4 },
                { totalLevel: 16, minMainStat: 5 },
                { totalLevel: 19, minMainStat: 6 }
            ],
            8: [
                { totalLevel: 10, minMainStat: 4 },
                { totalLevel: 14, minMainStat: 5 },
                { totalLevel: 17, minMainStat: 6 },
                { totalLevel: 19, minMainStat: 7 }
            ],
            9: [
                { totalLevel: 10, minMainStat: 4 },
                { totalLevel: 12, minMainStat: 5 },
                { totalLevel: 15, minMainStat: 6 },
                { totalLevel: 18, minMainStat: 7 },
                { totalLevel: 19, minMainStat: 8 }
            ],
            10: [
                { totalLevel: 10, minMainStat: 4 },
                { totalLevel: 11, minMainStat: 5 },
                { totalLevel: 14, minMainStat: 6 },
                { totalLevel: 16, minMainStat: 7 },
                { totalLevel: 18, minMainStat: 8 },
                { totalLevel: 19, minMainStat: 9 }
            ]
        };
        
        for (let sim = 0; sim < numSimulations; sim++) {
            let fragments = 0;
            let resets = 0;
            let success = false;
            
            while (!success) {
                // Start fresh at 0/0/0
                let mainStat = 0;
                let totalLevel = 0;
                let fragments_this_attempt = 0;
                let needsReset = false;
                
                // Keep attempting until we hit level cap, reach target, or need reset
                while (totalLevel < 20 && mainStat < targetLevel && !needsReset) {
                    // Cost is based on main stat level
                    fragments_this_attempt += levelCosts[mainStat].cost;
                    
                    // Get probabilities
                    let mainStatChance = levelCosts[mainStat].chance / 100;
                    if (isSunnySunday && mainStat >= 5) {
                        // Increase by 20% of base rate
                        mainStatChance *= 1.20;
                    }
                    
                    // Simulate the enhance
                    const roll = Math.random();
                    if (roll < mainStatChance) {
                        mainStat++;
                    }
                    totalLevel++;
                    
                    // Check thresholds
                    const thresholds = RESET_THRESHOLDS[targetLevel] || [];
                    for (const threshold of thresholds) {
                        if (totalLevel >= threshold.totalLevel && mainStat < threshold.minMainStat) {
                            needsReset = true;
                            break;
                        }
                    }
                }
                
                fragments += fragments_this_attempt;
                
                // Check if we succeeded
                if (mainStat >= targetLevel) {
                    success = true;
                } else {
                    resets++;
                }
            }
            
            totalResets += resets;
            totalFragments += fragments;
        }
        
        return {
            avgResets: Math.ceil(totalResets / numSimulations),
            avgFragments: Math.ceil(totalFragments / numSimulations)
        };
    };

    const result = simulateAttempts(targetLevel, numSimulations);
    self.postMessage(result);
};
