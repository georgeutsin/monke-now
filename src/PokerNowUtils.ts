var getTableBetsList = (): number[] => {
    return jQuery(".table-player p.table-player-bet-value")
        .toArray()
        .map((e) => { return parseFloat(e.innerText.replace(/check/i, "0")); });
}

var getCurrentPlayerBet = (): number => {
    var currentPlayer = jQuery(".decision-current").first();
    var currentPlayerBetUI = currentPlayer.find("p.table-player-bet-value");
    var currentPlayerBet = 0 + (
        currentPlayerBetUI
        && parseFloat(currentPlayerBetUI.text().replace(/check/i, "0") || "0")
    );
    return currentPlayerBet;
}

var getNumPlayersIn = (): number => {
    var all = jQuery(".table-player").toArray();
    var fold = jQuery(".table-player .fold").toArray();
    return all.length - fold.length;
}

var getHandCards = ():string[] => {
    return getCardsFromRoot(jQuery(".you-player"));
}

var getTableCards = ():string[] => {
    return getCardsFromRoot(jQuery(".table-cards"));
}

var getCardsFromRoot = (root: JQuery<HTMLElement>):string[] => {
    var cards: string[] = [];
    $(root).find('.card').each((idx, card) => {
        var val = $(card).find(".value").text();
        if (val == "10") {
            val = "T";
        }
        var suit = $(card).find(".sub-suit").text();
        cards.push(val + suit);
    });
    return cards;
}

export { getTableBetsList, getCurrentPlayerBet, getNumPlayersIn, getHandCards, getTableCards };