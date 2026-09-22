let winner1_total = 0
let winner2_total = 0
let type_match = ''

let public_full_screen = false

let scores1main = []
let scores2main = []

let globalWinner = 0

let play_number = 0

let caution1 = 0
let caution2 = 0
let warning1 = 0
let warning2 = 0

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
            play_number = data.play_number

            $("#name_1_match").text(competitor1name)
            $("#name_2_match").text(competitor2name)

            $("#play_number").text(play_number)

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
    const dataToSendUpdateScore = { 
        match_id: match_id,
        type_match: type_match,
        winner: countWinnerLogic()
    };
    $.ajax({
        type: "POST",
        url: '/api/pj/add_current_score_to_main',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSendUpdateScore),
        dataType: 'json',
        success: function (response, status, jqXHR) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    });
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

function countWinnerLogic(){
    let winner
    if (winner1_total > winner2_total){
        winner = competitor1id;
    }
    else if (winner1_total < winner2_total){
        winner = competitor2id;
    }
    else{
        winner = 0
    }
    if (winner == competitor1id){
        return 1
    }
    else if (winner == competitor2id){
        return 2
    }
    else{
        return 0
    }

}

// function countWinner(winners){
//     winner1_total = 0
//     winner2_total = 0
//     for (let i = 0; i < winners.length; i++){
//         if (winners[i] == 1){
//             winner1_total += 1
//         }
//         else if(winners[i] == 2){
//             winner2_total += 1
//         }
//     }
// }

function countWinnerOfAllPlays(scores1, scores2, scores1main, scores2main){
    let s1 = []
    let s2 = []
    let wins = []
    console.log('2 wins')
    for (let i = 0; i < scores1.length; i++){
        if (type_match == 'sparring'){
            if (countWinnerLogic() == 1){
                console.log('1 wins')
                s1.push(scores1main[i] + 1)
                s2.push(scores2main[i])
                if (scores1main[i] + 1 > scores2main[i]){
                    wins.push(1)
                } else if (scores1main[i] + 1 < scores2main[i]){
                    wins.push(2)
                } else {
                    wins.push(0)
                } 
            } else if(countWinnerLogic() == 2){
                console.log('2 wins')
                s1.push(scores1main[i])
                s2.push(scores2main[i] + 1)
                if (scores1main[i] > scores2main[i] + 1){
                    wins.push(1)
                } else if (scores1main[i] < scores2main[i] + 1){
                    wins.push(2)
                } else {
                    wins.push(0)
                } 
            } else {
                console.log('draw')
                s1.push(scores1main[i])
                s2.push(scores2main[i])
                if (scores1main[i] > scores2main[i]){
                    wins.push(1)
                } else if (scores1main[i] < scores2main[i]){
                    wins.push(2)
                } else {
                    wins.push(0)
                } 
            }

        } else{
            s1.push(scores1main[i] + scores1[i])
            s2.push(scores2main[i] + scores2[i])
            if (scores1main[i] + scores1[i] > scores2main[i] + scores2[i]){
                wins.push(1)
            } else if (scores1main[i] + scores1[i] < scores2main[i] + scores2[i]){
                wins.push(2)
            } else {
                wins.push(0)
            }
        }
    }
    let winner1 = 0
    let winner2 = 0
    for (let i = 0; i < wins.length; i++){
        if (wins[i] == 1){
            winner1 += 1
        }
        else if(wins[i] == 2){
            winner2 += 1
        }
    }
    if (winner1 > winner2){
        $("#the_winner_is").text('Побеждает: ' + competitor1name)
        globalWinner = competitor1id;
    }
    else if (winner1 < winner2){
        $("#the_winner_is").text('Побеждает: ' + competitor2name)
        globalWinner = competitor2id;
    }
    else{
        $("#the_winner_is").text('Ничья')
        globalWinner = 0
    }
}

function endMatchLogic(){
    // let winner
    // if (winner1_total > winner2_total){
    //     winner = competitor1id;
    // }
    // else if (winner1_total < winner2_total){
    //     winner = competitor2id;
    // }
    // else{
    //     window.close();
    //     // pageBack();
    //     return;
    // }

    // let winner = countWinnerLogic()
    // if (winner == 0){
    //     window.close();
    //     // pageBack();
    //     return;
    // }
    if (globalWinner != 0){
        const dataToSend = { 
            winner: globalWinner, //winner
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
    const dataToSendCleanScore = { 
        match_id: match_id
    };
    $.ajax({
        type: "POST",
        url: '/api/pj/clean_score',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSendCleanScore),
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

function newPlayNumber(){
    const dataToSend = { 
        match_id: match_id,
        type_match: type_match,
        winner: countWinnerLogic()
    };
    $.ajax({
        type: "POST",
        url: '/api/pj/new_play_number',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            socket.emit("start_new", {
                doyang_id: current_doyang
            });
            getPlayingMatch(current_doyang, function(){
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}


function judgesContentShowScores(ids, logins, scores1, scores2, winners, scores1main, scores2main,
    cautions1, cautions2, warnings1, warnings2
){
    const table = $("#table_show_match")
    const tbody = table.find("tbody");
    tbody.empty()
    for (let i = 0; i < ids.length; i++){
        const tr = $('<tr>', {
        })
        const td1 = $('<td>', {
            colspan: 9
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: scores1[i]
            })
        );
        const td2 = $('<td>', {
            colspan: 2,
            text: logins[i]
        })
        const td3 = $('<td>', {
            colspan: 9
        }).append(
            $('<div>',{
                class: 'score blue',
                style: 'align-items: center;',
                text: scores2[i]
            })
        );
        tr.append(td1)
        tr.append(td2)
        tr.append(td3)
        tbody.append(tr)
    }

    if (type_match == 'sparring'){
        const tr_cautions = $('<tr>', {
        })
        const td1_caution = $('<td>', {
            colspan: 10
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: 'Чуй ' + String(cautions1[0]),
                id: 'caution1'
            })
        ).on('click', function() {
            set_foul(1, 0, 0, 0)
        });
        const td2_caution = $('<td>', {
            colspan: 10
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: 'Чуй ' + String(cautions2[0]),
                id: 'caution2'
            })
        ).on('click', function() {
            set_foul(0, 1, 0, 0)
        });
        tr_cautions.append(td1_caution)
        tr_cautions.append(td2_caution)

        const tr_warnings = $('<tr>', {
        })
        const td1_warning = $('<td>', {
            colspan: 10
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: 'Гамджун ' + String(warnings1[0]),
                id: 'warning1'
            })
        ).on('click', function() {
            set_foul(0, 0, 1, 0)
        });
        const td2_warning = $('<td>', {
            colspan: 10
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: 'Гамджун ' + String(warnings2[0]),
                id: 'warning2'
            })
        ).on('click', function() {
            set_foul(0, 0, 0, 1)
        });
        tr_warnings.append(td1_warning)
        tr_warnings.append(td2_warning)
        tbody.append(tr_cautions)
        tbody.append(tr_warnings)
    }
}

function set_foul(c1, c2, w1, w2){
    const dataToSend = {
        doyang: current_doyang,
        caution1: c1,
        caution2: c2,
        warning1: w1,
        warning2: w2
    }
    $.ajax({
        type: "POST",
        url: '/api/pj/set_foul',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        success: function (response, status, jqXHR) {
            $.ajax({
                url: '/api/pj/get_fouls',
                method: 'GET',
                dataType: 'json',
                data: {
                    doyang: current_doyang,
                },
                success: function (data) { 
                    caution1 = data.caution1
                    caution2 = data.caution2
                    warning1 = data.warning1
                    warning2 = data.warning2

                    $("#caution1").text('Чуй ' + String(caution1))
                    $("#caution2").text('Чуй ' + String(caution2))
                    $("#warning1").text('Гамджун ' + String(warning1))
                    $("#warning2").text('Гамджун ' + String(warning2))

                    console.log('Update in next step...')
                    updateJudges();
                },
                error: function () {
                    console.error('Error fetching data.');
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    }); 
}