import { VZ } from '/imports/startup/both/namespace';

VZ.UI.dropdown = function (elementSelector) {
    let $dropDownContainer = $(elementSelector),
        $dropDownButton = $dropDownContainer.find('.dropdown-button');

    $dropDownButton.dropdown();

};

VZ.UI.select = function (elementSelector) {
    let $element = $(elementSelector),
        $caretDown = $('<i class="tiny material-icons rotate-90 caret">play_arrow</i>'),
        $materializeCaret;

    $element.material_select();
    $element = $(elementSelector);

    $materializeCaret = $element.find('.caret');
    $materializeCaret.text('').append($caretDown)
};
