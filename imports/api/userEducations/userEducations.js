import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const UserEducation = new Mongo.Collection('vz-user-education');

export const EducationSchema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    degree: {
        type: String,
        min: 3,
        max: 70
    },
    school: {
        type: String,
        min: 3,
        max: 70
    },
    description: {
        type: String,
        min: 3,
        max: 300
    },
    isStudy: {
        type: Boolean
    },
    startAt: {
        type: Date
    },
    completeAt: {
        type: Date,
        optional: true
    }
});

EducationSchema.messages({

    "minString degree": "[label] must be at least [min] characters",
    "maxString degree": "[label] cannot exceed [max] characters",

    "required degree": "Degree is required",

    "minString school": "[label] must be at least [min] characters",
    "maxString school": "[label] cannot exceed [max] characters",

    "required school": "School is required",

    "minString description": "[label] must be at least [min] characters",
    "maxString description": "[label] cannot exceed [max] characters",

    "required description": "Decription is required",

    "required startAt": "Date creation required",
    "required completeAt": "Date complete required"
});
