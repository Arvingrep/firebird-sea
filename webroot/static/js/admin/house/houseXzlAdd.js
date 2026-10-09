//实例化编辑器
var ue = UE.getEditor('note');
var mue = UE.getEditor('mbody', {"term": "mobile"});

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		regex: function(obj){
			var regex = obj.attr("data-regex");
			if(regex != undefined){
				var exp = new RegExp("^" + regex + "$", "img");
				if(!exp.test($.trim(obj.val()))){
					return false;
				}else{
					return true;
				}
			}
		}

		//树形递归分类
		,treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">不限</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(addrid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(addrid == jArray[k]["id"]){
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
				})(l[i]);
			}
			return typeList.join("");
		}
	};

	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	})

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

	//供求
	$("input[name=type]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#price").next(".add-on").html(echoCurrency('short') + "/平米&bull;月");
		}else{
			$("#price").next(".add-on").html("万" + echoCurrency('short'));
		}
	});

	$("input[name=type]").bind("click", function(){
		var val = $(this).val();
		// if(sell==0||val==0||val==1){
			if (val==0) {
				if (sell==0||type==1) {
					//出租
					$(':radio[name="sellstate"]').eq(0).attr("checked",true);
				}else if(sell==1){
					$(':radio[name="sellstate"]').eq(1).attr("checked",true);
				}

			}else{
				if (sell==0||type==0) {
					//出租
					$(':radio[name="sellstate1"]').eq(0).attr("checked",true);
				}else if(sell==2){
					$(':radio[name="sellstate1"]').eq(1).attr("checked",true);
				}
			}
		// }
		if(val == 0){
			$("#sellstate").removeClass('hide');
			$("#sellstate1").addClass('hide');
			
		}else{
			$("#sellstate1").removeClass('hide');
			$("#sellstate").addClass('hide');
		

		}
		

	});

	//房源性质选择
	$("input[name=usertype]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			var t = $("#users");
			checkPersonUser(t, t.val());
			$("#userType0").show();
			$("#userType1").hide();
		}else{
			$("#userType1").show();
			$("#userType0").hide();
		}
	});

	//模糊匹配个人会员
	$("#users").bind("input", function(){
		$("#userid").val("0");
		$("#userPhoneP").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkPersonUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userListP, #userPhoneP").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userListP")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userListP, #userPhoneP").html("").hide();
				}
			});

		}else{
			$("#userListP, #userPhoneP").html("").hide();
		}
    });

	$("#userListP").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#users").val(name);
		$("#userid").val(id);
		$("#userListP").html("").hide();
		$("#userPhoneP").html("电话："+phone).show();
		$("#users").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkPersonUser($("#users"), name);
		return false;
	});

	$("#users").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkPersonUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	function checkPersonUser(t, val){
		var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkPersonUser", "key="+val, function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].username == val){
                        flag = true;
                        $("#userid").val(data[i].id);
                        $("#userPhoneP").val(data[i].phone).show();
                    }
                }
            }
            if(flag){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").show();
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error").show();
            }
        });
	}

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#userPhone").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkZjUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList, #userPhone").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList, #userPhone").html("").hide();
				}
			});

		}else{
			$("#userList, #userPhone").html("").hide();
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#userPhone").html("电话："+phone).show();
		$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		return false;
	});

	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#userList").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#userList").hide();
            }
		}
		if (!jQuery.contains($("#userListP").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#userListP").hide();
            }
        }
    });

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkZjUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].username == val){
							flag = true;
							$("#userid").val(data[i].id);
							$("#userPhone").html("电话："+data[i].phone).show();
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
				}
			});
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			loupan       = $("#loupan").val(),
			loupanid     = $("#loupanid").val(),
			addrid       = $("#addrid").val(),
			address      = $("#address"),
			price        = $("#price"),
			area         = $("#area"),
			usertype     = $("input[name=usertype]:checked").val(),
			username     = $("#users"),
			contact      = $("#contact"),
			userid       = $("#userid").val(),
			user         = $("#user").val(),
			typeid       = $("input[name='typeidArr']:checked").val(),
			weight       = $("#weight");

		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if(loupan == ''){
			huoniao.goTop();
			return false;
		};

		if(loupanid == 0 || loupanid == ''){
			if(addrid == 0 || addrid == ""){
				huoniao.goTop();
				$.dialog.alert("请选择区域！");
				return false;
			}

			if(!huoniao.regex(address)){
				huoniao.goTop();
				return false;
			};
		}

		if(!init.regex(price)){
			huoniao.goTop();
			$.dialog.alert("请正确输入价格，只能填写数字，支持两位小数！");
			return false;
		};

		if(!init.regex(area)){
			huoniao.goTop();
			$.dialog.alert("请正确输入面积，只能填写正整数！");
			return false;
		};

		if(usertype == 0){
			if(username.val()==''){
				username.focus();
				return false;
			}
			if(userid == "" || userid == 0){
				$("#users").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				username.focus();
				return false;
			}
			if(!huoniao.regex(contact)){
				$("#contact").focus();
				// huoniao.goTop();
				return false;
			}
		}else{
			if(userid == "" || userid == 0 || user == ""){
				$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				$("#user").focus();
				// huoniao.goTop();
				return false;
			}
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		var pics = [];
		if(typeid == 0){
			if($("#listSection2").find("li").length > 0 && $("#listSection2").find("li").length != 6){
				$.dialog.alert("请上传6张完整的全景图片！");
				return false;
			}

			$("#listSection2").find("img").each(function(index, element) {
        pics.push($(this).attr("data-val"));
	    });
			
		}else if(typeid == 1){
			// if($("#url").val() == ""){
			// 	$.dialog.alert("请输入URL地址！");
			// 	return false;
			// }
		}
		$("#litpic").val(pics.join(","));

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("houseXzlAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

	//竣工时间
	$("#opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=house&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#addr").val() == ""){
					$("#addr").val(addr);
				}
				huoniao.regex($("#addr"));
			},
			cancel: true
		});
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});
	
	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#qj_type0, #qj_type1").hide();
		$("#qj_type"+$(this).val()).show();
	});

	//全景预览
	// $("#licenseFiles a").bind("click", function(event){
	// 	event.preventDefault();
	// 	var id   = $(this).attr("data-id");

	// 	window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	// });

	$("#previewQj").bind("click", function(){
        if($("#listSection2").find("li").length == 6){

            event.preventDefault();
            var href = $(this).attr("href");

            pics = [];
            $("#listSection2").find("img").each(function(index, element) {
                pics.push($(this).attr("data-val"));
            });

            window.open(href+pics.join(","), "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");

        }else{
            $.dialog.alert("请上传6张完整的全景图片！");
        }
    });
	

	//楼盘模糊匹配
	var timer = null;
	$("#loupan").bind("input", function(){
		clearTimeout(timer);
		var t = $(this), val = t.val();
		timer = setTimeout(function(){
			$("#loupanid").val("0");
			$("#loupanAddr").html("").hide();
			$("#loupanInfo").hide();
			if(val != ""){
				t.addClass("input-loading");
				huoniao.operaJson("../inc/json.php?action=checkLoupan", "type=写字楼&key="+val, function(data){
					t.removeClass("input-loading");
					if(!data) {
						$("#loupanList").html("").hide();
						return false;
					}
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push('<li data-id="'+data[i].id+'" data-addrid="'+data[i].typename+'" data-addr="'+data[i].addr+'" title="'+data[i].title+'">'+data[i].title+'</li>');
					}
					if(list.length > 0){
						newSear = false;
						var pos = t.position();
						$("#loupanList")
							.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
							.html('<ul>'+list.join("")+'</ul>')
							.show();
					}else{
						$("#loupanList").html("").hide();
					}
				});

			}else{
				$("#loupanList").html("").hide();
			}
		}, 200)
  });
  $("#loupan").bind("blur", function(){
		var t = $(this);
		setTimeout(function(){
			var val = t.val();
			if(val != ""){
    		checkLoupan(t, val);
			}else{
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
			}
		}, 200)
	});

	$("#loupanList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), addrid = $(this).attr("data-addrid"), addr = $(this).attr("data-addr");
		var c = $(this).data();
		$('#loupan').val(name);
		$('#loupanid').val(id);
		$("#loupanAddr").html(addrid+" "+addr).show();
		$("#loupanList").html("").hide();

		$("#loupan").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		$("#loupanList, #loupanInfo").hide();
		return false;
	});

	function checkLoupan(t, val){
    t.addClass("input-loading");
    huoniao.operaJson("../inc/json.php?action=checkLoupan", "type=写字楼&key="+val, function(data){
        t.removeClass("input-loading");
				var flag = false;
        if(data) {
            for(var i = 0; i < data.length; i++){
                if(data[i].title == val){
                	console.log("have");
                		newSear = false;
                    flag = true;
                    $("#loupan").val(data[i].title);
                    $("#loupanid").val(data[i].id);
                    $("#loupanAddr").html(data[i].typename+" "+data[i].addr).show();
                }
            }
        }
        if(flag){
            t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            $("#loupanInfo").hide();
        }else{
            t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            console.log('show ' + val)
            $("#loupanInfo").show();
        }
    });
	}

	$(document).click(function (e) {
      var s = e.target;
      if (!jQuery.contains($("#loupanList").get(0), s)) {
          if (jQuery.inArray(s.id, "user") < 0) {
              $("#loupanList").hide();
          }
      }
  });

  //删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	// 监听楼层切换
	$('[name="floortype"]').change(function(){
		var t = $(this), val = t.val();
		if(val == 0){
			$('#radio-floorspr').hide();
		}else{
			$('#radio-floorspr').show();
		}
	})


});

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else if(obj == "video"){
		media = '<video src="'+cfg_attachment+file+'"></video>';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline;");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "house",
		type: "delThumb",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
