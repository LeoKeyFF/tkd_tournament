let winner1_total = 0
let winner2_total = 0
let type_match = ''

let public_full_screen = false

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

function getPlayingMatch(doyang_id, callback){
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
            type_match = data.type

            $("#name_1_match").text(competitor1name)
            $("#name_2_match").text(competitor2name)

            callback();
        },
        error: function () {
        }
    });
}

function endMatch(){
    socket.emit("close_doyang", {
        doyang_id: current_doyang
    });
    const dataToSendEnd = { 
        match_id: match_id
    };
    $.ajax({
        type: "POST",
        url: '/api/end_match',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSendEnd),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            endMatchLogic()
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function countWinner(winners){
    winner1_total = 0
    winner2_total = 0
    for (let i = 0; i < winners.length; i++){
        if (winners[i] == 1){
            winner1_total += 1
        }
        else if(winners[i] == 2){
            winner2_total += 1
        }
    }
}

function endMatchLogic(){
    let winner
    if (winner1_total > winner2_total){
        winner = competitor1id;
    }
    else if (winner1_total < winner2_total){
        winner = competitor2id;
    }
    else{
        window.close();
        // pageBack();
        return;
    }

    const dataToSend = { 
        winner: winner,
        match_id: match_id
    };
    $.ajax({
        type: "POST",
        url: '/api/set_winner',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            window.close()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function showMatchPublic(){
    const dataToSend = {
        doyang_id: current_doyang
    }
    const newTabPublic = window.open('about:blank', '_blank');
    this.window.focus();
    if (newTabPublic) {
        newTabPublic.document.write('<h1>Загрузка...</h1>');
    }     
    $.ajax({
        type: "POST",
        url: '/api/show_match_public',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        success: function (response, status, jqXHR) {
            if (newTabPublic) {
                newTabPublic.location.href = response.redirect; 
            } 
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (newTabPublic) {
                newTabPublic.close(); 
            }      
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function matchFullScreen(){
    // public_full_screen = !(public_full_screen)
    // if (!public_full_screen){
    //     document.documentElement.requestFullscreen();
    //     $('#full_screen_button').hide()
    // }
    // document.documentElement.requestFullscreen();
    // $('#full_screen_button').hide()

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}


function judgesContentPublic(ids, scores1, scores2, winners){
    const table = $("#table_show_match_public")
    const tbody = table.find("tbody");
    tbody.empty()
    for (let i = 0; i < ids.length; i++){
        const tr = $('<tr>', {
        })
        const td1 = $('<td>', {
            colspan: 5
        })
        if (type_match == 'tuly'){
            td1.append(
                $('<div>',{
                    style: 'align-items: center; font-size: 6rem',
                    text: winners[i] == 1 ? '1' : '0'
                })
            );
        } else if(type_match == 'sparring'){
            td1.append(
                $('<div>',{
                    style: 'align-items: center; font-size: 6rem',
                    text: scores1[i]
                })
            );
        }

        const td2 = $('<td>', {
            colspan: 2,
        }).append(
            $('<div>',{
                style: 'align-items: center; font-size: 2rem',
                text: `Судья ${i + 1}`
            })
        );
        const td3 = $('<td>', {
            colspan: 5
        })
        if (type_match == 'tuly'){
            td3.append(
                $('<div>',{
                    style: 'align-items: center; font-size: 6rem',
                    text: winners[i] == 2 ? '1' : '0'
                })
            );
        } else if(type_match == 'sparring'){
            td3.append(
                $('<div>',{
                    style: 'align-items: center; font-size: 6rem',
                    text: scores2[i]
                })
            );
        }

        
        tr.append(td3) //it is reversed for viewers because the screen is turned to the public 
        tr.append(td2)
        tr.append(td1)

        tbody.append(tr)
    }
    const tr_all = $('<tr>', {
    })
    const td_all_1 = $('<td>', {
        colspan: 6
    }).append(
        $('<div>',{
            class: 'score red',
            style: 'align-items: center; font-size: 6rem',
            text: winner1_total
        })
    );
    const td_all_2 = $('<td>', {
        colspan: 6
    }).append(
        $('<div>',{
            class: 'score blue',
            style: 'align-items: center; font-size: 6rem',
            text: winner2_total
        })
    );
    tr_all.append(td_all_2) //it is reversed for viewers because the screen is turned to the public 
    tr_all.append(td_all_1)
    tbody.append(tr_all)
}