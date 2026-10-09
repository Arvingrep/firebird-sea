$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">不限分类</a></li>');

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
		}
	};

	//填充栏目分类
	$("#typeBtn").append(init.selectTypeList());

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

	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});

	//预览
	$("#preview").bind("click", function(){
		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: $(this).parents("form").serialize()+"&submit=" + encodeURI("预览"),
			dataType: "json",
			success: function(data){
				var content = "";
				if(data.state == 100){
					var dataList = [], list = data.info.list;
					for(var i = 0; i < list.length; i++){
						var data_ = [];
						for(var key in list[i]){
							data_.push('<font color="red">'+key+"：</font>"+list[i][key]);
						}
						dataList.push(data_.join("<br />"));
				 　　}
					content = dataList.join("<hr />");
				}else{
					content = data.info;
				};

				$.dialog({
					title: "预览结果",
					content: '<div style="height:300px; overflow-y:auto;">'+content+'</div>',
					width: 450,
					height: 300,
					ok: true
				});


			},
			error: function(msg){
				$.dialog.alert("网络错误，预览失败 ！");
			}
		});
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this);
		id = $("#id").val();
		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: $(this).parents("form").serialize()+"&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "save"){
						$.dialog({
							fixed: true,
							title: "生成成功",
							icon: 'success.png',
							content: "生成成功！",
							ok: function(){
								huoniao.goTop();
								window.location.reload();
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
								huoniao.goTop();
								window.location.reload();
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
