import './hours.html';

Template.timePickerHoursState.onRendered(function(){
    let number = +this.data.number;
    this.$('.analog-hour').removeClass('active');
    this.$('#' + number + 'h').addClass('active');
});
