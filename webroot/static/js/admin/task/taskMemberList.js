$(function(){

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn, #pendBtn"),
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

            //快速编辑
            ,quickEdit: function(id, rank){
                if(id == ""){
                    
                    $.dialog({
                        fixed: true,
                        title: '新增会员',
                        content: $("#editForm").html(),
                        width: 460,
                        ok: function(){
                            //提交
                            var uid  = self.parent.$("#uid").val(),
                                level = self.parent.$("#level").val(),
                                serialize = self.parent.$(".quick-editForm").serialize();

                            if(!uid){
                                alert("请输入会员ID");
                                return false;
                            }

                            if(!level){
                                alert("请选择会员等级");
                                return false;
                            }

                            huoniao.operaJson("?dopost=operMember", serialize, function(data){
                                if(data.state == 100){
                                    huoniao.showTip("success", data.info, "auto");
                                    setTimeout(function() {
                                        location.reload();
                                    }, 800);
                                }else if(data.state == 101){
                                    alert(data.info);
                                    return false;
                                }else{
                                    huoniao.showTip("error", data.info, "auto");
                                    location.reload();
                                }
                            });

                        },
                        cancel: true
                    });
                    
                    self.parent.$("#level").html(init.treeTypeList(0));

                }else{
                    huoniao.showTip("loading", "正在获取信息，请稍候...");
    
                    huoniao.operaJson("?dopost=getMemberDetail", "uid="+id, function(data){
                        if(data != null){
                            data = data[0];
                            huoniao.hideTip();
                            //huoniao.showTip("success", "获取成功！", "auto");
                            $.dialog({
                                fixed: true,
                                title: '修改会员',
                                content: $("#editForm").html(),
                                width: 460,
                                ok: function(){
                                    //提交
                                    var uid  = self.parent.$("#uid").val(),
                                        level = self.parent.$("#level").val(),
                                        serialize = self.parent.$(".quick-editForm").serialize();
    
                                    if(!uid){
                                        alert("请输入会员ID");
                                        return false;
                                    }

                                    if(!level){
                                        alert("请选择会员等级");
                                        return false;
                                    }
    
                                    huoniao.operaJson("?dopost=operMember", serialize, function(data){
                                        if(data.state == 100){
                                            huoniao.showTip("success", data.info, "auto");
                                            setTimeout(function() {
                                                getList();
                                            }, 800);
                                        }else if(data.state == 101){
                                            alert(data.info);
                                            return false;
                                        }else{
                                            huoniao.showTip("error", data.info, "auto");
                                            getList();
                                        }
                                    });
    
                                },
                                cancel: true
                            });
    
                            //填充信息
                            self.parent.$("#uid").val(data.uid);
                            self.parent.$("#level").html(init.treeTypeList(data.level));
                            self.parent.$("#refresh_coupon").val(data.refresh_coupon);
                            self.parent.$("#bid_coupon").val(data.bid_coupon);
                            self.parent.$("#open_time").val(huoniao.transTimes(data.open_time, 1));
                            self.parent.$("#end_time").val(huoniao.transTimes(data.end_time, 1));
    
                        }else{
                            huoniao.showTip("error", "信息获取失败！", "auto");
                        }
                    });
                }
    
            }

		};


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

	//新增会员
	$("#addNew").bind("click", function(event){
		init.quickEdit(0);
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id");
		init.quickEdit(id);
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
		level    = $("#clevel").val(),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("level="+level);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, memberList = val.memberList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < memberList.length; i++){
				list.push('<tr data-id="'+memberList[i].id+'">');
				list.push('  <td class="row2">&nbsp;</td>');
				
				var photo;
				if(memberList[i].photo.indexOf('http') > -1){
					photo = memberList[i].photo;
				}else{
					photo = cfg_attachment + memberList[i].photo + '&type=small';
				}
				list.push('  <td class="row5 left">'+memberList[i].uid+'</td>');
				list.push('  <td class="row20 left"><a href="javascript:;" class="userinfo" data-id="'+memberList[i].uid+'"><img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="'+photo+'" class="litpic" style="width:60px; height:60px;" /><span>'+memberList[i].nickname+'</span></a><br /><code>保障金：'+memberList[i].promotion+'元</code></td>');
			
				list.push('  <td class="row10 left">'+memberList[i].level+'</td>');
				list.push('  <td class="row15 left">'+memberList[i].open_time+'<br />'+memberList[i].end_time+'</td>');
				list.push('  <td class="row7 left">'+memberList[i].refresh_coupon+'个</td>');
				list.push('  <td class="row7 left">'+memberList[i].bid_coupon+'小时</td>');
				list.push('  <td class="row7 left">'+memberList[i].reportCount+'次</td>');
				list.push('  <td class="row10 left"><small><span><code class="uaccount" title="发布的任务总数">总数</code>'+memberList[i].task.taskCount+'个</span><br /><span><code class="uaccount" title="审核通过的订单数量">订单</code>'+memberList[i].task.orderCount+'单</span><br /><span><code class="uaccount" title="发放的赏金总额">赏金</code>'+memberList[i].task.orderAmount+'元</span></small></td>');
				list.push('  <td class="row10 left"><small><span><code class="uaccount" title="领取的任务总数">总数</code>'+memberList[i].order.orderCount+'单</span><br /><span><code class="uaccount" title="审核通过有效的订单数量">有效</code>'+memberList[i].order.validCount+'单</span><br /><span><code class="uaccount" title="收到的赏金总额">赏金</code>'+memberList[i].order.orderAmount+'元</span></small></td>');
				list.push('  <td class="row7"><a href="javascript:;" data-id="'+memberList[i].uid+'" class="edit" title="修改会员信息" style="margin: 0 10px;">修改</a></td>');
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
