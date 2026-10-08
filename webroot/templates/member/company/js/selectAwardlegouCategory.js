$(function(){

	var typeid = parseInt($("#typeid").val());

	//分类一级点击
	$(".t-list").delegate(".t-name", "click", function(){
		var subNav = $(this).next(".sub-nav");
		if(subNav.is(":visible")){
			subNav.hide();
			$(this).find("s").html("▼");
		}else{
			subNav.show();
			$(this).find("s").html("▲");
		}
	});

	//初始加载分类
	getTypeList(0, 0, 0);

	if(typeid){
		huoniao.operaJson("/include/ajax.php?service=shop&action=typeParent", "typeid="+typeid, function(data){
			if(data.info){
				data = data.info;
				$("#tList .t-item:eq(0)").find(".t-name").each(function(index, element) {
		        	var id = $(this).attr("data-id");
					if(id == data[0]){
						$(this).find("s").html("▲");
						return false;
					}
		        });
				$("#tList .t-item:eq(0)").find("li").each(function(index, element) {
		        	var id = $(this).attr("data-id");
					if(id == data[1]){
						$(this).parent().show();
						$("#tList li").removeClass("selected");
						$(this).addClass("selected");
						return false;
					}
		        });
				for(var i = 1; i < data.length-1; i++){
					getTypeList(data[i], i, data[i+1]);
				}

				getCurrTypeName();
			}
		});
	}

	//点击分类验证是否有子级
	$("#tList").delegate("li", "click", function(){
		var t = $(this), selected = t.attr("class"), id = t.attr("data-id"), pClass = t.parent().parent().attr("class"), ite = 0;
		if(pClass != undefined && pClass.indexOf("exp") > -1){
			t.parent().parent().parent().parent().find("li").removeClass("selected");
		}else{
			ite = t.parent().parent().parent().index();
			t.siblings("li").removeClass("selected");
		}
		$("#tList li").removeClass("selected")
		t.addClass("selected")

		$("#tList .t-item:eq("+ite+")").nextAll(".t-item").remove();

		if(t.find("s").html() != undefined && id != undefined){
			$("#btnNext").removeClass().addClass("btn btn-large").attr("disabled", true);
			$("#typeid").val("");
			typeid = 0;
			getTypeList(id, ite, 0);
		}else{
			$(".cc-nav.next").hide();
			var itemLength = $("#tList .t-item").length;
			if(itemLength > 4){
				var ml = (itemLength - 4) * 239;
				$(".cc-nav.prev").show();
				$("#tList").animate({"margin-left": -ml+"px"});
			}else{
				$("#tList").animate({"margin-left": 0});
			}
			$("#typeid").val(id);
			$("#btnNext").removeClass().addClass("btn btn-large btn-primary").removeAttr("disabled");
		}

		getCurrTypeName();
	});

	function getCurrTypeName(){
		var cTxt = [];
		$("#tList").find(".t-item").each(function(index, element) {
			var li = $(this).find("li.selected");
			if(li.size() > 0){
	      cTxt.push(li.html());
				if(li.find("s").html() != undefined && li.attr("data-id") != undefined){
					cTxt.push("&nbsp;>&nbsp;");
				}
			}
    });
		if(cTxt.length > 0){
			$("#cTxt").html(cTxt.join(""));
		}else{
			$("#cTxt").html(langData['siteConfig'][13][20]);
		}

		if($("#tList .t-item").length < 5){
			$(".cc-nav").hide();
		}
	}

	//左右点击
	var click = true;
	$(".cc-nav").bind("click", function(){
		if(!click) return false;
		click = false;
		var t = $(this), cla = t.attr("class"), itemLength = $("#tList .t-item").length, ml = Number($("#tList").css("margin-left").replace("px", ""));
		obj = cla.indexOf("next") > -1 ? "next" : "prev";
		ml = ml > 0 ? 0 : ml;
		ml = -ml > (itemLength - 4) * 239 ? (itemLength - 4) * 239 : ml;
		if(itemLength > 4){
			if(obj == "next"){
				if((itemLength - 4) * 239 != -ml){
					$(".cc-nav.prev").show();
					if((itemLength - 5) * 239 == -ml){
						$(".cc-nav.next").hide();
					}
					$("#tList").stop(true).animate({"margin-left": "-=239px"}, 200);
				}
			}else{
				if(ml != 0){
					$(".cc-nav.next").show();
					if(ml == -239){
						$(".cc-nav.prev").hide();
					}
					$("#tList").stop(true).animate({"margin-left": "+=239px"}, 200);
				}else{
					$(".cc-nav.prev").hide();
				}
			}
			setTimeout(function(){click = true;}, 200);
		}
	});

	//关键字模糊匹配
	$("#tList").delegate("input", "input", function(){
		var t = $(this), ite = t.parent().parent().parent(), val = $.trim(t.val());
		if(val != ""){
			ite.find(".sub-nav").css({"margin-top": 0}).show();
			ite.find(".sub-nav li").hide();
			ite.find(".exp").addClass("nob");
			ite.find(".t-name").hide();

			ite.find(".sub-nav li").each(function(index, element) {
				$(this).html($(this).html().replace(/\<font color\=\"red\"\>(.*?)\<\/font\>/g, "$1"));
        var txt = $(this).attr("title");
				if(txt.indexOf(val) > -1){
					$(this).html($(this).html().replace(val, '<font color="red">'+val+'</font>'));
					$(this).show();
				}
	    });

		}else{
			if(ite.index() != 0){
				ite.find(".sub-nav").css({"margin-top": 0}).show();
			}else{
				ite.find(".sub-nav").css({"margin-top": "-6px"}).hide();

				var parent = ite.find("li.selected").parent();
				if(parent.length > 0){
					parent.show();
					// parent.prev(".t-name").find("s").html("▲");
				}else{
					// ite.find(".t-name s").html("▼");
				}
			}
			ite.find(".sub-nav li").each(function(index, element) {
	    	$(this).html($(this).html().replace(/\<font color\=\"red\"\>(.*?)\<\/font\>/g, "$1"));
      });
			ite.find(".sub-nav li").show();
			ite.find(".exp").removeClass("nob");
			ite.find(".t-name").show();
		}
	});

	//确认，下一步
	$("#btnNext").bind("click", function(event){
		event.preventDefault();
		var src = $(".editform").attr("action"), typeid = parseInt($("#typeid").val()), id = parseInt($("#id").val());
		if(typeid != 0){
			var url = src.replace("%typeid%", typeid);
			if(id != 0){
				if(url.indexOf("?") > -1){
					url += "&id="+id;
				}else{
					url += "?id="+id;
				}
			}
			location.href = url;
		}
	});

	//获取分类列表
	function getTypeList(tid, ite, cid){
		huoniao.operaJson("/include/ajax.php?service=awardlegou&action=type", "tid="+tid, function(data){
			if(data.state == 100 && data.info){
				var list = [];
				list.push('<dl class="t-item">');
				list.push('  <dt><label class="clearfix"><s></s><input type="text" placeholder="'+langData['siteConfig'][19][560]+'" /></label></dt>');
                list.push('  <dd>');
				//第一级
				if(tid == 0){
					for(var i = 0; i < data.info.length; i++){
						list.push('    <ul>');
						list.push('      <li  data-id="'+data.info[i].id+'" title="'+data.info[i].typename+'">');
						list.push('        <span class="t-name" data-id="'+data.info[i].id+'" title="'+data.info[i].typename+'">'+data.info[i].typename+'</span>');
						var subnav = data.info[i].subnav;
						if(subnav){
							list.push('        <ul class="sub-nav">');
							for(var s = 0; s < subnav.length; s++){
								var arrow = "", selected = "";
								if(subnav[s].type == 1){
									arrow = '<s></s>';
								}
								if(subnav[s].id == typeid || subnav[s].id == cid){
									selected = " class='selected'"
								}
								list.push('          <li data-id="'+subnav[s].id+'" title="'+subnav[s].typename+'"'+selected+'>'+subnav[s].typename+arrow+'</li>');
							}
							list.push('        </ul>');
						}
						list.push('      </li>');
						list.push('    </ul>');
					}
				}else{
					list.push('    <ul class="sub-nav sub">');
					for(var i = 0; i < data.info.length; i++){
						var arrow = "", selected = "";
						if(data.info[i].type == 1){
							arrow = '<s></s>';
						}
						if(data.info[i].id == typeid || data.info[i].id == cid){
							selected = " class='selected'"
						}
						list.push('      <li data-id="'+data.info[i].id+'" title="'+data.info[i].typename+'"'+selected+'>'+data.info[i].typename+arrow+'</li>');
					}
					list.push('    </ul>');
				}
				list.push('  </dd>');
				list.push('</dl>');
				$("#tList").append(list.join(""));

				var itemLength = $("#tList .t-item").length;
				if(itemLength > 4){
					var ml = (itemLength - 4) * 239;
					$(".cc-nav.prev").show();
					$("#tList").animate({"margin-left": -ml+"px"}, 200);
				}else{
					$("#tList").animate({"margin-left": 0}, 200);
				}

				getCurrTypeName();

			}
		});
	}

});
