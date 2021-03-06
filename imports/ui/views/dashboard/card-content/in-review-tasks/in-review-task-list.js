import { Projects } from '/imports/api/projects/projects';

Template.usersInReviewTasksList.helpers({
    projectName() {
        let projectId = this.projectId;
        let project = Projects.findOne({_id: projectId});
        return project && project.name;
    }
});

Template.usersInReviewTasksList.events({
    'click #task-name': function (event, tmpl) {
        event.preventDefault();
        let taskId = this._id;
        let projectId = this.projectId;
        Session.set('taskId', taskId);
        Router.go('projectDashboard', {id: projectId});
    }
});
