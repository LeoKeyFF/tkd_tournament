let score_red = 24
let score_blue = 24

let score_red_history = [24]
let score_blue_history = [24]

function updateScore(competitor, score_change){
    if (competitor == 1){
        score_red = +(score_red + score_change).toFixed(1)
        if (score_red < 0){
            score_red = 0
        }
        score_red_history.push(score_red)
        $('#score1').text(score_red);
    } else {
        score_blue = +(score_blue + score_change).toFixed(1)
        if (score_blue < 0){
            score_blue = 0
        }
        score_blue_history.push(score_blue)
        $('#score2').text(score_blue);
    }
    socketUpdate()
}

function returnScore(competitor){
    if (competitor == 1){
        if (score_red_history.length > 1){
            score_red = score_red_history.at(-2)
            score_red_history.pop()
            $('#score1').text(score_red);
        }

    } else {
        if (score_blue_history.length > 1){
            score_blue = score_blue_history.at(-2)
            score_blue_history.pop()
            $('#score2').text(score_blue);
        }
    }
    socketUpdate()

}

function cleenScore(){
    score_blue = 24
    score_red = 24

    score_red_history = [24]
    score_blue_history = [24]

    $('#score1').text(score_red);
    $('#score2').text(score_blue);

    $('body').toggleClass('menu-open');

    socketUpdate()
}

function socketUpdate(){
    socket.emit("update_scores", {
        score1: score_red,
        score2: score_blue
    });
}