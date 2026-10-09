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

			//更新任务状态
			,opera: function(type, id, note = ''){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("?dopost=updateState", "type="+type+"&id="+id+"&note="+encodeURIComponent(note), function(data){
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

            //数据
            ,quickEdit0: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的订单！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            var button = [{
                                name: '关闭',
                                focus: true
                            }];

                            //只有审核中的才需要平台操作
                            if(data.state == 1){
                                button = [{
                                    name: '用户胜诉',
                                    callback: function(){
                                        var ret = prompt('请输入管理员备注');
                                        if(ret !== null && ret != '') {
                                            if(confirm('此操作不可恢复，您确定要判定用户胜诉吗？')){
                                                init.opera(1, id, ret);
                                                return true;
                                            };
                                            return true;
                                        }                                        
                                        return false;
                                    }
                                },{
                                    name: '商家/发布人胜诉',
                                    callback: function(){
                                        var ret = prompt('请输入管理员备注');
                                        if(ret !== null && ret != '') {
                                            if(confirm('此操作不可恢复，您确定要判定商家/发布人胜诉吗？')){
                                                init.opera(2, id, ret);
                                                return true;
                                            };
                                            return true;
                                        }                                        
                                        return false;
                                    }
                                },{
                                    name: '关闭',
                                    focus: true
                                }];
                            }

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '举报信息',
                                content: $("#editForm0").html(),
                                width: 700,
                                height: 600,
                                button: button
                            });
    
                            //填充信息
                            self.parent.$("#ordernum").html(data.ordernum);

                            var state = '';
                            if(data.state == 0){
                                state = '待对方辩诉';
                            }else if(data.state == 1){
                                state = '待平台审核';
                            }else if(data.state == 2){
                                state = '平台已审核通过';
                            }else if(data.state == 3){
                                state = '已自动结束';
                            }
                            self.parent.$("#state").html(state);

                            self.parent.$("#winner").html(data.state == 2 || data.state == 3 ? (data.winner == 1 ? '用户胜诉' : '商家/发布人胜诉') : '');

                            if(data.adminid > 0){
                                self.parent.$('.report_admin').show();
                                self.parent.$("#admin").html(data.admin);
                                self.parent.$("#note").html(data.note);
                                self.parent.$("#admin_time").html(data.admin_time > 0 ? huoniao.transTimes(data.admin_time, 1) : '');
                            }else{
                                self.parent.$('.report_admin').hide();
                            }

                            self.parent.$("#uid").html('<code>ID:' + data.uid + '</code>&nbsp;' + data.uname + (data.uid == data.sid ? '&nbsp;&nbsp;<span class="label label-info">商家/发布人</span>' : '&nbsp;&nbsp;<span class="label label-warning">用户</span>'));
                            self.parent.$("#reason").html(data.reason);

                            if(data.pics){
                                self.parent.$('.report_pics').show();
                                var pics = data.pics, picsHtml = [];
                                var picArr = pics.split('||');
                                for(var i = 0; i < picArr.length; i++){
                                    picsHtml.push('<a href="'+picArr[i]+'" target="_blank" style="margin-right: 10px;"><img src="'+picArr[i]+'" style="width: 100px; height: 100px; object-fit: cover;" /></a>');
                                }
                                self.parent.$("#pics").html(picsHtml.join(''));
                            }else{                                
                                self.parent.$('.report_pics').hide();
                            }
                            
                            if(data.video){
                                self.parent.$('.report_video').show();
                                self.parent.$("#video").html('<a href="/include/videoPreview.php?f=' + data.video + '" target="_blank">查看视频</a>');
                            }else{                                
                                self.parent.$('.report_video').hide();
                            }
                            self.parent.$("#pubdate").html(huoniao.transTimes(data.pubdate, 1));
                            self.parent.$("#expired").html(huoniao.transTimes(data.expired, 1));


                            self.parent.$("#mid").html('<code>ID:' + data.mid + '</code>&nbsp;' + data.mname + (data.mid == data.sid ? '&nbsp;&nbsp;<span class="label label-info">商家/发布人</span>' : '&nbsp;&nbsp;<span class="label label-warning">用户</span>'));
                            self.parent.$("#bs_reason").html(data.bs_reason);

                            if(data.bs_pics){
                                self.parent.$('.report_bs_pics').show();
                                var pics = data.bs_pics, picsHtml = [];
                                var picArr = pics.split('||');
                                for(var i = 0; i < picArr.length; i++){
                                    picsHtml.push('<a href="'+picArr[i]+'" target="_blank" style="margin-right: 10px;"><img src="'+picArr[i]+'" style="width: 100px; height: 100px; object-fit: cover;" /></a>');
                                }
                                self.parent.$("#bs_pics").html(picsHtml.join(''));
                            }else{                                
                                self.parent.$('.report_bs_pics').hide();
                            }
                            
                            if(data.bs_video){
                                self.parent.$('.report_bs_video').show();
                                self.parent.$("#bs_video").html('<a href="/include/videoPreview.php?f=' + data.bs_video + '" target="_blank">查看视频</a>');
                            }else{                                
                                self.parent.$('.report_bs_video').hide();
                            }
                            self.parent.$("#bs_pubdate").html(data.bs_pubdate > 0 ? huoniao.transTimes(data.bs_pubdate, 1) : '');
                            
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

            //数据
            ,quickEdit: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的订单！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("taskOrderList.php?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '订单信息',
                                content: $("#editForm").html(),
                                width: 700,
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
    
                    huoniao.operaJson("taskOrderList.php?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '订单信息',
                                content: $("#editForm1").html(),
                                width: 700,
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

            //查看
            ,quickEdit2: function(id){
                if(id == ""){
                    huoniao.showTip("warning", "请选择要查看的任务！", "auto");
                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("taskList.php?dopost=getDetail", "id="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();

                            $.dialog({
                                id: "taskDetail",
                                fixed: true,
                                title: '任务详情',
                                content: $("#editForm2").html(),
                                width: 700,
                                height: 600,
                                ok: true
                            });
    
                            //填充信息
                            self.parent.$("#tid").html(data.id);
                            self.parent.$("#title").html(data.title);
                            self.parent.$("#price").html(data.price + '，平台佣金：' + data.fabu_fee_amount);
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
                            
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

		};

    //填充操作人列表
    huoniao.buildAdminList($("#cadmin"), adminList, '请选择管理员');
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

	//详情
	$("#list").delegate(".detail", "click", function(){
		var id = $(this).attr("data-id");
		init.quickEdit0(id);
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

	//任务
	$("#list").delegate(".task", "click", function(){
		var id = $(this).attr("data-id");
		init.quickEdit2(id);
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
		admin    = $("#cadmin").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("admin="+admin);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, taskReport = val.taskReport;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < taskReport.length; i++){
				list.push('<tr data-id="'+taskReport[i].id+'">');
				list.push('  <td class="row2">&nbsp;</td>');

				list.push('  <td class="row20 left">'+taskReport[i].ordernum+'<br /><code class="uaccount" style="color: #999;">'+taskReport[i].title+'</code><br /><code class="uaccount" style="color: #999;">'+taskReport[i].typename+'</code><code class="uaccount" style="color: #999;">'+taskReport[i].project+'</code><code class="uaccount" style="color: #999;">赏金：'+taskReport[i].price+'元</code></td>');

				list.push('  <td class="row24 left">');
                
                var usertype = '';
                if(taskReport[i].utype == 'user'){
                    usertype = '<code class="uaccount" style="color: #999;">用户</code>';
                    if((taskReport[i].state == 2 || taskReport[i].state == 3) && taskReport[i].utype == 'user' && taskReport[i].winner == 1){
                        usertype += '<code class="uaccount" style="color: #d14;">胜诉</code>';
                    }
                }else{
                    usertype = '<code class="uaccount" style="color: #999;">商家</code>';
                    if((taskReport[i].state == 2 || taskReport[i].state == 3) && taskReport[i].utype == 'store' && taskReport[i].winner == 2){
                        usertype += '<code class="uaccount" style="color: #d14;">胜诉</code>';
                    }
                }
                list.push('<code class="uaccount" style="color: #999;">投诉人</code>'+usertype+'<a href="javascript:;" class="userinfo" data-id="'+taskReport[i].uid+'">'+taskReport[i].nickname+'</a>');
                list.push('<br />');

                var usertype = '';
                if(taskReport[i].utype == 'user'){
                    usertype = '<code class="uaccount" style="color: #999;">商家</code>';
                    if((taskReport[i].state == 2 || taskReport[i].state == 3) && taskReport[i].utype == 'user' && taskReport[i].winner == 2){
                        usertype += '<code class="uaccount" style="color: #d14;">胜诉</code>';
                    }
                }else{
                    usertype = '<code class="uaccount" style="color: #999;">用户</code>';
                    if((taskReport[i].state == 2 || taskReport[i].state == 3) && taskReport[i].utype == 'store' && taskReport[i].winner == 1){
                        usertype += '<code class="uaccount" style="color: #d14;">胜诉</code>';
                    }
                }
                list.push('<code class="uaccount" style="color: #999;">被投诉</code>'+usertype+'<a href="javascript:;" class="userinfo" data-id="'+taskReport[i].mid+'">'+taskReport[i].mname+'</a>');
                list.push('</td>');

				list.push('  <td class="row17 left"><small><span><code class="uaccount">审核</code>'+(taskReport[i].sh_time ? huoniao.transTimes(taskReport[i].sh_time, 1) : '')+'</span><br /><span><code class="uaccount">提交</code>'+(taskReport[i].tj_time ? huoniao.transTimes(taskReport[i].tj_time, 1) : '')+'</span><br /><span><code class="uaccount">领取</code>'+(taskReport[i].lq_time ? huoniao.transTimes(taskReport[i].lq_time, 1) : '')+'</span></small></td>');

                list.push('  <td class="row17 left"><small><span><code class="uaccount">通过</code>'+(taskReport[i].admin_time ? huoniao.transTimes(taskReport[i].admin_time, 1) : '')+'</span><br /><span><code class="uaccount">辩诉</code>'+(taskReport[i].bs_pubdate ? huoniao.transTimes(taskReport[i].bs_pubdate, 1) : '')+'</span><br /><span><code class="uaccount" title="辩诉过期时间">过期</code>'+(taskReport[i].expired ? huoniao.transTimes(taskReport[i].expired, 1) : '')+'</span><br /><span><code class="uaccount">提交</code>'+(taskReport[i].pubdate ? huoniao.transTimes(taskReport[i].pubdate, 1) : '')+'</span></small></td>');

                var state = "";
				if(taskReport[i].state == 0){
                    state = "<span class='gray'>维权中</span>";
                }else if(taskReport[i].state == 1){
                    state = "<span class='audit' style='color: #f89406;'>审核中</span>";
                }else if(taskReport[i].state == 2){
                    state = "<span class='audit' style='color: #62c462;'>已通过</span>";
                }else if(taskReport[i].state == 3){
                    state = "<span class='gray'>已结束</span>";
                }
				list.push('  <td class="row10 left">'+state+(taskReport[i].adminid > 0 ? '<br /><code class="uaccount" style="color: #999;" title="审核管理员">'+(taskReport[i].admin)+'</code>' : '')+'<br /><code class="uaccount" style="color: #999;">'+(taskReport[i].mid == taskReport[i].sid ? '用户举报商家' : '商家举报用户')+'</code></td>');

                var btn = '<a href="javascript:;" data-id="'+taskReport[i].id+'" class="link detail">举报详情</a><br /><a href="javascript:;" data-id="'+taskReport[i].oid+'" class="link data">提交数据</a><br /><a href="javascript:;" data-id="'+taskReport[i].oid+'" class="link log">提交记录</a><br /><a href="javascript:;" data-id="'+taskReport[i].tid+'" class="link task">任务详情</a>';
				list.push('  <td class="row10"><small style="padding: 0;">'+btn+'</small></td>');
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
