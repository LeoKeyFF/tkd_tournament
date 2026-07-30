function addJudge(){
    var login = $('#judge_input_login').val();
    var password = $('#judge_input_password').val();
    $('#judge_input_login').val("");
    $('#judge_input_password').val("");
    const dataToSend = { 
        login: login,
        password: password,
        doyang_id: 0
    };
    $.ajax({
        type: "POST",
        url: '/add_judge',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            updateJudgesAll(function(){})
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

function updateJudgesAll(callback){
    $.ajax({
        url: '/get_all_judges',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            judgesAll(data.ids, data.logins, data.passwords, data.doyangs);
            callback();
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function judgesAll(ids, logins, passwords, doyangs){
    $('#judges_list').empty();  
    for (let i = 0; i < ids.length; i++){
        const judgeDiv = $('<div>', {
            class: 'judge-div',
            text: logins[i] + ' | ' + passwords[i] + ' | ' + doyangs[i]
        });
        $('#judges_list').append(judgeDiv);
    }
}