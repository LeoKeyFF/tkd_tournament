let score_red = 24
let score_blue = 24

let score_red_history = [24]
let score_blue_history = [24]

let counter_type = 'tuly'
let doyang = 0
let role = 'judge'

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
    if (counter_type == 'tuly'){
        score_blue = 24
        score_red = 24

        score_red_history = [24]
        score_blue_history = [24]
    }
    else {
        score_blue = 0
        score_red = 0

        score_red_history = [0]
        score_blue_history = [0]
    }

    $('#score1').text(score_red);
    $('#score2').text(score_blue);

    $('body').removeClass('menu-open');

    socketUpdate()
}

function socketUpdate(){
    socket.emit("update_scores", {
        score1: score_red,
        score2: score_blue
    });
}

function changeCounter(){
    console.log(counter_type)
    if (counter_type == 'sparring'){
        $('#score_1_1').text('+3')
        $('#score_1_1').attr('onclick', 'updateScore(1, +3)')

        $('#score_2_1').text('+3')
        $('#score_2_1').attr('onclick', 'updateScore(2, +3)')

        $('#score_1_2').text('+2')
        $('#score_1_2').attr('onclick', 'updateScore(1, +2)')

        $('#score_2_2').text('+2')
        $('#score_2_2').attr('onclick', 'updateScore(2, +2)')

        $('#score_1_3').text('+1')
        $('#score_1_3').attr('onclick', 'updateScore(1, +1)')

        $('#score_2_3').text('+1')
        $('#score_2_3').attr('onclick', 'updateScore(2, +1)')
    }
    else {
        $('#score_1_1').text('0')
        $('#score_1_1').attr('onclick', 'updateScore(1, -24)')

        $('#score_2_1').text('0')
        $('#score_2_1').attr('onclick', 'updateScore(2, -24)')

        $('#score_1_2').text('-0.5')
        $('#score_1_2').attr('onclick', 'updateScore(1, -0.5)')

        $('#score_2_2').text('-0.5')
        $('#score_2_2').attr('onclick', 'updateScore(2, -0.5)')

        $('#score_1_3').text('-0.3')
        $('#score_1_3').attr('onclick', 'updateScore(1, -0.3)')

        $('#score_2_3').text('-0.3')
        $('#score_2_3').attr('onclick', 'updateScore(2, -0.3)')
    }
    // cleenScore()
}

function getData(callback){
    $.ajax({
        url: '/api/get_data_of_judge',
        method: 'GET',
        dataType: 'json',
        success: function (data) {        
            score_red = data.score1
            $('#score1').text(score_red);
            score_blue = data.score2
            $('#score2').text(score_blue);
            doyang = data.doyang
            console.log(data, score_red, score_blue)
            role = data.role
            callback();
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });  
}

function getPlayingMatchCounter(doyang_id, callback){
    $.ajax({
        url: '/api/get_playing_match',
        method: 'GET',
        dataType: 'json',
        data: {
            doyang_id: doyang_id,
        },
        success: function (data) {
            counter_type = data.type
            callback();
        },
        error: function () {
        }
    });
}