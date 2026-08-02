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

function getPlayingMatch(doyang_id){
    $.ajax({
        url: '/api/get_playing_match',
        method: 'GET',
        dataType: 'json',
        data: {
            doyang_id: doyang_id,
        },
        success: function (data) {
            match_id = data.match_id
            competitor1id = data.competitor_1_id
            competitor1name = data.competitor_1_name
            competitor2id = data.competitor_2_id
            competitor2name = data.competitor_2_name
        },
        error: function () {
        }
    });
}