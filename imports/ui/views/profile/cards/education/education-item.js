import { VZ } from '/imports/startup/both/namespace';
import { UserEducation } from '/imports/api/userEducations/userEducations';
import { updateEducation, removeEducation } from '/imports/api/userEducations/methods';

import './education-item.html';

Template.educationItem.onCreated(function () {
    this.showMore = new ReactiveVar(false);
});
Template.educationItem.onDestroyed(function () {
});
Template.educationItem.onRendered(function () {
});
Template.educationItem.helpers({
    profileOwner() {
        let user = Meteor.users.findOne({_id: Router.current().params.id});
        return user && Meteor.userId() == user._id;
    },
    studyPeriod(){
        if(this.data.isStudy){
            return moment(this.data.startAt).format('YYYY') + ' - current';
        }
        else{
            return moment(this.data.startAt).format('YYYY') + ' - ' + moment(this.data.completeAt).format('YYYY');
        }
    },
    completeDate(){
        if(this.data.isStudy){
            return moment().format('YYYY');
        }
        else{
            return moment(this.data.completeAt).format('YYYY');
        }
    },
    description() {
        let description = this.data.description;
        let new_text, small_len = 200;

            if (this.data.description.length > 200 && !Template.instance().showMore.get()) {
                new_text = description.substr(0, (small_len - 3)) + '...';
                return new_text;
            }
            return this.data.description;
    },
    showMore() {
        let user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return this.data.description.length > 200 && Template.instance().showMore.get();
    },
    showMoreButton() {
        let user = Meteor.users.findOne({_id: Router.current().params.id});
        if (!user || !user.profile) {
            return;
        }
        return this.data.description.length > 200;
    }
});
Template.educationItem.events({
    'click .edit-education': function (event, tmpl) {
        event.preventDefault();
        let educationId = this.data._id;
        let education = UserEducation.findOne({_id: educationId});
        let parentNode = $('body')[0],
            onEducationInsertEdit = function (education, educationTmpl) {
                education._id = educationId;
                updateEducation.call(education, function (error, result) {
                    if (!error) {
                        educationTmpl.$('#edit-education-modal').modal('close');
                        removeTemplate(educationTmpl.view);
                        VZ.notify('Success');
                    }
                    else {
                        VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));
                    }
                });
            },
            modalData = {
                education: education,
                onEducationInsertEdit: onEducationInsertEdit
            };
        Blaze.renderWithData(Template.editEducationModal, modalData, parentNode);
    },
    'click .remove-education': function (event, tmpl) {
        event.preventDefault();
        let educationId = this.data._id;
        removeEducation.call({educationId: educationId}, function (error, result) {
            if(error){
                VZ.notify(error.message.replace(/[[0-9]+]/gi, ''));

            }
        });
    },
    'click .show-more-education': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(true);
    },
    'click .show-less-education': function (event, tmpl) {
        event.preventDefault();
        tmpl.showMore.set(false);
    }
});
let removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};