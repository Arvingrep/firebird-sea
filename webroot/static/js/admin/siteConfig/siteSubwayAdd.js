$(function(){
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	$("#pBtn").change(function(){
		var id = $(this).val();
		if(id != 0 && id != ""){
			cid = id;
			getCity(id);
		}else{
			cid = 0;
			$("#cBtn").html('<option value="0">--城市--</option>');
			$("#xBtn").html('<option value="0">--区县--</option>');
		}
	});

	$("#cBtn").change(function(){
		var id = $(this).val();
		if(id != 0 && id != ""){
			cid = id;
			getCity1(id);
		}else{
			cid = 0;
			$("#xBtn").html('<option value="0">--区县--</option>');
		}
	});

	$("#xBtn").change(function(){
		var id = $(this).val();
		if(id != 0 && id != ""){
			cid = id;
		}else{
			cid = $("#cBtn").val();
		}
	});

	if(provinceid != 0){
		getCity(provinceid);
	}

	if(cityid != 0){
		getCity1(cityid);
	}

	function getCity(id){
		huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					var select = "";
					if(data[i].id == cityid){
						select = " selected";
					}
					li.push('<option value="'+data[i].id+'"'+select+'>'+data[i].typename+'</option>');
				}
				$("#cBtn").html('<option value="0">--城市--</option>'+li.join(""));
			}else{
				$("#cBtn").html('<option value="0">--城市--</option>');
			}
		});
	}

	function getCity1(id){
		huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					var select = "";
					if(data[i].id == countyid){
						select = " selected";
					}
					li.push('<option value="'+data[i].id+'"'+select+'>'+data[i].typename+'</option>');
				}
				$("#xBtn").html('<option value="0">--区县--</option>'+li.join(""));
			}else{
				$("#xBtn").html('<option value="0">--区县--</option>');
			}
		});
	}

	//提示
	$('#menus i, #menus a').tooltip();
	$('#menus i').bind("mousedown", function(){
		$('#menus i').tooltip("hide");
	});

	//拖动排序
	$("#menus").dragsort({ dragSelector: "h3>i" });
	$("#menus ul").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });

	//新增线路
	$("#addItem").bind("click", function(){
		var itemHtml = '<div class="menus-item clearfix"><h3><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-title"placeholder="线路名"class="input-small"data-id="0"/></h3><div class="del-item"><a href="javascript:;"><i class="icon-trash"></i>删除此线路</a></div><ul class="clearfix"><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li><li><i data-toggle="tooltip"data-placement="right"data-original-title="拖动以排序"class="icon-move"></i><input type="text"name="m-list"placeholder="站点"class="input-medium"data-id="0"/><a data-toggle="tooltip"data-placement="right"data-original-title="删除"href="javascript:;"class="icon-trash"></a></li></ul><a href="javascript:;"class="addNewList"><i class="icon-plus"></i>新增站点</a></div>';
		$("#menus").append(itemHtml);

		$('#menus i, #menus a').tooltip();
		$('#menus i').bind("mousedown", function(){
			$('#menus i').tooltip("hide");
		});

		$("#menus").dragsort("destroy");
		$("#menus ul").dragsort("destroy");
		$("#menus").dragsort({ dragSelector: "h3>i" });
		$("#menus ul").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });
	});

	//新增站点
	$("#menus").delegate(".addNewList", "click", function(){
		var listHtml = '<li><i data-toggle="tooltip" data-placement="right" data-original-title="拖动以排序" class="icon-move"></i><input type="text" name="m-list" placeholder="站点" class="input-medium" data-id="0" /><a data-toggle="tooltip" data-placement="right" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>';
		$(this).prev("ul").append(listHtml);

		$('#menus i, #menus a').tooltip();
		$('#menus i').bind("mousedown", function(){
			$('#menus i').tooltip("hide");
		});
	});

	//删除线路
	$("#menus").delegate(".del-item", "click", function(){
		var t = $(this);
		if($(this).closest("#menus").find(".menus-item").length == 1){
			$.dialog.alert("至少保留一条线路！");
		}else{
			$.dialog.confirm("您确定要删除此线路吗？", function(){
				t.closest(".menus-item").hide(300, function(){
					t.closest(".menus-item").remove()
				});

				//异步删除
				var id = t.prev("h3").find("input").data("id");
				huoniao.operaJson("siteSubway.php?dopost=delSubway", "id="+id);
			});
		}
	});

	//删除站点
	$("#menus").delegate(".icon-trash", "click", function(){
		var parent = $(this).parent();
		if($(this).closest("ul").find("li").length == 1){
			$.dialog.alert("至少保留一个站点！");
		}else{
			parent.hide(300, function(){
				parent.remove()
			});

			//异步删除
			var id = $(this).prev("input").data("id");
			huoniao.operaJson("siteSubway.php?dopost=delStation", "id="+id);
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

	//搜索回车提交
  $("#editform input").keyup(function(e){
    if(!e){
      var e = window.event;
    }
    if(e.keyCode){
      code = e.keyCode;
    }else if(e.which){
      code = e.which;
    }
    if(code === 13){
      $("#btnSubmit").click();
    }
  });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this),
			id = $("#id").val();

		if(cid == 0){
			$.dialog.alert("请选择所在城市");
			return false;
		}

		var menus = [];
		$("#menus").find(".menus-item").each(function(index, element) {
      var t = $(this), tit = t.find("h3 input[name=m-title]").val(), tid = t.find("h3 input[name=m-title]").data("id");
			if($.trim(tit) != ""){
				var mValues = [];
				t.find("ul li").each(function(index, element) {
          var val = $(this).find("input[name=m-list]").val(), id = $(this).find("input[name=m-list]").data("id");
					if($.trim(val) != ""){
						mValues.push(val+"^"+id);
					}
        });

				if(mValues){
					menus.push(tit+"^"+tid+"$$"+mValues.join("||"));
				}
			}
    });
		if(menus){
			menus = menus.join("@@@");
		}else{
			menus = "";
		}

		t.attr("disabled", true);

		var data = [];
		data.push("dopost="+$("#dopost").val());
		data.push("id="+$("#id").val());
		data.push("token="+$("#token").val());
		data.push("cid="+cid);
		data.push("menus="+menus);
		data.push("submit="+encodeURI("提交"));

		//异步提交
		huoniao.operaJson("siteSubway.php", data.join("&"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "add"){
					$.dialog({
						fixed: true,
						title: "添加成功",
						icon: 'success.png',
						content: "添加成功！",
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
							try{
								$("body",parent.document).find("#nav-siteSubwayphp").click();
								parent.reloadPage($("body",parent.document).find("#body-siteSubwayphp"));
								$("body",parent.document).find("#nav-siteSubwayEdit"+sid+" s").click();
							}catch(e){
								location.href = thisPath + "siteSubway.php";
							}
						},
						cancel: false
					});
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
