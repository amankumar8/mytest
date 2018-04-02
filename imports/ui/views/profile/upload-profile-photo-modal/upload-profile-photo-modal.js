import './upload-profile-photo-modal.html';
import { VZ } from '/imports/startup/both/namespace';
import { updateProfilePhoto } from '/imports/api/users/methods';
import Dropzone from 'dropzone/dist/dropzone';

Template.uploadPhotoModal.onCreated(function () {
    let self = this;
    this.photoToUpload = new ReactiveVar({});
    this.resizePhoto = function (file) {
        Resizer.resize(file, {
            width: 100,
            height: 100,
            cropSquare: true
        }, function (err, res) {
            if (err) {
                self.data.onPhotoUpload(false);
                VZ.notify('Failed to format image. Try again');
            }
            else {
                let smallImg = res;
                Resizer.resize(file, {
                    width: 200,
                    height: 200,
                    cropSquare: true
                }, function (err, res) {
                    if (err) {
                        self.data.onPhotoUpload(false);
                        VZ.notify('Failed to format image. Try again');
                    }
                    else {
                        let largeImg = res;
                        self.transformAndUpload(smallImg, largeImg, file.type);
                    }
                });
            }
        });
    };
    this.transformAndUpload = function (smallImg, largeImg, type) {
        if (largeImg && smallImg) {
            let smallBuffer,
                largeBuffer;
            let reader = new FileReader();
            reader.onload = function (e) {
                if (!largeBuffer) {
                    largeBuffer = new Uint8Array(reader.result);
                    reader.readAsArrayBuffer(smallImg);
                }
                else {
                    smallBuffer = new Uint8Array(reader.result);
                    updateProfilePhoto.call({smallBuffer: smallBuffer, largeBuffer: largeBuffer, type: type}, function (err, res) {
                        if (err) {
                            VZ.notify(err.message);
                            self.data.onPhotoUpload(false);
                        }
                        else {
                            VZ.notify('Photo uploaded!');
                            self.data.onPhotoUpload(false);
                        }
                    });
                }
            };
            reader.readAsArrayBuffer(largeImg);
        }
    };
});
Template.uploadPhotoModal.onRendered(function () {
    let self = this;
    this.$('.modal').modal();
    this.$('.modal').modal('open');

    Dropzone.autoDiscover = false;

    let dropzone = new Dropzone('#profile-picture-drop-zone', {
        url: "/target-url",
        addRemoveLinks: true,
        maxFiles: 1,
        maxFilesize: 5,
        parallelUploads: 5,
        acceptedFiles: 'image/*',
        clickable: false,
        dictDefaultMessage: '',
        previewsContainer: '.dropzone-previews',

        accept: function (file, done) {
            self.photoToUpload.set(file);
            done();
        }

    });

    dropzone.on('addedfile', function (file) {
        let typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;

        if (file.size >= 5 * 1000000) {
            dropzone.removeFile(file);
            VZ.notify('File too large! Limit 5MB');
        }
        if (!typeRegEx.test(file.type)) {
            dropzone.removeFile(file);
            VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
        }

    });

    dropzone.on('maxfilesexceeded', function (file) {
        dropzone.removeFile(file);
    });

    $('.modal-overlay').on('click', function () {
        dropzone.destroy();
        removeTemplate(self.view);
    });
    document.addEventListener('keyup', function (e) {
        if (e.keyCode == 27) {
            dropzone.destroy();
            removeTemplate(self.view);
        }
    });
});
Template.uploadPhotoModal.onDestroyed(function () {
    $('.modal-overlay').remove();
});

Template.uploadPhotoModal.helpers({
    isPhotoToUpload() {
        return _.isEmpty(Template.instance().photoToUpload.get());
    }
});

Template.uploadPhotoModal.events({
    'click .cancel': function (event, tmpl) {
        event.preventDefault();
        tmpl.$('#edit-profile-picture').modal('close');
        removeTemplate(tmpl.view);
    },

    'click .save': function (event, tmpl) {
        event.preventDefault();
        tmpl.data.onPhotoUpload(true);
        let photoToUpload = tmpl.photoToUpload.get();
        if(_.isEmpty(photoToUpload)){
            VZ.notify('Select image');
            tmpl.data.onPhotoUpload(false);
            return;
        }
        tmpl.resizePhoto(photoToUpload);
        tmpl.$('#edit-profile-picture').modal('close');
        removeTemplate(tmpl.view);
    },

    'change #profile-photo-input': function (event, tmpl) {
        event.preventDefault();
        let file = $(event.target).prop('files')[0];

        if (!photoValidation(file)) {
            tmpl.data.onPhotoUpload(false);
            return;
        }
        tmpl.data.onPhotoUpload(true);
        tmpl.resizePhoto(file);
        tmpl.$('#edit-profile-picture').modal('close');
        removeTemplate(tmpl.view);
    }
});

let removeTemplate = function (view) {
    setTimeout(function () {
        Blaze.remove(view);
    }, 500);
};

let photoValidation = function (file) {
    if (!file) {
        return;
    }
    if (file.size >= 5 * 1000000) {
        VZ.notify('File too large! Limit 5MB');
        $('#profile-photo-input').val('');
        return
    }
    let typeRegEx = /^image\/(jpeg|JPEG|png|PNG|gif|GIF|tif|TIF)$/;
    if (!typeRegEx.test(file.type)) {
        VZ.notify('Wrong file type! Allowed jpeg, png, gif, tif');
        $('#profile-photo-input').val('');
        return
    }
    return true
};