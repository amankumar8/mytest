import { VZ } from '/imports/startup/both/namespace';
import { Skills } from '/imports/api/skills/skills';
import noUiSlider from 'nouislider'; //npm package
import { JobsChecker } from '/imports/api/jobs/jobs-checker';
import { parseUpload } from '/imports/api/data-parse/methods';
import {createJob, editJob} from '/imports/api/jobs/methods';
import './create-edit-job.html';

Template.creteEditJob.onCreated(function () {
    let self = this;
    let salaryType;
    let skillsLabels;
    if(this.data && this.data.job){
        salaryType = this.data.job.salary && this.data.job.salary.type || '';
        salaryType = salaryType != '' &&  salaryType == 'Annual' ? 'annual' : salaryType == 'Hourly' ? 'hourly' : salaryType == 'Fixed price' ? 'fixed-price' : salaryType == 'Monthly' ? 'monthly' : '';
        skillsLabels  = _.map(this.data.job.skillsIds, function (element) {
            return {tag: Skills.findOne({_id:element}).label};
        });
    }

    let skills = skillsLabels || [];
    this.salaryType = new ReactiveVar(salaryType);
    this.skills = new ReactiveVar(skills);
    this.isSettingSkill = new ReactiveVar(false);
    this.searchString = new ReactiveVar('TESTTEST');
    this.createOrEditJob = _.debounce(function (document) {
        if (self.data && self.data.job) {
            document._id = self.data.job._id;
            editJob.call(document, (err, res) => {
                if (err) {
                    let message = err.reason || err.message;
                    VZ.notify(message);
                } else {
                Router.go('addLocation', {id: self.data.job._id});
                }
            });
        } else {
            createJob.call(document, (err, res) => {
                if (err) {
                    let message = err.reason || err.message;
                    VZ.notify(message);
                } else {
                    Router.go('addLocation', {id: res});
                }
            });
        }
    }, 1000, true);
});

Template.creteEditJob.onRendered(function () {
    this.$('select').material_select();
    this.$('#description').trigger('autoresize');
    let salary  = this.data && this.data.job  && this.data.job.salary;
    let salaryMin = salary && salary.min || 15000;
    let salaryMax = salary && salary.max || 45000;

    let slider = document.getElementById('slider-range');
    noUiSlider.create(slider, {
        start: [salaryMin, salaryMax],
        connect: true,
        step: 100,
        tooltips: true,
        pips: {
            mode: 'range',
            density: 10
        },
        range: {
            'min': 0,
            'max': 200000
        },
        format: wNumb({
            prefix: '$',
            decimals: 0
        })
    });
});

Template.creteEditJob.helpers({
    salaryType() {
        return Template.instance().salaryType.get();
    },
    skills() {
        let tmpl = Template.instance();
        return tmpl.skills.get();
    },
    isSettingSkill() {
        return Template.instance().isSettingSkill.get();
    },
    suggestedSkills() {
        let searchString = Template.instance().searchString.get();
        let regex = new RegExp(searchString, 'gi');

        return Skills.find({
            label: {$regex: regex},
            isArchived: false
        }, {
            sort: {label: 1}, limit: 10
        });
    },
    isContractType(jobContractType) {
        if(this.job){
            let contractType = this.job.contractType;
            if(contractType == jobContractType){
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {return '';}
    },
    isSalary(jobSalary) {
        if(this.job){
            let contractType = this.job.salary.type;
            if(contractType == jobSalary){
                return 'checked';
            }
            else {
                return '';
            }
        }
        else {
            return jobSalary == 'Annual' ? 'checked' : '';
        }
    }
});

Template.creteEditJob.events({
    'click .next': function (event, tmpl) {
        event.preventDefault();
        let job = {};
        let salary ={};
        let title = tmpl.$('#title').val().trim();
        let description = tmpl.$('#description').val().trim();
        let contractType = tmpl.$('input[name="contract-type"]:checked').val();
        let salaryType = tmpl.$('input[name="salary"]:checked').val();
        let equity = tmpl.$('#equity').val();

        let skillsLabels = tmpl.$('.chips-placeholder').material_chip('data');
        if (equity != ''){
            equity = parseFloat(parseFloat(equity).toFixed(2));
            job.equity = equity;
        }

        if (salaryType == 'Annual'){
            let slider = document.getElementById('slider-range');
            let salaryRange = slider.noUiSlider.get();
            let min = parseInt(salaryRange[0].replace('$',''));
            let max = parseInt(salaryRange[1].replace('$',''));
            salary.min = min;
            salary.max = max;
        }
        else if(salaryType == 'Monthly'){
            let montlyRate = tmpl.$('#monthly-rate').val();
            if (montlyRate != ''){
                montlyRate = parseFloat(parseFloat(montlyRate).toFixed(6));
                salary.montlyRate = montlyRate;
            }
        }
        else if(salaryType == 'Hourly'){
            let hourlyRate = tmpl.$('#hourly-rate').val();
            if (hourlyRate != ''){
                hourlyRate = parseFloat(parseFloat(hourlyRate).toFixed(6));
                salary.hourlyRate = hourlyRate;
            }
        }
        else if(salaryType == 'Fixed price'){
            let contractPrice = tmpl.$('#contract-price').val();
            if (contractPrice != ''){
                contractPrice = parseFloat(parseFloat(contractPrice).toFixed(6));
                salary.contractPrice = contractPrice;
            }
        }

        let skillsIds  = _.map(skillsLabels, function (element) {
            return Skills.findOne({label:element.tag})._id;
        });
        salary.type = salaryType;
        job.title = title;
        job.description = description;
        job.contractType = contractType;
        job.salary = salary;
        job.skillsIds = skillsIds;
        try {
            check(job, JobsChecker);
            tmpl.createOrEditJob(job);
        } catch (error) {
            let message = error.reason || error.message;
            VZ.notify(message.replace('Match error: Match error: Match error: ',''));
        }
    },
    'click input[type=radio]': function (event, tmpl) {
        let salaryType = $(event.currentTarget).prop('id');
        if(salaryType == 'annual' || salaryType == 'monthly' || salaryType == 'hourly' || salaryType == 'fixed-price'){
            tmpl.salaryType.set(salaryType);
        }
    },
    'click .suggested-skill': function (event, tmpl) {
        event.preventDefault();
        let suggestedSkill = tmpl.$(event.target).html();
        if (suggestedSkill != 'close') {
            tmpl.isSettingSkill.set(true);
            suggestedSkill = suggestedSkill.replace('<i class="close material-icons">close</i>', '');
            let skills = tmpl.$('.chips-placeholder').material_chip('data');
            if(skills.length >= 7){
                VZ.notify('Can\'t add more than 7 skills');
                tmpl.isSettingSkill.set(false);
            }
            else {
                let isSkill = _.find(skills, function (skill) {
                    return skill.tag == suggestedSkill;
                });
                if (!isSkill) {
                    skills.push({tag: suggestedSkill});
                }
                tmpl.skills.set(skills);
                Meteor.setTimeout(function () {
                    tmpl.isSettingSkill.set(false);
                }, 5);
            }
        }
    },
    'chip.add .chips': function (event, tmpl) {
        event.preventDefault();
        let skills = tmpl.$('.chips-placeholder').material_chip('data');
        skills.pop();
        tmpl.isSettingSkill.set(true);
        tmpl.skills.set(skills);
        Meteor.setTimeout(function () {
            tmpl.isSettingSkill.set(false);
        }, 5);
    },
    'keyup .input': _.debounce(function (event, tmpl) {
        event.preventDefault();
        let suggestedSkill = tmpl.$('.input').val();
        if (suggestedSkill == ''){
            tmpl.searchString.set('TESTTEST');
        }
        else {
            tmpl.searchString.set(suggestedSkill);
        }
    },100),
    'click .discard': function (event, tmpl) {
        event.preventDefault();
        Router.go('userJobs');
    }
    // 'change [name="uploadCSV"]' ( event, template ) {
    //     event.preventDefault();
    //     Papa.parse( event.target.files[0], {
    //         header: true,
    //         complete( results, file ) {
    //             console.log(results.data);
    //             parseUpload.call(results.data, ( error, response ) => {
    //                 if ( error ) {
    //                     VZ.notify(error.reason);
    //                 } else {
    //                     VZ.notify('Success');
    //                 }
    //             });
    //         }
    //     });
    // }
});