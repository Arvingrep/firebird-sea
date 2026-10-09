$(function(){

	var defaultBtn = $("#operaBtn, .statusTips"),
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

            //树形递归分类
            ,treeTypeList: function(id){
                var l=levelListArr.length, typeList = [], cl = "", level = 0;
                for(var i = 0; i < l; i++){
                    (function(){
                        var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
                        //选中
                        if(id == jsonArray["id"]){
                            selected = " selected";
                        }
                        typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+jsonArray["typename"]+'</option>');
                        
                    })(levelListArr[i]);
                }
                return typeList.join("");
            }

			//更新任务状态
			,opera: function(type, id, note = ''){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("?dopost=updateState", "type="+type+"&ids="+id+"&note="+encodeURIComponent(note), function(data){
                    huoniao.hideTip();
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        $("#selectBtn a:eq(1)").click();
                        setTimeout(function(){
                            getList();
                        }, 1000);
                    }else{
                        $.dialog.alert(data.info);
                    }
                });
                $("#selectBtn a:eq(1)").click();
			}

            //查看
            ,quickEdit: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的任务！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            var button = [];

                            //未付款
                            if(data.state == 0 && data.haspay == 0){
                                button.push({
                                    name: '删除任务',
                                    callback: function(){
                                        if(confirm('此操作不可恢复，您确定要删除此任务吗？\r\n已经付款的任务将会自动把费用退还到发布人的账户余额中！')){
                                            init.opera(3, id);
                                            return true;
                                        };
                                        return false;
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                });
                            }

                            //未审核
                            if(data.state == 0 && data.haspay == 1){
                                button.push({
                                    name: '平台说明',
                                    callback: function(){
                                        var ret = prompt('请输入平台说明');
                                        if(ret !== null && ret != '') {
                                            init.opera(6, id, ret);
                                            return true;
                                        }
                                        return false;
                                    }
                                },{
                                    name: '删除任务',
                                    callback: function(){
                                        if(confirm('此操作不可恢复，您确定要删除此任务吗？\r\n已经付款的任务将会自动把费用退还到发布人的账户余额中！')){
                                            init.opera(3, id);
                                            return true;
                                        };
                                        return false;
                                    }
                                },{
                                    name: '通过审核',
                                    callback: function(){
                                        init.opera(1, id);
                                    }
                                },{
                                    name: '审核拒绝',
                                    callback: function(){
                                        var ret = prompt('请输入审核拒绝的原因');
                                        if(ret !== null && ret != '') {
                                            init.opera(2, id, ret);
                                            return true;
                                        }
                                        return false;
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                });
                            }

                            //已审核
                            if(data.state == 1){
                                if(data.finish == 1){
                                    button.push({
                                        name: '关闭',
                                        focus: true
                                    });
                                }else{
                                    button.push({
                                        name: '平台说明',
                                        callback: function(){
                                            var ret = prompt('请输入平台说明');
                                            if(ret !== null && ret != '') {
                                                init.opera(6, id, ret);
                                                return true;
                                            }
                                            return false;
                                        }
                                    },{
                                        name: '冻结任务',
                                        callback: function(){
                                            var ret = prompt('请输入冻结任务的原因');
                                            if(ret !== null && ret != '') {
                                                init.opera(4, id, ret);
                                                return true;
                                            }
                                            return false;
                                        }
                                    },{
                                        name: '关闭',
                                        focus: true
                                    });
                                }
                            }

                            //拒绝审核
                            if(data.state == 2){
                                button.push({
                                    name: '删除任务',
                                    callback: function(){
                                        if(confirm('此操作不可恢复，您确定要删除此任务吗？\r\n已经付款的任务将会自动把费用退还到发布人的账户余额中！')){
                                            init.opera(3, id);
                                            return true;
                                        };
                                        return false;
                                    }
                                },{
                                    name: '通过审核',
                                    callback: function(){
                                        init.opera(1, id);
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                });
                            }

                            //已暂停
                            if(data.state == 3){
                                button.push({
                                    name: '冻结任务',
                                    callback: function(){
                                        var ret = prompt('请输入冻结任务的原因');
                                        if(ret !== null && ret != '') {
                                            init.opera(4, id, ret);
                                            return true;
                                        }
                                        return false;
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                });
                            }

                            //已冻结
                            if(data.state == 4){
                                button.push({
                                    name: '取消冻结',
                                    callback: function(){
                                        init.opera(5, id);
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                });
                            }

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '任务详情',
                                content: $("#editForm").html(),
                                width: 700,
                                height: 600,
                                button: button
                            });
    
                            //填充信息
                            self.parent.$("#title").html(data.title);
                            self.parent.$("#tj_time").html(data.tj_time);
                            self.parent.$("#sh_time").html(data.sh_time);

                            //有极速审核
                            if(data.js_began_time && data.js_end_time){
                                self.parent.$('.js_sh_obj').show();
                                self.parent.$("#js_sh_time").html(data.js_sh_time);
                                self.parent.$("#js_began_time").html(huoniao.transTimes(data.js_began_time, 1));
                                self.parent.$("#js_end_time").html(huoniao.transTimes(data.js_end_time, 1));

                                var js_logArr = data.js_log;
                                var js_logHtml = [];
                                if(js_logArr){
                                    for(var i = 0; i < js_logArr.length; i++){
                                        js_logHtml.push('<div class="task-items">');
                                        js_logHtml.push('<p style="margin:0;">开始时间：'+huoniao.transTimes(js_logArr[i].began, 1)+'</p>');
                                        js_logHtml.push('<p style="margin:0;">结束时间：'+huoniao.transTimes(js_logArr[i].end, 1)+'</p>');
                                        js_logHtml.push('<p style="margin:0;">审核限时：'+js_logArr[i].sh_time+'分钟</p>');
                                        js_logHtml.push('<p style="margin:0;">设置时间：'+huoniao.transTimes(js_logArr[i].time, 1)+'</p>');
                                        js_logHtml.push('</div>');
                                    }
                                }
                                self.parent.$("#js_log").html(js_logHtml.join(''));
                            }else{
                                self.parent.$('.js_sh_obj').hide();
                            }

                            self.parent.$("#note").html(data.note);
                            self.parent.$("#platform_tips").html(data.platform_tips ? data.platform_tips : '无');
                            if(data.video){
                                self.parent.$("#video").html('<a href="/include/videoPreview.php?f='+data.video+'" target="_blank">预览视频</a>');
                            }else{
                                self.parent.$("#video").closest('dl').hide();
                            }
                            self.parent.$("#amount").html(data.amount + '元 ');
                            self.parent.$("#pay_type").html(data.pay_type);
                            self.parent.$("#pay_time").html(huoniao.transTimes(data.pay_time, 1));

                            //任务步骤
                            var stepsArr = data.steps;
                            var stepsHtml = [];
                            if(stepsArr){
                                for(var i = 0; i < stepsArr.length; i++){
                                    stepsHtml.push('<div class="task-items">')
                                    stepsHtml.push('<p><code>步骤'+(i+1)+'</code> ' + stepsArr[i].note + '</p>');
                                    if(stepsArr[i].type == 'website'){
                                        stepsHtml.push('<p>网址：<a href="' + (stepsArr[i].value.indexOf('http') > -1 ? stepsArr[i].value : 'http://' + stepsArr[i].value) + '" target="_blank">' + stepsArr[i].value + '</a></p>');
                                    }else if(stepsArr[i].type == 'qr' || stepsArr[i].type == 'image' || stepsArr[i].type == 'save-image'){
                                        stepsHtml.push('<p><a href="' + stepsArr[i].value + '" target="_blank" title="点击查看图片"><img class="task-image" src="' + stepsArr[i].value + '" /></a></p>');
                                    }else if(stepsArr[i].type == 'video' || stepsArr[i].type == 'save-video'){
                                        stepsHtml.push('<p><a href="/include/videoPreview.php?f=' + stepsArr[i].value + '" target="_blank">查看视频</a></p>');
                                    }else if(stepsArr[i].type == 'copy' || stepsArr[i].type == 'text' || stepsArr[i].type == 'save-text'){
                                        stepsHtml.push('<p>' + stepsArr[i].value + '</p>');
                                    }
                                    stepsHtml.push('</div>')
                                }
                            }
                            self.parent.$("#steps").html(stepsHtml.join(''));

                            //修改前的任务步骤
                            var stepsArr = data.steps_last_edit;
                            if(stepsArr.length > 0){
                                var stepsHtml = [];
                                for(var i = 0; i < stepsArr.length; i++){
                                    stepsHtml.push('<div class="task-items">')
                                    stepsHtml.push('<p><code>步骤'+(i+1)+'</code> ' + stepsArr[i].note + '</p>');
                                    if(stepsArr[i].type == 'website'){
                                        stepsHtml.push('<p>网址：<a href="' + (stepsArr[i].value.indexOf('http') > -1 ? stepsArr[i].value : 'http://' + stepsArr[i].value) + '" target="_blank">' + stepsArr[i].value + '</a></p>');
                                    }else if(stepsArr[i].type == 'qr' || stepsArr[i].type == 'image' || stepsArr[i].type == 'save-image'){
                                        stepsHtml.push('<p><a href="' + stepsArr[i].value + '" target="_blank" title="点击查看图片"><img class="task-image" src="' + stepsArr[i].value + '" /></a></p>');
                                    }else if(stepsArr[i].type == 'video' || stepsArr[i].type == 'save-video'){
                                        stepsHtml.push('<p><a href="/include/videoPreview.php?f=' + stepsArr[i].value + '" target="_blank">查看视频</a></p>');
                                    }else if(stepsArr[i].type == 'copy' || stepsArr[i].type == 'text' || stepsArr[i].type == 'save-text'){
                                        stepsHtml.push('<p>' + stepsArr[i].value + '</p>');
                                    }
                                    stepsHtml.push('</div>')
                                }
                                self.parent.$("#steps_last_edit").html(stepsHtml.join(''));
                                self.parent.$('.steps_last_edit').show();
                            }else{
                                self.parent.$('.steps_last_edit').hide();
                            }
                            
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

		};

    $('.statusTips').tooltip();


	//填充城市列表
	$(".chosen-select").chosen();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
		$("#startMoney").html($("#sprice").val());
		$("#endMoney").html($("#eprice").val());
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
	$("#stateBtn, #pendBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(id == 'noopr'){//余额统计和积分统计 不触发
			$('#stateBtn').removeClass('open');
			return false;
		}
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

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			defaultBtn.show();
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
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

	//批量操作
	$("#operaBtn").delegate("a", "click", function(){
        var t = $(this), type = t.attr('data-id');

        var id = [];
        var checked = $("#list tbody tr.selected");
        if(checked.length < 1){
            huoniao.showTip("warning", "未选中任何信息！", "auto");
            return;
        }else{
            for(var i = 0; i < checked.length; i++){
                id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
            }
        }

            
        var title = '';
        if(type == 1){
            title = '您确定要审核通过选中的任务吗？';
        }else if(type == 2){

            var ret = prompt('请输入审核拒绝的原因');
            if(ret !== null && ret != '') {
                init.opera(2, id, ret);
            }else{
                huoniao.showTip("warning", "操作失败，您没有输入审核拒绝的原因", "auto");
            }
            return;

        }else if(type == 3){
            title = '此操作不可恢复，您确定要删除选中的任务吗？<br />已经付款的任务将会自动把费用退还到发布人的账户余额中！';

        }else if(type == 4){

            var ret = prompt('请输入冻结任务的原因');
            if(ret !== null && ret != '') {
                init.opera(4, id, ret);
            }else{
                huoniao.showTip("warning", "操作失败，您没有输入冻结任务的原因", "auto");
            }
            return;

        }else if(type == 5){
            title = '您确定要取消冻结选中的任务吗？<br />取消冻结后任务状态将更新为：已审核';
        }
		$.dialog.confirm(title, function(){
			init.opera(type, id);
		});
	});

	//单条删除
	$("#list").delegate(".delete", "click", function(){
        var id = $(this).attr('data-id');
		$.dialog.confirm('此操作不可恢复，您确定要删除此任务吗？<br />已经付款的任务将会自动把费用退还到发布人的账户余额中！', function(){
			init.opera(3, id);
		});
	});

	//单条通过
	$("#list").delegate(".tongguo", "click", function(){
        var id = $(this).attr('data-id');
		$.dialog.confirm('您确定要审核通过此任务吗？', function(){
			init.opera(1, id);
		});
	});

	//单条拒绝
	$("#list").delegate(".jujue", "click", function(){
        var id = $(this).attr('data-id');
		var ret = prompt('请输入审核拒绝的原因');
        if(ret !== null && ret != '') {
            init.opera(2, id, ret);
        }else{
            huoniao.showTip("warning", "操作失败，您没有输入审核拒绝的原因", "auto");
        }
	});

	//单条冻结
	$("#list").delegate(".dongjie", "click", function(){
        var id = $(this).attr('data-id');
        var ret = prompt('请输入冻结任务的原因');
        if(ret !== null && ret != '') {
            init.opera(4, id, ret);
        }else{
            huoniao.showTip("warning", "操作失败，您没有输入冻结任务的原因", "auto");
        }
	});

	//单条取消冻结
	$("#list").delegate(".qxdongjie", "click", function(){
        var id = $(this).attr('data-id');
		$.dialog.confirm('您确定要取消冻结此任务吗？<br />取消冻结后任务状态将更新为：已审核', function(){
			init.opera(5, id);
		});
	});

	//查看
	$("#list").delegate(".preview", "click", function(){
		var id = $(this).attr("data-id");
		init.quickEdit(id);
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		startMoney = $("#startMoney").html(),
		endMoney   = $("#endMoney").html(),
		level    = $("#clevel").val(),
		typeid   = $("#ctype").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("startMoney="+startMoney);
		data.push("endMoney="+endMoney);
		data.push("level="+level);
		data.push("typeid="+typeid);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, taskList = val.taskList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state01").html(val.pageInfo.state01);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state5").html(val.pageInfo.state5);
		$(".state6").html(val.pageInfo.state6);
		$(".state7").html(val.pageInfo.state7);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < taskList.length; i++){
				list.push('<tr data-id="'+taskList[i].id+'">');
				list.push('  <td class="row2"><span class="check"></span></td>');
                
                //会员头像
				var photo;
				if(taskList[i].photo.indexOf('http') > -1){
					photo = taskList[i].photo;
				}else{
					photo = cfg_attachment + taskList[i].photo + '&type=small';
				}

                //会员等级信息
                var level = '';
                if(taskList[i].level && taskList[i].level.name){
                    level = '<code style="color: '+taskList[i].level.fontcolor+'; background: '+taskList[i].level.bgcolor+'; border-color: '+taskList[i].level.bgcolor+'; margin-left: 5px; overflow: hidden;">'+taskList[i].level.name+'</code>';
                }
                
                //任务标签
                var labelArr = [];

                if(taskList[i].isbid){
                    labelArr.push('<span class="label label-info statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="开始时间：'+huoniao.transTimes(taskList[i].bid_began_time, 1)+'，结束时间：'+huoniao.transTimes(taskList[i].bid_end_time, 1)+'，共：'+((taskList[i].bid_end_time-taskList[i].bid_began_time)/3600)+'小时" style="margin-right:3px">推荐</span>');
                }

                if(taskList[i].sh_time <= 60 && taskList[i].js_began_time > 0 && taskList[i].js_end_time > 0){
                    labelArr.push('<span class="label label-warning statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="开始时间：'+huoniao.transTimes(taskList[i].js_began_time, 1)+'，结束时间：'+huoniao.transTimes(taskList[i].js_end_time, 1)+'，审核限时：'+taskList[i].js_sh_time+'分钟" style="margin-right:3px">极速</span>');
                }

                if(taskList[i].isfirst){
                    labelArr.push('<span class="label label-success" style="margin-right:3px">首发</span>');
                }

				list.push('  <td class="row6 left">'+taskList[i].id+'</td>');
				list.push('  <td class="row20 left">'+taskList[i].title+'<br />'+labelArr.join('')+'<code class="uaccount" style="color: #999;">'+taskList[i].typename+'</code><code class="uaccount" style="color: #999;">'+taskList[i].project+'</code></td>');
				list.push('  <td class="row17 left"><a href="javascript:;" class="userinfo" data-id="'+taskList[i].uid+'"><img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="'+photo+'" class="litpic" style="width:60px; height:60px;" /><span>'+taskList[i].nickname+'</span></a><br /><code>保障金：'+taskList[i].promotion+'元</code>'+level+'</td>');

                var number = '';
                if(taskList[i].number == 0){
                    number = '每人1次';
                }else if(taskList[i].number == 1){
                    number = '每天1次';
                }else if(taskList[i].number == 2){
                    number = '每人3次';
                }
				list.push('  <td class="row10 left"><small><span><code class="uaccount">单价</code>'+taskList[i].price+'元<code title="平台佣金" style="margin-left: 5px;">'+taskList[i].fabu_fee_amount+'</code></span><br /><span><code class="uaccount">名额</code>'+taskList[i].quota+'次</span><br /><span><code class="uaccount">次数</code>'+number+'</span></small></td>');
				list.push('  <td class="row15 left"><small><span><code class="uaccount">刷新</code>'+(taskList[i].refresh_time ? huoniao.transTimes(taskList[i].refresh_time, 1) : '')+'</span><br /><span><code class="uaccount">审核</code>'+(taskList[i].audit_time ? huoniao.transTimes(taskList[i].audit_time, 1) : '')+'</span><br /><span><code class="uaccount">发布</code>'+huoniao.transTimes(taskList[i].pubdate, 1)+'</span></small></td>');
				list.push('  <td class="row10 left"><small><span><code class="uaccount">剩余</code>'+(taskList[i].quota - taskList[i].statistics.used)+'</span><br /><span><code class="uaccount">待审</code>'+taskList[i].statistics.review+'</span><br /><span><code class="uaccount">通过</code>'+taskList[i].statistics.valid+'</span></small></td>');

                var state = "";
				if(taskList[i].state == 0 && taskList[i].haspay == 0){
                    state = "<span class='gray'>待付款</span>";
                }else if(taskList[i].state == 0){
                    if(taskList[i].review != ''){
                        state = "<span class='refuse statusTips1' data-toggle='tooltip' data-placement='bottom' data-original-title='"+taskList[i].review+"'>"+(taskList[i].review == '进行中的任务修改了任务步骤' ? '任务步骤修改审核' : '重新提交审核')+" <i class='icon-question-sign' style='margin-top: 3px;'></i></span>";
                    }else{
                        state = "<span class='gray'>待审核</span>";
                    }
                }else if(taskList[i].state == 1){
                    if(taskList[i].finish == 1){
                        state = "<span class='audit' style='color: #62c462;'>已完成</span>";
                    }else{
                        state = "<span class='audit'>已审核</span>";
                    }
                }else if(taskList[i].state == 2){
                    state = "<span class='refuse statusTips1' data-toggle='tooltip' data-placement='bottom' data-original-title='"+taskList[i].review+"'>审核拒绝 <i class='icon-question-sign' style='margin-top: 3px;'></i></span>";
                }else if(taskList[i].state == 3){
                    state = "<span class='gray'>已暂停</span>";
                }else if(taskList[i].state == 4){
                    state = "<span class='refuse statusTips1' data-toggle='tooltip' data-placement='bottom' data-original-title='"+taskList[i].review+"'>已冻结 <i class='icon-question-sign' style='margin-top: 3px;'></i></span>";
                }
				list.push('  <td class="row10 left">'+state+'</td>');

                var btnArr = [];

                //未审核、审核拒绝
                if(taskList[i].state == 0 || taskList[i].state == 2){
                    btnArr.push('&nbsp;&nbsp;<a href="javascript:;" data-id="'+taskList[i].id+'" class="link delete" style="color: #f00;">删除</a>');
                }
                //已审核、已暂停
                if(taskList[i].state == 1 || taskList[i].state == 3){
                    if(taskList[i].finish == 0){
                        btnArr.push('&nbsp;&nbsp;<a href="javascript:;" data-id="'+taskList[i].id+'" class="link dongjie" style="color: #f89406;">冻结</a>');
                    }
                }
                //已冻结
                if(taskList[i].state == 4){
                    btnArr.push('&nbsp;&nbsp;<a href="javascript:;" data-id="'+taskList[i].id+'" class="link qxdongjie" style="color: #f89406;">取消冻结</a>');
                }
                //未审核
                if(taskList[i].state == 0 && taskList[i].haspay == 1){
                    btnArr.push('<br /><a href="javascript:;" data-id="'+taskList[i].id+'" class="link tongguo">通过</a>&nbsp;&nbsp;<a href="javascript:;" data-id="'+taskList[i].id+'" class="link jujue">拒绝</a>');
                }
                //审核拒绝
                if(taskList[i].state == 2){
                    btnArr.push('<br /><a href="javascript:;" data-id="'+taskList[i].id+'" class="link tongguo">通过</a>');
                }
				list.push('  <td class="row10"><a href="javascript:;" data-id="'+taskList[i].id+'" class="link preview">查看</a>'+btnArr.join('')+'</td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
            
            $('.statusTips1').tooltip();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
