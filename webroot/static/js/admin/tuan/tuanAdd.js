//实例化编辑器
var ue = UE.getEditor('body');
var mue = UE.getEditor('mbody', {"term": "mobile"});

$(function () {

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var m = 0;

	var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
	//左侧导航点击
	$("#left-nav a").bind("click", function(){
		isClick = 1; //关闭滚动监听
		var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $("#editform .thead:eq("+index+")").offset().top - 15;
		$("#left-nav li").removeClass("current");
		parent.addClass("current");
		$('html, body').animate({
         	scrollTop: theadTop - parent.position().top
     	}, 300, function(){
     		isClick = 0; //开启滚动监听
     	});
	});

	//滚动监听
	$(window).scroll(function(){
		if(isClick) return false;  //判断是否点击中转中...
		var scroH = $(this).scrollTop();
		var theadLength = $("#editform .thead").length;
		$("#left-nav li").removeClass("current");

		$("#editform .thead").each(function(index, element){
			var offsetTop = $(this).offset().top;
			if(index != theadLength-1){
				var offsetNavTop = $("#left-nav li:eq("+(index+1)+")").position().top+30;
				var offsetNextTop = $("#editform .thead:eq("+(index+1)+")").offset().top;
				if(scroH >= offsetTop-offsetNavTop && scroH < offsetNextTop-offsetNavTop){
					$("#left-nav li:eq("+index+")").addClass("current");
					return false;
				}
			}else{
				$("#left-nav li:last").addClass("current");
				return false;
			}
		});
	});

	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			if(type == "addr"){
				var l=addrListArr;
				typeList.push('<option value="">选择地区</option>');
			}else{
				var l=typeListArr;
				typeList.push('<option value="">选择分类</option>');
			}
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if((type == "type" && typeid == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
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
						if((type == "type" && typeid == jArray[k]["id"]) || (type == "addr" && addr == jArray[k]["id"])){
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

		//异步字段html
		,ajaxItemHtml: function(data){
			$.ajax({
				type: "POST",
				url: "tuanAdd.php?dopost=getInfoItem&sid="+$("#sid").val(),
				data: data,
				dataType: "json",
				success: function(data){
					if(data){
						init.itemHtml(data);
					}else{
						$("#itemList").html("");
					}
				}
			});
		}

		//字段html
		,itemHtml: function(data){
			var itemList = data.itemList, html = [];
			for(var i = 0; i < itemList.length; i++){
				html.push('<dl class="clearfix">');
				html.push('  <dt><label for="'+itemList[i].field+'">'+itemList[i].title+'：</label></dt>');
				html.push('  <dd>');

				var val = "", required = "";
				if(itemList[i].value != ""){
					val = itemList[i].value;
				}else{
					val = itemList[i].default;
				}
				if(itemList[i].required == 1){
					required = ' data-required="true"'
				}
				if(itemList[i].type == "text"){
					html.push('    <input class="input-xlarge" type="text" name="'+itemList[i].field+'" id="'+itemList[i].field+'"'+required+' value="'+val+'" />');
					html.push('    <span class="input-tips"><s></s>请输入'+itemList[i].title+'</span>');
				}else if(itemList[i].type == "radio" || itemList[i].type == "checkbox"){
					var list = itemList[i].options.split(",");
					for(var a = 0; a < list.length; a++){
						var checked = "";
						if(itemList[i].type == "radio"){
							if(itemList[i].value != ""){
								if(list[a] == itemList[i].value){
									checked = " checked='true'";
								}
							}else if(itemList[i].default != ""){
								if(list[a] == itemList[i].default){
									checked = " checked='true'";
								}
							}else{
								if(a == 0){
									//checked = " checked='true'";
								}
							}
						}else{
							var dVal = itemList[i].default.split("|"), vVal = itemList[i].value.split(",");
							if(itemList[i].value != "") {
								for(var c = 0; c < vVal.length; c++){
									if(list[a] == vVal[c]){
										checked = " checked='true'"
									}
								}
							}else{
								if(itemList[i].default != ""){
									for(var c = 0; c < dVal.length; c++){
										if(list[a] == dVal[c]){
											checked = " checked='true'"
										}
									}
								}
							}
						}
						var name = itemList[i].field;
						if(itemList[i].type == "checkbox"){
							name = itemList[i].field+'[]';
						}
						html.push('    <label for="'+itemList[i].field+"_"+a+'"><input type="'+itemList[i].type+'" name="'+name+'" id="'+itemList[i].field+"_"+a+'"'+required+' value="'+list[a]+'"'+checked+' />'+list[a]+'</label>&nbsp;&nbsp;');
					}
					html.push('    <span class="input-tips"><s></s>请选择'+itemList[i].title+'</span>');

					//多选按钮组增加全选功能
					if(itemList[i].type == "checkbox"){
						html.push('<br /><span class="label label-info checkAll">全选</span>');
					}
				}else if(itemList[i].type == "select"){
					var list = itemList[i].options.split(",");
					html.push('    <span id="'+itemList[i].field+'List"><select name="'+itemList[i].field+'" id="'+itemList[i].field+'"'+required+'>');
					html.push('      <option value="">请选择</option>');
					for(var a = 0; a < list.length; a++){
						var checked = "";
						if(itemList[i].value != ""){
							if(list[a] == itemList[i].value){
								checked = " selected";
							}
						}else if(itemList[i].default != ""){
							if(list[a] == itemList[i].default){
								checked = " selected";
							}
						}
						html.push('      <option value="'+list[a]+'"'+checked+'>'+list[a]+'</option>');
					}
					html.push('    </select></span>');
					html.push('    <span class="input-tips"><s></s>请选择'+itemList[i].title+'</span>');
				}

				html.push('  </dd>');
				html.push('</dl>');
			}
			$("#itemList").html(html.join(""));
		},

		manyHtml : function(){
			return '<table class="tab tab'+m+'"><tr><td class="mtit"><input type="text" value="内容" /></td><td class="items"><table><thead><tr><th width="38%"align="left"><a href="javascript:;" class="remove" title="删除"><i class="icon-remove"></i></a>名称</th><th width="15%">单价</th><th width="15%">数量/规格</th><th width="15%">小计</th><th width="17%">操作</th></tr></thead><tbody><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="move"title="移动"><i class="icon-move"></i></span><span class="del"title="删除"><i class="icon-remove"></i></span><span title="添加"class="add"><i class="icon-plus"></i></span></td></tr><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="move"title="移动"><i class="icon-move"></i></span><span class="del"title="删除"><i class="icon-remove"></i></span><span title="添加"class="add"><i class="icon-plus"></i></span></td></tr><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="move"title="移动"><i class="icon-move"></i></span><span class="del"title="删除"><i class="icon-remove"></i></span><span title="添加"class="add"><i class="icon-plus"></i></span></td></tr><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="move"title="移动"><i class="icon-move"></i></span><span class="del"title="删除"><i class="icon-remove"></i></span><span title="添加"class="add"><i class="icon-plus"></i></span></td></tr></tbody></table></td></tr></table>';
		}
	};

	//平台切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(".nav-tabs li").removeClass("active");
			$(this).parent().addClass("active");

			$(".nav-tabs").parent().find(">div").hide();
			cfg_term = obj;
			$("#"+obj).show();
		}
	});



	//商家模糊匹配
	$("#store").bind("input", function(){
		$("#sid").val("0");
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("tuanAdd.php?dopost=checkStore", "key="+val+"&id="+id, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#storeList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'" title="'+data[i].company+'">'+data[i].company+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#storeList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#storeList").html("").hide();
				}
			});

		}else{
			$("#storeList").html("").hide();
		}
    });

	$("#storeList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#store").val(name);
		$("#sid").val(id);
		$("#storeList").html("").hide();
		checkGw($("#store"), name, $("#id").val());
		return false;
	});

	$(document).click(function (e) {
    var s = e.target;
    if (!jQuery.contains($("#storeList").get(0), s)) {
        if (jQuery.inArray(s.id, "user") < 0) {
            $("#storeList").hide();
        }
    }
  });

  $("#store").bind("blur", function(){
		var t = $(this), val = t.val(), id = $("#id").val();
		if(val != ""){
			checkGw(t, val, id);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});

	function checkGw(t, val, id){
		var flag = false, typeid = 0;
		t.addClass("input-loading");
		huoniao.operaJson("tuanAdd.php?dopost=checkStore", "key="+val+"&id="+id, function(data){
			t.removeClass("input-loading");
			if(data == 200){
				t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它商家，一个会员不可以管理多个商家！');
			}else{
				if(data) {
					for(var i = 0; i < data.length; i++){
						if(data[i].company == val){
							flag = true;
							$("#uid").val(data[i].id);
							typeid = data[i].stype;
						}
					}
				}
				if(flag){
					t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理商家信息');
					if($("#dopost").val() == "edit"){
						init.ajaxItemHtml("typeid="+typeid+"&id="+$("#id").val());
					}else{
						init.ajaxItemHtml("typeid="+typeid);
					}
				}else{
					t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
					$("#itemList").html("");
				}
			}
		});
	}


	if($("#dopost").val() == "edit"){
		init.ajaxItemHtml("typeid="+$("#typeid").val()+"&id="+$("#id").val());
	}


	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input[type='radio'], input[type='checkbox']", "click", function(){
		if($(this).attr("data-required") == "true"){
			var name = $(this).attr("name"), val = $("input[name='"+name+"']:checked").val();
			if(val == undefined){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
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

	//开始、结束、有效时间
	$("#startdate, #enddate, #expireddate, .chooseDateTime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss', autoclose: true, minView: 0, language: 'ch'});

	//团购类型切换
	$("input[name='tuantype']").bind("click", function(){
		var val = $(this).val();
		if(val == 0){
			$("#tuantype0").show();
			$("#tuantype1").hide();
			$("#tuantype2").hide();
		}else if(val == 1){
			$("#tuantype0").show();
			$("#tuantype1").show();
			$("#tuantype2").hide();
		}else if(val == 2){
			$("#tuantype0").hide();
			$("#tuantype1").hide();
			$("#tuantype2").show();
		}
	});


	//购买须知拖动排序
	$("#notice").dragsort({ dragSelector: ".move", dragSelectorExclude: ".notice dd, .notice dt", placeHolderTemplate: '<dl class="holder"></dl>' });

	//套餐内容拖动排序
	$(".many .tab .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

	//删除购买须知
	$("#notice").delegate(".del", "click", function(){
		$(this).closest("dl").remove();
		if($("#notice dl").length <= 0){
			$("#notice").html('<a href="javascript:;" class="btn btn-small addNotice">新增一项</a>');
		}
	});

	//新增购买须知
	var noticeHtml = '<dl><dt><input type="text" class="dt" value="" /></dt><dd><textarea class="dd"></textarea></dd><span class="move" title="移动"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></dl>';
	$("#notice").delegate(".addNotice", "click", function(){
		$(this).before(noticeHtml);
	});

	$("#notice").delegate(".add", "click", function(){
		$(this).parent().after(noticeHtml);
	});


	//套餐类型
	var packtypeVal = $("input[name=packtype]:checked").val(),
			taocon = $(".taocon").html();

	$("input[name=packtype]").bind('click', function(){
		var val = $(this).val();

		if(packtypeVal == val){

			$(".taocon").html(taocon);

		}else	if(val == 1){
			var singelHtml = '<div class="singel"><table><thead><tr><th width="50%"align="left">内容</th><th width="15%">单价</th><th width="18%">数量/规格</th><th width="17%">小计</th></tr></thead><tbody><tr><td><input type="text" class="s1" /></td><td><input type="text" class="s2" /></td><td><input type="text" class="s3" /></td><td><input type="text" class="s4" /></td></tr></tbody></table></div>';
			$(".taocon").html(singelHtml);
		}else if(val == 2){

			$(".taocon").html('<div class="many">'+init.manyHtml()+'<a href="javascript:;" class="btn btn-small addTao">新增套餐内容</a></div>');
			$(".many .tab"+m+" .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

		}
	});

	//删除套餐列
	$(".taocon").delegate(".del", "click", function(){
		var t = $(this);

		if(t.closest("tbody").find("tr").length <= 1){
			t.closest(".tab").remove();
		}else{
			t.closest("tr").remove();
		}
	});

	//新增套餐列
	$(".taocon").delegate(".add", "click", function(){
		var t = $(this);
		t.closest("tr").after('<tr><td><input type="text" class="tit"></td><td><input type="text" class="pric"></td><td><input type="text" class="coun"></td><td><input type="text" class="tot"></td><td><span class="move" title="移动" style="cursor: move;"><i class="icon-move"></i></span><span class="del" title="删除"><i class="icon-remove"></i></span><span title="添加" class="add"><i class="icon-plus"></i></span></td></tr>');
	});

	//删除套餐内容
	$(".taocon").delegate(".remove", "click", function(){
		$(this).closest(".tab").remove();
	});

	//新增套餐内容
	$(".taocon").delegate(".addTao", "click", function(){
		m++;
		$(this).before(init.manyHtml());
		$(".many .tab"+m+" .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	});
	//选择过期类型函数
	function expire_type_change(){
		var expire_type = $(":radio[name='expire_type']:checked").val();
		if(expire_type==='limit'){
			$("#expire_type_static").hide();
			$("#expire_type_limit").show();
		}else if(expire_type==='static'){
			$("#expire_type_limit").hide();
			$("#expire_type_static").show();
		}
	}
	//加载
	expire_type_change();
	//点击切换选择过期类型
	$(":radio[name='expire_type']").bind('click',expire_type_change);

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			subtitle     = $("#subtitle"),
			startdate    = $("#startdate").val(),
			enddate      = $("#enddate").val(),
			minnum       = $("#minnum"),
			maxnum       = $("#maxnum"),
			limit        = $("#limit"),
			defbuynum    = $("#defbuynum"),
			expire_type  = $(":radio[name='expire_type']:checked").val(),
			expireddate  = $("#expireddate").val(),
			expire_limit = $("#expire_limit").val(),
			amount       = $("#amount"),
			freight      = $("#freight"),
			freeshi      = $("#freeshi"),
			market       = $("#market"),
			price        = $("#price"),
			weight       = $("#weight"),
			tj           = true;

		//标题
		if(!huoniao.regex(title)){
			tj = false;
			//huoniao.goTop();
			title.focus();
			return false;
		};

		//副标题
		if(!huoniao.regex(subtitle)){
			tj = false;
			//huoniao.goTop();
			subtitle.focus();
			return false;
		};

		//开始时间
		if(startdate == ""){
			tj = false;
			$.dialog.alert("请选择团购开始时间！");
			return false;
		}

		//开始时间
		if(enddate == ""){
			tj = false;
			$.dialog.alert("请选择团购结束时间！");
			return false;
		}

		//开始与结束时间对比
		if(startdate != "" && enddate != "" && Date.ParseString(startdate) - Date.ParseString(enddate) > 0){
			$.dialog.alert("结束时间必须大于开始时间！");
			return false;
		}

		//最低团购数量
		if(!huoniao.regex(minnum)){
			tj = false;
			//huoniao.goTop();
			minnum.focus();
			return false;
		};

		//最高团购数量
		if(!huoniao.regex(maxnum)){
			tj = false;
			//huoniao.goTop();
			maxnum.focus();
			return false;
		};

		//购买限制
		if(!huoniao.regex(limit)){
			tj = false;
			//huoniao.goTop();
			limit.focus();
			return false;
		};

		//默认已购买数量
		if(!huoniao.regex(defbuynum)){
			tj = false;
			//huoniao.goTop();
			defbuynum.focus();
			return false;
		};

		if($("input[name='tuantype']:checked").val() == 0){

			//限定过期类型
			if(expire_type === 'limit'){
				if(!expire_limit){
					expire_limit = 0;
				}
				if(isNaN(expire_limit) || expire_limit <= 0){
					tj = false;
					$.dialog.alert("过期天数必须为正整数！");
					$("#expire_limit").focus();
					return false;
				}
			}

		}else if($("input[name='tuantype']:checked").val() == 1){
			//充值卡金额
			if(amount.val() == ""){
				$.dialog.alert("请输入充值卡金额！");
				return false;
			}else{
				var regex = amount.attr("data-regex"),
					exp = new RegExp("^" + regex + "$", "img");
				if(!exp.test($.trim(amount.val()))){
					tj = false;
					$.dialog.alert("请正确输入充值卡金额！");
					return false;
				}
			};
		}else if($("input[name='tuantype']:checked").val() == 2){
			//运费
			if(freight.val() == ""){
				$.dialog.alert("请输入快递运费！");
				return false;
			}else{
				var regex = freight.attr("data-regex"),
					exp = new RegExp("^" + regex + "$", "img");
				if(!exp.test($.trim(freight.val()))){
					tj = false;
					$.dialog.alert("快递运费必须为数字！");
					return false;
				}
			};

			//免运费
			if(freeshi.val() == ""){
				$.dialog.alert("请输入免运费的商品数量！");
				return false;
			}else{
				var regex = freeshi.attr("data-regex"),
					exp = new RegExp("^" + regex + "$", "img");
				if(!exp.test($.trim(freeshi.val()))){
					tj = false;
					$.dialog.alert("免运费的商品数量必须为数字！");
					return false;
				}
			};

		}

		//市场价
		if(market.val() == ""){
			$.dialog.alert("请输入市场价！");
			return false;
		}else{
			var regex = market.attr("data-regex"),
				exp = new RegExp("^" + regex + "$", "img");
			if(!exp.test($.trim(market.val()))){
				tj = false;
				$.dialog.alert("市场价必须为数字！");
				return false;
			}
		};

		//团购价
		if(price.val() == ""){
			$.dialog.alert("请输入团购价！");
			return false;
		}else{
			var regex = price.attr("data-regex"),
				exp = new RegExp("^" + regex + "$", "img");
			if(!exp.test($.trim(price.val()))){
				tj = false;
				$.dialog.alert("团购价必须为数字！");
				return false;
			}
		};

		//排序
		if(!huoniao.regex(weight)){
			tj = false;
			$.dialog.alert("排序必须为数字！");
			return false;
		}

		$("#itemList").find("input, select").each(function() {
      var objid = $(this).attr("id"), type = $(this).attr("type"), name = $(this).attr("name"), tip = $(this).parent().siblings(".input-tips");
			if($(this).attr("data-required") == "true"){
				if(type == "radio" || type == "checkbox"){
					if($("input[name='"+name+"']:checked").val() == "" || $("input[name='"+name+"']:checked").val() == undefined){
						tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
						tj = false;
						$.dialog.alert(tip.text());
						return false;
					}else{
						tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
					}
				}else{
					if($(this).val() == ""){
						tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
						tj = false;
						$.dialog.alert(tip.text());
						return false;
					}else{
						tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
					}
				}
			}
    });

    //购买须知
    var notice = [], noticeItem = $("#notice dl");
    if(noticeItem.length > 0){
    	for(var i = 0; i < noticeItem.length; i++){
    		var obj = $("#notice dl:eq("+i+")");
    		var tit = obj.find("input").val();
    		var con = obj.find("textarea").val();
    		notice.push(tit+"$$$"+con);
    	}
    }

    //套餐内容
    var packtype = $("input[name=packtype]:checked").val(), packages = [];
    if(packtype == 1){
    	var obj = $(".singel"), s1 = obj.find(".s1").val(), s2 = obj.find(".s2").val(), s3 = obj.find(".s3").val(), s4 = obj.find(".s4").val();
    	packages.push(s1+"$$$"+s2+"$$$"+s3+"$$$"+s4);
    }else if(packtype == 2){
    	var obj = $(".many");
    	obj.find("table").each(function(i){

    		var manyItem = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), coun = t.find(".coun").val(), tot = t.find(".tot").val();
    			if(tit != undefined && pric != undefined && coun != undefined && tot != undefined){
	    			manyItem.push(tit+"$$$"+pric+"$$$"+coun+"$$$"+tot);
	    		}
    		});
    		if(mtit != undefined){
	    		packages.push(mtit+"@@@"+manyItem.join("~~~"));
	    	}

    	});

    }


		ue.sync();
		// if(ue.getContent() == ""){
		// 	$.dialog.alert("请输入团购详情！");
		// 	return false;
		// }


		if(tj){
			t.attr("disabled", true);
			$.ajax({
				type: "POST",
				url: "tuanAdd.php?action="+action,
				data: $(this).parents("form").serialize() + "&notice="+notice.join("|||")+"&package="+packages.join("|||")+"&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
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
				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
					t.attr("disabled", false);
				}
			});
		}
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
		mod: "info",
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
