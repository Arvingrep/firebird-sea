//实例化编辑器
// var ue = UE.getEditor('body');
// var mue = UE.getEditor('mbody', {"term": "mobile"});
var delmanager = [];
var uploadCustom = {
	//旋转图集文件
	rotateAtlasPic: function(mod, direction, img, c) {
		var g = {
			mod: mod,
			type: "rotateAtlas",
			direction: direction,
			picpath: img,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		});
	}
}

$(function () {

	huoniao.parentHideTip();

    //填充城市列表
    huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
    $(".chosen-select").chosen();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//菜单递归分类
		selectTypeList: function(dataArr, def){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			if(def !== null){
				typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');
			}

			var l=dataArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower || [], cl = "";
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
				})(dataArr[i]);
			}

			typeList.push('</ul>');
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
	});

	//填充类型
	$("#typeBtn").append(init.selectTypeList(typeListArr, null));
	//填充媒体类型
	$("#type2Btn").append(init.selectTypeList(type2ListArr));
	//填充媒体资质类型
	$("#type22Btn").append(init.selectTypeList(type22ListArr));
	//填充领域
	$("#fieldBtn").append(init.selectTypeList(fieldListArr));
	//填充政府机构类型
	$("#type4Btn").append(init.selectTypeList(type4ListArr));
	//填充政府机构级别
	$("#type42Btn").append(init.selectTypeList(type42ListArr));

	//二级菜单点击事件
	$(".dropdown-box").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text(), p = $(this).closest('.dropdown-box');
		p.find("input").val(id);
		p.find("button").html(title+'<span class="caret"></span>');

		if(id != 0){
			p.find(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			p.find(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
		// 切换类型
		if(p.data('type') == 'type'){
			changeItem(id);
		}
	});

	function changeItem(id, first){
		$('.variable').hide().find('input, textarea, select').prop('disabled', true);
		// $('.variable-'+id).show().find('input, textarea, select').prop('disabled', false);
		$('.variable-'+id).each(function(){
		  var o = b = $(this);
		  if(b.find('.variable-'+id).length){
		    o = b.find('.variable-'+id);
		  }
		  b.show();
		  o.find('input, textarea, select').prop('disabled', false);
		})
		$('#group-op-title').text(id == 1 ? '运营者联系信息' : '授权运营者联系信息');

		if(!first){
			// getField(id);
		}
	}
	changeItem(type, true);

	if($('#newupdate').length){
		var oftop = $('#editform').offset().top;
		var ofbtm = $('#newupdate').offset().top;
		$('body').append('<div style="position:absolute;left:0;top:'+oftop+'px;right:0;bottom:280px;z-index:1000;"></div>')
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

	$("#pubdate").bind("blur", function(){
		huoniao.resetDate($(this));
		return false;
	});

	//发布时间
	$(".form_datetime .add-on").datetimepicker({
		format: 'yyyy-mm-dd hh:ii:ss',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		minuteStep: 5,
		linkField: "pubdate"
	});



	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
				id           = $("#id").val(),
				typeid       = $("#type"),
				ac_name      = $("#ac_name"),
				ac_profile   = $("#ac_profile"),
				ac_field     = $("#ac_field"),
				ac_photo     = $("#ac_photo").val(),
				op_name      = $("#op_name").val(),
				op_phone     = $("#op_phone").val(),
				op_email     = $("#op_email").val(),
				weight       = $("#weight"),
				keywords     = $("#keywords"),
				editstate    = $('[name=editstate]:checked').val() ? $('[name=editstate]:checked').val() : 0;
				tj           = true;

		// 先处理资料更新申请
		if($('#newupdate').length){
			if(!editstate){
				$.dialog.alert('请确定资料修改申请处理结果');
				return;
			}
			huoniao.operaJson('articleJson.php?action=updateSelfmediaState', 'id='+id+'&type=update&arcrank='+editstate, function(){
					huoniao.parentTip("success", "操作成功！");
					location.reload();
			});
			return;
		}


		//分类
		if(typeid.val() == "" || typeid.val() == 0){
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			console.log('type')
			huoniao.goTop();
			return false;
		}else{
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		// 后台只验证账号信息 ---------------------------------------------------

		//标题
		if(!huoniao.regex(ac_name)){
			tj = false;
			huoniao.goTop();
			console.log('ac_name')
			ac_name.focus();
			return false;
		};

		//介绍
		if(!huoniao.regex(ac_profile)){
			tj = false;
			huoniao.goTop();
			ac_profile.focus();
			console.log('ac_profile')
			return false;
		};

		//领域
		if(ac_field.val() == "" || ac_field.val() == 0){
			ac_field.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			console.log('ac_field')
			huoniao.goTop();
			return false;
		}else{
			ac_field.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		// 头像
		if(ac_photo == ''){
			$.dialog.alert('请上传自媒体头像');
			huoniao.goTop();
			return false;
		}
		
		// 领域
		if(ac_field.val() == "" || ac_field.val() == 0){
			ac_field.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			console.log('ac_field')
			return false;
		}else{
			ac_field.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		var ac_addrid = $('.addrBtn').attr('data-id'), ids = $('.addrBtn').attr('data-ids');
		var cityid = 0;
		if(ac_addrid){
			cityid = ids.split(' ')[0];
			$('#ac_addrid').val(ac_addrid);
			$('#cityid').val(cityid);
		}
    //区域
    if(ac_addrid == '' || ac_addrid == 0){
        $.dialog.alert('请选择所在地');
        huoniao.goTop();
        return false;
    };

    var ids = [];
		$("#managerTable tbody:eq(0) tr").each(function(){
			var tr = $(this), id = tr.attr('data-id');
			if(id){
				ids.push(id);
			}
		})
		$("#manager").val(ids.join(","));
		$("#delmanager").val(delmanager.join(","));

		t.attr("disabled", true);

		if(tj){
			
			$.ajax({
				type: "POST",
				url: "selfmediaAdd.php",
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						if($("#dopost").val() == "save"){
							huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							location.reload();
						}else{
							huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
							location.reload();
							//更新列表页数据
							// $("body",parent.document).find("#body-articleListphp")[0].contentWindow.getList()
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
		}
	});

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//模糊匹配会员
	$("#username").bind("input", function(){
		$("#userid").val("0");
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("?dopost=checkUser", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#companyList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					var name = data[i].company ? data[i].company : (data[i].nickname ? data[i].nickname : data[i].username);
					list.push('<li data-id="'+data[i].id+'" data-company="'+name+'">'+name+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#companyList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#companyList").html("").hide();
				}
			});

		}else{
			$("#companyList").html("").hide();
		}
  });

	$("#companyList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#username").val(name);
		$("#userid").val(id);
		$("#companyList").html("").hide();
		checkGw($("#username"), name, $("#id").val());
		return false;
	});

	$(document).click(function (e) {
    var s = e.target;
    if (!jQuery.contains($("#companyList").get(0), s)) {
      if (jQuery.inArray(s.id, "user") < 0) {
          $("#companyList").hide();
      }
    }
  });


	function checkGw(t, val, id){
		var flag = false;
		t.addClass("input-loading");
		huoniao.operaJson("?dopost=checkUser", "key="+val, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它自媒体，一个会员不可以管理多个自媒体！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].company == val || data[i].nickname == val || data[i].username == val){
							flag = true;
							$("#uid").val(data[i].id);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理自媒体信息');
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
				}
			}
		});
	}

	// 查看当前资料
	$('#lookNow').click(function(){
		var id = $(this).attr("data-id"),
			title = "ID："+id+"当前资料",
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("edit"+action+id+"real", "article", title, "article/"+href);
		} catch(e) {}
	})



	function getField(id){
		$('#ac_field').val(0);
		$.ajax({
			url: 'articleJson.php?action=getMediaField',
			type: 'post',
			data: 'type='+id,
			dataType: 'json',
			success: function(data){
				$('#fieldBtn .btn').html('请选择<span class="caret"></span>').siblings('.dropdown-menu').remove();
				if(data){
					fieldList = data;
					$("#fieldBtn").append(init.selectTypeList(data));
				}
			},
			error: function(){
				$('#fieldBtn .btn').html('请选择<span class="caret"></span>').siblings('.dropdown-menu').remove();
			}
		})
	}
	// 自媒体管理员
	//增加一行
	$(".addManager").bind("click", function(){
		$(this).closest('table').find("tbody:eq(0)").append($("#trTemp").html().replace(/__/g, $(this).data('type')));
	});

	//删除
	$("table").delegate(".del", "click", function(){
		var t = $(this), tr = t.closest("tr"), id = tr.attr("data-id");
		tr.remove();
		delmanager.push(id);
	});
	// $('#managerTable').on("blur", ".uid", function(){
	$('#managerTable').delegate(".uid", "blur", function(){
		var t = $(this), tr = t.closest('tr'), val = t.val(), info = t.next('.info');
		tr.attr('data-id', '');
		info.removeClass('error success').text('');
		if(val){
			$.ajax({
				url: '?dopost=checkUserById&userid='+val+'&aid='+id,
				type: 'get',
				dataType: 'json',
				success: function(res){
					if(res && res.state == 100){
						info.addClass("success").html('<a href="javascript:;" class="userinfo" data-id="'+val+'">'+res.info+'</a>');
						tr.attr('data-id', val);
					}else{
						info.addClass("error").text(res.info);
					}
					$("#btnSubmit").attr('disabled', false);
				},
				error: function(){
					info.text('网络错误，用户验证失败');
					$("#btnSubmit").attr('disabled', false);
				}
			})
		}else{
			$("#btnSubmit").attr('disabled', false);
		}
	})
	// 自定义分类
	$('#custype').click(function(){
		var href = 'selfmediaArticleType.php?id='+id, title = $('#ac_name').val();
		try {
			parent.addPage("editMediaArticleType"+id, "article", title+"的自定义分类", "article/"+href);
		} catch(e) {}
	})

	var timer;
	$("#managerTable").delegate(".uid", "keydown", function(){
		$("#btnSubmit").attr('disabled', true);
	})
});
