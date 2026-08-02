let all_doyangs_ids = []
let all_doyangs_names = []

function addJudge(){
    var login = $('#judge_input_login').val();
    var password = $('#judge_input_password').val();
    var doyang = $('#choose_doyang').val();
    var role = $('#choose_role_judge').val();
    $('#judge_input_login').val("");
    $('#judge_input_password').val("");
    $('#choose_doyang').val(1);
    $('#choose_role_judge').val("judge");
    const dataToSend = { 
        login: login,
        password: password,
        doyang_id: doyang,
        role: role
    };
    $.ajax({
        type: "POST",
        url: '/api/add_judge',
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
        url: '/api/get_all_judges',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            judgesAll(data.ids, data.logins, data.roles, data.doyangs, data.doyangs_names);
            callback();
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function judgesAll(ids, logins, roles, doyangs, doyangs_names){
    $('#judges_list').empty();  
    for (let i = 0; i < ids.length; i++){

        const judgeDiv = $('<table>', {
            class: 'table-row',
            style: 'height: 44px;'
        });
        const tr = $('<tr>', {
        });
        const td1 = $('<td>', {
            colspan: 3,
            class: 'table-row-name'
        });
        const td2 = $('<td>', {
            colspan: 3,
            class: 'table-row-name'
        });
        const td3 = $('<td>', {
            colspan: 3,
            class: 'table-row-name'
        });
        const td4 = $('<td>', {
            colspan: 2,
            class: 'table-row-del'
        });
        const td5 = $('<td>', {
            colspan: 2,
            class: 'table-row-del'
        });

        const delButton = $('<button>',{
            class: 'button-primary primary-clickable del-button',
            text: '🗑️'
        }).on('click', function(){
            deleteJudge(ids[i]);
        })
        const doyangSelect = $('<select>',{
            class: 'select-for-judge'
        });
        doyangsToChoose(all_doyangs_ids, all_doyangs_names, doyangSelect)
        doyangSelect.val(doyangs[i])

        const rolesSelect = $('<select>',{
            class: 'select-for-judge'
        });
        rolesJudgesToChoose(rolesSelect)
        rolesSelect.val(roles[i])

        const changeButton = $('<button>',{
            class: 'button-primary primary-clickable save-button',
            text: '💾'
        }).on('click', function(){
            changeJudge(ids[i], doyangSelect.val(), rolesSelect.val());
        })

        td1.append(logins[i])
        td2.append(rolesSelect)
        td3.append(doyangSelect)
        td4.append(changeButton)
        td5.append(delButton)

        tr.append(td1)
        tr.append(td2)
        tr.append(td3)
        tr.append(td4)
        tr.append(td5)

        judgeDiv.append(tr)
        $('#judges_list').append(judgeDiv);
    }
}

function doyangsToChoose(ids, names, $element){
    $element.empty();
    for (let i = 0; i < ids.length; i++){
        const doyangOption = $('<option>',{
            value: ids[i],
            text: names[i]
        })
        $element.append(doyangOption)
    }
}

function rolesJudgesToChoose($element){
    $element.empty();
    $element.append(
        $('<option>',{
            value: 'judge',
            text: roleToName("judge")
        })
    )
    $element.append(
        $('<option>',{
            value: 'referee',
            text: roleToName("referee")
        })
    )
    $element.append(
        $('<option>',{
            value: 'pj',
            text: roleToName("pj")
        })
    )
}

function deleteJudge(id){
    const dataToSend = {
        id: id
    }
    $.ajax({
        type: "POST",
        url: '/api/delete_judge',
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

function changeJudge(judge_id, doyang_id, role_id){
    const dataToSend = {
        judge_id: judge_id,
        doyang_id: doyang_id,
        role_id: role_id
    }
    $.ajax({
        type: "POST",
        url: '/api/change_judge',
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

function uploadJudges() {
    const file = $('#file_input_judges')[0].files[0];
    if (!file) {
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
        type: "POST",
        url: '/api/read_judges_file',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response, status, jqXHR) {
            updateJudgesAll(function(){})
            // window.location.replace(response.redirect);
            // window.location.href = response.redirect;
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function judgesContentShowScores(ids, scores1, scores2, winners){
    $("#name_1_match").text(competitor1name)
    $("#name_2_match").text(competitor2name)

    const table = $("#table_show_match")
    for (let i = 0; i < ids.length; i++){
        const tr = $('<tr>', {
        })
        const td1 = $('<td>', {
            colspan: 9
        }).append(
            $('<div>',{
                class: 'score red',
                style: 'align-items: center;',
                text: scores1
            })
        );
        const td2 = $('<td>', {
            colspan: 2,
            text: i+1
        })
        const td3 = $('<td>', {
            colspan: 9
        }).append(
            $('<div>',{
                class: 'score blue',
                style: 'align-items: center;',
                text: scores2
            })
        );
        tr.append(td1)
        tr.append(td2)
        tr.append(td3)
        table.append(tr)
    }
}


function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}