import { VZ } from '/imports/startup/both/namespace';
import { archiveTeam, restoreTeam } from '/imports/api/teams/methods';

import './team-actions.html';

Template.teamActions.onRendered(function () {
    this.$('.dropdown-button').dropdown({
        inDuration: 100,
        outDuration: 125,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        // belowOrigin: false, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
});

Template.teamActions.helpers({
    canEditTeam() {
        return VZ.canUser('editTeam', Meteor.userId(), this.data._id);
    }
});

Template.teamActions.events({
    'click #archive-team': function (event, tmpl) {
        event.preventDefault();
        const teamId = this.data._id;
        Session.set('teamsFormChanged',  false);
        archiveTeam.call({teamId: teamId}, function (error, result) {
            if(!error){
                VZ.notify('Archived');
                Session.set('teamsFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('teamsFormChanged',  true);

            }
        });
    },
    'click #restore-team': function (event, tmpl) {
        event.preventDefault();
        const teamId = this.data._id;
        Session.set('teamsFormChanged',  false);
        restoreTeam.call({teamId: teamId}, function (error, result) {
            if(!error){
                Session.set('teamsFormChanged',  true);
            }
            else {
                VZ.notify(error.message);
                Session.set('teamsFormChanged',  true);
            }
        });
    }
});