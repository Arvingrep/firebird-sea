//实例化编辑器
//var ue = UE.getEditor('note');

$(function(){

	huoniao.parentHideTip();

	$(".chosen-select").chosen();

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

	//填充区域
	$("#addrid").html(init.treeTypeList("addr"));

	//填充行业
	$("#industry").html(init.treeTypeList("industry"));

	// 营业时间
	$("#start_time, #end_time").datetimepicker({
		format: 'hh:ii',
		autoclose: true,
		minView: 2,
		language: 'ch',
		autoclose: 1,
		startView: 1,
		minView: 0,
		maxView: 1,
		forceParse: 0
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

	//模糊匹配会员
	$("#user").bind("input", function(){
		$("#userid").val("0");
		$("#people").val("");
		$("#contact").val("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#userList").html("").hide();
					$("#people").val("");
					$("#contact").val("");
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-nickname="'+data[i].nickname+'" data-phone="'+data[i].phone+'">'+data[i].username+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#userList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#userList").html("").hide();
					$("#people").val("");
					$("#contact").val("");
				}
			});

		}else{
			$("#userList").html("").hide();
			$("#people").val("");
			$("#contact").val("");
		}
    });

	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), nickname = $(this).attr("data-nickname"), phone = $(this).attr("data-phone");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#people").val(nickname);
		$("#contact").val(phone);
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
		huoniao.operaJson("../inc/json.php?action=checkBranchStoreUser", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它店铺分店，一个会员不可以管理多个店铺分店！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].username == val){
							flag = true;
							$("#userid").val(data[i].id);
							$("#people").val(data[i].nickname);
							$("#contact").val(data[i].phone);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理店铺分店');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
				}
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
		$('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			branchid     = $("#branchid").val(),
			title        = $("#title"),
			addrid       = $("#addrid").val(),
			industry     = $("#industry").val(),
			project      = $("#project"),
			litpic       = $("#litpic"),
			people       = $("#people"),
			contact      = $("#contact"),
			weight       = $("#weight");

		if(branchid == "" || branchid == 0){
			huoniao.goTop();
			alert('请选择所属店铺！');
			return false;
		}

		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if(addrid == "" || addrid == 0){
			huoniao.goTop();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(industry == "" || industry == 0){
			huoniao.goTop();
			$("#industryList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#industryList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(project)){
			huoniao.goTop();
			return false;
		}

		if(litpic == ""){
			huoniao.goTop();
			$.dialog.alert("请上传店铺logo！");
			return false;
		};

		if(!huoniao.regex(people)){
			huoniao.goTop();
			return false;
		}

		if(!huoniao.regex(contact)){
			huoniao.goTop();
			return false;
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("shopBranchStoreAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "店铺分店添加成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();

				}else{

					huoniao.parentTip("success", "店铺分店修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
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
			content: 'url:'+adminPath+'../api/map/mark.php?mod=shop&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&address="+$("#address").val(),
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

	var i = print_config;
	$("#copy").bind("click",function(){
		var html = [];

		html.push('<div class="printer" style="border: solid 1px;width: 480px; position: relative; margin-bottom: 20px;">');
		html.push('<dl class="clearfix"><dt><label for="bind_print">是否开启打印机：</label></dt><dd class="radio"><select name="print_config['+i+'][bind_print]" id="Config_bind_print"><option value="0">关闭</option><option value="1">开启</option></select></dd></dl>');
		html.push('<dl class="clearfix"><dt><label for="print_config">备注：</label></dt><dd><input type="text" class="input-large" id="print_config_remarks" name="print_config['+i+'][remarks]" value="" /></dd></dl>');
		html.push('<dl class="clearfix"><dt><label for="print_config">打印机终端号：</label></dt><dd><input type="text" class="input-large" id="print_config_mcode" name="print_config['+i+'][mcode]" value="" /></dd></dl>');
		html.push('<dl class="clearfix"><dt><label for="print_config">打印机密钥：</label></dt><dd><input type="text" class="input-large" id="print_config_msign" name="print_config['+i+' value="" /></dd></dl>');
		html.push('<dl class="clearfix"><dt><label for="print_state">打印机状态：</label></dt><dd></dl>');
		html.push('<div class="btn btn-sm btn-danger del" style="position: absolute; right: 2px; top: 2px;" data-id="" >删除</div></div>');
		$(this).before(html.join(''));
		i++;
	});

	$("body").delegate(".del","click",function(){
    var printid = $(this).data("id");
    console.log(printid);
    if(printid!="" ){
      var dopost = "del";
       $.ajax({
          url: 'shopStoreAdd.php',
          type: "post",
          data: {sid:sid,printid:printid,dopost:dopost},
          dataType: "json",
          success: function(res){
             if(res.state == 100){
                  $(this).closest(".printercopy").remove();
                  $.dialog({
                  title: '提醒',
                  icon: 'success.png',
                  content: '删除成功！',
                  ok: function(){
                                window.scroll(0, 0);
                                location.reload();
                  }
              });
              }else{
                  $.dialog.alert(res.info);
                  $(".del").attr("disabled", false);
              }
          },
          error: function(){
              $.dialog.alert("网络错误，保存失败！");
              $(".del").attr("disabled", false);
          }
      })
    }else{
      $(this).closest(".printer").remove();
    }
  })

});
