//实例化编辑器
// var ue = UE.getEditor('desc');

$(function(){
    //填充城市列表
    //huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
    //$(".chosen-select").chosen();

	var m = 0;

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

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//填充分类
	//$("#typeBtn").append(init.selectTypeList("type"));

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

	//访问方式
	$("input[name=domaintype]").bind("click", function(){
		var val = $(this).val(), obj = $("#domainObj"), input = $("#domain");
		if(val == 0){
			obj.hide();
		}else if(val == 1){
			input.removeClass().addClass("input-large");
			input.next(".add-on").hide();
			obj.show();
		}else if(val == 2){
			input.removeClass().addClass("input-mini");
			input.next(".add-on").show();
			obj.show();
		}
	});

	//域名过期时间
	$("#domainexp").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

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

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#tel").val("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					$("#tel").val("");
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
					$("#userList").html("").hide();
					$("#tel").val("");
				}
			});

		}else{
			$("#userList").html("").hide();
			$("#tel").val("");
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#tel").val(phone);
		checkGw($("#user"), name, $("#id").val());
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
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});

	function checkGw(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("../inc/json.php?action=checkUser_pensionelderly", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它老人信息，一个会员不可以管理多个老人信息！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].username == val){
							flag = true;
							$("#userid").val(data[i].id);
							$("#tel").val(data[i].phone);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理老人信息');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
				}
			}
		});
	}

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=pension&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&address="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					address = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(address);
				}
				huoniao.regex($("#address"));
			},
			cancel: true
		});
	});

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
		$('#addrid').val($('.addrBtn').attr('data-id'));
		var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			cityid       = $("#cityid").val(),
			typeid       = $("#typeid").val(),
			elderlyname  = $("#elderlyname"),
			userid       = $("#userid").val(),
			user         = $("#user").val(),
			tel          = $("#tel").val(),
			address      = $("#address").val();

        //城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择城市');
            return false;
        };

		if(!huoniao.regex(elderlyname)){
			huoniao.goTop();
			return false;
		};

		if(tel==''){
			$.dialog.alert('请填写联系方式！');
			huoniao.goTop();
			return false;
		}

		if(address==''){
			$.dialog.alert('请填写详细地址！');
			huoniao.goTop();
			return false;
		}

		// ue.sync();

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("pensionelderlyAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
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
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

});

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "pension",
		type: "delVideo",
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
