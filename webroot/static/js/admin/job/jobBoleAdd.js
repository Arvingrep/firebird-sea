$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			var l = type == "addr" ? addrListArr : industryListArr;
			var s = type == "addr" ? addrid : industry;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(s == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							var selected = "";
							if(s == jArray[k]["id"]){
								selected = " selected";
							}
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}
	};

	//模糊匹配中介公司
	$("#company").bind("input", function(){
		$("#cid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkJobCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#comList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-tel="'+data[i].contact+'" data-email="'+data[i].email+'">'+data[i].title+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#comList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#comList").html("").hide();
				}
			});

		}else{
			$("#comList").html("").hide();
		}
    });

	$("#comList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), tel = $(this).attr("data-tel"), email = $(this).attr("data-email");
		$("#company").val(name);
		$("#cid").val(id);
		$("#comList").html("").hide();
		$("#company").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		return false;
	});

	$(document).click(function (e) {
      var s = e.target;
      if (!jQuery.contains($("#comList").get(0), s)) {
          if (jQuery.inArray(s.id, "zjcom") < 0) {
              $("#comList").hide();
          }
      }
  });

	$("#company").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkJobCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].title == val){
							flag = true;
							$("#company").val(data[i].title);
							$("#cid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").addClass("input-ok");
				}else{
					t.siblings(".input-tips").addClass("input-error");
				}
			});
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择公司');
		}
	});

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//会员模糊匹配
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#realname").val("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("jobBole.php?dopost=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" title="'+data[i].name+'" data-phone="'+data[i].phone+'">'+data[i].name+'('+data[i].phone+')</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList").html("").hide();
				}
			});

		}else{
			$("#userList").html("").hide();
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).attr("title"), id = $(this).attr("data-id");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		checkMember($("#user"), name, $("#id").val());
		return false;
	});

	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#userList").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#userList").hide();
            }
        }
    });

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkMember(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
		}
	});

	function checkMember(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("jobBole.php?dopost=checkMember", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已为伯乐！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].name == val){
							flag = true;
							$("#userid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>请输入网站对应会员名');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
				}
			}
		});
	}

	//选择标签、技能
	$(".chooseData").bind("click", function(){
		var type = $(this).prev("input").attr("id"), input = $(this).prev("input"), valArr = input.val().split(",");

		var content = [], selected = [];
		content.push('<div class="selectedTags c-data">已选：</div>');
		content.push('<ul class="choose-data" style="margin-bottom:5px;">');

		var data = type == "industry" ? industryListArr : typeListArr;
		for(var a = 0; a < data.length; a++){
			if(type == "zhineng"){
				content.push('<dl class="zhineng">');
			}else{
				content.push('<dl>');
			}
			content.push('<dt><span>'+data[a].typename+'</span><s></s></dt>');
			content.push('<dd class="clearfix">');

			if(data[a].lower.length > 0){
				var lower1 = data[a].lower;

				//行业
				if(type == "industry"){

					content.push('<ul class="clearfix">');
					for(var c = 0; c < lower1.length; c++){
						if($.inArray(lower1[c].id, valArr) > -1){
							selected.push('<span data-id="'+lower1[c].id+'">'+lower1[c].typename+'<a href="javascript:;">&times;</a></span>');
						}
						content.push('<li><label><input type="checkbox" data-id="'+lower1[c].id+'" data-name="'+lower1[c].typename+'"'+($.inArray(lower1[c].id, valArr) > -1 ? " checked='checked'" : "")+' /> '+lower1[c].typename+'</label></li>');
					}
					content.push('</ul>');

				//职能
				}else if(type == "zhineng"){

					var subdata = [], f = 0;

					for(var b = 0; b < lower1.length; b++){
						content.push('<div class="sub-data" data-id="'+b+'"><a href="javascript:;">'+lower1[b].typename+'</a><i></i></div>');
						lower2 = lower1[b].lower;

						subdata.push('<ul class="clearfix zn'+b+'">');
						for(var c = 0; c < lower2.length; c++){
							if($.inArray(lower2[c].id, valArr) > -1){
								selected.push('<span data-id="'+lower2[c].id+'">'+lower2[c].typename+'<a href="javascript:;">&times;</a></span>');
							}
							subdata.push('<li><label><input type="checkbox" data-id="'+lower2[c].id+'" data-name="'+lower2[c].typename+'"'+($.inArray(lower2[c].id, valArr) > -1 ? " checked='checked'" : "")+' /> '+lower2[c].typename+'</label></li>');
						}
						subdata.push('</ul>');

						f++;

						if(f == 3 || (lower1.length%3 == 1 && b == lower1.length-1)){
							content.push(subdata.join(""));
							subdata = [];
							f = 0;
						}

					}
				}


			}

			content.push('</dd>');
			content.push('</dl>');
		}



		// for(var i = 0; i < data.length; i++){
		// 	content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].typename+'</a></li>');
		// }
		// content.push('</ul><div class="tagsList">');
		// for(var i = 0; i < data.length; i++){
		// 	content.push('<div class="tag-list'+(i == 0 ? "" : " hide")+'" id="tab'+i+'">')
		// 	for(var l = 0; l < data[i].lower.length; l++){
		// 		var id = data[i].lower[l].id, name = data[i].lower[l].typename;
		// 		if($.inArray(id, valArr) > -1){
		// 			selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
		// 		}
		// 		content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
		// 	}
		// 	content.push('</div>');
		// }
		content.push('</ul>');

		$.dialog({
			id: "dataInfo",
			fixed: false,
			title: "选择招聘"+(type == "industry" ? "行业" : "技能"),
			content: '<div class="selectTags">'+content.join("")+'</div>',
			width: 800,
			height: 450,
			okVal: "确定",
			ok: function(){

				//确定选择结果
				var html = parent.$(".selectedTags").html().replace("已选：", ""), ids = [];
				parent.$(".selectedTags").find("span").each(function(){
					var id = $(this).attr("data-id");
					if(id){
						ids.push(id);
					}
				});
				input.val(ids.join(","));
				input.prev(".selectedTags").html(html);

			},
			cancelVal: "关闭",
			cancel: true
		});

		var selectedObj = parent.$(".selectedTags");
		//填充已选
		selectedObj.append(selected.join(""));

		//TAB切换
		parent.$('.sub-data').click(function () {
			var t = $(this), id = t.attr("data-id"), par = t.closest("dd");
			if(t.hasClass("curr")){
				t.removeClass("curr");
				parent.$(".choose-data .sub-data").removeClass("curr");
				parent.$(".choose-data ul").stop().slideUp("fast");
			}else{
				parent.$(".choose-data .sub-data").removeClass("curr");
				parent.$(".choose-data ul").stop().slideUp("fast");

				t.addClass("curr");
				par.find(".zn"+id).stop().slideDown("fast");
			}
		});

		//选择标签
		parent.$(".choose-data input").click(function(){
			var t = $(this), id = t.attr("data-id"), name = t.attr("data-name");
			if(t.is(":checked")){
				selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
			}else{
				selectedObj.find("span").each(function(index, element){
	        if($(this).attr("data-id") == id){
						$(this).remove();
					}
	      });
			}
		});

		//取消已选
		selectedObj.delegate("a", "click", function(){
			var pp = $(this).parent(), id = pp.attr("data-id");

			parent.$(".choose-data").find("input").each(function(index, element) {
        if($(this).attr("data-id") == id){
					$(this).attr("checked", false);
				}
      });

			pp.remove();
		});


	});

	//删除已选择的标签/技能（非浮窗）
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().next("input");
		pp.remove();

		var val = input.val().split(",");
		val.splice($.inArray(id,val),1);
		input.val(val.join(","));
	});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=dating&lnglat='+$("#lnglat").val()+"&city="+mapCity,
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val();
				$("#lnglat").val(lng+","+lat);
			},
			cancel: true
		});
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('.addrBtn').attr('data-id'));
		var t       = $(this),
			id        = $("#id").val(),
			user      = $("#user").val(),
			work      = $("#work");

		//会员名
		if(user == ""){
			$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}

		if(!huoniao.regex(work)){
			huoniao.goInput(work);
			return false;
		};

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "jobBole.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "Add"){
						huoniao.goTop();
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								location.reload();
								// try{
								// 	$("body",parent.document).find("#nav-jobBolephp").click();
								// 	//parent.reloadPage($("body",parent.document).find("#body-jobBolephp")[0].contentWindow);
								// 	parent.reloadPage($("body",parent.document).find("#body-jobBolephp"));
								// 	$("body",parent.document).find("#nav-jobBoleEdit"+id+" s").click();
								// }catch(e){
								// 	location.href = thisPath + "jobBole.php";
								// }
							},
							cancel: false
						});
					}
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});
