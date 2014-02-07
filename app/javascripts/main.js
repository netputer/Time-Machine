/* global $, _, console */

var FormatDate = function (format, date) {
    date = date ? new Date(parseInt(date, 10)) : new Date();
    var output = format;

    var zh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    output = output.replace(/y{4}|D{2}|M{2}|d{2}|h{2}|H{2}|m{2}|s{2}/g, function (keyword) {
        var result = '';

        switch (keyword) {
        case 'yyyy':
            result = date.getFullYear();
            break;
        case 'MM':
            result = date.getMonth() + 1;
            break;
        case 'dd':
            result = date.getDate();
            break;
        case 'HH':
            var HH = date.getHours();
            if (HH < 10) {
                result = '0' + HH;
            } else {
                result = HH;
            }
            break;
        case 'hh':
            var hh = date.getHours();
            if (hh > 12) {
                hh = hh - 12;
            }
            if (hh < 10) {
                result = '0' + hh;
            } else {
                result = hh;
            }
            break;
        case 'mm':
            var mm = date.getMinutes();
            if (mm < 10) {
                result = '0' + mm;
            } else {
                result = mm;
            }
            break;
        case 'ss':
            var ss = date.getSeconds();
            if (ss < 10) {
                result = '0' + ss;
            } else {
                result = ss;
            }
            break;
        case 'DD':
            var DD = date.getDay();
            if (window.navigator.language.indexOf('zh') > -1) {
                result = zh[DD];
            } else {
                result = en[DD];
            }
            break;
        }

        return result;
    });

    return output;
};

var ReadableSize = function (bytes) {
    bytes = parseInt(bytes, 10);
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    bytes = Math.max(bytes, 0);
    var pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
    pow = Math.min(pow, units.length - 1);
    bytes = bytes * 100 / Math.pow(1024, pow);
    var unit = units[pow];

    var result;
    if (unit === 'B' || unit === 'KB') {
        result = Math.round(Math.round(bytes) / 100) + ' ' + units[pow];
    } else {
        result = Math.round(bytes) / 100 + ' ' + units[pow];
    }

    return result;
};

$(function () {
    'use strict';

    window.scrollConverter.activate();

    var query = location.hash.substr(1);
    var isCategory = query.indexOf('.') < 0;
    var url;

    if (isCategory) {
        url = 'http://192.168.111.218:8080/apps/time_machine?category=' + query;
    } else {
        url = 'http://192.168.111.218:8080/apps/time_machine?packageName=' + query;

        $.ajax({
            url : 'http://192.168.111.218:8080/apps/repairTime?packageName=' + query
        });
    }

    $.ajax({
        url : url,
        dataType : 'json'
    }).done(function (data) {
        console.error(data);

        $('.w-header .title').text(data.finalVersion.title.newData + '的成长故事');
        $('.background').css('background-image', 'url(' + data.finalVersion.icon.newData + ')');

        var cards = [];

        _.each(data.appMilestoneList, function (milestone) {
            switch (milestone.type) {
            case 'launch':
                cards.push(_.template($('#a-template-launch').html(), milestone));
                break;

            case 'update':
                cards.push(_.template($('#a-template-update').html(), milestone));
                break;

            case 'install':
                cards.push(_.template($('#a-template-install').html(), milestone));
                break;

            case 'award':
                cards.push(_.template($('#a-template-award').html(), _.extend(milestone, data.appSelectedAward)));
                break;
            }
        });

        cards.push(_.template($('#a-template-summary').html(), data));

        $('.cross').html(cards);
    });

    // var ctx = $('.install-chart')[0].getContext('2d');

    // var data = {
    //     labels : ['09-11', '09-12', '09-13', '09-14', '09-15', '09-16', '09-17'],
    //     datasets : [{
    //         fillColor : 'rgba(59, 170, 36, 0.4)',
    //         strokeColor : '#3baa24',
    //         pointColor : '#3baa24',
    //         pointStrokeColor : '#fff',
    //         data : [28,48,60,89,106,127,200]
    //     }]
    // };

    // var options = {
    //     bezierCurve : false
    // };

    // var installChart = new window.Chart(ctx).Line(data, options);
});
