function addJudge(){
    var login = $('#judge_intput_login').val();
    $('#judge_intput_login').val("");
    const dataToSend = { 
        login: login,
        doyang_id_current: current_doyang
    };
    $.ajax({
        type: "POST",
        url: '/pj/add_judge',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            updateDinamicContent()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            updateDinamicContent()
        }
    });
}

function judgesContent(ids, logins, scores1, scores2, winners){
    $('#judges_list').empty();
    for (let i = 0; i < ids.length; i++){
        const judgeDiv = $('<div>', {
            class: 'judge-div',
            text: logins[i] + ' | ' + scores1[i] + ' | ' + scores2[i] + ' | ' + winners[i] 
        });
        $('#judges_list').append(judgeDiv);
    }
}