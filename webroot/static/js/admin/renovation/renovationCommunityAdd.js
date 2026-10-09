$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		},

		//树形递归分类
		treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">请选择</option>');
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

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=renovation&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#address").val(),
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

	//竣工时间
	$("#opendate").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//建筑类型选择
	$("#buildTypeInput input[type='checkbox']").bind("click", function(){
		var val = [];
		$("#buildTypeInput input[type='checkbox']:checked").each(function(index, element) {
            val.push($(this).val());
        });
		$("#buildtype").val(val.join(" "));
	});

	//增加一条周边信息
	$("#addConfig").click(function(){
		var obj = $(this).closest(".item");
		obj.append('<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容"></textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>');
	});

	$(".item").delegate(".icon-trash", "click", function(){
		$(this).closest("dl").remove();
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
			title        = $("#title"),
			addrid       = $("#addrid").val(),
			address      = $("#address"),
			litpic       = $("#litpic").val(),
			opendate     = $("#opendate"),
			price        = $("#price");

		if(!huoniao.regex(title)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(addrid == "" || addrid == 0){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(address)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(litpic == ""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请上传小区图片！", "auto");
			return false;
		};

		if(!huoniao.regex(price)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		var configItem = $("#editform .item:eq(1)").find("dl");
		var configArr = [];
		if(configItem.length > 1){
			for(var i = 1; i < configItem.length; i++){
				var obj = configItem.eq(i);
				var name = obj.find("input").val(), note = obj.find("textarea").val();
				configArr.push(name+"###"+note);
			}
		}
		configArr = configArr.join("|||");

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length > 0){
			var content = $('#imglist').val().replace(/\|/g, "##").replace(/,/g, "||");
			$('#imglist').val(content);
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("renovationCommunityAdd.php", $("#editform").serialize() + "&config="+configArr+"&token="+$("#token").val() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();

				}else{

					huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
