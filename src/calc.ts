import { getTableBetsList, getCurrentPlayerBet, getNumPlayersIn, getHandCards, getTableCards } from "./PokerNowUtils";
import { Calculator } from "./Game";
import { Input, Stats } from "./types";

// Timer to ensure the host page is complete before we jam our shiz
var readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        console.log("Beginning inject.js...");
        setTimeout(() => { doSetup(); }, 1000);
    }
}, 10);

// Setup, build output UI, and attach DOM observers
var doSetup = () => {
    var html = "<div class='pot-odds-container'>Pot odds:&nbsp;<span class='pot-odds-value'>&mdash;</span></div>";
    jQuery(".table").prepend(jQuery(html));
    var html = "<div class='prob-container'><span class='prob-value'>&mdash;</span></div>";
    jQuery(".table").prepend(jQuery(html));
    var html = `<div class='out-container'><span class='out-value'><table>
    <tr>
      <th>Hand</th>
      <th>Player</th>
      <th>Opp.</th>
    </tr>
  </table></span></div>`;
    jQuery(".table").prepend(jQuery(html));


    // Initiate observers
    var targetNode = jQuery(".table")[0];
    // Options for the observer (which mutations to observe)
    const config = { characterData: true, attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    var callback: MutationCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
        for (var mutation of mutationsList) {
            // Skip non-element nodes
            if (
                !mutation.target.getAttribute
                || !mutation.target.getAttribute('class')
            ) { continue }
            var c = mutation.target.getAttribute('class');
            if (c && c.match(/decision\-current|flipped/)) {
                updateStats();
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    console.log("...setup done.");
};

// Do the main thing
var updateStats = () => {
    updatePotOdds();
    updateHandOdds();
};

var updatePotOdds = () => {
    jQuery(".pot-odds-value").html("&mdash;");

    var potTotal = parseInt(jQuery(".table-pot-size").text());
    var currentBets = getTableBetsList();
    var currentBetsTotal = currentBets.reduce((a, b) => a + b, 0);
    var largestCurrentBet = Math.max(...currentBets);
    var currentPlayerBet = getCurrentPlayerBet();

    // Update pot odds display if the current bet is smaller than the biggest bet on the table
    if (largestCurrentBet > 0 && largestCurrentBet > currentPlayerBet) {
        var amountToWin = potTotal + currentBetsTotal;
        var callToMake = largestCurrentBet - currentPlayerBet;
        var potOdds = '' + Math.round((callToMake / (amountToWin + callToMake) * 100.00)) + '%';
        console.log("Updated pot odds: ", potOdds);
        jQuery(".pot-odds-value").html(potOdds);
    }
}

var updateHandOdds = () => {
    let hand = getHandCards().join(",");
    const input = {
        hands: [hand],
        numPlayers: getNumPlayersIn(),
        board: getTableCards().join(","),
        returnHandStats: true,
        returnTieHandStats: true,
        iterations: 1e5
    };

    const s = cachedSimulation(input);
    jQuery(".prob-value").html(stringifyProb(s, hand));
    jQuery(".out-value").html(stringifyOuts(s, hand));
}

var stringifyInput = (input: Input): string => {
    return input.hands!.join() + input.numPlayers + input.board;
}

var cache: any = {};
var cachedSimulation = (input: Input): Record<string, Partial<Stats>> => {
    let key = stringifyInput(input);
    if (key in cache) {
        console.log("Using cache", key, cache[key]);
        return cache[key]!;
    }

    const c = new Calculator(input);
    const s = c.simulate();
    console.log(s);
    cache[key] = s;
    return s;
}

var stringifyProb = (s: Record<string, Partial<Stats>>, hand: string): string => {
    var probVal = "Player: ";
    probVal += s[hand].winPercent + "% (T " + s[hand].tiePercent + "%)";
    probVal += "<br/>Opp: " + s["NPC 1"].winPercent + "% (T " + s["NPC 1"].tiePercent + "%)";
    return probVal;
}

var stringifyOuts = (s: Record<string, Partial<Stats>>, hand: string): string => {
    var rankToShort = {
        "highCard": "HC",
        "pair":"P",
        "twoPair": "2P", 
        "trips": "3OAK", 
        "straight": "STR", 
        "flush": "FL", 
        "fullHouse": "FH",
        "quads": "4OAK", 
        "straightFlush": "SF"
    }
    let rows = "";
    for (var rank of ["highCard", "pair", "twoPair", "trips", "straight", "flush", "fullHouse", "quads", "straightFlush"]) {
        const shortRank = rankToShort[rank as keyof typeof rankToShort];
        const pVal = s[hand].handStats![rank].percent;
        const oVal = s["NPC 1"].handStats![rank].percent;
        const col = Math.abs(pVal-oVal) > 0.01 ? `style="color:${pVal > oVal ? 'limegreen' : 'red'}"` : "";
        rows += `
        <tr>
            <td>${shortRank}</td>
            <td ${col}>${pVal}</td>
            <td>${oVal}</td>
        </tr>`;
    }
    return `
    <table>
    <tr>
        <th>Hand</th>
        <th>Player</th>
        <th>Opp.</th>
    </tr>
    ${rows}
    </table>
`;
}
