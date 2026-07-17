class Match {
    constructor(category, round, competitor1id, competitor1name, competitor2id, competitor2name, winner, matchId, row){
        this.category = category;
        this.round = round;
        this.competitor1id = competitor1id;
        this.competitor1name = competitor1name;
        this.competitor2id = competitor2id;
        this.competitor2name = competitor2name;
        this.winner = winner;
        this.matchId = matchId;
        this.rowIndex = row
    }
}

function convertMatches(matches_){
    let matches = []
    for (let match of matches_){
        matches.push(new Match(match[0], match[1], match[2], match[3], match[4], match[5], match[6], match[7], match[8]))
    }
    
    return matches
}