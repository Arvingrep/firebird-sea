$(function(){
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

    var defaultBtn = $("#delBtn"),
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
                    defaultBtn.show();
                    checkedBtn.hide();
                }else{
                    defaultBtn.hide();
                    checkedBtn.show();
                }
            }
        };

    //初始加载
    getList();

    //开始、结束时间
    $("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
        $("#start").html($("#stime").val());
        $("#end").html($("#etime").val());
        $("#list").attr("data-atpage", 1);
        getList();
    });

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

    //二级菜单点击事件
    $("#stateBtn, #pageBtn, #paginationBtn,#leimuBtn,#shouruBtn").delegate("a", "click", function(){
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
        var nolist = $(this).data("nolist");
        if(!nolist){
            getList();
        }
    });

    //下拉菜单过长设置滚动条
    $(".dropdown-toggle").bind("click", function(){
        if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
            var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
            $(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
        }
    });

    //单选
    $("#list tbody").delegate("tr", "click", function(event){
        var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
        if(event.target.className.indexOf("check") > -1) {
            if(isCheck.hasClass("selected")){
                isCheck.removeClass("selected");
            }else{
                isCheck.addClass("selected");
            }
        }else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
            $("#list tr").removeClass("selected");
            isCheck.addClass("selected");
        }else{
            if(checkLength > 1){
                $("#list tr").removeClass("selected");
                isCheck.addClass("selected");
            }else{
                if(isCheck.hasClass("selected")){
                    isCheck.removeClass("selected");
                }else{
                    $("#list tr").removeClass("selected");
                    isCheck.addClass("selected");
                }
            }
        }

        init.funTrStyle();
    });

    // 导出
    $("#export").click(function(e){
        // e.preventDefault();
        var sKeyword = encodeURIComponent($("#sKeyword").html()),
            cityid   = $("#cityid").val(),
            start    = $("#start").html(),
            end      = $("#end").html(),
            leimutype= $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "",
            pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
            page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

        var data = [];
        data.push("sKeyword="+sKeyword);
        data.push("cityid="+cityid);
        data.push("start="+start);
        data.push("end="+end);
        data.push("type="+leimutype);
        data.push("pagestep=200000");
        data.push("page=1");
        huoniao.showTip("loading", "正在导出，请稍候...", "auto");
        $(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));

    })
});

//获取列表
function getList(){
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    var sKeyword = encodeURIComponent($("#sKeyword").html()),
        cityid   = $("#cityid").val(),
        start    = $("#start").html(),
        end      = $("#end").html(),
        leimutype= $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("cityid="+cityid);
    data.push("start="+start);
    data.push("end="+end);
    data.push("type="+leimutype);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("maiDanOrder.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), listArr = [], i = 0, list = val.list;
        obj.attr("data-totalpage", val.pageInfo.totalPage);
        $(".totalCount").html(val.pageInfo.totalCount);
        $("#totalMoney").html(val.pageInfo.totalMoney);
        if(val.state == "100"){
            //huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();
            for(i; i < list.length; i++){
                listArr.push('<tr data-id="'+list[i].id+'">');
                listArr.push('  <td class="row10 left"><code>'+list[i].cityname+'</code><br /><small>'+list[i].ordernum+'</small></td>');

                if(list[i].userid!=-1){
                    listArr.push('  <td class="row10 left"><a href="javascript:;" data-id="'+list[i].userid+'" class="userinfo">'+list[i].nickname+'</a></td>');
                }else{
                    listArr.push('  <td class="row10 left">'+list[i].nickname+'</td>');
                }

                if(list[i].bid!=-1){
                    listArr.push('  <td class="row14 left"><a target="_blank" href="'+list[i].url+'">'+list[i].bname+'</a></td>');
                }else{
                    listArr.push('  <td class="row14 left">'+list[i].bname+'</td>');
                }

                listArr.push('  <td class="row8 left">'+list[i].amount+'</td>');
                listArr.push('  <td class="row8 left">'+(list[i].amount_alone > 0 ? list[i].amount_alone : '-')+'</td>');

                var sale = (list[i].amount-list[i].payamount).toFixed(2);
                listArr.push('  <td class="row8 left">'+(sale > 0 ? sale : '-')+'</td>');

                listArr.push('  <td class="row8 left">'+list[i].payamount+'</td>');
                listArr.push('  <td class="row8 left">'+(list[i].tg_yj > 0 ? (list[i].tg_yj + '<br /><code>' + (list[i].xinke ? '新客' : '老客') + list[i].yj_per + '%</code>') : '-')+'</td>');

                listArr.push('  <td class="row8 left">'+(list[i].pt_yj_per > 0 ? list[i].pt_yj + '<br /><code>'+list[i].pt_yj_per+'%</code>' : '-')+'</td>');

                listArr.push('  <td class="row8 left">'+list[i].daozhang+'</td>');

                listArr.push('  <td class="row10 left">'+list[i].paytype+'<br /><small>'+huoniao.transTimes(list[i].paydate,1)+'</small></td>');
                
                
            }

            obj.find("tbody").html(listArr.join(""));
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
