/* global window, $, _, console */

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

var getQueryString = function (key, string) {
    var QUERYSTRING_PATTERN_PREFIX = '[\\?\\&\\#]';
    var QUERYSTRING_PATTERN_SUFFIX = '=([^&]*)';

    string = string || window.location.search;
    var matches = string.match(new RegExp(QUERYSTRING_PATTERN_PREFIX + key + QUERYSTRING_PATTERN_SUFFIX, 'i'));
    var encodedValue = matches && matches[1];
    var value = encodedValue && decodeURIComponent(encodedValue);
    return value;
};

$(function () {
    window.scrollConverter.activate();

    var queryPackageName = getQueryString('packageName');
    var queryCategory = getQueryString('category');

    // var host = 'http://192.168.111.191:8080';
    var host = 'http://192.168.111.218:8080';
    var url;

    if (!!queryCategory) {
        url = host + '/category/time_machine?category=' + queryCategory;
    } else {
        url = host + '/apps/time_machine?packageName=' + queryPackageName;

        if (getQueryString('repair') === '1') {
            $.ajax({url : host + '/apps/repairTime?packageName=' + queryPackageName});
        }
    }

    $('.w-landing .action a').on('click', function (e) {
        $('.w-landing').addClass('end').on('webkitTransitionEnd', function () {
            $(this).hide();
        });
    });



    // $('.w-landing').hide();
    // return;



    $.ajax({
        url : url,
        dataType : 'json',
        crossDomain : true,
        timeout : 30000
    }).done(function (data) {
        $('.cross').html('');

        $('.w-landing .action a').text('开启时光机');

        if (queryPackageName) {
            document.title = data.finalVersion.title.newData + '的时光机';

            $('body').addClass('w-app');
            $('.w-landing img').attr('src', data.finalVersion.icon.newData);
            $('.js-title').text(data.finalVersion.title.newData);
            $('.background').css('background-image', 'url(' + data.finalVersion.icon.newData + ')');
        }

        if (queryCategory) {
            document.title = queryCategory + '分类的时光机';

            var categoryIcons = [];

            _.each(data.finalVersions, function (app) {
                if (app && app.icon) {
                    categoryIcons.push($('<img>').attr('src', app.icon.newData));
                }
            });

            $('body').addClass('w-category');
            $('.w-landing .icons').html(categoryIcons);

            $('.w-landing .desc').text('了解「' + queryCategory + '」分类中的应用们，鲜为人知的成长故事');
            $('.js-title').text(queryCategory + '分类');
            $('.background').css('background-image', 'url(' + data.finalVersions[0].icon.newData + ')');

            $('.cross').append(_.template($('#a-template-category').html(), data));
        }

        _.each(data.appMilestoneList, function (milestone) {
            switch (milestone.type) {
            case 'launch':
                $('.cross').append(_.template($('#a-template-launch').html(), milestone));
                break;

            case 'update':
                $('.cross').append(_.template($('#a-template-update').html(), milestone));
                break;

            case 'install':
                $('.cross').append(_.template($('#a-template-install').html(), milestone));

                var chartLabels = [];
                var chartDataset = [];

                var downloadHistoryList = _.last(milestone.downloadHistoryList, 5);

                _.each(downloadHistoryList, function (everyday) {
                    chartLabels.push(FormatDate('MM-dd', everyday.date));
                    chartDataset.push(parseInt(everyday.downloads, 10));
                });


                var ctx = $('.install-chart-' + milestone.date)[0].getContext('2d');

                var chartData = {
                    labels : chartLabels,
                    datasets : [{
                        fillColor : 'rgba(59, 170, 36, 0.4)',
                        strokeColor : '#3baa24',
                        pointColor : '#3baa24',
                        pointStrokeColor : '#fff',
                        data : chartDataset
                    }]
                };

                var chartOptions = {
                    bezierCurve : false
                };

                new window.Chart(ctx).Line(chartData, chartOptions);

                break;

            case 'award':
                $('.cross').append(_.template($('#a-template-award').html(), _.extend(milestone, data.appSelectedAward)));
                break;
            }
        });

        if (data.appSummary) {
            $('.cross').append(_.template($('#a-template-summary').html(), data));
        }

        if (data.oldestApp) {
            $('.cross').append(_.template($('#a-template-oldest').html(), data.oldestApp));
        }

        if (data.controversialApp) {
            $('.cross').append(_.template($('#a-template-controversial').html(), data));
        }
    });

    // $('.w-landing').hide();
});
