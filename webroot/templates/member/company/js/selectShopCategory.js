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
	// getTypeList(0, 0, 0);

	if(typeid){
		huoniao.operaJson("/include/ajax.php?service=shop&action=typeParent", "typeid="+typeid, function(data){
			if(data.info){
				data = data.info;
				// $("#tList .t-item:eq(0)").find(".t-name").each(function(index, element) {
		  //       	var id = $(this).attr("data-id");
				// 	if(id == data[0]){
				// 		$(this).find("s").html("▲");
				// 		return false;
				// 	}
		  //       });
				// $("#tList .t-item:eq(0)").find("li").each(function(index, element) {
		  //       	var id = $(this).attr("data-id");
				// 	if(id == data[1]){
				// 		$(this).parent().show();
				// 		$(this).addClass("selected");
				// 		return false;
				// 	}
		  //       });
				// for(var i = 1; i < data.length-1; i++){
				// 	getTypeList(data[i], i, data[i+1]);
				// }

				// getCurrTypeName();
				
				$(".typeList:not(.rootList) li").each(function(){
					var t = $(this);
					var par = t.closest('.fl_list');
					var typelist = par.closest('.typeList');
					if(data[0] == par.attr("data-id")){
						var pid = par.attr('data-id'),id = t.attr('data-id');
						typelist.scrollTop(par.attr('data-top'));
						if(data.length == 2 && id == data[1]){
							t.click();
						}


					}
				})
				
				
			}
		});
	}

	//点击分类验证是否有子级
	// $("#tList").delegate(".sub-nav li", "click", function(){
	// 	var t = $(this), selected = t.attr("class"), id = t.attr("data-id"), pClass = t.parent().parent().attr("class"), ite = 0;
	// 	if(pClass != undefined && pClass.indexOf("exp") > -1){
	// 		t.parent().parent().parent().parent().find("li").removeClass("selected");
	// 	}else{
	// 		ite = t.parent().parent().parent().index();
	// 		t.siblings("li").removeClass("selected");
	// 	}
	// 	t.addClass("selected");

	// 	$("#tList .t-item:eq("+ite+")").nextAll(".t-item").remove();

	// 	if(t.find("s").html() != undefined && id != undefined){
	// 		$("#btnNext").removeClass().addClass("btn btn-large").attr("disabled", true);
	// 		$("#typeid").val("");
	// 		typeid = 0;
	// 		getTypeList(id, ite, 0);
	// 	}else{
	// 		$(".cc-nav.next").hide();
	// 		var itemLength = $("#tList .t-item").length;
	// 		if(itemLength > 4){
	// 			var ml = (itemLength - 4) * 239;
	// 			$(".cc-nav.prev").show();
	// 			$("#tList").animate({"margin-left": -ml+"px"});
	// 		}else{
	// 			$("#tList").animate({"margin-left": 0});
	// 		}
	// 		$("#typeid").val(id);
	// 		$("#btnNext").removeClass().addClass("btn btn-large btn-primary").removeAttr("disabled");
	// 	}

	// 	getCurrTypeName();
	// });

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
					parent.prev(".t-name").find("s").html("▲");
				}else{
					ite.find(".t-name s").html("▼");
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
			var modAdrr = $('#modAdrr').val();
			if(id != 0){
				if(url.indexOf("?") > -1){
					url += "&id="+id+'&modAdrr='+modAdrr;
				}else{
					url += "?id="+id+'&modAdrr='+modAdrr;
				}
			}else{
				url = url+'?modAdrr='+modAdrr
			}
			

			location.href = url;
		}
	});

	//获取分类列表
	function getTypeList(tid, ite, cid){
		huoniao.operaJson("/include/ajax.php?service=shop&action=getTypeList", "tid="+tid, function(data){
			if(data.state == 100 && data.info){
				var list = [];
				list.push('<dl class="t-item">');
				list.push('  <dt><label class="clearfix"><s></s><input type="text" placeholder="'+langData['siteConfig'][19][560]+'" /></label></dt>');
                list.push('  <dd>');
				//第一级
				if(tid == 0){
					for(var i = 0; i < data.info.length; i++){
						list.push('    <ul>');
						list.push('      <li class="exp">');
						list.push('        <span class="t-name" data-id="'+data.info[i].typeid+'" title="'+data.info[i].typename+'">'+data.info[i].typename+'<s>▼</s></span>');
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
	/*********2021-12-21 新增团购发布************/
	//选择商品模板
	$('.choseMod .choseCon .comCon').click(function(){
		$(this).addClass('active').siblings('.comCon').removeClass('active');
		var modname = $(this).attr('data-type');
		$('#modAdrr').val(modname);
	})
	//模板后的下一步
	$('.nextStep').click(function(){
		$('.choseMod,.xztit1').addClass('fn-hide');
		$('.choseFenlei,.xztit2').removeClass('fn-hide');
		$(".flList .fl_list").each(function(){
			var t = $(this);
			t.attr('data-top',t.position().top);
		})
	})


	if($(".flList .fl_list").length){
		$(".flList .fl_list").each(function(){
			var t = $(this);
			t.attr('data-top',t.position().top);
		})
	}

	

	// 20220421 修改类型选择
	canhover = true; //可以触发hover事件，避免误触
	$(".rootList li").hover(function(){
		if(canhover){
			var t = $(this) , id = t.attr('data-id'), lower = t.attr('data-lower');
			var ul = t.closest('.rootList')
			var nextUl = ul.next('.typeList');
			var scrTop = nextUl.find('.fl_list[data-id="'+id+'"]').attr('data-top')
			nextUl.scrollTop(scrTop - 60);
		}
	},function(){
		canhover = true;
	});

	// 点击获取
	var startAjax = false;
	var typenameArr = [];
	var typeidArr = []; //选择的分类 
	$('body').delegate('.typeList:not(.rootList) li','click',function(){
		var t = $(this), id = t.attr('data-id'),lower = t.attr('data-lower');
		var currUl = t.closest('.typeList'); //当前窗口
		var nextUl = currUl.next('.typeList');  //下一个窗口
		currUl.nextAll('.typeList').find('li').removeClass('chosed');
		currUl.find('li').removeClass('chosed')
		t.addClass('chosed')
		var pid = t.closest('.typeList').attr('data-pid')

		if(t.closest('.fl_list').length > 0){ //二级分类
			var fllist = t.closest('.fl_list');
			typenameArr = [];
			typeidArr = [];
			typenameArr.push(fllist.find('h4').text()); //一级分类			
			typenameArr.push(t.text()); //二级分类			
			typeidArr.push(fllist.attr("data-id")); //一级分类			
		}else{
			var index = currUl.index();
			if(typeidArr.length >= index){
				typenameArr = typenameArr.slice(0,(index ))
				typeidArr = typeidArr.slice(0,(index ))
			}

			typenameArr.push(t.text()); //一级分类			
			typeidArr.push(t.attr("data-id")); //一级分类	
		}
		if(lower > 0){
			getshopType(id,nextUl);
			$("#btnNext").removeClass().addClass("btn btn-large").attr("disabled", true);
		}else{
			nextUl.remove()
			$("#typeid").val(id);
			$("#btnNext").removeClass().addClass("btn btn-large btn-primary").removeAttr("disabled");
		}

		$("#cTxt").text(typenameArr.join('>')).attr('data-id',typeidArr.join(','))
		
	});


	// 搜索分类
	var lock_chinese = false; //是否正在输入中文
	$(".searchFl input").on('compositionstart',function(){
		lock_chinese = true;
	});

	$(".searchFl input").on('compositionend',function(){
		lock_chinese = false;
		var keywords = $(this).val();
		if(keywords){
			searchtype(keywords)
		}else{
			$(".searchCon").css('display','none')
		}
			
	});

	$(".searchFl input").on('input',function(){
		if(!lock_chinese){
			var keywords = $(this).val();
			if(keywords){
				searchtype(keywords)
			}else{
				$(".searchCon").css('display','none')
			}
		}
	});


	function searchtype(keywords){
		var listArr = [];
		$('.searchCon').css('display','block');
		$.ajax({
			url: '/include/ajax.php?service=shop&action=serachType&typename='+keywords,
			type: "POST",
			dataType: "json",
			success: function (data) {
			  if(data && data.state == 100){
				  var list = data.info;
				  for(var i = 0; i < list.length; i++){
					var currList = list[i].reverse();
					if(listArr && listArr.length > 0){
						for(var m = 0; m <listArr.length; m++){
							if(!isContained(currList,listArr[m])){
								listArr.push(currList);
								break;
							}
						}
						
					}else{
						listArr.push(currList)
					}
					 
				  }
				  var html = [];
				  for(var i = 0 ; i < listArr.length; i++){
					var spanArr = []
					listArr[i].forEach(function(val){
						var str = val.typename;
						if(str.indexOf(keywords) > -1){
							str = str.replace(keywords,'<s>'+keywords+'</s>')
						}
						spanArr.push('<span class="" data-pid="'+val.parentid+'" data-lower="'+val.lower+'" data-id="'+val.id+'">'+str+'</span>')
					})
					html.push('<li>'+spanArr.join('>')+'</li>')
				  }
				  $('.searchCon ul').html(html.join(''))
				  
			   }else{
				$('.searchCon ul').html('<div class="loading">没有查到相关数据</div>')
			   }
			
			},
			error: function(){}
		  });
	}



	$('.searchCon').delegate('li','click',function(){
		canhover = false;
		var t = $(this);
		var typeArr = [];
		typeidArr=[];
		typenameArr = [];
		var lower = 0; pid = 0;
		t.find('span').each(function(){
			var span = $(this), index = span.index()
			typeArr.push(span.attr('data-id'))
			typeidArr.push(span.attr('data-id'))
			typenameArr.push(span.text())
			if(index == (t.find('span').length - 1)){ //最后一个
				lower = span.attr('data-lower');
				pid = span.attr('data-pid')
			}
		});

		var scrTop = $(".fl_list[data-id='"+typeArr[0]+"']").attr('data-top')
			$(".flList").nextAll('.typeList').remove();
			$(".flList").scrollTop(scrTop - 60);
		if(typeArr.length > 2){
			for(var i = 0; i<typeArr.length; i++){
				if(i >= 1){
					var num = i == (typeArr.length-1) ? 0 : typeArr[i+1]
					getshopType(typeArr[i],'',num)
				}else{
					$(".fl_list[data-id='"+typeArr[0]+"'] li[data-id='"+typeArr[1]+"']").addClass('chosed')
				}
			}
		}else{
			if(typeArr.length == 2){
				$(".fl_list[data-id='"+typeArr[0]+"'] li[data-id='"+typeArr[1]+"']").click()
			}
		}
		$('.searchCon').css('display','none')
		$("#cTxt").text(typenameArr.join('>')).attr('data-id',typeidArr.join(','))
		$("#typeid").val(typeArr[typeArr.length - 1]);
	})
	
	// 验证数据是否包含
	
	function isContained(a, b){
		var val = false;
		var ifArr = [];
		b.forEach(function(arr){
			for(var m = 0; m < a.length; m++){
				if(arr.id == a[m].id){
					ifArr.push(1)
					break;
				}
			}
		})
		
		if(ifArr.length == b.length){
			val = true
		}

		return val;
	}


	function getshopType(id,nextUl,num){
		
		$.ajax({
			url: '/include/ajax.php?service=shop&action=type&type='+id,
			type: "POST",
			dataType: "json",
			success: function (data) {
			  if(data && data.state == 100){
				  var list = data.info;
				  var html = [];
				  for(var i = 0; i< list.length; i++){
					var lower = list[i].lower > 0 ? 'lower' : '';
					var lowerArrow =  list[i].lower > 0 ? '<s></s>' : '';
					var cls = num && num == list[i].id ? 'chosed' : '';
					html.push('<li class="'+ lower + cls +'"  data-id="' + list[i].id + '" data-lower="' + list[i].lower + '"">' + list[i].typename + lowerArrow + '</li>')
				  }
				  if(nextUl && nextUl.length > 0){
					nextUl.html(html.join(''))
				  }else{
					  $(".flListBox").append('<ul class="typeList" data-id="'+id+'">'+html.join("")+'</ul>')
				  }
				 
			   }else if(nextUl == ''){
				   $(".typeList li[data-id='"+id+"']").click()
			   }
			
			},
			error: function(){}
		  });
		
		
	}




});
