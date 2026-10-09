//实例化编辑器
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

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=job&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
				huoniao.regex($("#address"));
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

	//搜索回车提交
//   $("#editform input").keyup(function (e) {
//       if (!e) {
//           var e = window.event;
//       }
//       if (e.keyCode) {
//           code = e.keyCode;
//       }
//       else if (e.which) {
//           code = e.which;
//       }
//       if (code === 13) {
//           $("#btnSubmit").click();
//       }
//   });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		$('#addr').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t     = $(this),
			id      = $("#id").val(),
			title   = $("#title"),
			addr    = $("#addr").val(),
			address = $("#address");

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		if(addr == "" || addr == 0){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(address)){
			huoniao.goInput(address);
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("jobFairsCenter.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "Add"){

					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					window.location.reload();

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
