$(function(){

	if(typeidLevel != ''){
		var typeArr = typeidLevel.split(' '), typeLen = typeArr.length;
	    var typeCon = $(".sel-group");
	    typeCon.html('');
	    getChildType('0',true,0);
	}

	//交友标签
	$('#tagBtn').click(function(){
		var btn = $(this), input = $('#tags'), valArr = input.val().split(",");

		$('.tagBox').removeClass('initial');
		$('.tag-mask').show();
		$('#main').addClass('gz-sel-addr-active');
		$('html').addClass('bgblack');

	    $.ajax({
      		url: masterDomain+"/include/ajax.php?service=dating&action=tags",
      		dataType: "JSONP",
      		success: function(data){
      			console.log(data)
        		if(data && data.state == 100){
          			data = data.info;
	  				var content = [], selected = [];
	  				content.push('<div class="tagselect">');
	  				content.push('<p>'+langData['siteConfig'][19][788]+'</p><div class="box"></div></div>');
	  				content.push('<div class="tagtype"><div class="scrollbox"><div class="box">');
	  				for(var i = 0; i < data.length; i++){
	  					content.push('<a'+ (i == 0 ? ' class="active"' : "") +' href="#tab'+i+'">'+data[i].typename+'</a>');
	  				}
	  				content.push('</div></div></div><div class="taglist">');
	  				for(var i = 0; i < data.length; i++){
	  					content.push('<div class="pane'+(i == 0 ? "" : " fn-hide")+'" id="tab'+i+'">')
	  					for(var l = 0; l < data[i].lower.length; l++){
	  						var id = data[i].lower[l].id, name = data[i].lower[l].typename;
	  						if($.inArray(id, valArr) > -1){
	  							selected.push('<a href="javascript:;" data-id="'+id+'">'+name+' &times;</a>');
	  						}
	  						content.push('<a href="javascript:;"'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'+</a>');
	  					}
	  					content.push('</div>');
	  				}
	  				content.push('</div>');

	  				$('.tag-body').html(content.join(""));

					// 关闭
					parent.$('.tag-box-close,.tag-mask').click(function(){
						closeTagBox();
					})
					function closeTagBox(){
						var html = [], ids = [];
  						parent.$(".tagselect .box a").each(function(){
  							var id = $(this).attr("data-id");
  							if(id){
  								ids.push(id);
  								html.push($(this).text().replace("×",""));
  							}
  						});
  						btn.val(html.join(" "))
						input.val(ids.join(","));
						$('.tagBox').addClass('initial');
						$('.tag-mask').hide();
						$('#main').removeClass('gz-sel-addr-active');
						$('html').removeClass('bgblack');
					}
	  				var selectedObj = parent.$(".tagselect .box");
	  				//填充已选
	  				selectedObj.append(selected.join(""));

	  				//TAB切换
	  				parent.$('.tagtype a').click(function (e) {
	  					e.preventDefault();
	  					var obj = $(this).attr("href").replace("#", "");
	  					if(!$(this).hasClass("active")){
	  						$(this).siblings().removeClass("active");
	  						$(this).addClass("active");

	  						$(".taglist").find(".pane").hide();
	  						parent.$("#"+obj).show();
	  					}
	  				});

	  				//选择标签
	  				parent.$(".taglist a").click(function(){
	  					if(!$(this).hasClass("checked")){
	  						var length = selectedObj.find("a").length;
	  						if(length >= tagsLength){
	  							alert(langData['siteConfig'][20][299].replace('1', tagsLength));
	  							return false;
	  						}

	  						var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
	  						$(this).addClass("checked");
	  						selectedObj.append('<a href="javascript:;" data-id="'+id+'">'+name+' &times;</a>');
	  					}
	  				});

	  				//取消已选
	  				selectedObj.delegate("a", "click", function(){
	  					var pp = $(this), id = pp.attr("data-id");

	  					parent.$(".taglist").find("a").each(function(index, element) {
	              		if($(this).attr("data-id") == id){
	  							$(this).removeClass("checked");
	  						}
	            		});

	  					pp.remove();
	  				});

	  			}
			}
		})
	});

	//删除已选择的标签/技能（非浮窗）
	$(".selectedTags").delegate("span a", "click", function(){
		var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().siblings("input");
		pp.remove();

		var val = input.val().split(",");
		val.splice($.inArray(id,val),1);
		input.val(val.join(","));
	});



	//选择区域
	$(".sel-group").delegate('select','change',function(){
	    var t = $(this), id = t.val();
	    t.nextAll("select").remove();
	    if(id != '' && id != 0){
	    	getChildType(id);
	    }
	});

	//获取子级分类
	function getChildType(id,getLeave,no){
		if(id == undefined || id == '') return;
    	var sid = 0;
		$.ajax({
			url: masterDomain + "/include/ajax.php?service=dating&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<select>');
					html.push('<option value="0">'+langData['siteConfig'][7][2]+'</option>');
					for(var i = 0; i < list.length; i++){
			            var selected = '';
			            var sname = list[i].typename;
			            if(getLeave){
			              if($.trim(typeArr[no]) != '' && $.trim(typeArr[no]) == sname){
			                selected = ' selected="selected"';
			                sid = list[i].id;
			              }
			            }
						html.push('<option value="'+list[i].id+'"'+selected+'>'+sname+'</option>');
					}
					html.push('</select>');

					$(".sel-group").append(html.join(""));
					if(getLeave && (no) < typeLen){
						getChildType(sid,true,++no);
					}
				}
			}
		});
	}


    //提交
	$("#submit").bind("click", function(event){
		event.preventDefault();

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		var t = $(this);

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled").html(langData['siteConfig'][7][9]+"...");

		var addrid = 0;
		$('#selAddr select').each(function(){
			var id = $(this).val();
			if(id) addrid = id;
		})
		$('#addrid').val(addrid);

		var url = t.closest("form").attr("action"), data = t.closest("form").serialize();

		$.ajax({
			url: url,
			data: data,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data.state == 100){
					t.removeClass("disabled").html(langData['siteConfig'][6][39]);
					setTimeout(function(){
						t.html(langData['siteConfig'][6][62]);
					},500)
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][62]);
				}
			},
			error: function(){
				t.removeClass("disabled").html(langData['siteConfig'][6][62]);
				alert(langData['siteConfig'][20][253]);
			}
		});

  });


})
