$(function(){

	var defaultBtn = $("#delBtn"),
        init = {

            //选中样式切换
            funTrStyle: function(){
                var trLength = $("#list .item").length, checkLength = $("#list .selected").length;
                if(trLength == checkLength){
                    $("#selectBtn .check").removeClass("checked").addClass("checked");
                }else{
                    $("#selectBtn .check").removeClass("checked");
                }

                if(checkLength > 0){
                    defaultBtn.show();
                }else{
                    defaultBtn.hide();
                }
            },

            //新增
            quickEdit: function(id){
                var title = "创建小程序码";
                var dopost = "add";

                $.dialog({
                    fixed: true,
                    title: title,
                    content: $("#addForm").html(),
                    width: 730,
                    ok: function(){

                        //提交
                        var url  = $.trim(self.parent.$("#url").val());

                        if(url == ''){
                            alert('请输入要跳转的链接地址！');
                            return false;
                        }

                        huoniao.showTip("loading", "创建中，请稍候...");
                        huoniao.operaJson("wxMiniProgramScene.php?dopost=add", "url=" + encodeURIComponent(url), function(data){
                            if(data.state == 100){
                                huoniao.showTip("success", data.info, "auto");
                                setTimeout(function(){
                                    location.reload();
                                }, 300);
                            }else if(data.state == 101){
                                alert(data.info);
                                return false;
                            }else{
                                huoniao.showTip("error", data.info, "auto");
                            }
                        });

                    },
                    cancel: true
                });

            }

            //删除
            ,del: function(){
                var checked = $("#list .selected");
                if(checked.length < 1){
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                }else{
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    var id = [];
                    for(var i = 0; i < checked.length; i++){
                        id.push($("#list .selected:eq("+i+")").attr("data-id"));
                    }

                    huoniao.operaJson("wxMiniProgramScene.php?dopost=del", "id="+id, function(data){
                        if(data.state == 100){
                            huoniao.showTip('success', data.info, "auto");
                            $("#selectBtn a:eq(1)").click();
                            setTimeout(function(){
                                getList();
                            }, 500);
                        }else{
                            var info = [];
                            for(var i = 0; i < $("#list .item").length; i++){
                                var tr = $("#list .item:eq("+i+")");
                                for(var k = 0; k < data.info.length; k++){
                                    if(data.info[k] == tr.attr("data-id")){
                                        info.push("▪ "+tr.find("input").text());
                                    }
                                }
                            }
                            $.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
                }
            }

        };

    //搜索
    $("#searchBtn").bind("click", function(){
        $("#sKeyword").html($("#keyword").val());
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

    $("#pageBtn, #paginationBtn").delegate("a", "click", function(){
        var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
        obj.attr("data-id", id);
        if(obj.attr("id") == "paginationBtn"){
            var totalPage = $("#list").attr("data-totalpage");
            $("#list").attr("data-atpage", id);
            obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
        }else{
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

    //全选、不选
    $("#selectBtn a").bind("click", function(){
        var id = $(this).attr("data-id");
        if(id == 1){
            $("#selectBtn .check").addClass("checked");
            $("#list .item").removeClass("selected").addClass("selected");

            defaultBtn.show();
        }else{
            $("#selectBtn .check").removeClass("checked");
            $("#list .item").removeClass("selected");

            defaultBtn.hide();
        }
    });

    $('#list').delegate('.check', 'click', function(){
       var t = $(this), item = t.closest('.item');
       item.hasClass('selected') ? item.removeClass('selected') : item.addClass('selected');
       init.funTrStyle();
    });

    //删除
    $("#delBtn").bind("click", function(){
        $.dialog.confirm('确定要删除吗？', function(){
            init.del();
        });
    });

    //单条删除
    $("#list").delegate(".del", "click", function(){
        var t = $(this).closest('.item');
        $.dialog.confirm('确定要删除吗？', function(){
            t.addClass('selected').siblings('.item').removeClass('selected');
            init.del();
        });
    });

	//新增邮箱帐号
	$("#addNew").bind("click", function(){
		init.quickEdit();
	});

	//排序
    $('.orderby').bind('click', function(){
       var t = $(this);
       t.hasClass('curr') ? t.removeClass('curr').html('按访问次数排序') : t.addClass('curr').html('按默认排序');
        $("#list").attr("data-atpage", 1);
        getList();
    });

    $('#list').delegate('.item', 'mouseover', function(){
       $(this).siblings('.item').addClass('blur');
    });
    $('#list').delegate('.item', 'mouseout', function(){
        $(this).siblings('.item').removeClass('blur');
    });

	//列表数据
    getList();

});


function getList() {
    huoniao.showTip("loading", "正在操作，请稍候...");
    var keyword = encodeURIComponent($("#sKeyword").html()),
        pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "20",
        orderby  = $(".orderby").hasClass('curr') ? 1 : 0,
        page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

    var data = [];
    data.push("keyword="+keyword);
    data.push("orderby="+orderby);
    data.push("pagestep="+pagestep);
    data.push("page="+page);

    huoniao.operaJson("wxMiniProgramScene.php?dopost=getList", data.join("&"), function(val){
        var obj = $("#list"), list = [], i = 0, listArr = val.list;
        if(val.state == "100"){
            huoniao.hideTip();

            obj.attr("data-totalpage", val.pageInfo.totalPage);

            for(i; i < listArr.length; i++){
                list.push('<div class="item" data-id="'+listArr[i].id+'">');
                list.push('<div class="oper"><span class="check"></span><span class="del"></span></div>');
                list.push('<img src="'+cfg_attachment+listArr[i].fid+'" />');
                list.push('<input type="text" value="'+listArr[i].url+'" readonly />');
                list.push('<div class="clear">');
                list.push('<span>'+huoniao.transTimes(listArr[i].date, 2)+'</span>');
                list.push('<em>访问'+listArr[i].count+'次</em>');
                list.push('</div></div>');
            }

            obj.html(list.join(""));
            huoniao.showPageInfo();
        }else{
            obj.attr("data-totalpage", "1");
            huoniao.showPageInfo();
            obj.html('<div class="loading">' + val.info + '</div>');
            huoniao.showTip("warning", val.info, "auto");
        }
    });
}