$(function(){
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	huoniao.parentHideTip();

	var init = {
		//树形递归分类
		treeTypeList: function(){
			var typeList = [], cl = "";
			var l = typeListArr;
			typeList.push('<option value="">选择分类</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(type == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(type == jArray[k]["id"]){
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
				})(l[i]);
			}
			return typeList.join("");
		}

		//菜单递归分类
		,selectTypeList: function(type){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var l= type == "addr" ? addrListArr : typeListArr;
			for(var i = 0; i < l.length; i++){
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
				})(l[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		}

	};

	//填充职位类别
	$("#typeBtn").append(init.selectTypeList());

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#type").val(id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');

		if(id != 0){
			$("#type").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}else{
			$("#type").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
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

	//模糊匹配中介公司
	$("#company").bind("input", function(){
		$("#comid").val("0");
		$("#tel").val("");
		$("#email").val("");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkJobCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#comList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" data-tel="'+data[i].contact+'" data-email="'+data[i].email+'">'+data[i].title+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#comList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#comList").html("").hide();
				}
			});

		}else{
			$("#comList").html("").hide();
		}
    });

	$("#comList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id"), tel = $(this).attr("data-tel"), email = $(this).attr("data-email");
		$("#company").val(name);
		$("#comid").val(id);
		$("#tel").val(tel);
		$("#email").val(email);
		$("#comList").html("").hide();
		$("#company").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
		return false;
	});

	$(document).click(function (e) {
      var s = e.target;
      if (!jQuery.contains($("#comList").get(0), s)) {
          if (jQuery.inArray(s.id, "zjcom") < 0) {
              $("#comList").hide();
          }
      }
  });

	$("#company").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkJobCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].title == val){
							flag = true;
							$("#company").val(data[i].title);
							$("#comid").val(data[i].id);
							$("#tel").val(data[i].contact);
							$("#email").val(data[i].email);
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").addClass("input-ok");
				}else{
					t.siblings(".input-tips").addClass("input-error");
				}
			});
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择公司');
		}
	});

	$("#valid").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
	$("#pubdate").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, todayBtn: true, minuteStep: 5, language: 'ch'});

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
		$('#addr').val($('.addrBtn').attr('data-id'));

		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			type         = $("#type"),
			comid        = $("#comid").val(),
			company      = $("#company").val(),
			valid        = $("#valid").val(),
			number       = $("#number"),
			addr         = $("#addr"),
			experience   = $("#experience").val(),
			educational  = $("#educational").val(),
			salary       = $("#salary").val(),
			tel          = $("#tel"),
			email        = $("#email"),
			weight       = $("#weight");

		if(!huoniao.regex(title)){
			huoniao.goInput($("#title"));
			return false;
		}

		if(type.val() == "" || type.val() == 0){
			type.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			type.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(comid == "" || comid == 0 || company == ""){
			$("#company").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goInput($("#company"));
			return false;
		}

		if(valid == ""){
			huoniao.goInput($("#valid"));
			$.dialog.alert("请选择有效期");
			return false;
		}

		if(!huoniao.regex(number)){
			huoniao.goInput(number);
			return false;
		}

		if(addr.val() == "" || addr.val() == 0){
			addr.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			addr.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(experience == "" || experience == 0){
			huoniao.goInput($("#experience"));
			$("#experienceList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#experienceList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(educational == "" || educational == 0){
			huoniao.goInput($("#educational"));
			$("#educationalList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#educationalList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(salary == "" || salary == 0){
			huoniao.goInput($("#salary"));
			$("#salaryList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#salaryList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		if(!huoniao.regex(email)){
			// huoniao.goInput(email);
			// return false;
		}

		if(!huoniao.regex(weight)){
			huoniao.goInput(weight);
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("jobPostAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
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
