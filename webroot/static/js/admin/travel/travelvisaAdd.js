$(function(){
    var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			var l = type == 'country' ? countryListArr : addrListArr;
			if(type == 'country'){
				typeList.push('<option value="">选择国家</option>');
			}else{
				typeList.push('<option value="">选择地区</option>');
			}
			
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if((type == "country" && country == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
						selected = " selected";
					}
					if(jsonArray['lower'] != "" && type == "type"){
						typeList.push('<optgroup label="'+cl+"|--"+jsonArray["typename"]+'"></optgroup>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if((type == "country" && country == jArray[k]["id"]) || (type == "addr" && addr == jArray[k]["id"])){
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
		},

		//菜单递归分类
        selectTypeList: function(type){
            var typeList = [], title = type == 'country' ? "选择国家" : "选择类型";
            typeList.push('<ul class="dropdown-menu">');
            typeList.push('<li><a href="javascript:;" data-id="0">'+title+'</a></li>');

            var l = type == 'country' ? countryListArr : typeListArr;

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

	$("#country").append(init.treeTypeList("country"));
	$("#typeBtn").append(init.selectTypeList("type"));

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];


	//二级菜单点击事件
	$("#countryBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#country").val(id);
        $("#countryBtn button").html(title+'<span class="caret"></span>');

        if(id != 0){
            $("#country").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }else{
            $("#country").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
        }
	});
	
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
	$("#zjcom").bind("input", function(){
		$("#comid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("../inc/json.php?action=checkTravelStore", "key="+val+"&filter=7", function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#comList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].title+'</li>');
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
	
	$("#zjcom").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjcom(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择所属店铺');
		}
	});

    $("#comList").delegate("li", "click", function(){
        var name = $(this).text(), id = $(this).attr("data-id"),inputname =$("#zjcom") ;
        $("#zjcom").val(name);
        $("#comid").val(id);
        $("#comList").html("").hide();
        $("#zjcom").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkZjcom(inputname, name);
        return false;
    });

    function checkZjcom(t, val){
        var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkTravelStore", "key="+val+"&filter=7", function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].title == val){
                        flag = true;
                        $("#zjcom").val(data[i].title);
                        $("#comid").val(data[i].id);
                    }
                }
            }
            if(flag){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}
	

	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#comList").get(0), s)) {
            if (jQuery.inArray(s.id, "zjcom") < 0) {
                $("#comList").hide();
            }
        }
    });

	//开始、结束、有效时间
    $("#earliestdate").datetimepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        minView: 0,
        language: 'ch'
	});

	var noticeHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	// var incumbentsscienceHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	// var retireescienceHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	// var professionalscienceHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	// var studentsscienceHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	// var childrenscienceHtml = '<dl><dt><input type="text" class="dt" placeholder="请输入标题" value="" /></dt><dd><textarea placeholder="请输入内容" class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	$("#notice").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#notice").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#notice").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#notice dl").length <= 0){
			$("#notice").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#notice").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//在职人员

	$("#incumbentsscience").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#incumbentsscience").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#incumbentsscience").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#incumbentsscience dl").length <= 0){
			$("#incumbentsscience").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#incumbentsscience").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//退休人员retireescience

	$("#retireescience").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#retireescience").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#retireescience").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#retireescience dl").length <= 0){
			$("#retireescience").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#retireescience").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//自由职业者professionalscience

	$("#professionalscience").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#professionalscience").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#professionalscience").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#professionalscience dl").length <= 0){
			$("#professionalscience").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#professionalscience").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//在校学生studentsscience

	$("#studentsscience").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#studentsscience").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#studentsscience").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#studentsscience dl").length <= 0){
			$("#studentsscience").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#studentsscience").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//学龄前儿童childrenscience

	$("#childrenscience").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#childrenscience").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});

	$("#childrenscience").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#childrenscience dl").length <= 0){
			$("#childrenscience").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	$("#childrenscience").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });


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
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			comid        = $("#comid").val(),
			weight       = $("#weight");


		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if(comid == "" || comid == 0 || zjcom == ""){
			$("#zjcom").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			huoniao.goTop();
			return false;
		}

		if(!huoniao.regex(weight)){
			return false;
		}

		var notice = [], noticeItem = $("#notice dl");
		if(noticeItem.length > 0){
			for(var i = 0; i < noticeItem.length; i++){
				var obj = $("#notice dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				notice.push(tit+"$$$"+con);
			}
		}

		//在职人员
		var incumbentsscience = [], incumbentsscienceItem = $("#incumbentsscience dl");
		if(incumbentsscienceItem.length > 0){
			for(var i = 0; i < incumbentsscienceItem.length; i++){
				var obj = $("#incumbentsscience dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				incumbentsscience.push(tit+"$$$"+con);
			}
		}

		//退休人员
		var retireescience = [], retireescienceItem = $("#retireescience dl");
		if(retireescienceItem.length > 0){
			for(var i = 0; i < retireescienceItem.length; i++){
				var obj = $("#retireescience dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				retireescience.push(tit+"$$$"+con);
			}
		}

		//自由职业者
		var professionalscience = [], professionalscienceItem = $("#professionalscience dl");
		if(professionalscienceItem.length > 0){
			for(var i = 0; i < professionalscienceItem.length; i++){
				var obj = $("#professionalscience dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				professionalscience.push(tit+"$$$"+con);
			}
		}

		//儿童
		var childrenscience = [], childrenscienceItem = $("#childrenscience dl");
		if(childrenscienceItem.length > 0){
			for(var i = 0; i < childrenscienceItem.length; i++){
				var obj = $("#childrenscience dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				childrenscience.push(tit+"$$$"+con);
			}
		}

		//在校学生
		var studentsscience = [], studentsscienceItem = $("#studentsscience dl");
		if(studentsscienceItem.length > 0){
			for(var i = 0; i < studentsscienceItem.length; i++){
				var obj = $("#studentsscience dl:eq("+i+")");
				var tit = obj.find("input").val();
				var con = obj.find("textarea").val();
				studentsscience.push(tit+"$$$"+con);
			}
		}


		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("travelvisaAdd.php", $("#editform").serialize() + "&processingflow="+notice.join("|||") +"&incumbentsscience=" + incumbentsscience.join("|||") + "&retireescience="+retireescience.join("|||")+"&professionalscience="+professionalscience.join("|||")+"&childrenscience="+childrenscience.join("|||")+"&studentsscience="+studentsscience.join("|||")+"&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

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
		});
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

});

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "travel",
		type: "delVideo",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
