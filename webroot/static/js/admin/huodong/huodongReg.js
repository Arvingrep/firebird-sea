$(function(){

    var defaultBtn = $("#delBtn, #batchAudit"),
        checkedBtn = $("#stateBtn"),
        init = {

            //选中样式切换
            funTrStyle: function(){
                var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
                if(trLength == checkLength){
                    $("#selectBtn .check").removeClass("checked").addClass("checked");
                }else{
                    $("#selectBtn .check").removeClass("checked");
                }

                if(checkLength > 0){
                    defaultBtn.css('display', 'inline-block');
                    checkedBtn.hide();
                }else{
                    defaultBtn.hide();
                    checkedBtn.css('display', 'inline-block');
                }
            }

        };

    //初始加载
    getList();

    //填充分站列表
    // huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    huoniao.choseCity($(".choseCity"),$("#cityList"));
    $(".chosen-select").chosen();
    $("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
        $("#sType").html($("#typeBtn").attr("data-id"));
        $("#list").attr("data-atpage", 1);
        $("#start").html($("#stime").val());
        $("#end").html($("#etime").val());
        getList();
    });


    // 导出
    $("#export").click(function(e){
        var sKeyword = encodeURIComponent($("#sKeyword").html()),
            cityid   = $("#cityid").val(),
            start    = $("#start").html(),
            end      = $("#end").html(),
            state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
            pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
            page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

        var data = [];
        if($("#cityList").val()!='' && $("#cityList").val()!=null){
            data.push("adminCity="+$("#cityList").val());
        }
        data.push("sKeyword="+sKeyword);
        data.push("cityid="+cityid);
        data.push("start="+start);
        data.push("end="+end);
        data.push("state="+state);
        data.push("pagestep=200000");
        data.push("page=1");
        huoniao.showTip("loading", "正在导出，请稍候...", "auto");
        $(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));

    })

    //搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

    //搜索分类菜单点击事件
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeBtn").attr("data-id", id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');
    });

    $("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if(obj.attr("id") == "paginationBtn"){
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        }else{

            if(obj.attr("id") != "propertyBtn"){
                obj.find("button").html(title+'<span class="caret"></span>');
            }
            $("#list").attr("data-atpage", 1);
        }
        getList();
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn"){
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
    });

});

//查看报名详细
$("#list").delegate(".piaodetail", "click", function(){
    var t = $(this), name = t.attr("data-name"), property = t.siblings(".property").html();

    $.dialog({
        title: langData['siteConfig'][19][570],  //详细信息
        width: 400,
        content: '<div class="propertyPopup">'+property+'</div>',
        ok: false
    });
});

//查看退款详细
$("#list").delegate(".refunddetail", "click", function(){
    var t = $(this), name = t.attr("data-name"), property = t.siblings(".property").html();

    $.dialog({
        title: langData['siteConfig'][19][570],  //详细信息
        width: 400,
        content: '<div class="propertyPopup">'+property+'</div>',
        ok: false
    });
});


//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        sType = $("#sType").html(),
        start    = $("#start").html(),
        end      = $("#end").html(),
        state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("sType="+sType);
    if($("#cityList").val()!='' && $("#cityList").val()!=null){
        data.push("adminCity="+$("#cityList").val());
    }
    data.push("start="+start);
    data.push("end="+end);
    data.push("state="+state);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("huodongReg.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), list = [], i = 0, commonList = val.commonList;
        obj.attr("data-totalpage", val.pageInfo.totalPage);

        $(".totalCount").html(val.pageInfo.totalCount);
        $(".totalCan").html(val.pageInfo.totalCan);
        $(".totalWan").html(val.pageInfo.totalWan);
        $(".totalQuxiao").html(val.pageInfo.totalQuxiao);
        $(".totalRefund").html(val.pageInfo.totalRefund);

        if(val.state == "100"){
            huoniao.hideTip();
            //huoniao.showTip("success", "获取成功！", "auto");

            for(i; i < commonList.length; i++){
                list.push('<tr data-id="'+commonList[i].id+'">');
                list.push('  <td class="row30 left"><a href="'+commonList[i].urlparam+'" target="_blank">'+commonList[i].title+'</a>');
                list.push('</td>');
                list.push('  <td class="row13 left">'+commonList[i].piaotitle+(commonList[i].piaoprice > 0 ? '<br />' + commonList[i].piaoprice + (commonList[i].paytype ? '['+commonList[i].paytype+']' : '') : '')+'</td>');
                var user = '<a href="javascript:;" data-id="'+commonList[i].uid+'" class="userinfo ">'+commonList[i].nickname+'</a>';
                if(commonList[i].uid == 0){
                    user = commonList[i].nickname;
                }
                var info = [];
                var property = commonList[i].property ;
                if(property.length > 0){
                    for(var tmp in property){
                        for(var n in property[tmp]){
                            info.push('<p><span>'+(n == 'areaCode' ? '区号' : n)+'：</span>'+property[tmp][n]+'</p>');
                        }
                    }
                }
                list.push('  <td class="row15 left ">'+user+'<span title="报名资料" class="piaodetail" style="color: red; display: inline-block; width: 30px; height: 30px; vertical-align: middle; margin-left: 5px; line-height: 30px; text-align: center; cursor: pointer;"><i class="icon-user"></i></span><div class="property" style="display: none">'+info.join("")+'</div></td>');

                var info = '';
                if(commonList[i]._state == 4 && commonList[i].refrunddate && commonList[i].refrundno){
                    var info = '<p><span>退款平台：</span>'+commonList[i].paytype+'</p><p><span>退款金额：</span>'+commonList[i].piaoprice+'</p><p><span>退款时间：</span>'+commonList[i].refrunddate+'</p><p><span>退款单号：</span>'+commonList[i].refrundno+'</p>';
                }
                list.push('  <td class="row12 left">'+commonList[i].state+(commonList[i]._state == 4 && info ? '<span title="退款信息" class="refunddetail" style="color: red; display: inline-block; width: 30px; height: 30px; vertical-align: middle; margin-left: 5px; line-height: 30px; text-align: center; cursor: pointer;"><i class="icon-question-sign"></i></span><div class="property" style="display: none">'+info+'</div>' : '')+'</td>');
                list.push('  <td class="row15 left">'+commonList[i].code+(commonList[i].ordernum ? '<br />' + commonList[i].ordernum : '')+'</td>');
                list.push('  <td class="row15 left">'+commonList[i].date+'<br />'+commonList[i].usedate+'</td>');
                list.push('</tr>');
            }

            obj.find("tbody").html(list.join(""));
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();

        }else{

            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    });

};
