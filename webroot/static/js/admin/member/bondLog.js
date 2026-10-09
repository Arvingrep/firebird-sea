$(function(){
    huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

    var defaultBtn = $("#delBtn"),
        checkedBtn = $("#stateBtn"),
        init = {

            //选中样式切换
            funTrStyle: function(){
                return;
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

			//更新状态
			,opera: function(type, id, note = ''){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("?dopost=updateState", "type="+type+"&id="+id+"&note="+encodeURIComponent(note), function(data){
                    huoniao.hideTip();
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function(){
                            getList();
                        }, 1000);
                    }else{
                        $.dialog.alert(data.info);
                    }
                });
			}

        };

    //初始加载
    getList();

	//保障金设置
	$("#configBtn").click(function(e){

        $.dialog({
            fixed: true,
            title: '保障金设置',
            content: $("#settingHtml").html(),
            width: 500,
            ok: function(){
                //提交
                var note      = $.trim(self.parent.$("#note").val()),
                    reason    = $.trim(self.parent.$("#reason").val()),
                    least     = $.trim(self.parent.$("#least").val()),
                    serialize = self.parent.$(".quick-editForm").serialize();

                if(note == ""){
                    $.dialog.alert("请输入保障金说明");
                    return false;
                }

                if(least == "" || least == 0){
                    $.dialog.alert("请输入最少缴纳金额");
                    return false;
                }

                if(reason == ""){
                    $.dialog.alert("请输入提取原因");
                    return false;
                }

                huoniao.showTip("loading", "正在更新，请稍候...");

                huoniao.operaJson("../siteConfig/siteConfig.php?action=promotionConfig", serialize, function(data){
                    huoniao.showTip("success", "保存成功", "auto");
                    setTimeout(function(){
                        location.reload();
                    }, 2000);
                });

            },
            cancel: true
        });

	})

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
    $("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

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

	//单条通过
	$("#list").delegate(".tongguo", "click", function(){
        var id = $(this).attr('data-id');
		$.dialog.confirm('您确定要审核通过吗？<br />审核通过后，该笔金额将转入到会员账户余额！', function(){
			init.opera(1, id);
		});
	});

	//单条拒绝
	$("#list").delegate(".jujue", "click", function(){
        var id = $(this).attr('data-id');
		var ret = prompt('请输入审核失败的原因');
        if(ret !== null && ret != '') {
            init.opera(2, id, ret);
        }else{
            huoniao.showTip("warning", "操作失败，您没有输入审核失败的原因", "auto");
        }
	});

    // 导出
    $("#export").click(function(e){
        // e.preventDefault();
        var sKeyword = encodeURIComponent($("#sKeyword").html()),
            cityid   = $("#cityid").val(),
            start    = $("#start").html(),
            end      = $("#end").html(),
            type     = $("#typeBtn").attr("data-id") ? $("#typeBtn").attr("data-id") : "",
            state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
            shouru   = $("#shouruBtn").attr("data-id") ? $("#shouruBtn").attr("data-id") : "";
            pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
            page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

        var data = [];
        data.push("sKeyword="+sKeyword);
        data.push("cityid="+cityid);
        data.push("start="+start);
        data.push("end="+end);
        data.push("type="+type);
        data.push("state="+state);
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
        type     = $("#typeBtn").attr("data-id") ? $("#typeBtn").attr("data-id") : "",
        state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("sKeyword="+sKeyword);
    data.push("cityid="+cityid);
    data.push("start="+start);
    data.push("end="+end);
    data.push("type="+type);
    data.push("state="+state);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("bondLog.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), listArr = [], i = 0, list = val.list;
        obj.attr("data-totalpage", val.pageInfo.totalPage);
        $(".totalCount").html(Number(val.pageInfo.totalCount));
        $("#totalAdd").html(Number(val.info1['amount']));
        $("#totalLess").html(Number(val.info2['amount']));
        usable = Number(val.info3['amount'])-Number(val.info2['amount']);
        usable = usable < 0 ? 0 : usable;
        $("#totalUsable").html(usable.toFixed(2));
        $(".info1").html(val.info1['id']);
        $(".info2").html(val.info2['id']);

        $(".state0").html(Number(val.pageInfo.state0));
        $(".state1").html(Number(val.pageInfo.state1));
        $(".state2").html(Number(val.pageInfo.state2));

        if(val.state == "100"){
            //huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();
            for(i; i < list.length; i++){
                listArr.push('<tr data-id="'+list[i].id+'">');
                listArr.push('  <td class="row10 left">'+list[i].addrname+'</td>');
                var type = list[i].type==1?"缴纳":"提取";
                listArr.push('  <td class="row10 left">'+type+'</td>');
                var extract = '';
                if(list[i].type == 0){
                    extract = '<br />原因：' + list[i].title + '<br />说明：' + list[i].note;
                }else if(list[i].note != ''){
                    extract = '<br />原因：' + list[i].title + '<br />说明：' + list[i].note;
                }
                listArr.push('  <td class="row20 left">'+list[i].ordernum+extract+'</td>');
                var user_info = list[i].uid>0 ? 'href="javascript:;" data-id="'+list[i].uid+'" class="userinfo"' : 'data-id="'+list[i].uid+'"';
                listArr.push('  <td class="row15 left"><a '+user_info+'>'+list[i].nickname+'</a></td>');

                var amount = list[i].amount;
                if(list[i].type == 0){
                    amount = '<font color="#b1000f">- '+list[i].amount+'</font>';
                }else{
                    amount = '<font color="#30992e">+ '+list[i].amount+'</font>';
                }
                listArr.push('  <td class="row10 left">'+amount+'</td>');
                listArr.push('  <td class="row15 left">'+list[i].date+'</td>');

                var stateInfo = '';
                if(list[i].type == 1){
                    stateInfo = '<span class="audit">审核通过</span>';
                }else{
                    if(list[i].state == 0){
                        stateInfo = '<span class="gray">待审核</span>';
                    }else if(list[i].state == 1){
                        stateInfo = '<span class="audit">审核通过</span>';
                    }else if(list[i].state == 2){
                        stateInfo = '<span class="refuse statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="'+list[i].reason+'">审核失败 <i class="icon-question-sign" style="margin-top: 3px;"></i></span>';
                    }
                }

                listArr.push('  <td class="row10 left">'+stateInfo+'</td>');

                var opera = '';
                if(list[i].type == 0 && list[i].state == 0){
                    opera = '<a href="javascript:;" data-id="'+list[i].id+'" class="link tongguo">通过</a>&nbsp;&nbsp;<a href="javascript:;" data-id="'+list[i].id+'" class="link jujue">拒绝</a>';
                }

                listArr.push('  <td class="row10">'+opera+'</td>');
            }

            obj.find("tbody").html(listArr.join(""));
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();
            
            $('.statusTips1').tooltip();
        }else{

            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    },"json");

};
