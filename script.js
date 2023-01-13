class Roster {
    constructor(name) {
        this.name = name;
        this.players = [];
    }

    addPlayer(name, age, primary, secondary) {
        this.players.push(new Player(name, age, primary, secondary));
    }
}

class Player {
    constructor(name, age, primary, secondary) {
        this.name = name;
        this.age = age;
        this.primary = primary;
        this.secondary = secondary;
    }
}

class RosterService {
    static url = 'https://63bf5e66a177ed68abaff54a.mockapi.io/rosters';

    static getAllRosters() {
        return $.get(this.url);
    }

    static getRoster(id) {
        return $.get(this.url + `/${id}`);
    }

    static createRoster(roster) {
        return $.post(this.url, roster);
    }

    static updateRoster(roster) {
        return $.ajax({
            url: this.url + `/${roster.id}`,
            dataType: 'json',
            data: JSON.stringify(roster),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteRoster(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static rosters;

    static getAllRosters() {
        RosterService.getAllRosters().then(rosters => this.render(rosters));
    }

    static createRoster(name) {
        RosterService.createRoster(new Roster(name))
        .then(() => {
            return RosterService.getAllRosters();
        })
        .then((rosters) => this.render(rosters));
    }

    static deleteRoster(id) {
        RosterService.deleteRoster(id)
        .then(() => {
            return RosterService.getAllRosters();
        })
        .then((rosters) => this.render(rosters));
    }

    static addPlayer(id) {
        for (let roster of this.rosters) {
            if (roster.id == id) {
                roster.players.push(new Player($(`#${roster.id}-player-name`).val(), $(`#${roster.id}-player-age`).val(), $(`#${roster.id}-player-primary`).val(), $(`#${roster.id}-player-secondary`).val()));
                RosterService.updateRoster(roster) 
                .then(() => {
                    return RosterService.getAllRosters();
                })
                .then((rosters) => this.render(rosters));
            }
        }
    }

    static deletePlayer(rosterId, playerName) {
        for (let roster of this.rosters) {
            if (roster.id == rosterId) {
                for (let player of roster.players) {
                    if (player.name == playerName) {
                        roster.players.splice(roster.players.indexOf(player), 1);
                        RosterService.updateRoster(roster)
                        .then(() => {
                            return RosterService.getAllRosters();
                        })
                        .then((rosters) => this.render(rosters));
                    }
                }
            }
        }
    }

    static render(rosters) {
        this.rosters = rosters;
        $('#app').empty();
        for (let roster of rosters) {
            $('#app').prepend(
                `
                <div id="${roster.id}" class="card">
                    <div class="card-header">
                        <h2 class="display-2">${roster.name}</h2>
                        <button class="btn btn-rounded btn-danger" onclick="DOMManager.deleteRoster('${roster.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card text-light">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${roster.id}-player-name" class="form-control" placeholder="Player Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${roster.id}-player-age" class="form-control" placeholder="Player Age">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${roster.id}-player-primary" class="form-control" placeholder="Player Primary Classes">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${roster.id}-player-secondary" class="form-control" placeholder="Player Secondary Classes">
                                </div>
                            </div>
                            <button id="${roster.id}-new-player" onclick="DOMManager.addPlayer('${roster.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let player of roster.players) {
                $(`#${roster.id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${player.id}"><strong>Name: </strong>${player.name}</span>
                    <span id="age-${player.id}"><strong>Age: </strong>${player.age}</span>
                    <span id="primary-${player.id}"><strong>Primary Class: </strong>${player.primary}</span>
                    <span id="secondary-${player.id}"><strong>Secondary Classes: </strong>${player.secondary}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deletePlayer('${roster.id}', '${player.name}')">Delete Player</button>
                    </p>`
                );
            }
        }
    }

}

$('#create-new-roster').click(() => {
    DOMManager.createRoster($('#new-roster-name').val());
    $('#new-roster-name').val('');
})

DOMManager.getAllRosters();