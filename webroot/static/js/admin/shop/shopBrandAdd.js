$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(){
			var typeList = [];
			var l=typeListArr;
			typeList.push('<option value="">选择分类</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(typeid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+jsonArray["typename"]+'</option>');
				})(l[i]);
			}
			return typeList.join("");
		}

	};

	//填充栏目分类
	$("#typeid").html(init.treeTypeList());

   //填充分站列表
   // huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化

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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
            cityid       = $("#cityid").val(),
			typeid       = $("#typeid").val(),
			title        = $("#title"),
			litpic       = $("#litpic"),
			weight       = $("#weight");

        //城市
        // if(cityid == '' || cityid == 0) {
        //     $.dialog.alert('请选择城市');
        //     return false;
        // }

        //分类
		if(typeid == "" || typeid == "0"){
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//品牌名称
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//品牌logo
		if(litpic == ""){
			huoniao.goTop();
			$.dialog.alert("请上传品牌logo");
			return false;
		}

		//排序
		if(!huoniao.regex(weight)){
			huoniao.goTop();
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "shopBrand.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "Add"){
						huoniao.goTop();
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-shopBrandphp").click();
									parent.reloadPage($("body",parent.document).find("#body-shopBrandphp"));
									$("body",parent.document).find("#nav-shopBrandEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "shopBrand.php";
								}
							},
							cancel: false
						});
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
