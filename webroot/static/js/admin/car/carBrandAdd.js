$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		/* treeTypeList: function(){
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
		}, */
		//菜单递归分类
		selectTypeList: function(type){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');
			var l = type == 'brand' ? brandListArr : levelListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+' ><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
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
		},

	};
	/*20190815   开始修改*/
	//获取数据
	huoniao.getTypeList(brandListArr,$('#brandBtn'));
	huoniao.getTypeList(levelListArr,$('#typeBtn'));

	//选择
	$('.brand_box li').click(function(e){
		var t = $(this),p=t.parents('.brand_box ');
		var btn = p.prev('.clearfix').find('.btn-group');
		var val = p.prev('.clearfix').find('input')
		huoniao.liClick(e,t,btn,val);
	});


	$('#brandBtn,#typeBtn').click(function(e){
		var t = $(this),box = t.parents('.clearfix').next('.brand_box');
		var	ul = box.children('ul')
		$(this).parents('.clearfix').next('.brand_box').show();
		$(document).one('click',function(){
			$('.brand_box').hide();
		});
	})

	/*20190815   结束修改*/


	//填充栏目分类
//	$("#typeBtn").append(init.selectTypeList());
//	$("#brandBtn").append(init.selectTypeList('brand'));  //20190815注释

	$("#prodate").datetimepicker({format: 'yyyy', autoclose: true, minView: 0, language: 'ch', startView: 4, minView: 4});

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#level").val(id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#level").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#level").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
	});

	$("#brandBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#brand").val(id);
		$("#brandBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#brand").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#brand").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
		}
	});

	//发布选择分类
	/* $("#brand").change(function(){
		var t = $(this), id = t.val();
		if(id){
			huoniao.operaJson("carBrand.php?dopost=getChildType", "type="+id, function(data){
				if(!data) {
					$("#carsystemList").find("select").remove().hide();
					return false;
				}
				var option = [], list = data.list;
				for(var i = 0; i < list.length; i++){
					option.push('<option value="'+list[i].id+'">'+list[i].title+'</option>');
				}
				if(option){
					$("#carbrand").show();
					$("#carsystemList").find("select").remove();
					$("#carsystemList").append('<select name="carsystem" id="carsystem" class="input-large"><option value="">请选择分类</option>'+option.join("")+'</select>');
				}
			});
		}else{
			$("#carsystemList").remove();
		}
	}); */

	//填充栏目分类
	//$("#typeid").html(init.treeTypeList());

    //填充城市列表
    //huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
    //$(".chosen-select").chosen();

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
			brand        = $("#brand").val(),
			level        = $("#level").val(),
			carsystem    = $("#carsystem").val(),
			title        = $("#title"),
			litpic       = $("#litpic"),
			weight       = $("#weight");

        //分类
		if(brand == "" || brand == "0"){
			$("#brandList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#brandList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//分类
		/* if(carsystem == "" || carsystem == "0"){
			$("#carsystemList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#carsystemList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		} */

		//品牌名称
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//分类
		if(level == "" || level == "0"){
			$("#typeBtn").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeBtn").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//排序
		if(!huoniao.regex(weight)){
			huoniao.goTop();
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "carBrand.php?dopost="+$("#dopost").val(),
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
								location.reload();
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
