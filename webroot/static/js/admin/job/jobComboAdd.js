//实例化编辑器

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
			var l = [];
			var s = [];
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
	$("#industry").html(init.treeTypeList("industry"));

	//修改有效期类型
	function change_valid_type(){
		let type = $(":radio[name=valid_type]:checked").val();
		if(type==1){
			$("#valid_type_val").removeClass("hide");
		}else{
			$("#valid_type_val").addClass("hide");
		}
	}
	change_valid_type();
	$(":radio[name=valid_type]").change(change_valid_type);

	//修改职位类型
	function change_job_type(){
		let type = $(":radio[name=job_type]:checked").val();
		if(type==1){
			$("#job_type_val").removeClass("hide");
		}else{
			$("#job_type_val").addClass("hide");
		}
	}
	change_job_type();
	$(":radio[name=job_type]").change(change_job_type);

	//修改简历类型
	function change_resume_type(){
		let type = $(":radio[name=resume_type]:checked").val();
		if(type==1){
			$("#resume_type_val").removeClass("hide");
		}else{
			$("#resume_type_val").addClass("hide");
		}
	}
	change_resume_type();
	$(":radio[name=resume_type]").change(change_resume_type);



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

	//显示与隐藏修改内容
	$(".changeRefuse").click(function (event){
		let item = $(event.target).parent().next().removeClass("hide");
	});
	$(".changeSuccess").click(function (event){
		let item = $(event.target).parent().next().next().addClass("hide");
	});

	//域名过期时间
	$("#domainexp").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, language: 'ch'});

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
    // $("#editform input").keyup(function (e) {
    //     if (!e) {
    //         var e = window.event;
    //     }
    //     if (e.keyCode) {
    //         code = e.keyCode;
    //     }
    //     else if (e.which) {
    //         code = e.which;
    //     }
    //     if (code === 13) {
    //         $("#btnSubmit").click();
    //     }
    // });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			valid_type   = $(":radio[name=valid_type]:checked").val(),
			valid		 = $("#valid").val(),
			job_type     = $(":radio[name=job_type]:checked").val(),
			job			 = $("#job").val(),
			resume_type  = $(":radio[name=resume_type]:checked").val(),
			resume		 = $("#resume").val(),
			money 		 = $("#money").val();

		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};

		if(valid_type==1){
			if(valid<1){
				$.dialog.alert("有效期不能为0");
				return false;
			}
		}
		if(job_type==1){
			if(job<1){
				$.dialog.alert("职位数不能为0");
				return false;
			}
		}
		if(resume_type==1){
			if(resume<1){
				$.dialog.alert("简历数不能为0");
				return false;
			}
		}

		if(money<=0){
			$.dialog.alert("套餐价格不能为0");
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("jobComboAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
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
