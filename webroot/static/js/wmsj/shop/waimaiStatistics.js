$(function(){



    jQuery('.chooseDate').datepicker(jQuery.extend({

        showMonthAfterYear: false

    },

    jQuery.datepicker.regional['zh_cn'], {

        'showSecond': true,

        'changeMonth': true,

        'changeYear': true,

        'tabularLevel': null,

        'yearRange': '2013:' + new Date().getFullYear(),

        'minDate': new Date(2013, 1, 1, 00, 00, 00),

        'timeFormat': 'hh:mm:ss',

        'dateFormat': 'yy-mm-dd',

        'timeText': langData['siteConfig'][19][384],

        'hourText': langData['waimai'][6][124],

        'minuteText': langData['waimai'][6][125],

        'secondText': langData['waimai'][6][126],

        'currentText': langData['waimai'][6][127],

        'closeText': langData['siteConfig'][6][15],

        'showOn': 'focus'

    }));



    jQuery('.chooseDateTime').datetimepicker(jQuery.extend({

        showMonthAfterYear: false

    },

    jQuery.datepicker.regional['zh_cn'], {

        'showSecond': true,

        'changeMonth': true,

        'changeYear': true,

        'tabularLevel': null,

        'yearRange': '2013:' + new Date().getFullYear(),

        'minDate': new Date(2013, 1, 1, 00, 00, 00),

        'timeFormat': 'hh:mm:ss',

        'dateFormat': 'yy-mm-dd',

        'timeText': langData['siteConfig'][19][384],

        'hourText': langData['waimai'][6][124],

        'minuteText': langData['waimai'][6][125],

        'secondText': langData['waimai'][6][126],

        'currentText': langData['waimai'][6][127],

        'closeText': langData['siteConfig'][6][15],

        'showOn': 'focus'

    }));





    $(".chosen-select").chosen();



});
