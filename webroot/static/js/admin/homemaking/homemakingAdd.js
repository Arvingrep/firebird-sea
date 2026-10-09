//实例化编辑器
var ue = UE.getEditor('note');
//var mue = UE.getEditor('mbody', {"term": "mobile"});

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
				if(!exp.test($.trim(obj.val())).toString()){
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
		},
		//菜单递归分类
		selectTypeList: function(type){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

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

	$("#brandBtn").append(init.selectTypeList('brand'));

	$("#brandBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
        $("#typeidss").val(id);
        $("#brandBtn button").html(title+'<span class="caret"></span>');

        if(id != 0){
            $("#typeidss").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }else{
            $("#typeidss").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
        }
	});

	//模糊匹配中介公司
	$("#zjcom").bind("input", function(){
		$("#comid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkHomemakingStore", "key="+val, function(data){
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
	
	$("#zjcom").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjcom(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择家政公司');
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
        huoniao.operaJson("../inc/json.php?action=checkHomemakingStore", "key="+val, function(data){
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

	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#comList").get(0), s)) {
            if (jQuery.inArray(s.id, "zjcom") < 0) {
                $("#comList").hide();
            }
        }
    });

	//房源性质选择
	$("input[name=homemakingtype]").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#price1").hide();
		}else{
			$("#price1").show();
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
			cityid       = $("#cityid").val(),
			typeidss     = $("#typeidss").val(),
			comid        = $("#comid").val(),
			price        = $("#price"),
			homemakingtype     = $("input[name=homemakingtype]:checked").val(),
			username     = $("#username"),
			contact      = $("#contact"),
			weight       = $("#weight");

		//分类
		if(typeidss == "" || typeidss == "0"){
			$("#typeidss").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeidss").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//品牌名称
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择所在区域');
            return false;
		};

		if(comid == "" || comid == 0 || zjcom == ""){
			$("#zjcom").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}

		if(username == ''){
			$("#username").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}

		if(contact == ''){
			$("#contact").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}

		if(homemakingtype!=0){console.log();
			if($("#price").val() == '' || $("#price").val() == 0){
				huoniao.goTop();
				$.dialog.alert("请正确输入价格，只能填写数字，支持两位小数！");
				return false;
			}
			if(!init.regex(price)){
				huoniao.goTop();
				$.dialog.alert("请正确输入价格，只能填写数字，支持两位小数！");
				return false;
			}
		}

		ue.sync();

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("homemakingAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
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

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=homemaking&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
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
		mod: "homemaking",
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
