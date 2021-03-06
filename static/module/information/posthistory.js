/**
 * Created by Msater Zg on 2017/4/20.
 */
/**
 * Created by Msater Zg on 2017/4/20.
 */
/**
 * Created by Msater Zg on 2017/1/25.
 */
define(function (require, exports, module) {
    // 通过 require 引入依赖,加载所需要的js文件
    var api = require('../../common/api');
    var sysTem = window.parent.SYSTEM;
    var tableChoiceData = {};
    $.datetimepicker.setLocale('zh');
    $('#choose-start-time').datetimepicker({
        format: 'Y-m-d H:i',
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#choose-end-time').val() ? $('#choose-end-time').val() : false
            })
        }
    });
    $('#choose-end-time').datetimepicker({
        format: 'Y-m-d H:i',
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#choose-start-time').val() ? $('#choose-start-time').val() : false
            })
        }
    });

    $('#finish-time').focus(function () {
        $('#choose-time-section').stop().slideDown();
    });

    $('#remove-choose-time').unbind('click').click(function () {
        $('#choose-time-section').stop().slideUp();
    });

    $('#sure-choose-time').unbind('click').click(function () {
        var startTime = $('#choose-start-time').val();
        var endTime = $('#choose-end-time').val();
        if (startTime == "") {
            $('#finish-time').val("");
        } else {
            var timeSection = startTime + '&' + endTime;
            $('#finish-time').val(timeSection);
            $('#choose-start-time').val("");
            $('#choose-end-time').val("");
        }
        $('#choose-time-section').stop().slideUp();
    });

    var settingScheme = {
        callback: {
            onClick: onClickCallBackScheme
        },
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "area_parent",
                rootPId: 0
            }
        }
    };
    // 联动性参数设置
    var zNodesScheme = null;
    api.system.areaManage.getAllArea(function (rep) {
        zNodesScheme = rep.data;
        $.fn.zTree.init($("#scheme-area-tree"), settingScheme, zNodesScheme);
    });

    function onClickCallBackScheme(event, treeId, treeNode) {
        var treeObj = $.fn.zTree.getZTreeObj("scheme-area-tree");
        var nodes = treeObj.transformToArray(treeNode);
        var nodesLen = nodes.length;
        var idS = [];
        for (var i = 0; i < nodesLen; i++) {
            idS.push(nodes[i].id);
        }
        api.movement.severCustomer.getAllServeCustomers(idS.join(','), function (rep) {
            var schemeAll = rep.data;
            var schemeAllLen = rep.total;
            var schemeDom = [];
            for (var i = 0; i < schemeAllLen; i++) {
                schemeDom.push('<label class="radio-inline">');
                schemeDom.push('<input type="radio" name="schemeOptions" schemeName="' + schemeAll[i].customer_name + '"  value="' + schemeAll[i].id + '" checked>');
                schemeDom.push('' + schemeAll[i].customer_name + '');
                schemeDom.push('</label>');
            }
            $('#search-scheme-name').val("");
            $('.scheme-info').empty();
            $('.scheme-info').append(schemeDom.join(''));
        });
    };

    $('#post-scheme-btn').unbind('click').click(function () {
        layer.closeAll();
        var customerArray = [];
        $('input[name = schemeOptions]:checked').each(function () {
            customerArray.push($(this).attr('schemeName'));
        });
        $('#contact-info-customer').val(customerArray.join('|'));
    });

    $('#choose-contact-customer-btn').unbind('click').click(function () {
        layer.open({
            title: '筛 选 客 户',
            type: 1,
            area: ['50%', '96%'], //宽高
            content: $('#scheme-choose-dialog')
        });
    });

    function getFormValue() {
        var searchData = {};
        var getNumber = $('#get-number').val();
        var finishTime = $('#finish-time').val();
        var finishPeople = $('#finish-people').val();
        var inforContent = $('#infor-content').val();
        var customerName = $('#contact-info-customer').val();
        if (getNumber !== "") {
            searchData.infor_get_people = getNumber;
        }
        if (finishTime !== "") {
            searchData.infor_finish_time = finishTime;
        }
        if (finishPeople !== "") {
            searchData.user_name = finishPeople;
        }
        if (inforContent !== "") {
            searchData.infor_context = inforContent;
        }
        if (customerName !== "") {
            searchData.infor_consumer = customerName;
        }
        return searchData;
    }

    $('#search-history-data').unbind('click').click(function () {
        tableChoiceData = getFormValue();
        tableStart();
    });

    $('.export-history-data').unbind('click').click(function () {
        var exportType = $(this).attr('export-type');
        tableChoiceData = getFormValue();
        api.information.infoHistory.exportHistoryInfor(JSON.stringify(tableChoiceData), exportType, function (rep) {
            var filePath = rep.result;
            if (filePath === '') {
                layer.msg('抱歉!没有可导出的数据', {
                    time: 1500
                });
            } else {
                window.open('http://118.178.237.219:8080/dummyPath/' + filePath);
            }
        });
    });

    function getTime(startTime, endTime) {
        var startTime = new Date(startTime);
        var endTime = new Date(endTime);
        var timeDisparity = endTime.getTime() - startTime.getTime();
        var days = Math.floor(timeDisparity / (24 * 3600 * 1000));
//计算出小时数
        var leave1 = timeDisparity % (24 * 3600 * 1000);   //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000));
//计算相差分钟数
        var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000));
        var timeData = hours + "时 " + minutes + "分";
        return timeData;
    }

    tableStart();

    /**
     * 表格初始化
     */
    function tableStart() {
        $('#all-infor-history').bootstrapTable('destroy');
        $('#all-infor-history').bootstrapTable({
            columns: [{
                field: 'infor_title',
                title: '信息标题',
                width: 200,
                formatter: function (value, row, index) {
                    if (value.length > 25) {
                        return value.substring(0, 25) + "...";
                    } else {
                        return value;
                    }
                }
            }, {
                field: 'infor_context',
                title: '信息内容',
                width: 500,
                formatter: function (value, row, index) {
                    if (value.length > 75) {
                        return value.substring(0, 75) + "...";
                    } else {
                        return value;
                    }
                }
            }, {
                field: 'infor_consumer',
                title: '接收方'
            }, {
                field: 'gmt_create',
                title: '推送时间',
                formatter: function (value, row, index) {
                    return value.substring(0, 16);
                }
            }, {
                field: 'id',
                title: '时间差',
                formatter: function (value, row, index) {
                    var startTime = row.gmt_create.substring(0, 16).replace(/-/g, "/");
                    var endTime = row.gmt_modified.substring(0, 16).replace(/-/g, "/");
                    return getTime(startTime, endTime);
                }
            }],
            pageNumber: 1,
            pageSize: 25,
            dataField: 'data',//指定后台的数据的名称
            undefinedText: '--',
            sidePagination: 'server',
            classes: 'table table-bordered table-hover',
            method: 'post',
            url: '' + api.baseUrl + '/getAllHistory',
            queryParamsType: "undefined",
            queryParams: function (params) {
                var param = {
                    pageNumber: params.pageNumber,
                    pageSize: params.pageSize,
                    tableChoiceData: JSON.stringify(tableChoiceData)
                };
                return param;
            },
            pagination: true,
            paginationHAlign: 'left',
            paginationDetailHAlign: 'right',
            onLoadSuccess: function (data) {
            }
        });
    }
});
