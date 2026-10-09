//实例化编辑器
var ue = UE.getEditor('body');

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

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
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

	//营业期限
	$("#operPeriodb").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});
	$("#operPeriode").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});

	//成立日期
	$("#founded").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});

	//年检时间
	$("#inspection").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});

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
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
				huoniao.regex($("#address"));
			},
			cancel: true
		});
	});

    //拒审原因
    $('input[name=state]').click(function(){
        var t = $(this), val = t.val();
        if(val == 2){
            $('#refuseObj').show();
        }else{
            $('#refuseObj').hide();
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

	//选择服务区域
	$(".chooseRange").bind("click", function(){
		var input = $(this).prev("input"), valArr = input.val().split(",");
		huoniao.showTip("loading", "数据读取中，请稍候...");
		huoniao.operaJson("renovationStoreAdd.php?dopost=getAddr", "", function(data){
			huoniao.hideTip();
			if(data){

				var content = [], selected = [];
				content.push('<div class="selectedTags">已选：</div>');
				content.push('<div class="tagsList"><div class="tag-list">');
				for(var l = 0; l < data.length; l++){
					var id = data[l].id, name = data[l].typename;
					if($.inArray(id, valArr) > -1){
						selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
					}
					content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
				}
				content.push('</div></div>');

				$.dialog({
					id: "rangeInfo",
					fixed: false,
					title: "选择区域",
					content: '<div class="selectTags">'+content.join("")+'</div>',
					width: 600,
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
				parent.$('.nav-tabs a').click(function (e) {
					e.preventDefault();
					var obj = $(this).attr("href").replace("#", "");
					if(!$(this).parent().hasClass("active")){
						$(this).parent().siblings("li").removeClass("active");
						$(this).parent().addClass("active");

						$(this).parent().parent().next(".tagsList").find("div").hide();
						parent.$("#"+obj).show();
					}
				});

				//选择标签
				parent.$(".tag-list span").click(function(){
					if(!$(this).hasClass("checked")){

						var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
						$(this).addClass("checked");
						selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
					}
				});

				//取消已选
				selectedObj.delegate("a", "click", function(){
					var pp = $(this).parent(), id = pp.attr("data-id");

					parent.$(".tagsList").find("span").each(function(index, element) {
						if($(this).attr("data-id") == id){
							$(this).removeClass("checked");
						}
					});

					pp.remove();
				});

			}
		});
	});

	//删除已选择的区域
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().next("input");
		pp.remove();

		var val = input.val().split(",");
		val.splice($.inArray(id,val),1);
		input.val(val.join(","));
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
		huoniao.operaJson("../inc/json.php?action=checkStoreUser_3&type=renovation", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它店铺，一个会员不可以管理多个店铺！');
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
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理店铺信息');
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
			company      = $("#company"),
			domain       = $("#domain").val(),
			addrid       = $("#addrid").val(),
			address      = $("#address"),
			litpic       = $("#litpic").val(),
			userid       = $("#userid").val(),
			people       = $("#people"),
			contact      = $("#contact"),
			tel          = $("#tel"),
			weight       = $("#weight"),
			storetemp    = $("#storetemp").val();

		if(!huoniao.regex(company)){
			huoniao.goInput(company);
			return false;
		};

		if($("input[name=domaintype]:checked").val() != 0){
			if($.trim(domain) == ""){
				$.dialog.alert("请输入要绑定的域名！");
				huoniao.goTop();
				return false;
			}
		}

		if(addrid == "" || addrid == 0){
			huoniao.goTop();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(address)){
			huoniao.goInput(address);
			return false;
		}

		if(litpic == ""){
			huoniao.goInput($("#litpic"));
			$.dialog.alert("请上传公司logo！");
			return false;
		};

		if(!huoniao.regex(people)){
			huoniao.goInput(people);
			return false;
		}

		if(!huoniao.regex(contact)){
			huoniao.goInput(contact);
			return false;
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("renovationStoreAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

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
