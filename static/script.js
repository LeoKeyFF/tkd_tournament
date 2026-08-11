let current_doyang = 0
let current_category = 0
let current_page = 0

const currentPath = window.location.pathname;

function addDoYang(){
    var text = $('#DoYangInput').val();
    $('#DoYangInput').val("");
    const dataToSend = { 
        name: text
    };
    $.ajax({
        type: "POST",
        url: '/api/add_doyang',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        // dataType: 'json',
        success: function (response, status, jqXHR) {
            updateDoYangs(function(){})
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function addDoYangToCategories(){
    const dataToSend = { 
        categories: choosen_categories,
        doyang_id: current_doyang
    };
    $.ajax({
        type: "POST",
        url: '/api/add_doyang_to_categories',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        // dataType: 'json',
        success: function (response, status, jqXHR) {
            choosen_categories = []
            // showPage(1)
            updateCategories(function() {
                showPage(1)
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    });  
}

function deleteDoYangFromCategory(category){
    if (confirm('Убрать категорию с площадки?')) {
        const dataToSend = { 
            categories: [category],
            doyang_id: 0
        };
        $.ajax({
            type: "POST",
            url: '/api/add_doyang_to_categories',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(dataToSend),
            // dataType: 'json',
            success: function (response, status, jqXHR) {
                updateCategories(function() {
                })
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Error handling
            },
            complete: function (jqXHR, textStatus) {
            }
        });  
    }
}

function createGrid(){
    const dataToSend = { 
        category_id: current_category
    };
    $.ajax({
        type: "POST",
        url: '/api/create_grid',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        // dataType: 'json',
        success: function (response, status, jqXHR) {
            updateMatches()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function updateDinamicContent(){
    updateMatches()
}

function updateDoYangs(callback, role = "user"){
    $.ajax({
        url: '/api/get_data_doyangs',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            doYangsContent(data.ids, data.names);
            if (role == "admin"){
                doyangsToChoose(data.ids, data.names, $("#choose_doyang"));
                all_doyangs_ids = data.ids;
                all_doyangs_names = data.names
            }
            callback();
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function updateCategories(callback){
    $.ajax({
        url: '/api/get_data_categories',
        method: 'GET',
        dataType: 'json',
        success: function (data) {        
            callback();
            categoriesContent(data.ids, data.names, data.doyangs, data.doyangs_list, data.competitors_amounts);
            allCategories(data.ids, data.names, data.doyangs, data.doyangs_list);
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function updateMatches(){
    $.ajax({
        url: '/api/get_data_matches',
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

function updateCompetitors(callback){
    $.ajax({
        url: '/api/get_data_competitors',
        method: 'GET',
        dataType: 'json',
        data: {
            category_id: current_category,
        },
        success: function (data) {
            competitorsContent(data.ids, data.names, data.clubs, data.categories, data.categories_list);
            callback();
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function updateJudges(){
    $.ajax({
        url: '/api/pj/get_data_judges',
        method: 'GET',
        dataType: 'json',
        data: {
            doyang_id: current_doyang,
        },
        success: function (data) {        
            // judgesContent(data.ids, data.logins, data.scores1, data.scores2, data.winners)
            judgesContentShowScores(data.ids, data.logins, data.scores1, data.scores2, data.winners)
            countWinner(data.winners)
            if (currentPath === '/show_match'){
                judgesContentPublic(data.ids, data.winners)
            }
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });         
}

function deleteDoYang(id){
    if (confirm('Удалить площадку?')) {
        const dataToSend = {
            doyang_id: id
        }
        $.ajax({
            type: "POST",
            url: '/api/delete_doyang',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(dataToSend),
            success: function (response, status, jqXHR) {
                updateDoYangs(function() {})
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Error handling
            },
            complete: function (jqXHR, textStatus) {
            }
        }); 
    } 
}

function openMenu() {
    const body = $('body');
    body.toggleClass('menu-open');

    $(document).on('keydown', function(event) {
        if (event.key === 'Escape' && body.hasClass('menu-open')) {
            body.toggleClass('menu-open');
        }
    });
};

function deleteTournament(){
    if (confirm('Полностью очистить турнир?')) {
        $.ajax({
            type: "POST",
            url: '/api/delete_tournament',
            contentType: 'application/json; charset=utf-8',
            success: function (response, status, jqXHR) {
                window.location.replace(response.redirect);
                // window.location.href = response.redirect;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Error handling
            },
            complete: function (jqXHR, textStatus) {
            }
        }); 
    }
}

function searchCategory(){
    updateCategories(function() {
    })
}

function opendJudges(){
    $.ajax({
        type: "POST",
        url: '/api/open_judges',
        success: function (response, status, jqXHR) {
            window.location.href = response.redirect;
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function playMatch(){
    const dialog = $("#chooseWinner")[0];
    dialog.close();

    const dataToSend = {
        match_id: match_id
        // ,
        // competitor1id: competitor1id,
        // competitor1name: competitor1name,
        // competitor2id: competitor2id,
        // competitor2name: competitor2name,
    }
    const newTabScores = window.open('about:blank', '_blank');
    if (newTabScores) {
        newTabScores.document.write('<h1>Загрузка...</h1>');
    }       
    $.ajax({
        type: "POST",
        url: '/api/play_match',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        success: function (response, status, jqXHR) {
            if (newTabScores) {
                newTabScores.location.href = response.redirect; 
            }
            
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (newTabScores) {
                newTabScores.close(); 
            }      
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function pageBack(){
    window.history.back();
}