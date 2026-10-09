$(function(){

	var defaultBtn = $("#aa"),
		checkedBtn = $("#bb"),
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

            //数据
            ,quickEdit: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的订单！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '订单信息',
                                content: $("#editForm").html(),
                                width: 600,
                                height: 600,
                                ok: true
                            });
    
                            //填充信息
                            self.parent.$("#ordernum").html(data.ordernum);

                            //任务步骤
                            var stepsArr = data.tj_data;
                            var stepsHtml = [];
                            if(stepsArr){
                                for(var i = 0; i < stepsArr.length; i++){
                                    stepsHtml.push('<div class="task-items">')
                                    stepsHtml.push('<p>' + stepsArr[i].note + '</p>');
                                    if(stepsArr[i].type == 'save-image'){
                                        stepsHtml.push('<p><a href="' + stepsArr[i].value + '" target="_blank" title="点击查看图片"><img class="task-image" src="' + stepsArr[i].value + '" /></a></p>');
                                    }else if(stepsArr[i].type == 'save-video'){
                                        stepsHtml.push('<p><a href="/include/videoPreview.php?f=' + stepsArr[i].value + '" target="_blank">查看视频</a></p>');
                                    }else if(stepsArr[i].type == 'save-text'){
                                        stepsHtml.push('<p>' + stepsArr[i].value + '</p>');
                                    }
                                    stepsHtml.push('</div>')
                                }
                            }
                            self.parent.$("#tj_data").html(stepsHtml.join(''));
                            
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

            //记录
            ,quickEdit1: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的订单！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '订单信息',
                                content: $("#editForm1").html(),
                                width: 600,
                                height: 600,
                                ok: true
                            });
    
                            //填充信息
                            self.parent.$("#ordernum").html(data.ordernum);

                            //提交记录
                            var stepsArr = data.tj_log;
                            var stepsHtml = [];
                            if(stepsArr){
                                for(var i = 0; i < stepsArr.length; i++){
                                    stepsHtml.push('<div class="task-items">')
                                    stepsHtml.push('<p><code>ID：'+stepsArr[i].uid+'</code> ' + stepsArr[i].nickname + (data.sid == stepsArr[i].uid ? ' <span class="label label-info">发布人</span>' : ' <span class="label label-warning">提交人</span>') + '</p><p>时间：'+huoniao.transTimes(stepsArr[i].time, 1)+'</p><p>标题：'+stepsArr[i].title+'</p>');
                                    if(stepsArr[i].value){
                                        stepsHtml.push('<p>');
                                        var imagesArr = stepsArr[i].value.split('||');
                                        for(var g = 0; g < imagesArr.length; g++){
                                            if(imagesArr[g]){
                                                if(imagesArr[g].indexOf('mp4') > -1){
                                                    stepsHtml.push('<a href="' + imagesArr[g] + '" target="_blank" title="点击查看视频"><img class="task-image" src="/static/images/mp4.png" /></a>');
                                                }else{
                                                    stepsHtml.push('<a href="' + imagesArr[g] + '" target="_blank" title="点击查看图片"><img class="task-image" src="' + imagesArr[g] + '" /></a>');
                                                }
                                            }
                                        }
                                        stepsHtml.push('</p>');
                                    }
                                    stepsHtml.push('</div>')
                                }
                            }
                            self.parent.$("#tj_log").html(stepsHtml.join(''));
                            
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

		};

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

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

	//数据
	$("#list").delegate(".data", "click", function(){
		var id = $(this).attr("data-id");
		init.quickEdit(id);
	});

	//记录
	$("#list").delegate(".log", "click", function(){
		var id = $(this).attr("data-id");
		init.quickEdit1(id);
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
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, taskOrderList = val.taskOrderList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state01").html(val.pageInfo.state01);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < taskOrderList.length; i++){
				list.push('<tr data-id="'+taskOrderList[i].id+'">');
				list.push('  <td class="row2">&nbsp;</td>');
                
                //会员头像
				var photo;
				if(taskOrderList[i].photo.indexOf('http') > -1){
					photo = taskOrderList[i].photo;
				}else{
					photo = cfg_attachment + taskOrderList[i].photo + '&type=small';
				}

                //会员等级信息
                var level = '';
                if(taskOrderList[i].level && taskOrderList[i].level.name){
                    level = '<code style="color: '+taskOrderList[i].level.fontcolor+'; background: '+taskOrderList[i].level.bgcolor+'; border-color: '+taskOrderList[i].level.bgcolor+'; margin-right: 5px; overflow: hidden;">'+taskOrderList[i].level.name+'</code>';
                }

                var number = '';
                if(taskOrderList[i].number == 0){
                    number = '每人1次';
                }else if(taskOrderList[i].number == 1){
                    number = '每天1次';
                }else if(taskOrderList[i].number == 2){
                    number = '每人3次';
                }

				list.push('  <td class="row15 left">'+taskOrderList[i].ordernum+'<br /><code class="uaccount" style="color: #999;">金额：'+taskOrderList[i].price+'元'+(taskOrderList[i].price_add ? '，多领' + taskOrderList[i].price_add + '元' : '')+'</code></td>');
				list.push('  <td class="row20 left">'+taskOrderList[i].title+'</a><br /><code class="uaccount" style="color: #999;">'+taskOrderList[i].typename+'</code><code class="uaccount" style="color: #999;">'+taskOrderList[i].project+'</code><code class="uaccount" style="color: #999;">'+number+'</code></td>');
				list.push('  <td class="row20 left"><a href="javascript:;" class="userinfo" data-id="'+taskOrderList[i].uid+'"><img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="'+photo+'" class="litpic" style="width:60px; height:60px;" /><span>'+taskOrderList[i].nickname+'</span></a><br />'+level+'</td>');
				list.push('  <td class="row20 left"><small><span><code class="uaccount">审核</code>'+(taskOrderList[i].sh_time ? huoniao.transTimes(taskOrderList[i].sh_time, 1) : '')+'</span><br /><span><code class="uaccount">提交</code>'+(taskOrderList[i].tj_time ? huoniao.transTimes(taskOrderList[i].tj_time, 1) : '')+'</span><br /><span><code class="uaccount">领取</code>'+(taskOrderList[i].lq_time ? huoniao.transTimes(taskOrderList[i].lq_time, 1) : '')+'</span></small></td>');

                var state = "";
				if(taskOrderList[i].state == 0){
                    state = "<span class='gray'>待提交</span>";
                }else if(taskOrderList[i].state == 1){
                    state = "<span class='audit' style='color: #f89406;'>审核中</span>";
                }else if(taskOrderList[i].state == 2){
                    state = "<span class='audit'>已通过</span>";
                }else if(taskOrderList[i].state == 3){
                    state = "<span class='refuse statusTips1' data-toggle='tooltip' data-placement='bottom' data-original-title='"+taskOrderList[i].sh_explain+"'>未通过 <i class='icon-question-sign' style='margin-top: 3px;'></i></span>";
                }else if(taskOrderList[i].state == 4){
                    state = "<span class='gray'>已失效</span>";
                }
				list.push('  <td class="row10 left">'+state+'</td>');

                var btn = '&nbsp;';
                if(taskOrderList[i].state != 0){
                    btn = '<a href="javascript:;" data-id="'+taskOrderList[i].id+'" class="link data">数据</a>&nbsp;&nbsp;<a href="javascript:;" data-id="'+taskOrderList[i].id+'" class="link log">记录</a>';
                }
				list.push('  <td class="row13">'+btn+'</td>');
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
