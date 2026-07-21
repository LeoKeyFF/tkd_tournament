let competitor1id = 0
let competitor1name = ''
let competitor2id = 0
let competitor2name = ''
let match_id = 0

function doYangsContent(ids, names){
    $('#doyangs_list').empty();
    for (let i = 0; i < ids.length; i++){
        const doyangButton = $('<button>', {
            class: 'doyang-button',
            text: names[i]
        }).on('click', function() {
            $(this).toggleClass('active');
            current_doyang = ids[i]
            showPage(1)
            updateDinamicContent()
        });
        $('#doyangs_list').append(doyangButton);
    }
}

function categoriesContent(ids, names, doyangs, doyangs_list){
    $('#categories_list').empty();
    for (let i = 0; i < ids.length; i++){
        if (doyangs[i] == current_doyang){
            const categoryButton = $('<button>', {
                class: 'category-button',
                text: names[i]
            }).on('click', function() {
                $(this).toggleClass('active');
                current_category = ids[i]
                showPage(2)
                updateDinamicContent()

            });
            $('#categories_list').append(categoryButton);
        }
    }
    for (let doyang of doyangs_list){
        if (doyang[0] == current_doyang && !$('#path_card_doyang').length){
            const pathDoyang = $('<div>', {
                class: 'cardpath',
                text: doyang[1],
                id: 'path_card_doyang'
            }).on('click', function(){
                showPage(0)
            });
            $('#path_card_doyang').remove();
            $('#path').append(pathDoyang);

            break
        }
    };

}

function competitorsContent(ids, names, clubs, categories, categories_list){
    $('#competitors_list').empty();
    for (let i = 0; i < ids.length; i++){
        if (categories[i] == current_category){
            const competitorDiv = $('<div>', {
                class: 'competitor-div',
                text: names[i] + ' | ' + '(' + clubs[i] + ')'
            });
            $('#competitors_list').append(competitorDiv);
        }
    }
    for (let category of categories_list){
        if (category[0] == current_category && !$('#path_card_category').length){
            const pathCategory = $('<div>', {
                class: 'cardpath',
                text: category[1],
                id: 'path_card_category'
            }).on('click', function(){
                showPage(1)
            });
            // $('#path_card_category').remove();
            $('#path').append(pathCategory);

            break
        }
    };
}

function showPage(page){
    current_page = page
    if (page == 0){
        $("#doyangs").css("display", "block");
        $("#categories").css("display", "none");
        $("#competitors").css("display", "none");

        $("#path_card_doyang").remove();
        $('#path_card_category').remove();

        current_doyang = 0;
        current_category = 0;
    }
    else if (page == 1) {
        $("#doyangs").css("display", "none");
        $("#categories").css("display", "block");
        $("#competitors").css("display", "none");

        $('#path_card_category').remove();

        current_category = 0;
    }
    else {
        $("#doyangs").css("display", "none");
        $("#categories").css("display", "none");
        $("#competitors").css("display", "block");
    }
}

function backPage(){
    if (current_page > 0){
        showPage(current_page - 1)
    }
}

function drawGrid(matches, rounds){
    
    const table = $('<table>', {
        id: 'grid_table',
        class: 'grid-table'
    });
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    for (const round of rounds){
        th = $('<th>');
        if (round != 1){
            divHead =  $('<div>',{
                class: 'round-header',
                text: "1/" + round + " Финала"
            });
        } else {
            divHead =  $('<div>',{
                class: 'round-header',
                text: "Финал"
            });
        }

        th.append(divHead)
        headerRow.append(th);
    };
    thead.append(headerRow);
    table.append(thead);

    const tbody = $('<tbody>');
    
    for (let i = 0; i < rounds[0]; i++){
        const tr = $('<tr>');
        for (let match of matches){
            if (match.rowIndex == i){
                td = $('<td>', {
                    rowspan: rounds[0]/match.round
                });
                const divCompetitorBox = $('<div>',{
                    class: 'competitor-box'
                }); 
                if (match.competitor1id != 0 && match.competitor1id != null 
                    && match.competitor2id != 0 && match.competitor2id != null 
                    && match.winner == null){
                    divCompetitorBox.on('click', function() {
                        competitor1id = match.competitor1id;
                        competitor1name = match.competitor1name;
                        competitor2id = match.competitor2id;
                        competitor2name = match.competitor2name;
                        match_id = match.matchId;
                        openChooseWinner();
                    })
                }
            
                const divRow1 = $('<div>',{
                    class: 'competitor-name',
                    text: match.competitor1name
                });
                const divRow2 = $('<div>',{
                    class: 'competitor-name',
                    text: match.competitor2name
                });

                if(match.competitor1id == match.winner){
                    divRow1.toggleClass('competitor-name-winner')
                }
                if(match.competitor2id == match.winner){
                    divRow2.toggleClass('competitor-name-winner')
                }

                divCompetitorBox.append(divRow1)
                divCompetitorBox.append($('<hr>'))
                divCompetitorBox.append(divRow2)

                td.append(divCompetitorBox);
                tr.append(td);
            }
        }
        tbody.append(tr);
    }  
    table.append(tbody);
    $("#grid_div").append(
        'Сетка:'
    );
    $("#grid_div").append(table);
}

function openChooseWinner(){
    const dialog = $("#chooseWinner")[0];
    $("#dialogCompetitor1").text(competitor1name);
    $("#dialogCompetitor2").text(competitor2name);
    dialog.addEventListener('click', function (e) {
        if (e.target === this) {
            this.close();
        }
    });
    dialog.showModal(); 
}

function closeChooseWinner(w){
    const dialog = $("#chooseWinner")[0];
    dialog.close();
    let winner
    if (w == 0)
        winner = competitor1id
    else
        winner = competitor2id;

    const dataToSend = { 
        winner: winner,
        match_id: match_id,
    };

    $.ajax({
        type: "POST",
        url: '/set_winner',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            updateDynamicContent()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            updateDynamicContent()
        }
    });
}
