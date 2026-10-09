var ue = UE.getEditor('note');

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			var l = addrListArr;
			typeList.push('<option value="">选择地区</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if((type == "type" && typeid == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
						selected = " selected";
					}
					if(jsonArray['lower'] != "" && type == "type"){
						typeList.push('<optgroup label="'+cl+"|--"+jsonArray["typename"]+'"></optgroup>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if((type == "type" && typeid == jArray[k]["id"]) || (type == "addr" && addr == jArray[k]["id"])){
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
		},

		//菜单递归分类
        selectTypeList: function(type){
            var typeList = [], title = "选择分类";
            typeList.push('<ul class="dropdown-menu">');
            typeList.push('<li><a href="javascript:;" data-id="0">'+title+'</a></li>');

            var l = typeListArr;

            for(var i = 0; i < l.length; i++){
                (function(){
                    var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
                    if(jArray.length > 0){
                        cl = ' class="dropdown-submenu"';
                    }
                    typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
                    if(jArray.length > 0){
                        typeList.push('<ul class="dropdown-menu">');
                    }
                    for(var k = 0; k < jArray.length; k++){
                        if(jArray[k]['lower'] != null){
                            arguments.callee(jArray[k]);
                        }else{
                            typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
                        }
                    }
                    if(jArray.length > 0){
                        typeList.push('</ul></li>');
                    }else{
                        typeList.push('</li>');
                    }
                })(l[i]);
            }

            typeList.push('</ul>');
            return typeList.join("");
        }

	};

	$("#typeBtn").append(init.selectTypeList("type"));

	//二级菜单点击事件
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeid").val(id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');

        if(id != 0){
            $("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }else{
            $("#typeid").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
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

	//模糊匹配中介公司
	$("#zjcom").bind("input", function(){
		$("#comid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkTravelStore", "key="+val+"&filter=6", function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#comList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].title+'</li>');
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

	$(document).click(function (e) {
        var s = e.target;
        /* if (!jQuery.contains($("#comList").get(0), s)) {
            if (jQuery.inArray(s.id, "zjcom") < 0) {
                $("#comList").hide();
            }
		} */
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
	
	//模糊匹配个人会员
	$("#users").bind("input", function(){
		$("#userid").val("0");
		$("#userPhoneP").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkTravelPersonUser", "key="+val, function(data){
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

	function checkPersonUser(t, val){
		var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkTravelPersonUser", "key="+val, function(data){
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
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}

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

	//商家
	function checkZjUser(t, val){
		var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkTravelUser", "key="+val+"&filter=6", function(data){
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
	}

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#userPhone").html("").hide();
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkTravelUser", "key="+val+"&filter=6", function(data){
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
        checkZjUser($("#user"), name);
		return false;
	});

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});
	
	//来源选择
	$("input[name=usertype]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#users").focus();
			var t = $("#users");
			checkPersonUser(t, val);
			$("#userType0").show();
			$("#userType1").hide();
		}else{
			$("#userType1").show();
			$("#userType0").hide();
		}
	});

	$("#zjcom").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjcom(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择所属店铺');
		}
	});

    $("#comList").delegate("li", "click", function(){
        var name = $(this).text(), id = $(this).attr("data-id"),inputname =$("#zjcom") ;
        $("#zjcom").val(name);
        $("#comid").val(id);
        $("#comList").html("").hide();
        $("#zjcom").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkZjcom(inputname, name);
        return false;
    });

    function checkZjcom(t, val){
        var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkTravelStore", "key="+val+"&filter=6", function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].title == val){
                        flag = true;
                        $("#zjcom").val(data[i].title);
                        $("#comid").val(data[i].id);
                    }
                }
            }
            if(flag){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}
	
	

	//搜索回车提交
    $("#editform input").keyup(function (e) {
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
            $("#btnSubmit").click();
        }
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
            id           = $("#id").val(),
			title        = $("#title").val(),
			comid        = $("#comid").val(),
			zjcom        = $("#zjcom").val(),
			weight       = $("#weight");

		if(title==''){
			$("#title").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}
	
		if(comid == "" || comid == 0 || zjcom == ""){
			$("#zjcom").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		// ue.sync();

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("travelstrategyAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "添加成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
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

	
 
});
