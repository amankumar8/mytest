import { VZ } from '/imports/startup/both/namespace';
import { Countries } from '/imports/api/countries/countries';
import {editWorkerLocation} from '/imports/api/jobs/methods';

import './worker-location.html';

Template.workerLocation.onCreated(function () {
    let workerLocation = this.data && this.data.job && this.data.job.workerLocation;
    let continent = workerLocation && this.data.job.workerLocation.continent || '';
    let isCountriesDisabled = workerLocation && this.data.job.workerLocation.country == 'anywhere' ? true : false;

    this.continentCode = new ReactiveVar(continent);
    this.isCountriesDisabled = new ReactiveVar(isCountriesDisabled);
});
Template.workerLocation.onRendered(function () {
    $('#continent').material_select();
    $('#country').material_select();
    $('input.location').click(function () {
        $('input:not(:checked)').parent().removeClass('active');
        $('input:checked').parent().addClass('active');
    });
    this.autorun(() =>{
        this.continentCode.get();
        this.isCountriesDisabled.get();
        Tracker.afterFlush(function () {
            $('#country').material_select();
        });

    });
});
Template.workerLocation.helpers({
    isRestricted(restricted) {
        if (this.job && this.job.workerLocation && this.job.workerLocation) {
            let isJobRestricted = this.job.workerLocation.isRestricted;
            let contract = isJobRestricted ? 'restricted' : 'anywhere';

            if (contract == restricted) {
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    isActive(restricted) {
        if (this.job && this.job.workerLocation && this.job.workerLocation.isRestricted) {
            let isJobRestricted = this.job.workerLocation.isRestricted;
            let contract = isJobRestricted ? 'restricted' : 'anywhere';

            if (contract == restricted) {
                return 'active';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    countries() {
        let tmpl = Template.instance();
        let continentCode = tmpl.continentCode.get();
        return Countries.find({continentCode: continentCode}).fetch() || [];
    },
    selectedContinent(continent) {
        if (this.job) {
            let jobContinent = this.job && this.job.workerLocation && this.job.workerLocation.continent;
            if (continent == jobContinent) {
                return 'selected';

            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    selectedCountry(country) {
        let tmpl = Template.instance();
        if(tmpl.data && tmpl.data.job && tmpl.data.job.workerLocation && tmpl.data.job.workerLocation.country){
            let jobCountry = tmpl.data.job.workerLocation.country;
            if (jobCountry == country) {
                return 'selected';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }

    },
    isRestrictedCountry() {
        let tmpl = Template.instance();
        if(tmpl.data && tmpl.data.job && tmpl.data.job.workerLocation && tmpl.data.job.workerLocation.country){
            let jobCountry = tmpl.data.job.workerLocation.country;
            if (jobCountry == 'anywhere') {
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    },
    isCountriesDisabled() {
        let tmpl = Template.instance();
        return tmpl.isCountriesDisabled.get();
    }
});
Template.workerLocation.events({
    'click .discard': function (event, tmpl) {
        event.preventDefault();
        let id = this.job._id;
        Router.go('editJob', {id: id});
    },
    'click .next': function (event, tmpl) {
        event.preventDefault();
        let job = {};
        let jobId = this.job._id;
        let contractType = tmpl.$('input[name="worker-location"]:checked').val();
        if (!contractType) {
            VZ.notify('Select location');
            return;
        }
        if (contractType == 'anywhere') {
            job.workerLocation = {
                isRestricted: false
            };
        }
        else if (contractType == 'restricted') {
            let continent = tmpl.$('#continent').val();
            job.workerLocation = {
                isRestricted: true,
                continent: continent
            };
            let country = tmpl.$('#country').val();
            let isCountryRestricted = !tmpl.$('#filled-in-box').prop('checked');
            if (!isCountryRestricted) {
                job.workerLocation.country = 'anywhere';
            } else if (isCountryRestricted) {
                job.workerLocation.country = country;

            }
        }
        if (jobId) {
            job._id = jobId;
            editWorkerLocation.call(job, (err, res) => {
                if (err) {
                    let message = err.reason || err.message;
                    VZ.notify(message);
                } else {
                    Router.go('jobOverview', {id: jobId});
                }
            });
        }
    },
    'change #continent': function (event, tmpl) {
        let continent = tmpl.$('#continent').val();
        tmpl.continentCode.set(continent);
        $('#country').material_select();
    },
    'change #filled-in-box': function (event, tmpl) {
        tmpl.isCountriesDisabled.set(event.target.checked);
    }
});