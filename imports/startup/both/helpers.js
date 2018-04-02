import { Teams } from '/imports/api/teams/teams';
import { VZ } from './namespace';

VZ.notify = function (msg, time) {
    time = time ? time : 5000;
    $('.toast').hide();
    Materialize.toast(msg, time);
};

VZ.getRandomColor = function () {
    let letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

VZ.dateRanges = {
    'Weekly': 'isoweek',
    'Monthly': 'month',
    'Quarterly': 'quarter',
    'Yearly': 'year'
};

VZ.helpers.isEmailVerified = function (user) {
    if (user && user.emails && (user.emails.length > 0)) {
        // return true if verified email, false otherwise.
        let found = _.find(
            user.emails,
            function (thisEmail) {
                return thisEmail.verified
            }
        );
        if (!found) {
            console.log('No verified emails found.');
        }
        return found;
    }
    else {
        console.log('User has no registered emails.');
        return false;
    }
};

VZ.helpers.isDev = function () {
    return Meteor.settings.public.isDev;
};

VZ.helpers.isEmailValid = function (email) {

    let regexp = new RegExp(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/);
    return regexp.test(email);

};
VZ.helpers.isPasswordValid = function (password) {

    let regexp = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/);
    return regexp.test(password);

};

VZ.helpers.isPasswordValid = function (password) {

    let regexp = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/);
    return regexp.test(password);

};

VZ.helpers.hasSpecialCharacters = function (str) {
    let regexp = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\':<>\?]/);
    return regexp.test(str);
};

VZ.helpers.validatePassword = function (password) {

    let minChars = 8,
        maxChars = 100;

    let result = {
        error: false,
        msg: 'Success'
    };
    if (_.isEmpty(password)) {
        result.error = true;
        result.msg = 'Password must be not shorter then ' + minChars + ' characters';
        return result;
    }

    if (password.length > maxChars) {
        result.error = true;
        result.msg = 'Password must be not longer then ' + maxChars + ' characters';
        return result;
    }
    if (VZ.helpers.hasSpecialCharacters(password)) {
        result.error = true;
        result.msg = 'Password may not contain special characters';

        return result;
    }
    if (!VZ.helpers.isPasswordValid(password)) {
        result.error = true;
        result.msg = 'Password should contain at least one capital letter and number';
        return result;
    }


    return result;
};

VZ.helpers.matchPasswords = function (password, passwordConfirm) {
    let result = {
        error: false,
        msg: 'Success'
    };
    if (_.isEmpty(passwordConfirm)) {
        result.error = true;
        result.msg = 'Please confirm your password';
        return result;
    }

    if (password != passwordConfirm) {
        result.error = true;
        result.msg = 'Passwords don\'t match';
        return result;
    }

    return result;

};


VZ.canUser = function (action, userId, groupId) {
    switch (action) {
        case 'editCompany':
          return Roles.userIsInRole(userId,
            ['company-owner', 'company-admin'], groupId);
        case 'deleteCompany':
          return Roles.userIsInRole(userId,
            ['company-owner'], groupId);
        case 'assignUserToCompany':
        case 'assignTeamToCompany':
        case 'contractingAsCompanyWithWorker':
            return Roles.userIsInRole(userId,
                ['company-owner', 'company-admin', 'company-manager'], groupId);
        case 'archiveCompany':
        case 'restoreCompany':
            return Roles.userIsInRole(userId,
                ['company-owner'], groupId);
        case 'viewCompany':
            let isAssignedUserCompany = Roles.userIsInRole(userId,
                ['company-owner', 'company-manager', 'company-worker'], groupId);

            if (isAssignedUserCompany) {
                return true;
            }

            let assignedTeamWithCurrentUser =
                Teams.findOne({assignedCompanyId: groupId, membersIds: userId});

            if (!!assignedTeamWithCurrentUser) {
                return Roles.userIsInRole(userId, ['team-member'],
                    assignedTeamWithCurrentUser._id);
            }
            return false;
        case 'verifyCompany':
            return Roles.userIsInRole(userId, 'admin', Roles.GLOBAL_GROUP);
      case 'assignUsersToCompany':
        return Roles.userIsInRole(userId, ['company-owner', 'company-admin', 'company-manager'], groupId);

      case 'editWorkplace':
        case 'deleteWorkplace':
        case 'shareWorkplace':
        case 'assignUserToWorkplace':
            return Roles.userIsInRole(userId, ['workplace-admin', 'workplace-manager'], groupId);
        case 'associateWorkplaceWithCompany':
            return Roles.userIsInRole(userId, ['workplace-admin'], groupId);
        case 'viewWorkplace':
        case 'updateWorkplaceState':
            return Roles.userIsInRole(userId, ['workplace-admin', 'workplace-manager', 'workplace-worker'], groupId);
        case 'editProject':
        case 'restoreProject':
        case 'archiveProject':
        case 'assignTeamToProject':
        case 'assignUserToProject':
        case 'assignProjectToWorkplace':
        case 'assignProjectToTask':
        case 'seeFilterByUserInProject':
        case 'viewTimeEntriesRelatedToProject':
            return Roles.userIsInRole(userId, ['project-owner', 'project-admin', 'project-manager'], groupId);

        case 'addUserToTask':
            return Roles.userIsInRole(userId, ['project-owner', 'project-admin', 'project-manager', 'project-worker'], groupId);
        case 'view':
            return Roles.userIsInRole(userId, ['project-worker'], groupId);
        case 'viewProject':
        case 'addActivityMessage':
        case 'viewDashboard':
            let isAssignedUser = Roles.userIsInRole(userId, ['project-admin', 'project-manager', 'project-worker'], groupId);

            if (isAssignedUser) {
                return true;
            }

            let assignedTeamWithCurrentUserDashboard =
                Teams.findOne({assignedProjectId: groupId, assignedUsersIds: userId});

            if (!!assignedTeamWithCurrentUserDashboard) {
                return Roles.userIsInRole(userId, ['team-member'],
                    assignedTeamWithCurrentUserDashboard._id);
            }
            return false;

        case 'editTeam':
        case 'deleteTeam':
        case 'assignUserToTeam':
            return Roles.userIsInRole(userId,
                ['team-admin', 'team-manager'], groupId);
        case 'viewTeam':
            return Roles.userIsInRole(userId,
                ['team-admin', 'team-manager', 'team-member'], groupId);
        case 'archiveTeam':
        case 'restoreTeam':
            return Roles.userIsInRole(userId, ['team-admin'], groupId);

        case 'viewConversation':
            return Roles.userIsInRole(userId, 'conversation-member', groupId);
        case 'addParticipantToConversation':
        case 'editConversation':
            return Roles.userIsInRole(userId, 'conversation-owner', groupId);

        case 'editTask':
        case 'archiveTask':
        case 'restoreTask':
        case 'deleteTask':
        case 'assignUserToTask':
        case 'assignTeamToTask':
            return Roles.userIsInRole(userId, ['task-owner', 'task-member'], groupId);

        case 'acceptContract':
        case 'declineContract':
            return Roles.userIsInRole(userId, ['contract-worker'], groupId);
        case 'pauseContract':
        case 'endContract':
            return Roles.userIsInRole(userId, ['contract-employer', 'contract-worker'], groupId);
        case 'viewContract':
            return Roles.userIsInRole(userId, ['contract-employer', 'contract-worker'], groupId);
        case 'deleteContract':
        case 'editContract':
            return Roles.userIsInRole(userId, 'contract-employer', groupId);
        case 'createJob':
        case 'viewJob':
        case 'editJob':
        case 'archiveJob':
        case 'deleteJob':
            return Roles.userIsInRole(userId, ['job-owner'], groupId);

        default :
            throw new Meteor.Error('No such action: "' + action + '"');
    }
};