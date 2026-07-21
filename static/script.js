let current_doyang = 0
let current_category = 0
let current_page = 0

const currentPath = window.location.pathname;

function createTables(){
    $.ajax({
        type: "POST",
        url: '/create_tables',
        contentType: 'application/json; charset=utf-8',
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
        club: club,
        category_id_current: current_category
    };
    $.ajax({
        type: "POST",
        url: '/add_competitor',
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

function createGrid(){
    const dataToSend = { 
        category_id: current_category
    };
    $.ajax({
        type: "POST",
        url: '/create_grid',
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
    if (currentPath === '/') {
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
    }
    
    $.ajax({
        url: '/get_data_categories',
        method: 'GET',
        dataType: 'json',
        success: function (data) {        
            categoriesContent(data.ids, data.names, data.doyangs, data.doyangs_list)
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });

    $.ajax({
        url: '/get_data_competitors',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            competitorsContent(data.ids, data.names, data.clubs, data.categories, data.categories_list)
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });

    $.ajax({
        url: '/get_data_matches',
        method: 'GET',
        dataType: 'json',
        data: {
            category_id: current_category,
        },
        success: function (data) { 
            $("#grid_div").empty()  
            if (data.rounds.length > 0){
                $("#CompetitorInputName").css("display", "none")
                $("#CompetitorInputClub").css("display", "none")
                $("#addCompetitor").css("display", "none")
                $("#createGrid").css("display", "none")

                matches = convertMatches(data.rows)
                drawGrid(matches, data.rounds)
            }
            else{
                $("#CompetitorInputName").css("display", "")
                $("#CompetitorInputClub").css("display", "")
                $("#addCompetitor").css("display", "")
                $("#createGrid").css("display", "")
            }
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}