//实例化编辑器
var ue = UE.getEditor('body');

$(function () {

   //填充分站列表
   huoniao.choseCity($(".choseCity"),$("#cityid"));
   
    $(".chosen-select").chosen();


    huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//菜单递归分类
		selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var l=typeListArr.length;
			for(var i = 0; i < l; i++){
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
				})(typeListArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		},
		

	};

	
	huoniao.getTypeList(typeListArr,$('#typeBtn'));
	//选择
	$('.brand_box li').click(function(e){
		var t = $(this),p=t.parents('.brand_box');
		var btn = p.prev('.clearfix').find('.btn-group');
		var val = p.prev('.clearfix').find('input')
		huoniao.liClick(e,t,btn,val);
	});
	
	
	$('#typeBtn').click(function(e){
		var t = $(this),box = t.parents('.clearfix').next('.brand_box');
		var	ul = box.children('ul')
		$(this).parents('.clearfix').next('.brand_box').show();
		$(document).one('click',function(){
			$('.brand_box').hide();
		});
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

	//自动获取关键词、描述
	$(".autoget").bind("click", function(){
		var t = $(this), type = t.data("type");
		var title = $('#title').val();
		var body = ue.getContentTxt();
		if(body != ""){
			if(t.text() == "自动获取" || t.text() == "重新获取"){
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=autoget",
					data: "type="+type+"&title="+title+"&body="+body,
					type: "POST",
					dataType: "json",
					success: function(data){
						if(data.state == 100){
							$("#"+type).val(data.info);
							t.html("重新获取");
						}else{
							t.html("获取失败，请稍后重试！");
							setTimeout(function(){
								t.html("重新获取");
							}, 2000);
						}
					}
				});
			}
		}else{
			$.dialog.alert("请先输入内容！");
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
            cityid       = $("#cityid").val(),
			title        = $("#title"),
			typeid       = $("#typeid"),
			weight       = $("#weight");

        //城市
        if(cityid == '' || cityid == 0){
            $.dialog.alert('请选择城市');
            return false;
        };

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//分类
		if(typeid.val() == "" || typeid.val() == 0){
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			typeid.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//排序
		if(!huoniao.regex(weight)){
			huoniao.goTop();
			return false;
		}

		ue.sync();

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "carNewsList.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "Add"){
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
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});
