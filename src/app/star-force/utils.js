// Constants for star force probabilities
export const STAR_FORCE_RATES = {
    0: { success: 0.95, maintain: 0.05, decrease: 0, destroy: 0 },
    1: { success: 0.90, maintain: 0.10, decrease: 0, destroy: 0 },
    2: { success: 0.85, maintain: 0.15, decrease: 0, destroy: 0 },
    3: { success: 0.85, maintain: 0.15, decrease: 0, destroy: 0 },
    4: { success: 0.80, maintain: 0.20, decrease: 0, destroy: 0 },
    5: { success: 0.75, maintain: 0.25, decrease: 0, destroy: 0 },
    6: { success: 0.70, maintain: 0.30, decrease: 0, destroy: 0 },
    7: { success: 0.65, maintain: 0.35, decrease: 0, destroy: 0 },
    8: { success: 0.60, maintain: 0.40, decrease: 0, destroy: 0 },
    9: { success: 0.55, maintain: 0.45, decrease: 0, destroy: 0 },
    10: { success: 0.50, maintain: 0.50, decrease: 0, destroy: 0 },
    11: { success: 0.45, maintain: 0.55, decrease: 0, destroy: 0 },
    12: { success: 0.40, maintain: 0.60, decrease: 0, destroy: 0 },
    13: { success: 0.35, maintain: 0.65, decrease: 0, destroy: 0 },
    14: { success: 0.30, maintain: 0.70, decrease: 0, destroy: 0 },
    15: { success: 0.30, maintain: 0.679, decrease: 0, destroy: 0.021 },
    16: { success: 0.30, maintain: 0, decrease: 0.679, destroy: 0.021 },
    17: { success: 0.30, maintain: 0, decrease: 0.679, destroy: 0.021 },
    18: { success: 0.30, maintain: 0, decrease: 0.672, destroy: 0.028 },
    19: { success: 0.30, maintain: 0, decrease: 0.672, destroy: 0.028 },
    20: { success: 0.30, maintain: 0.63, decrease: 0, destroy: 0.07 },
    21: { success: 0.30, maintain: 0, decrease: 0.63, destroy: 0.07 },
    22: { success: 0.03, maintain: 0, decrease: 0.776, destroy: 0.194 },
    23: { success: 0.02, maintain: 0, decrease: 0.686, destroy: 0.294 },
    24: { success: 0.01, maintain: 0, decrease: 0.594, destroy: 0.396 }
};

// Get max stars based on equipment level
export function getMaxStars(equipLevel) {
    if (equipLevel < 95) return 5;
    if (equipLevel < 108) return 8;
    if (equipLevel < 118) return 10;
    if (equipLevel < 128) return 15;
    if (equipLevel < 138) return 20;
    return 25;
}

// Calculate meso cost for a star force attempt
export function calculateMesoCost(equipLevel, currentStar) {
    let cost;
    const roundedLevel = Math.floor(equipLevel / 10) * 10;

    if (currentStar <= 9) {
        cost = 100 * Math.round((Math.pow(roundedLevel, 3) * (currentStar + 1) / 2500 + 10));
    } else if (currentStar <= 14) {
        const divisors = {
            10: 40000,
            11: 22000,
            12: 15000,
            13: 11000,
            14: 7500
        };
        cost = 100 * Math.round((Math.pow(roundedLevel, 3) * Math.pow(currentStar + 1, 2.7) / divisors[currentStar] + 10));
    } else {
        cost = 100 * Math.round((Math.pow(roundedLevel, 3) * Math.pow(currentStar + 1, 2.7) / 20000 + 10));
    }

    return cost;
}

// Apply MVP discount
export function applyMVPDiscount(cost, mvpType, currentStar) {
    if (currentStar >= 17) return cost;
    
    const discounts = {
        silver: 0.03,
        gold: 0.05,
        platinum: 0.10
    };

    return mvpType === 'none' ? cost : Math.floor(cost * (1 - discounts[mvpType]));
}

// Apply event discount
export function applyEventDiscount(cost, eventType) {
    if (eventType === 'thirtyOff' || eventType === 'shiningStarForce') {
        return Math.floor(cost * 0.7);
    }
    return cost;
}

// Calculate safeguard cost
export function calculateSafeguardCost(baseCost, currentStar, safeguardEnabled, isChanceTime, eventType) {
    // Only applicable for 15->16 and 16->17
    if (!safeguardEnabled || currentStar < 15 || currentStar > 16) return 0;

    // No safeguard cost during chance time or 5/10/15 events
    if (isChanceTime || 
        ((eventType === 'hundredSuccess' || eventType === 'shiningStarForce') && 
         currentStar === 15)) {
        return 0;
    }

    // Double the base cost for safeguard
    return baseCost;
}

// Adjust rates for star catch
export function adjustForStarCatch(rates, starCatchEnabled) {
    if (!starCatchEnabled) return rates;

    // Create a copy of the rates
    let adjustedRates = { ...rates };

    // Increase success rate by 5% multiplicatively
    adjustedRates.success = Math.min(1, rates.success * 1.05);

    // If there's no success rate increase possible (already at 100%), return original rates
    if (adjustedRates.success === rates.success) return rates;

    // Calculate the remaining probability to distribute
    const remainingProb = 1 - adjustedRates.success;

    // If there are no failure cases, return the adjusted rates
    if (remainingProb === 0) return adjustedRates;

    // Get the original sum of maintain, decrease, and destroy rates
    const originalSum = (rates.maintain || 0) + (rates.decrease || 0) + (rates.destroy || 0);
    
    if (originalSum === 0) return adjustedRates;

    // Redistribute the remaining probability proportionally
    if (rates.maintain) {
        adjustedRates.maintain = remainingProb * (rates.maintain / originalSum);
    }
    if (rates.decrease) {
        adjustedRates.decrease = remainingProb * (rates.decrease / originalSum);
    }
    if (rates.destroy) {
        adjustedRates.destroy = remainingProb * (rates.destroy / originalSum);
    }

    return adjustedRates;
}

// Get attempt result
export function getAttemptResult(currentStar, starCatchEnabled, eventType, isChanceTime) {
    // If it's chance time or specific event stars, 100% success
    if (isChanceTime || 
        ((eventType === 'hundredSuccess' || eventType === 'shiningStarForce') &&
        (currentStar === 5 || currentStar === 10 || currentStar === 15))) {
        return 'success';
    }

    let rates = adjustForStarCatch(STAR_FORCE_RATES[currentStar], starCatchEnabled);
    
    const roll = Math.random();
    let threshold = 0;

    threshold += rates.success;
    if (roll < threshold) return 'success';

    threshold += rates.maintain;
    if (roll < threshold) return 'maintain';

    threshold += rates.decrease;
    if (roll < threshold) return 'decrease';

    return 'destroy';
}

// Main simulation function
export function simulateStarForce({
    level,
    startingStar,
    targetStar,
    safeguardStars = [],
    starCatchStars = [],
    eventType = 'none',
    mvpType = 'none'
}) {
    let currentStar = startingStar;
    let attempts = 0;
    let booms = 0;
    let totalCost = 0;
    let maxAttempts = 10000; // Safety limit to prevent infinite loops
    let consecutiveDecreases = 0;
    let isChanceTime = false;

    while (currentStar < targetStar && attempts < maxAttempts) {
        attempts++;
        
        // Calculate base cost
        const baseCost = calculateMesoCost(level, currentStar);
        
        // Apply discounts
        let attemptCost = applyMVPDiscount(baseCost, mvpType, currentStar);
        attemptCost = applyEventDiscount(attemptCost, eventType);
        
        // Add safeguard cost if applicable
        const safeguardEnabled = safeguardStars.includes(currentStar);
        attemptCost += calculateSafeguardCost(baseCost, currentStar, safeguardEnabled, isChanceTime, eventType);
        
        // Add cost to total
        totalCost += attemptCost;

        // Get attempt result
        const starCatchEnabled = !isChanceTime && starCatchStars.includes(currentStar);
        const result = getAttemptResult(currentStar, starCatchEnabled, eventType, isChanceTime);

        // Process result
        switch (result) {
            case 'success':
                // Check for double star event
                if (currentStar < targetStar && 
                    (eventType === 'twoStars') && 
                    currentStar < 11) {
                    currentStar += 2;
                } else {
                    currentStar++;
                }
                consecutiveDecreases = 0;
                isChanceTime = false;
                break;
            case 'maintain':
                consecutiveDecreases = 0;
                isChanceTime = false;
                break;
            case 'decrease':
                if (currentStar > 0) {
                    currentStar--;
                    consecutiveDecreases++;
                    if (consecutiveDecreases >= 2) {
                        isChanceTime = true;
                        consecutiveDecreases = 0;
                    }
                }
                break;
            case 'destroy':
                if (!safeguardEnabled && !isChanceTime) {
                    booms++;
                    currentStar = 12; // Reset to 12 stars after destruction
                }
                consecutiveDecreases = 0;
                isChanceTime = false;
                break;
        }
    }

    return {
        success: currentStar >= targetStar,
        attempts,
        booms,
        totalCost
    };
}
