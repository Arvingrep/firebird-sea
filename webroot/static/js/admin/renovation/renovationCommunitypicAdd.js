$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		},

		//树形递归分类
		treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(addrid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(addrid == jArray[k]["id"]){
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
	};

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});


	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			litpic       = $("#litpic").val();


		
		if(litpic == ""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请上传小区图片！", "auto");
			return false;
		};

		
		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length > 0){
			var content = $('#imglist').val().replace(/\|/g, "##").replace(/,/g, "||");
			$('#imglist').val(content);
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("renovationCommunityAdd.php", $("#editform").serialize() + "&token="+$("#token").val() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();

				}else{

					huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
