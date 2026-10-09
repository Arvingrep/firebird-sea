var unitPrice = 0, zxtxt = "", istit = false;
if(id != 0) istit = true;
var autocomplete;
$(function(){

	if(zjuserMealInfo != ''){
		$.dialog.confirm(zjuserMealInfo, function(){
			location.href = buymealUrl;
		})
	}
	//点击销售状态
	$(".w-form").delegate(".radio_state span", "click", function(){
		var t = $(this), dl = t.closest("dl"), id = t.attr("data-id"), hline = dl.find(".tip-inline");
		if(!t.hasClass("curr")){
			hline.removeClass().addClass("tip-inline success").html("<s></s>");
			t.addClass("curr").siblings("span").removeClass("curr");
		}
		$('#sellstate').val(id);
	});
	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
    }
    //显示区号
    $('.areaCode').bind('click', function(e){
      console.log('codeclick')
        e.stopPropagation();
        var areaWrap =$(this).closest(".selectGroup").find('.areaCode_wrap');
        if(areaWrap.is(':visible')){
            areaWrap.fadeOut(300)
        }else{
            areaWrap.fadeIn(300);
           return false;
        }


    });

    //选择区号
    $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        var par = t.closest(".selectGroup");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });

	var init = {
		//树形递归分类
		treeTypeList: function(data){
			var typeList = [], cl = "";
			for(var i = 0; i < data.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					var parentid= jsonArray["parentid"]==undefined ? jsonArray["id"] : jsonArray["parentid"];
					typeList.push('<a href="javascript:;" data-parentid="'+parentid+'" data="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</a>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;"  data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(data[i]);
			}
			return typeList.join("");
		}
	}

	//选择区域
	$("#selAddr").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#addrid").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	//获取子级区域
	function getChildAddr(id){
		if(!id) return;
		$.ajax({
			url: "/include/ajax.php?service=house&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button class="sel" type="button">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');   //不限
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>');    //不限
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addrid").before(html.join(""));

				}
			}
		});
	}

	//小区模糊搜索
	var arr = [], dataArr = [];
	if($('#community').size() > 0){
		$('#community').autocomplete({
			serviceUrl: '/include/ajax.php?service=house&action=communityList&allcity=1',
			paramName: 'keywords',
			dataType: 'jsonp',
			transformResult: function(data){
				arr = [], dataArr = [];
				arr['suggestions'] = [];
				if(data && data.state == 100){
					var list = data.info.list;
					for(var i = 0; i < list.length; i++){
						dataArr[i] = [];
						dataArr[i]['id']      = list[i].id;
						dataArr[i]['cityid']  = list[i].cityid;
						dataArr[i]['title']   = list[i].title;
						dataArr[i]['address'] = list[i].address;
						dataArr[i]['price']   = list[i].price;
					}
				}

				arr['suggestions'] = $.map(dataArr, function (value, key) {
					return { value: value.title, data: value.id, cityid: value.cityid, address: value.address, price: value.price };
				})
				return arr;
			},
			onSelect: function(suggestion) {
				$('#community').attr('data-cityid', suggestion.cityid);
				$('#communityid').val(suggestion.data);
				$("#communityAddr").html(suggestion.address + "&nbsp;&nbsp;"+langData['siteConfig'][19][315]+"："+suggestion.price+echoCurrency('short')+"/㎡");   //单价
				unitPrice = suggestion.price;
				autoTitle();
				$(".community-addr").hide();
			},
			lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
				var re = new RegExp('\\b' + $.Autocomplete.utils.escapeRegExChars(queryLowerCase), 'gi');
				return re.test(suggestion.value);
			}
		});
	}

	$('#community').bind("input", function(){
		$('#community').attr('data-cityid', 0);
		$('#communityid').val(0);
		$("#selAddr button").html(langData['siteConfig'][7][2]+"<span class='caret'></span>");  //请选择
		$("#communityAddr").html("");
		$("#address").val("");
		$(".community-addr").hide();
		unitPrice = 0;
	})

	$("#community").bind("blur", function(){
		autoTitle();
		if(($("#communityid").val() == 0 || $("#communityid").val() =="") && $.trim($("#community").val()) != ""){
			$(".community-addr").show();
			
		}else{
			$(".community-addr").hide();
		}

		var communityTitle = $.trim($('#community').val());
		if(communityTitle != ''){
			$.ajax({
				url: "/include/ajax.php?service=house&action=communityList&allcity=1&keywords="+communityTitle,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100 && data.info.list.length > 0){
						var list = data.info.list;
						for (var i = 0; i < list.length; i++) {
							if(list[i].title == communityTitle){
								$('#community').attr('data-cityid', list[i].cityid);
								$('#communityid').val(list[i].id);
								$("#communityAddr").html(list[i].address + "&nbsp;&nbsp;"+langData['siteConfig'][19][315]+"："+list[i].price+echoCurrency('short')+"/㎡");   //单价
								unitPrice = list[i].price;
								autoTitle();
								$(".community-addr").hide();
							}
						}
					}
				}
			});
		}

	});

	//选择小区
	$("#chooseCommunity").bind("click", function(){

		var t = $(this);
		t.addClass("loading");

		$.ajax({
			url: "/include/ajax.php?service=house&action=addr&son=0&child=1",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				t.removeClass("loading");
				if(data && data.state == 100){

					var content = [];
					//选地区
					content.push('<div class="choose-item" id="selectAddr"><h2>'+langData['siteConfig'][6][73]+'：</h2><div class="choose-container fn-clear">');  //选择区域
					content.push('<div class="pinp_main"><div class="pinp_main_zm Addr">'+init.treeTypeList(data.info)+'</div></div>');
					content.push('</div></div>');

					//选小区
					content.push('<div class="choose-item" id="selectCommunity" style="width:230px;"><h2>'+langData['siteConfig'][6][74]+'：<span id="tCount"></span></h2><div class="choose-container fn-clear">');//选择小区
					content.push('<div class="pinp_main"><div class="pinp_main_zm"><center style="line-height:335px;">'+langData['siteConfig'][20][127]+'</center></div></div>');   //没有相关小区！
					content.push('</div></div>');

					$.dialog({
						id: "chooseData",
						fixed: false,
						title: langData['siteConfig'][6][74],  //选择小区
						content: '<div class="chooseData fn-clear">'+content.join("")+'</div>',
						width: 590,
						okVal: langData['siteConfig'][6][1],  //确定
						ok: function(){

							//确定选择结果
							var obj = parent.$("#selectCommunity .cur"),
								id = obj.attr("data-id"),
								title = obj.attr("data-title"),
								address = obj.attr("data-address"),
								price = obj.attr("data-price"),
								parentid = $('.Addr .cur').attr("data-parentid");
							if(id != undefined && title != undefined){
								unitPrice = price;
								$("#community").val(title);
								$("#communityid").val(id);
								$("#cityid").val(parentid);
								$("#communityAddr").html(address + "&nbsp;&nbsp;"+langData['siteConfig'][19][315]+"："+price+echoCurrency('short')+"/㎡");   //单价

								$("#selAddr button").html(langData['siteConfig'][7][2]+"<span class='caret'></span>");   //请选择
								$("#address").val(address);
								$(".community-addr").hide();
								$("#community").parent().find(".tip-inline").removeClass().addClass("tip-inline success")
								autoTitle();
							}else{
								alert(langData['siteConfig'][20][523]);   //请先选择小区！
								return false;
							}

							autocomplete.setInputValue('address');
						},
						cancelVal: langData['siteConfig'][6][15],    //关闭
						cancel: true
					});

					//选择地区
					parent.$("#selectAddr a").bind("click", function(){
						parent.$("#selectAddr a").removeClass("cur");
						$(this).addClass("cur");
						getCommunity();
					});

					//获取小区
					function getCommunity(){
						var addr = parent.$("#selectAddr .cur").attr("data");

						addr = addr != undefined ? addr : 0;

						parent.$("#selectCommunity .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][6][176]+'...</center>');   //搜索中


						$.ajax({
							url: "/include/ajax.php?service=house&action=communityList&allcity=1&pageSize=9999&addrid="+addr,
							type: "GET",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){
									var list = data.info.list, community = [];
									for (var i = 0; i < list.length; i++) {
										community.push('<a href="javascript:;" data-id="'+list[i].id+'" data-title="'+list[i].title+'" data-address="'+list[i].address+'" data-price="'+list[i].price+'" title="'+list[i].title+'"> '+(i+1)+'. '+list[i].title+'</a>');
									};
									parent.$("#selectCommunity .pinp_main_zm").html(community.join(""));
									parent.$("#tCount").html("<small>"+list.length+"个</small>");
								}else{
									parent.$("#selectCommunity .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][20][127]+'</center>');   //没有相关小区！
									parent.$("#tCount").html("");
								}
							}
						});

					}

					//选择小区
					parent.$("#selectCommunity").delegate("a", "click", function(){
						parent.$("#selectCommunity a").removeClass("cur");
			        	$(this).addClass("cur");
					});

				}
			}
		});
	});

	//楼盘模糊搜索
	if($('#loupan').size() > 0){
		$('#loupan').autocomplete({
			serviceUrl: '/include/ajax.php?service=house&action=checkLoupan&type='+type,
			paramName: 'title',
			dataType: 'jsonp',
			transformResult: function(data){
				var arr = [], dataArr = [];
				arr['suggestions'] = [];
				if(data && data.state == 100){
					var list = data.info;
					for(var i = 0; i < list.length; i++){
						dataArr[i] = [];
						dataArr[i]['id']       = list[i].id;
						dataArr[i]['loupan']   = list[i].title;
						dataArr[i]['address']  = list[i].addr;
						dataArr[i]['addrid']   = list[i].addrid;
						dataArr[i]['addrName'] = list[i].typename;
					}
				}

				arr['suggestions'] = $.map(dataArr, function (value, key) {
					return { id: value.id, value: value.loupan, address: value.address, addrid: value.addrid, addrName: value.addrName };
				})
				return arr;
			},
			onSelect: function(suggestion) {
				$('#loupan').attr('data-cityid', suggestion.cityid);
				$('#loupanid').val(suggestion.id);
				$("#loupanAddr").html(suggestion.address);
				autoTitle();
				$(".loupan-addr").hide();
			},
			lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
				var re = new RegExp('\\b' + $.Autocomplete.utils.escapeRegExChars(queryLowerCase), 'gi');
				return re.test(suggestion.value);
			}
		});
	}

	$('#loupan').bind("input", function(){
		$('#loupan').attr('data-cityid', 0);
		$('#loupanid').val(0);
		$("#selAddr button").html(langData['siteConfig'][7][2]+"<span class='caret'></span>");   //请选择
		$("#loupanAddr").html("");
		$("#address").val("");
		$(".loupan-addr").hide();
	})

	$("#loupan").bind("blur", function(){
		autoTitle();
		if(($("#loupanid").val() == 0 || $("#loupanid").val() =="") && $.trim($("#loupan").val()) != ""){
			$(".loupan-addr").show();
		}else{
			$(".loupan-addr").hide();
		}

		var loupanTitle = $.trim($('#loupan').val());
		if(loupanTitle != ''){
			$.ajax({
				url: "/include/ajax.php?service=house&action=checkLoupan&type="+type+"&title="+loupanTitle,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100 && data.info.length > 0){
						var list = data.info;
						for (var i = 0; i < list.length; i++) {
							if(list[i].title == loupanTitle){
								$('#loupan').attr('data-cityid', list[i].cityid);
								$('#loupanid').val(list[i].id);
								$("#loupanAddr").html(list[i].addr);
								autoTitle();
								$(".loupan-addr").hide();
							}
						}
					}
				}
			});
		}

	});

	//选择楼盘
	$("#chooseLoupan").bind("click", function(){
		var t = $(this);
		t.addClass("loading");

		$.ajax({
			url: "/include/ajax.php?service=house&action=addr&son=1",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				t.removeClass("loading");
				if(data && data.state == 100){

					var content = [];

					//选地区
					content.push('<div class="choose-item" id="selectAddr"><h2>'+langData['siteConfig'][6][73]+'：</h2><div class="choose-container fn-clear">');  //选择区域
					content.push('<div class="pinp_main"><div class="pinp_main_zm">'+init.treeTypeList(data.info)+'</div></div>');
					content.push('</div></div>');

					//选楼盘
					content.push('<div class="choose-item" id="selectLoupan" style="width:230px;"><h2>'+langData['siteConfig'][19][113]+'：<span id="tCount"></span></h2><div class="choose-container fn-clear">');   //选择楼盘
					content.push('<div class="pinp_main"><div class="pinp_main_zm"><center style="line-height:335px;">'+langData['siteConfig'][20][19]+'</center></div></div>');   //没有相关楼盘！
					content.push('</div></div>');

					$.dialog({
						id: "chooseData",
						fixed: false,
						title: langData['siteConfig'][19][113],   //选择楼盘
						content: '<div class="chooseData fn-clear">'+content.join("")+'</div>',
						width: 590,
						okVal: langData['siteConfig'][6][1],  //确定
						ok: function(){

							//确定选择结果
							var obj = parent.$("#selectLoupan .cur"),
								loupan = obj.attr("data-loupan"),
								loupanid = obj.attr("data-loupanid"),
								address = obj.attr("data-address"),
								addrid = obj.attr("data-addrid"),
								addrName = obj.attr("data-addrName");

							if(loupanid != undefined && loupan != undefined && address != undefined && addrid != undefined && addrName != undefined){
								$("#loupan").val(loupan);
								$("#loupanid").val(loupanid);
								$("#addrid").val(addrid);
								$("#address").val(address);
								$("#loupanAddr").text(address);
								$("#selAddr button").html(addrName+"<span class='caret'></span>");
								$("#loupan").parent().find(".tip-inline").removeClass().addClass("tip-inline success")
								$("#address").siblings(".tip-inline").removeClass().addClass("tip-inline success");
								autoTitle();
							}else{
								alert(langData['siteConfig'][20][524]);   //请先选择楼盘！
								return false;
							}
							autocomplete.setInputValue('address');
						},
						cancelVal: langData['siteConfig'][6][15],   //关闭
						cancel: true
					});

					//选择地区
					parent.$("#selectAddr a").bind("click", function(){
						parent.$("#selectAddr a").removeClass("cur");
						$(this).addClass("cur");
						getLoupan();
					});

					//获取楼盘
					function getLoupan(){
						var addr = parent.$("#selectAddr .cur").attr("data");

						addr = addr != undefined ? addr : 0;

						parent.$("#selectLoupan .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][6][176]+'...</center>');  //搜索中


						$.ajax({
							url: "/include/ajax.php?service=house&action=checkLoupan&addrid="+addr+"&type="+type,
							type: "GET",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){
									var list = data.info, community = [];
									for (var i = 0; i < list.length; i++) {
										community.push('<a href="javascript:;" data-loupan="'+list[i].title+'" data-loupanid="'+list[i].id+'" data-address="'+list[i].addr+'" data-addrid="'+list[i].addrid+'" data-addrName="'+list[i].typename+'" title="'+list[i].title+'"> '+(i+1)+'. '+list[i].title+'</a>');
									};
									parent.$("#selectLoupan .pinp_main_zm").html(community.join(""));
									parent.$("#tCount").html("<small>"+list.length+"个</small>");
								}else{
									parent.$("#selectLoupan .pinp_main_zm").html('<center style="line-height:335px;">'+langData['siteConfig'][20][19]+'</center>');   //移动
									parent.$("#tCount").html("");
								}
							}
						});

					}

					//选择楼盘
					parent.$("#selectLoupan").delegate("a", "click", function(){
						parent.$("#selectLoupan a").removeClass("cur");
			        $(this).addClass("cur");
					});

				}
			}
		});
	});

	//修改页面下拉菜单赋值
	if(id != 0){
		$(".selectGroup select").each(function(){
			var val = $(this).attr("data-val");
			$(this).find("option").each(function(){
				if($(this).val() == val){
					$(this).attr("selected", true);
				}
			});
		});
	}

	//自动获取交易地点
	if($("#getlnglat").size() > 0){
		//自动获取交易地点
		//百度地图
		if(site_map == "baidu"){
			var coords = $().coords();
			var transform = function(e, t) {
				coords.transform(e,	function(e, n) {
					n != null ? $("#address").val(n.street + n.streetNumber) : $.dialog.alert(e.message);
					$("#address").siblings(".tip-inline").removeClass().addClass("tip-inline success");
					var dist = n.district;
					$("#selAddr .sel-group:eq(0) li").each(function(){
						var t = $(this).find("a"), v = t.text(), i = t.attr("data-id");
						if(v.indexOf(dist) > -1){
							$("#addr").val(i);
							$("#selAddr .sel-group:eq(0)").find("button").html(v+'<span class="caret"></span>');
							$("#selAddr .sel-group:eq(0)").siblings(".sel-group").remove();
							getChildAddr(i);
						}
					});
					t.hide();
				}, true);
			};
			$("#getlnglat").bind("click", function() {
				var e = $(this);
				coords.get(function(t, n) {
					transform(n, e);
				}),
				$(this).unbind("click").html("<s></s>"+langData['siteConfig'][7][3]+"...");  //获取中
			});

			var address = $("#address").val();
			//搜索联想
			autocomplete = new BMap.Autocomplete({
					input: "address"
			});
			autocomplete.setLocation(map_city);

		//google 地图
		}else if(site_map == "google"){

			$("#getlnglat").hide();
			autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {placeIdOnly: true});

		}
	}

	var address = $("#address").val();
	if(address != ""){
		setTimeout(function(){
			$("#address").val(address);
		}, 5);
	}

});
