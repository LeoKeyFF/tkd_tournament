let current_doyang = 1
let current_category = 1

function addDoYang(){
    var text = $('#DoYangInput').val();
    $('#DoYangInput').val("");
    const dataToSend = { 
        name: text
    };
    $.ajax({
        type: "POST",
        url: '/add_doyang',
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

function addCategory(){
    var text = $('#CategoryInput').val();
    $('#CategoryInput').val("");
    console.log(current_doyang);
    const dataToSend = { 
        name: text,
        doyang: current_doyang
    };
    $.ajax({
        type: "POST",
        url: '/add_category',
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

function addCompetitor(){
    var name = $('#CompetitorInputName').val();
    var club = $('#CompetitorInputClub').val();
    $('#CompetitorInputName').val("");
    $('#CompetitorInputClub').val("");
    const dataToSend = { 
        name: name,
        club: club
    };
    $.ajax({
        type: "POST",
        url: '/add_competitor',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            
        }
    });
}

function updateDinamicContent(){
    $.ajax({
        url: '/get_data_doyangs',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.ids.length > 0){
                doYangsContent(data.ids, data.names)
            }
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
    
    $.ajax({
        url: '/get_data_categories',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.ids.length > 0){
                categoriesContent(data.ids, data.names, data.doyangs)
            }
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}