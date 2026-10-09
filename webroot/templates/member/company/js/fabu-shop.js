$.fn.extend({textareaAutoHeight:function(a){this._options={minHeight:0,maxHeight:1e3},this.init=function(){for(var b in a)this._options[b]=a[b];0==this._options.minHeight&&(this._options.minHeight=parseFloat($(this).height()));for(var b in this._options)null==$(this).attr(b)&&$(this).attr(b,this._options[b]);$(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight)},this.resetHeight=function(){var a=parseFloat($(this).attr("minHeight")),b=parseFloat($(this).attr("maxHeight"));$.browser.msie||$(this).height(0);var c=parseFloat(this.scrollHeight);c=a>c?a:c>b?b:c,$(this).height(c).scrollTop(c),c>=b?$(this).css("overflow-y","scroll"):$(this).css("overflow-y","hidden")},this.init()}});

var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";

$(function(){

	// 返回上一步
	$(".backBtn").click(function(){
		$('.choseMod,.xztit1').removeClass('fn-hide');
		$('.choseFenlei,.xztit2').addClass('fn-hide');
		
	})


	//选择商品类型
	$('.choseGoods .radio span').click(function(e){
		var inpval = $(this).attr('data-id');
		if(inpval == 0){//实物
			$('.quanAll').addClass('fn-hide');
		}else{//电子券
			$('.quanAll').removeClass('fn-hide');
		}
	})
	//电子券截止日期
    $("#Coupon_deadline").datetimepicker({		
		minView: 2,//设置只显示到月份
		format: 'yyyy-mm-dd',
		linkFormat: 'yyyy-mm-dd',
		autoclose: true,
		language: 'ch',
		todayBtn: true,
		timePicker : false,
		startDate:new Date(),
		onSelect: gotohdDate
	}).on('changeDate',gotohdDate);
	
	function gotohdDate(ev){
		$("#Coupon_deadline").siblings(".tip-inline").removeClass().addClass("tip-inline success");
	}
	//电子券属性
	$('#quantype').change(function(e){
		var inpval = $(this).val();
		if(inpval == 1){//有效天数
			$('.yxdays').removeClass('fn-hide');
			$('.yxdate').addClass('fn-hide');
		}else if(inpval == 2){//截止日期
			$('.yxdays').addClass('fn-hide');
			$('.yxdate').removeClass('fn-hide');
		}else{
			$('.yxdays').addClass('fn-hide');
			$('.yxdate').addClass('fn-hide');
		}

		var t = $("#quantype"), val = t.val(), dl = t.closest("dl"), tip = dl.data("title"), etip = tip, hline = dl.find(".tip-inline");
	    if(inpval == 0){
	        hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
	        return false;
	    }else{
	        hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
	        return true;
	    }
	})

  	var inputObj = "";
	//商品属性选择或输入：点击
	$("#fabuForm").delegate("input[type=text]", "click", function(){
		$(".popup_key").hide();
		var itemList = $(this).siblings(".popup_key");
		inputObj = $(this).attr("id");
		if(itemList.html() != undefined){
			itemList.show();;
		}
		return false;
	});

	//自定义规格名称同步
	$('#specification').delegate('.self_box .inp', 'input', function(){
		var t = $(this), val = t.val(), id = t.closest('dd').attr('data-id');
		t.siblings('input[type=checkbox]').val('custom_'+changeText(id+'_'+val)).attr('title', val);
		createSpecifi()
	});

	// 新增自定义值
	var pii = 1;
	$("#specification").delegate(".sure_add","click",function(){
		var t = $(this),dd = t.closest('dd');
		var par = t.parents('.self_add');
		var selfadd = par.siblings(".self_box");
		var inp = par.find("input[type=text]");
		var imgsrc =  par.find(".img_box img").attr('src');
		var imgurl =  par.find(".img_box img").attr('data-url');
		if(inp.val()==''||inp.val()==undefined) return false;

		var flag = 1;
		dd.find(".self_inp").each(function(){
			var sinp = $(this).find(".inp");
			if(sinp.val() == inp.val()){
				console.log("已经填写过这个值");
				flag = 0;
				return false;
			}
		});
		if(!flag) return false;

		var id = dd.attr('data-id');

		if(dd.attr("data-title")=="颜色"){
			var img = imgurl?"<img src='"+imgsrc+"' data-url='"+imgurl+"'>":"";
			var hide1 = imgurl?"fn-hide":"";
			var hide2 = imgurl?"":"fn-hide";
			var len = $(".self_inp").size();
			selfadd.append('<div class="self_inp color_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox" name="speCustom'+id+'[]" title="'+changeText(inp.val())+'" value="custom_'+changeText(id+'_'+inp.val())+'"><input type="text" class="inp" size="12" value="'+changeText(inp.val())+'"><i class="del_inp"></i><div class="img_box">'+img+'</div><div class="upimg filePicker1 '+hide1+'" id="filePicker'+pii+'">选择图片</div><div class="del_img '+hide2+'">删除图片</div><input class="spePic" type="hidden" name="speCustomPic'+changeText(id)+'[]" value="'+imgurl+'" /></div>');
			renderbtn($('#filePicker'+pii))
			pii++;
		}else{
			selfadd.append('<div class="self_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox" name="speCustom'+id+'[]" title="'+changeText(inp.val())+'" value="custom_'+changeText(id+'_'+inp.val())+'"><input type="text" class="inp"  size="22" value="'+changeText(inp.val())+'" /><i class="del_inp"></i></div>')
		}
		inp.val('');
		par.find(".img_box").html('');
		par.find('.del_img').addClass("fn-hide");
		par.find('.upimg').removeClass("fn-hide");
		createSpecifi()
	});

	// 预览图片
	$("#specification").delegate(".img_box","click",function(){
		var t = $(this);
		if(t.find("img").size()>0){
			var src = t.find("img").attr("src")
			$('.img_mask,.img_show').show();
			$(".img_show .imgbox img").attr("src",src);
		}
	});

	$('.img_mask,.img_show .close_btn').click(function(){
		$('.img_mask,.img_show').hide();
	})



	// 删除自定义
	$("#fabuForm").delegate(".self_inp .del_inp","click",function(){
		var t = $(this);
		t.parents('.self_inp').remove();
		createSpecifi();
	});


	// 新增自定义属性
	$(".self_dl").delegate(".adddiv","click",function(){
		$(".self_tip").before('<div class="self_div"><h2 class="fn-clear"><input type="text" class="inp" size="22" maxlength="50" placeholder="输入属性名称"> <a href="javascript:;" class="del_dd">删除</a></h2><ul class="fn-clear"><li class="fn-clear"><input type="text" class="inp" size="22" maxlength="50" placeholder="请输入属性值"><i class="del_prop"></i></li></ul></div>');
	});

	// 删除自定义属性
	$(".self_dl").delegate(".del_dd","click",function(){
		var t = $(this);
		// if($(".self_dl .self_div").size()>1){
			t.parents(".self_div").remove();
		// }else{
		// 	console.log("已经不能再删除啦~")
		// }
		adddl();
	})

	// 自定义属性值
	$(".self_dl").on("input propertychange",".self_div li .inp",function(){
		var t = $(this),par_li = t.parents('li'),par_ul = t.parents('ul');
		t.removeClass("err")
		if(t.val()!=''&&t.val()!=undefined){

			par_li.find(".del_prop").show();
			// t.val(t.val().replace(/[, ./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
			// t.val(t.val().replace(/\[|]/g,''));
			if(par_ul.find('li:last-child').children('input').val()!=''){
				par_li.after('<li class="fn-clear"><input type="text" class="inp" size="22" maxlength="50" placeholder="请输入属性值"><i class="del_prop"></i></li>');
			}
		}else{
			par_li.find(".del_prop").hide();
			if(par_ul.find('li').size()>1){
				par_li.remove();
			}
			adddl();

		}
	});

	// 自定义属性值
	var chineseTypein = false;
	$(".self_add, .self_box, .self_div h2").on("compositionend",".inp",function(){
		var t = $(this)
		t.removeClass("err")
		if(t.val()!=''&&t.val()!=undefined ){			
			// t.val(t.val().replace(/[, ./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
			// t.val(t.val().replace(/\[|]/g,''));
			chineseTypein = false;
		}
	})
	$(".self_add, .self_box, .self_div h2").on("compositionstart",".inp",function(){
		chineseTypein = true;
		
	})
	$(".self_add, .self_box, .self_div h2").on("input propertychange",".inp",function(){
		var t = $(this);
		if(t.val()!=''&&t.val()!=undefined && !chineseTypein){			
			// t.val(t.val().replace(/[, ./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
			// t.val(t.val().replace(/\[|]/g,''));

		}
	});

	// 删除自定义属性值
	$(".self_dl").delegate(".del_prop","click",function(){
		var t = $(this),pdiv = t.parents(".self_div");
		if(pdiv.find('li').size()>1){
			t.parents("li").remove();
		}
		adddl()
	});

	// 判断属性值是否重复
	$(".self_dl").on("blur",".self_div li .inp",function(){
		var t = $(this) , par_li = t.parents('li'),par_ul = t.parents('ul'),p = t.parents(".self_div");
		var val = t.val(),sx_name = p.find('h2 .inp').val();
		var num = 0;
		par_ul.find('li').each(function(){
			var val1 = $(this).find(".inp").val();
			if(val==val1 && val !== ''){
				num = num + 1;
			}
		});
		if(num>1){
			t.focus().addClass("err");
			return false;
		}
		adddl();   //遍历自定义属性

	});

	$('.self_dl').on("blur",".self_div h2 .inp",function(){
		var t = $(this),pardiv = t.closest('dd');
		var sx_name = changeText(t.val());
		var num = 0
		$("dd").find('.self_div').each(function(){
			var inp = $(this).find('h2 .inp');
			if(sx_name == changeText(inp.val() && sx_name !== '')){
				num = num+1;
			}
			if(num>1){
				t.focus().addClass("err");
				return false;
			}
		})
		adddl();
	})
	if(tuanFlag == 1){
		tuanadddl();
	}else{
		adddl();
	}

	
	function adddl(){
		$('.dl').remove()
		$('.self_div').each(function(){
			var html = [];
			var t = $(this);
			var index_ = t.index()
			sx_name = t.find('h2 .inp').val();
			sx_name = changeText(sx_name)
			var sx_val = [];
			t.find('li').each(function(){
				var tval = $(this).find(".inp").val();
				tval = changeText(tval)
				// console.log(tval)
				if(tval!=''){
					sx_val.push(tval);
				}
			})
			
			var fid = createRandomId();

			if(sx_name!=''&& sx_val!=[]){
				var sxval = []
				for(var i=0;i<sx_val.length;i++){
					sxval.push('<div class="self_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox" name="speNew['+sx_name+'][]" title="'+sx_val[i]+'" value="'+sx_val[i]+'"><input type="text" class="inp" size="22" value="'+sx_val[i]+'"><i class="del_inp"></i></div>');
				}

				html.push('<dl class="fn-clear dl" data-tit=""><dt>'+sx_name+'：</dt><dd data-title="'+sx_name+'" data-id="'+fid+'">'+sxval.join('')+'</dd></dl>');
			}
			$('#speList').before(html.join(''));
		});

		createSpecifi();
	}


	// 批量输入
	$("#speList").delegate(".pl_fill .text_tip","click",function(){
		var t = $(this);
		t.hide();
		t.siblings("input").show().focus();
	});

	$("#speList").on("blur",".pl_fill input",function(){
		var t = $(this);
		if(t.val()==''){
			t.hide();
			t.siblings(".text_tip").show().focus();
		}
	});

	$("#speList").on("keyup",".pl_fill input",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if(name=='pl_price1'||name=='pl_price2'){
			var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
		}else if(name=='pl_kc'){
			var nowval = val.replace(/\D/g,'')
			t.val(nowval)
		}
	});
	$("#speList").on("blur",".pl_fill input",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if((name=='pl_price1'||name=='pl_price2') && val!=''){
			var nowval = val.replace(/[^\d\.]/g,'')*1
			t.val(nowval.toFixed(2))
		}
	});

	$("#speList").on("keyup","td input",function(){
		var t = $(this),name = t.attr("data-type");
		var val = t.val();
		if(name=='mprice'||name=='price'){
			var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
		}else if(name=='inventory'){
			var nowval = val.replace(/\D/g,'')
			t.val(nowval)
		}
	});
	$("#speList").on("blur","input",function(){
		var t = $(this),name = t.attr("data-type");
		var val = t.val();
		if((name=='mprice'||name=='price') && val!=''){
			var nowval = val.replace(/[^\d\.]/g,'')*1
			t.val(nowval.toFixed(2))
		}
	})

	$(".piliang").click(function(){
		var inventory = 0;
		$(".pl_fill").each(function(){
			var t = $(this),p = t.parent('th');
			var index = p.index();			
			var eachTr = $(".speTab table tr");
			if(tuanFlag == 1){
				eachTr = $(".guigeCon .items tbody tr")
			}
			if(t.find("input").val()!='' && t.find("input").val()!=undefined){
				eachTr.each(function(){
					var m = $(this).find('td').eq(index);
					m.find('input').val(t.find("input").val());
					if(m.find('input').attr("data-type")=="inventory"){
						inventory = inventory + Number(m.find('input').val());
					}
				});
				$("#inventory").val(inventory)
				t.find("input").val('').hide();
				t.find(".text_tip").show()
			}
		});

	})





	//商品属性选择或输入：输入
	$("#fabuForm").delegate("input[type=text]", "input", function(){
		var itemList = $(this).siblings(".popup_key"), val = $(this).val(), sLength = 0;
		itemList.find("li").hide();
		itemList.hide();
		itemList.find("li").each(function(index, element) {
			var txt = $(this).attr("title");
			if(txt.indexOf(val) > -1){
				sLength++;
				$(this).show();
			}
		});
		if(sLength > 0){
			itemList.show();
		}
	});

	//商品属性选择完成关闭浮动层
	$(".popup_key").delegate("li", "click", function(){
		var id = $(this).attr("data-id"), val = $(this).attr("title"), parent = $(this).parent().parent();
		if(id && val){
			parent.siblings("input[type=text]").val(val);
		}
		parent.siblings(".tip-inline").removeClass().addClass("tip-inline success");
		parent.hide();
	});

	$(document).click(function (e) {
		$(".popup_key").hide();
  });

  //删除自定义产品参数
  $('#proItem').delegate('.icon-trash', 'click', function(){
      var t = $(this), dl = t.closest('dl');
      $.dialog.confirm('确认要删除吗？', function(){
          dl.remove();
      })
  });

  // 新增自定义参数
  $("#proItem").delegate(".adddiv","click",function(){
      $(this).parent().before('<dl class="clearfix cusItem"><dt><input type="text" class="inp" name="cusItemKey[]" placeholder="请输入参数名" data-regex="S+" value=""></dt><dd style="position:static;"><input type="text"  class="inp" name="cusItemVal[]" placeholder="请输入参数值" data-regex="S+" value=""><a style="float: none; vertical-align: middle; margin-left: 5px;" class="icon-trash">删除</a></dd></dl>');
      $('#proItem .icon-trash').tooltip();
  });




  //选择规格
	var fth;
	$("#specification").delegate("input[type=checkbox]", "click", function(){
		createSpecifi();
	});

	// if(specifiVal.length > 0){
	// 	if(tuanFlag == 1){//团购
 //       		createtuanSpecifi();
 //       	}else{
 //       		createSpecifi();
 //       	}
	// }

	//规格选择触发
	function createSpecifi(){
		if($("#specification").size()==0) return false;
		var checked = $("#specification input[type=checkbox]:checked");
		if(checked.length > 0){
			$("#inventory").val("0").attr("disabled", true);
			//thead
			var thid = [], thtitle = [], th1 = [],
				th2 = '<th><div class="pl_fill"><div class="text_tip">'+langData['waimai'][5][23]+' <font color="#f00">*</font></div><input type="text" name="pl_price1"/></div></th><th><div class="pl_fill"><div class="text_tip">'+langData['siteConfig'][26][159]+' <font color="#f00">*</font></div><input type="text" name="pl_price2"/></div></th><th><div class="pl_fill"><div class="text_tip">'+langData['siteConfig'][19][525]+' <font color="#f00">*</font></div><input type="text" name="pl_kc"/></div></th>';
			for(var i = 0; i < checked.length; i++){
				var t = checked.eq(i),
					// title = t.parent().parent().parent().attr("data-title"),
					title = t.parents('dd').attr("data-title"),
					id = t.parents('dd').attr("data-id");
					// id = t.parent().parent().parent().attr("data-id");

				if(!thid.in_array(id)){
					thid.push(id);
					thtitle.push(changeText(title));
				}
			}
			for(var i = 0; i < thid.length; i++){
				
				th1.push('<th>'+thtitle[i]+'</th>');
			}
			$("#speList thead").html(th1+th2);

			//tbody 笛卡尔集
			var th = new Array(), dl = $("#specification dl");
			for(var i = 0; i < dl.length - 1; i++){
				var tid = [];

				//取得已选规格
				dl.eq(i).find("input[type=checkbox]:checked").each(function(index, element) {
                    var id = $(this).val(), val = $(this).attr("title");
					tid.push(id+"###"+val);
                });

				//已选规格分组
				if(tid.length > 0){
					th.push(tid);
				}
			}
			if(th.length > 0){
				fth = th[0];
				for (var i = 1; i < th.length; i++) {
					descartes(th[i]);
				}
				console.log(fth)
				//输出
				createTbody(fth);
			}

		}else{
			$("#inventory").removeAttr("disabled");
			$("#speList thead, #speList tbody").html("");
			$("#speList").hide();
		}
	}

	//输出规格内容
	function createTbody(fth){
		if(fth.length > 0){
			var tr = [], inventory = 0;
			for(var i = 0; i < fth.length; i++){
				var fthItem = fth[i].split("***"), id = [], val = [];
				//console.log(fthItem)
				for(var k = 0; k < fthItem.length; k++){
					var items = fthItem[k].split("###");
					id.push(changeText(items[0]));
					val.push(changeText(items[1]));
				}
				//console.log(val)
				if(id.length > 0){
					tr.push('<tr>');

					var name = [];
					for(var k = 0; k < id.length; k++){
						tr.push('<td>'+changeText(val[k])+'</td>');
						name.push(changeText(id[k]));
					}

					var price = $("#price").val();
					var mprice = $("#mprice").val();
					var f_inventory = "";
					if(specifiVal.length > 0 && specifiVal.length > i){
						value = specifiVal[i].split("#");
						mprice = value[0];
						price = value[1];
						f_inventory = value[2];
						inventory = inventory + Number(f_inventory);
					}

					tr.push('<td><input class="inp" type="text" id="f_mprice_'+name.join("-")+'" name="f_mprice_'+name.join("-")+'" data-type="mprice" value="'+mprice+'" /></td>');
					tr.push('<td><input class="inp" type="text" id="f_price_'+name.join("-")+'" name="f_price_'+name.join("-")+'" data-type="price" value="'+price+'" /></td>');
					tr.push('<td><input class="inp" type="text" id="f_inventory_'+name.join("-")+'" name="f_inventory_'+name.join("-")+'" data-type="inventory" value="'+f_inventory+'" /></td>');
					tr.push('</tr>');
				}
			}

			if(specifiVal.length > 0){
				$("#inventory").val(inventory);
			}
			$("#speList tbody").html(tr.join(""));
			$("#speList").show();

			//合并相同单元格
			var th = $("#speList thead th");
			for (var i = 0; i < th.length-3; i++) {
				huoniao.rowspan($("#speList"), i);
			};
		}
	}

	//笛卡尔集
	function descartes(array) {
    var ar = fth;
    fth = new Array();
    for (var i = 0; i < ar.length; i++) {
      for (var j = 0; j < array.length; j++) {
        var v = fth.push(ar[i] + "***" + array[j]);
      }
    }
  }

	//计算库存
	$("#speList").delegate("input", "blur", function(){
		var inventory = 0;
		$("#speList").find("input").each(function(index, element) {
      var val = Number($(this).val()), type = $(this).attr("data-type");
			if(type == "inventory" && val){
				inventory = Number(inventory + val);
			}
    });
		$("#inventory").val(parseInt(inventory));
	});



    getEditor("mbody");
	getEditor("body");


	//表单验证
	var regex = {

		regexp: function(t, reg, err){
			var val = $.trim(t.val()), dl = t.closest("dl"), name = t.attr("name"),
					tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline"), check = true;

			if(val != ""){
				var exp = new RegExp("^" + reg + "$", "img");
				if(!exp.test(val)){
					etip = err;
					check = false;
				}
			}else{
				check = false;
			}

			if(dl.attr("data-required") == 1){
				if(val == "" || !check){
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
				}else{
					hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
				}
				return check;
			}
		}

		//名称
		,title: function(){
			return this.regexp($("#title"), ".{5,100}", langData['siteConfig'][27][90]);
		}

		//市场价
		,mprice: function(){
			return this.regexp($("#mprice"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}

		//一口价
		,price: function(){
			return this.regexp($("#price"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}

    //运费
    ,logistic: function(){
      var t = $("#logistic"), val = t.val(), dl = t.closest("dl"), tip = dl.data("title"), etip = tip, hline = dl.find(".tip-inline");
      if(val == 0){
        hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
        return false;
      }else{
        hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
        return true;
      }
    }
    //电子券属性
    ,quantype: function(){
      var t = $("#quantype"), val = t.val(), dl = t.closest("dl"), tip = dl.data("title"), etip = tip, hline = dl.find(".tip-inline");
      if(val == 0){
        hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
        return false;
      }else{
        hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
        return true;
      }
    }
    //有效天数
    ,validity: function(){
      var t = $("#validity"), val = t.val(), dl = t.closest("dl"), tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline");
      if(val == ''){
        hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
        return false;
      }else{
        hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
        return true;
      }
    }
     //截止日期
    ,deadline: function(){
      var t = $("#Coupon_deadline"), val = t.val(), dl = t.closest("dl"), tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline");
      if(val == ''){
        hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
        return false;
      }else{
        hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
        return true;
      }
    }

		//库存
		,inventory: function(){
			return this.regexp($("#inventory"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}

		//购买限制
		,limit: function(){
			return this.regexp($("#limit"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}


	}
	/*********2021-12-21 新增团购发布************/
	var m = 1,
		manyHtml = function(){
			return '<table class="tab tab'+m+'"><tr><td class="mingc"><input type="text" class="mealName" placeholder="输入套餐名称" value=""><div class="allOpr fn-clear"><span class="oprbtn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="oprbtn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span></div></td></tr><tr><td class="items"><table><thead><tr><th width="38%" style="text-align:left;">所含商品</th><th width="15%">'+langData['siteConfig'][19][548]+'</th><th width="15%">原价</th><th width="17%">'+langData['siteConfig'][6][11]+'</th></tr></thead><tbody><tr><td><input type="text"class="tit"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="pric"/></td><td><span class="oprbtn move"title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="oprbtn del"title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'"class="oprbtn add"><i></i></span></td></tr></tbody></table></td></tr></table>';
		};

	$(".many").dragsort({ dragSelector: ".allOpr .move", placeHolderTemplate: '<table class="tab"></table>' });
	// $(".many .tab .items tbody").dragsort({ dragSelector: ".danOpr .move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	$(".many .tab .items tbody").dragsort({ dragSelector: ".oprbtn.move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

	//删除套餐列
	$(".taocon").delegate(".oprbtn.del", "click", function(){
		var t = $(this);
		if(t.closest('.allOpr').length == 0){
			if(t.closest("tbody").find("tr").length <= 1){
				t.closest(".tab").remove();
			}else{
				t.closest("tr").remove();
			}
		}else{
			t.closest(".tab").remove();
		}
		
	});

	//新增套餐列
	$(".taocon").delegate(".add", "click", function(){
		var t = $(this);
		t.closest("tr").after('<tr><td><input type="text" class="tit"></td><td><input type="text" class="coun"></td><td><input type="text" class="pric"></td><td><span class="oprbtn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="oprbtn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'" class="oprbtn add"><i></i></span></td></tr>');
	});

	//删除套餐内容
	$(".taocon").delegate(".allOpr .del", "click", function(){
		$(this).closest(".tab").remove();
	});

	//新增套餐内容
	$(".taocon").delegate(".addtaocan", "click", function(){
		m++;
		$('.taocon .many').append(manyHtml());
		$(".many .tab"+m+" .items tbody").dragsort({ dragSelector: ".danOpr .move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	});

	//团购规格
		//单规格--多规格切换
		$('.choseGuige .radio span').click(function(e){
			var inpval = $(this).attr('data-id');
			if(inpval == 0){//单规格
				$('.singleGuige').removeClass('fn-hide');
				$('.moreGuige').addClass('fn-hide');
			}else{//多规格
				$('.singleGuige').addClass('fn-hide');
				$('.moreGuige').removeClass('fn-hide');
			}
		})
		//团购--新增规格列
	$(".guigeCon .items tbody").dragsort({ dragSelector: ".danOpr2 .move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	$(".guigeCon").delegate(".add", "click", function(){
		var t = $(this);
		t.closest("tr").after('<tr><td><input type="text" class="tit" placeholder="请输入规格名称"></td><td><input type="text" class="mpri" data-type="mprice"></td><td><input type="text" class="npri" data-type="price"></td><td><input type="text" class="nkuc" data-type="inventory"></td><td><span class="oprbtn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="oprbtn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'" class="oprbtn add"><i></i></span></td></tr>');
		$(".guigeCon .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	});

	$(".guigeCon").delegate(".del", "click", function(){
		var t = $(this);
		t.closest("tr").remove()
		tuanadddl()
	});
		
		// 自定义属性值
	var  guigeIn = false;
	$(".guigeCon").on("compositionstart",".tit",function(){
		guigeIn = true;
	});
	$(".guigeCon").on("compositionend",".tit",function(){
		var t = $(this);
		if(t.val()!=''&&t.val()!=undefined){
			// t.val(t.val().replace(/[,./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
		}
		guigeIn = false;
		
	});	
	$(".guigeCon").on("input propertychange",".tit",function(){
		var t = $(this);
		if(!guigeIn){
			if(t.val()!=''&&t.val()!=undefined){
				// t.val(t.val().replace(/[,./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
			}
		}
	});

	
		//根据规格名称 生成规格表
	$(".guigeCon").delegate(".tit", "blur", function(){
		var t = $(this),par_dd = t.parents(".items");
		var val = t.val();
		var num = 0;
		if(val!=''){
			par_dd.find('tbody tr').each(function(){
				var val1 = $(this).find(".tit").val();
				if(val==val1 && val!=''){
					num = num + 1;
				}
			});
			if(num>1){
				$.dialog.alert("输入的值重复");
				t.focus();
				return false;
			}
			tuanadddl();   //遍历自定义属性
		}
	})
	function tuanadddl(){
		$('.guigeCon .dl').remove();
		var tid = [];
		var html = [];
		$('.guigeCon .items tbody tr').each(function(){
			
			var t = $(this);
			var sx_name = t.find('.tit').val();
			sx_name = changeText(sx_name)
			var fid = createRandomId();
			if(sx_name!=''){
				html.push('<dl class="fn-clear dl fn-hide"><dt>'+sx_name+'：</dt><dd data-title="'+sx_name+'" data-id="'+fid+'"><input type="hidden" checked="checked" type="checkbox"  name="speNew['+sx_name+'][]" title="'+sx_name+'" value="'+sx_name+'"></dd></dl>')
				t.find('.mpri').attr('data-id','f_mprice_'+sx_name);
				t.find('.mpri').attr('name','f_mprice_'+sx_name);
				t.find('.npri').attr('data-id','f_price_'+sx_name);
				t.find('.npri').attr('name','f_price_'+sx_name);
				t.find('.nkuc').attr('data-id','f_inventory_'+sx_name);
				t.find('.nkuc').attr('name','f_inventory_'+sx_name);
			}
			tid.push(sx_name);
		});

		$('.guigeCon').append(html.join(''));
		if(doe == 'edit'){//编辑时填充数据
			createtuanTbody(tid);	
		}
		
	}	
	//输出团购规格内容
	function createtuanTbody(fth){
		console.log(fth)
		
		if(fth.length > 0){
			var inventory = 0;
			for(var i = 0; i < fth.length; i++){
				var price = $("#price").val();
				var mprice = $("#mprice").val();
				var f_inventory = "";
				if(specifiVal.length > 0 && specifiVal.length > i){
					value = specifiVal[i].split("#");
					mprice = value[0];
					price = value[1];
					f_inventory = value[2];
					inventory = inventory + Number(f_inventory);
					var name = changeText(fth[i])
					$('.guigeCon input[name="f_mprice_'+ name +'"]').val(mprice)
					$('.guigeCon input[name="f_price_'+name+'"]').val(price)
					$('.guigeCon input[name="f_inventory_'+name+'"]').val(f_inventory)
				}


			}

			if(specifiVal.length > 0){
				$("#inventory").val(inventory);
			}
		}
	}

		//销售说明弹窗
	$('.xsAlert .xstit').click(function(e){
		$('.xsAlert .sale_pop').toggleClass('show');
		$('body').one('click',function(){
			$('.xsAlert .sale_pop').removeClass('show');
		})
		e.stopPropagation()
	})	
	//商家配送运费模板
	getpsList();
  	function getpsList(){
	  	$.ajax({
			url: '/include/ajax.php?service=shop&action=logistic&logistype=1',
			type: "POST",
			dataType: "json",
			async:false,
			success: function (data) {

				if(data.state == 100){

					var plist = data.info;
					if(plist.length > 0){
						var typeList = [],html = [];
						html.push('<option value="0">选择商家配送运费模板</option>');
						for(var i = 0; i < plist.length; i++){
								var id = plist[i].id;
								var typename = plist[i].title;
								html.push('<option value="'+id+'" '+(blogistic == plist[i].id ? "selected" : "")+'>'+typename+'</option>');
						}

						$(".psChose #logistic").html(html.join(''));
					}else{
						$('.psChose').remove();
					}
					

					

				}else{
					$('.psChose').remove();
				}
			},
			error: function(){
				$('.psChose').remove();
			}
		});
  	}	

  	//快递配送运费模板
	getkdList();
  	function getkdList(){
	  	$.ajax({
			url: '/include/ajax.php?service=shop&action=logistic&logistype=0&modAdrr=' + modAdrr,
			type: "POST",
			dataType: "json",
			async:false,
			success: function (data) {

				if(data.state == 100){

					var plist = data.info;
					if(plist.length > 0){
						var typeList = [],html = [];
						html.push('<option value="0">选择快递运费模板</option>');
						for(var i = 0; i < plist.length; i++){
								var id = plist[i].id;
								var typename = plist[i].title;
								html.push('<option value="'+id+'" '+(logistic == plist[i].id ? "selected" : "")+'>'+typename+'</option>');
						}

						$(".kdChose #express").html(html.join(''));
					}else{
						$('.kdChose').remove();
					}				

				}else{
					$('.kdChose').remove();
				}
			},
			error: function(){
				$('.kdChose').remove();
			}
		});
  	}	

	

	function changeText(text,type) {
		regObj = {
			// "&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#x27;",
			"`": "&#x60;"
		}
		var changeText = text;

		if(!type){
			for (var item in regObj) {
				var reg = new RegExp( item , "g" )
				changeText = changeText.replace(reg, regObj[item])
			}
		}else{
			for (var item in regObj) {
				var reg = new RegExp( regObj[item] , "g" )
				changeText = changeText.replace(reg, item)
			}
		}


		return changeText;
	}

  	//选择销售类型
  	$(".saleCon").delegate("input[type=checkbox]", "click", function(){
  		var t = $(this), val = t.val();
  		pshow(val);
  	})

  	if($(".saleCon input[type=checkbox]:checked").length > 0){
  		pshow()
  	}
	function pshow(){
 		$('.psWrap .comchose').addClass('fn-hide');
 		$('.psWrap .tip-inline').hide();
 		if($('.saleCon input[type=checkbox]:checked').size() > 0){
 			var ptidArr = []
	 		$('.saleCon input[type=checkbox]:checked').each(function(){
	 			var ptid = $(this).val();
	 			ptidArr.push(ptid)
	 			if(ptid != '1' && ptid != '3'){//平台和到店是没有运费模板
					if($('.psWrap .comchose[data-id="'+ptid+'"]').size() > 0){
						$('.psWrap .comchose[data-id="'+ptid+'"]').removeClass('fn-hide');
					}else{
						$('.psWrap .tip-inline em').text(ptid == '2' ? '配送' : '快递')
						$('.psWrap .tip-inline').show();
					}
				}


	 		})

	 		$(".yfTip p").hide()
	 		if(ptidArr.length == 1 && ptidArr[0] == 2){
	 			$(".yfTip p[data-tp='2']").show()
	 		}else if(ptidArr.indexOf('4') > -1){
	 			if(ptidArr.indexOf('2') > -1){
	 				$(".yfTip p[data-tp='2|4']").show()
	 			}else if(ptidArr.indexOf('3') > -1){
	 				$(".yfTip p[data-tp='3|4']").show()
	 			}else{
	 				$(".yfTip p").hide()
	 			}
	 		}else if(ptidArr.indexOf('1') > -1){
	 			if(ptidArr.indexOf('2') > -1){
	 				$(".yfTip p[data-tp='2|1']").show()
	 			}else if(ptidArr.indexOf('3') > -1){
	 				$(".yfTip p[data-tp='3|1']").show()
	 			}
	 		}

	 		// 只选了一个时 平台和到店是没有运费模板的
	 		if($('.saleCon input[type=checkbox]:checked').size() == 1){
	 			if($('.saleCon .todian').attr('checked')){//只选了到店消费
	 				$('.psWrap').addClass('fn-hide');
	 			}else if($('.saleCon .ptps').attr('checked')){//只选了平台配送
	 				$('.psWrap').addClass('fn-hide');
	 			}else{
		            $('.psWrap').removeClass('fn-hide');
	 			}
	 		}else if($('.saleCon input[type=checkbox]:checked').size() == 2){//选了两个 到店和平台时 也没有运费模板
	 			if($('.saleCon .todian').attr('checked') && $('.saleCon .ptps').attr('checked')){
	 				$('.psWrap').addClass('fn-hide');
	 			}else{
		            $('.psWrap').removeClass('fn-hide');
	 			}

	 		}else{
	 			$('.psWrap').removeClass('fn-hide');
	 		}	
	 		
 		}else{
 			$('.psWrap').addClass('fn-hide');
 		}
 		//没有到店消费时  购买须知 隐藏
 		if($('.saleCon .todian').is(':checked')) {
    		$('.buynote').removeClass('fn-hide');
		}else{
			$('.buynote').addClass('fn-hide');
		}
      
 		
 	}
	//新增其他须知
	var noticeHtml = '<div class="notice-item fn-hide"><div class="label"><input type="text" placeholder="'+langData['siteConfig'][19][0]+'"  class="knowTitle"/></div><div class="dd"><textarea placeholder="'+langData['siteConfig'][19][1]+'" class="knowCont"></textarea></div><span class="oprbtn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="oprbtn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span class="oprbtn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span></div>';
	$(".addnotice").bind("click", function(){
		var newnotice = $(noticeHtml);
		newnotice.appendTo("#notice");
		newnotice.slideDown(300);
	});
	$("#notice").delegate(".add", "click", function(){
		var t = $(this).closest(".notice-item");
		var newnotice = $(noticeHtml);
		newnotice.insertAfter(t);
		newnotice.slideDown(300);
	});

	//删除购买须知
	$("#notice").delegate(".del", "click", function(){
		var t = $(this).closest(".notice-item"), val1 = t.find("input").val(), val2 = t.find("textarea").val();
		if(val1 == "" && val2 == ""){
			t.slideUp(300, function(){
				t.remove();
			});
		}else{
			$.dialog.confirm(langData['siteConfig'][27][97], function(){
				t.slideUp(300, function(){
					t.remove();
				});
			});
		}
	
	});

	$("#notice textarea").textareaAutoHeight({minHeight:52, maxHeight:100});
	$("#notice").dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="notice-item"></div>' });

	var isclick = 0;
	// 头部固定 链接定位
	$('.main').scroll(function(){
		$('.xsAlert .sale_pop').removeClass('show');	
		for(var i=0; i<$('.compage').length; i++){
			var scroll = $('.compage').eq(i).position().top;
			if($('.main').scrollTop() >=(scroll)-100 && !isclick){
				$('.formTab li').eq(i).addClass('active').siblings('li').removeClass('active');
			}

		}
	});
	$('.formTab li').click(function(){
		isclick = 1;
		var  t = $(this);
		t.addClass('active').siblings('li').removeClass('active');
		var index = t.index();
		var scroll = $('.compage').eq(index).position().top-60;
		$('.main').animate({scrollTop:scroll}, 300);
		setTimeout(function(){
			isclick = 0;
		},300)
	});

	//可用时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm',
			onpicked: function(dp){
				$("input[name='openStart']").parent().siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
		});
	}
	$(".timelist").on('focus','input.startime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openStart')
		selectDate("openStart");
	});
	$(".timelist").on('focus','input.stoptime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openEnd')
		selectDate("openEnd");
	})

	$(".addtime").click(function(){
		var t = $(this);
		$(".timelist input").removeAttr('id');
		var tlen = $(".timelist .input-append").length
		t.before('<div class="input-append input-prepend"><input type="text" class="startime" name="limit_time['+tlen+'][start]" class="inp"  size="5" maxlength="5" autocomplete="off" value="00:00"><span class="add-aft">到</span><input type="text" class="stoptime"  class="inp" size="5" name="limit_time['+tlen+'][stop]" maxlength="5" autocomplete="off" value="23:00"><s class="del_time"></s></div>')

	});

    $('body').delegate('.del_time','click',function(){
        var t = $(this);
        t.closest('.input-prepend').remove();
    })

    var mycount = 20;
	$('.filePickerBox').each(function(i){

		var ind = '003';
		var fileCount = 0,$list = $("#listSection"+ind),picker = $("#filePicker"+ind);

		// 初始化Web Uploader
			uploader_iv = WebUploader.create({
				auto: true,
				swf: pubStaticPath + 'js/webuploader/Uploader.swf',
				server: server_image_url,
				pick: '#filePicker'+ind,
				fileVal: 'Filedata',
				accept: {
					title: ind == '003' ?'Images':'Video',
					extensions: ind == '003' ?'gif,jpg,jpeg,bmp,png':'mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
					mimeTypes: ind == '003' ?'.gif,.jpg,.jpeg,.png':'.mp4,.mov'
					// title: 'Images',
					// extensions: 'gif,jpg,jpeg,bmp,png',
					// mimeTypes: 'image/*'
				},
	      chunked: true,//开启分片上传
	            // threads: 1,//上传并发数
				fileNumLimit:  mycount,
				// fileSingleSizeLimit: atlasSize
			});


			uploader_iv.on('beforeFileQueued', function(file) {
				if(file.type.indexOf('image') > -1){  //上传文件为图片
					uploader_iv.options.server = server_image_url;
				}else{

					uploader_iv.options.server = server_video_url;
				}
			});

			uploader_iv.on('fileQueued', function(file) {
				console.log('fileQueued')
				var pick = $(this.options.pick);
				//先判断是否超出限制
				if(fileCount == mycount){
			    alert(langData['siteConfig'][38][24]);//文件数量已达上限
					uploader_iv.cancelFile( file );
					return false;
				}

				fileCount++;
				addFile(file);
				updateStatus(pick);
			});



			// 文件上传过程中创建进度条实时显示。
			uploader_iv.on('uploadProgress', function(file, percentage){
				var $li = $('#'+file.id),
				$percent = $li.find('.progress span');

				// 避免重复创建
				if (!$percent.length) {
					$percent = $('<p class="progress"><span></span></p>')
						.appendTo($li)
						.find('span');
				}
				$percent.css('width', percentage * 100 + '%');

				//音频文件浏览器右下角增加上传进度
				if(file.type == 'video'){
					var progressFixed = $('#progressFixed_' + file.id);
					if(!progressFixed.length){
						var $i = $("<b id='progressFixed_"+file.id+"'>");
				        $i.css({bottom: 0, left: 0, position: "fixed", "z-index": "10000", background: "#a5a5a5", padding: "0 5px", color: "#fff", "font-weight": "500", "font-size": "12px"});
						$("body").append($i);
						progressFixed = $('#progressFixed_' + file.id);
					}
					progressFixed.text(""+langData['siteConfig'][38][25]+"："+parseInt(percentage * 100) + '%');//上传进度
					if(percentage == 1){
						progressFixed.remove();
					}
				}

			});
			uploader_iv.on('uploadSuccess',function(file,response){
					// console.log(response)
			  	window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
					var $li = $('#'+file.id), listSection = $li.closest('.listSection');
					listSection.show();
					if(response.state == "SUCCESS"){
						var img = $li.find("img");
						if (img.length > 0) {
							img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
							$li.find(".enlarge").attr("href", response.turl);
							// $li.closest('.listImgBox').find('.deleteAllAtlas').show();
							// 此处应该赋值
				      if(fileCount == mycount && mycount == 1){
				        $(this.options.pick).closest('.wxUploadObj').hide();
				  			return false;
				  		}
					}

					var video = $li.find("video");
					if(video.length > 0){
						video.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
						$li.find(".enlarge").attr("href", response.turl);
						// if(fileCount == count && count == 1){
							$(this.options.pick).closest('.btn-section').hide();
							return false;
						// }
					}


				}
			})
			uploader_iv.on('uploadComplete',function(file,response){
				  $('#'+file.id).find('.progress').remove();
			})

			$('body').delegate('.li-rm', 'click', function(event) {
				var $btn = $(this),$li = $btn.closest('.pubitem'),list = $btn.closest('.filePickerBox')
				if($li.find('video').length >= 1){
					var path = $li.find('video').attr('data-val')
					delFile(path, false, 'video', function(){
						$li.remove();
					});
					list.find('.btn-section').show()
				}else{
					var path = $li.find('img').attr('data-val');
					delFile(path, false, 'image',function(){
						$li.remove();
					});
				}
				fileCount--;
				if(fileCount == 0){
					$('#listpic').val('')
				}
			});
			//删除已上传的文件
			function delFile(b, d, d, c) {
				var type = "delVideo"
				if(d == 'image'){
					type = 'delImage'
				}
				var g = {
					mod: "shop",
					type: type,
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

			// 新增
			function addFile(file){
				// console.log(file)
				if(file.type.indexOf('image') > -1){
					var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"><span>删除</span></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>');//删除图片
					var $img = $li.find('img');
					// 创建缩略图
					uploader_iv.makeThumb(file, function(error, src) {
						$img.closest('.listSection').show();
						if(error){
							$list.show();
							$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
							return;
						}
						$img.attr('src', src);
					});
				}else{
					var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"><span>删除</span></a></div>');//删除图片
					var $video = $li.find('video');
					// $video.attr('src', src);
				}

				var $btns = $li.find('.li-rm');


				$btns.on('click', function(){
					uploader_iv.cancelFile( file );
					uploader_iv.removeFile(file, true);
				});
				// $list.prepend($li);
				picker.closest('.btn-section').before($li);
			}


			function updateStatus(obj){
				var len = $(".listSection .pubitem").length;
				if(length == 0){
					$(".wxUploadObj").show()
				}else{
					if(mycount == fileCount){
						$(".wxUploadObj").hide()
					}
				}
			}

	})


	// 设为主图
	$("body").delegate('.setMain', 'click', function(event) {
		var t = $(this);
		var li = t.closest('.pubitem');
  		$("#listSection003").prepend(li)

	});

	//监听数量规格
  	$('.mealWrap').delegate('.coun','keyup',function(){
  		$(this).val(testLayerName($(this).val()));
  	})
  	function testLayerName(str){
        str = str.replace(/[^\u4E00-\u9FA5A-Za-z0-9]/g,'');
        return str;
    }
    function isNumber(value) {         //验证是否为数字
	    var patrn = /^(-)?\d+(\.\d+)?$/;
	    if (patrn.exec(value) == null || value == "") {
	         return false
	    } else {
	         return true
	    }
 	}

 	//验证规格
 	function guigeCheck(){
 		var r = true;
 		var eachTr = $("#speList tbody");
		if(tuanFlag == 1){
			eachTr = $(".guigeCon .items tbody tr")
		}
		var kongnum = 0;
 		eachTr.find('input').each(function(index, element) {
        	var val = $(this).val();
        	if(val == ''){
        		$("#speList").find(".tip-inlines").removeClass().addClass("tip-inline tip-inlines error").html('<s></s>'+langData['siteConfig'][27][94]);
        		kongnum++
        		r = false;
        	}else{
        		if(!/^0|\d*\.?\d+$/.test(val) && !$(this).hasClass('tit')){
        			kongnum++;
        		}

        	}

      	});

      	if(kongnum > 0){
      		$("#speList").find(".tip-inlines").removeClass().addClass("tip-inline tip-inlines error").html('<s></s>'+langData['siteConfig'][27][93]);
      		r = false;
      	}else{
      		$("#speList").find(".tip-inlines").removeClass().addClass("tip-inline tip-inlines success");
      		r = true;
      	}
      	return r;
 	}

 	//保存到货架
    $('.psWrap .saveBook').click(function(){
    	$('.submit.nosale').click();
    })

    //提交验证时的滚动
    var title_Top = $("#title").offset().top - 160,
    	imglist_Top  =  $("#listSection003").offset().top - 160,
    	mprice_Top  =  $("#mprice").offset().top - 180,
    	price_Top  =  $("#price").offset().top - 180,
    	inventory_Top  =  $("#inventory").offset().top - 180,
    	limit_Top  =  $("#limit").offset().top - 160,
    	saleCon_Top  =  $(".saleCon").offset().top - 160,
    	miaoshu_Top  =  $(".miaoshu").offset().top - 80,
    	speList_Top  =  $("#speList").offset().top - 160;
    	
    if($("#proItem").size() > 0){
    	var proItem_Top  =  $("#proItem").offset().top - 100;
    }
    if($(".buynote").size() > 0){
    	var buynote_Top  =  $(".buynote").offset().top - 100;
    }


	//提交发布
	$(".submit").bind("click", function(event){

		event.preventDefault();

		var btn        = $(this);
		var  packages = [];
	    $("#typeid").val(typeid);
	    $("#id").val(id);

		if(btn.hasClass("disabled")) return;

		var litpic   = '', imglist  = [];
		$("#listSection003 .pubitem").each(function(i){
	      var val = $(this).find('img').attr('data-val');
	      if(i == 0){
	        litpic = val;
	      }else{
	        imglist.push(val);
	      }
	    })
	    $('#litpic').val(litpic);//主图
	    $('#imglist').val(imglist.join(","));//商品图集

		var offsetTop = 0;
		//标题  
		if(!regex.title() && offsetTop <= 0){
			offsetTop = title_Top;
		}
		if(btn.hasClass('tosale')){//销售时需验证 保存货架不需要验证

			// //图集
			if(imglist.length < 1 && offsetTop <= 0){
				$.dialog.alert('商品图集至少两张');
				offsetTop = imglist_Top;
			}
			

		}
		//团购发布 -- 套餐内容
	    if(tuanFlag == 1){
	    	
	    	$('.mealWrap table.tab').each(function(){
	    		var mealname = $(this).find('.mealName').val();
	    		var manyItem = [], mtit = $(this).find(".mealName").val();
	    		$(this).find(".items tbody tr").each(function(){
	    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), coun = t.find(".coun").val();
	    			if(isNumber(coun)){//不填写单位 默认为份
	    				coun = coun+'份';
	    			}
					if(btn.hasClass('tosale')) {//销售时必填
						if (tit != undefined && tit != '' && pric != undefined && pric != '' && coun != undefined && coun != '') {
							manyItem.push(tit + "$$$" + pric + "$$$" + coun);
						}
					}else{
						if ( tit != '' || pric != '' || coun != '') {
							manyItem.push(tit + "$$$" + pric + "$$$" + coun);
						}
					}
					console.log(manyItem)
	    		});
	    		
				if(btn.hasClass('tosale')) {//销售时必填
					if(manyItem.length>0 ){
						packages.push(mtit+"@@@"+manyItem.join("~~~"));
					}
				}else{
					if(manyItem.length>0 || mtit != '') {
						packages.push(mtit + "@@@" + manyItem.join("~~~"));
					}
				}
	    	})
	    	if(btn.hasClass('tosale')){//销售时需验证 保存货架不需要验证 
		    	if(packages.length == 0){
		    		$(".taocon .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请填写套餐内容");

		     	 	offsetTop = offsetTop == 0 ? $(".mealWrap").position().top-80 : offsetTop;
		    	}else{
		    		$(".taocon .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		    	}
		    }

		    

	    }


        //到店消费 才有有效期验证
        //团购有效期
        if($('.saleCon .todian').is(':checked') &&  tuanFlag == 1){

            if(!regex.quantype() && offsetTop <= 0){
                offsetTop = buynote_Top;
            }
            if($('#quantype').val() == 1){//有效天数
                if(!regex.validity() && offsetTop <= 0){
                    offsetTop = buynote_Top;
                }
            }else{//截止日期
                if(!regex.deadline() && offsetTop <= 0){
                    offsetTop = buynote_Top;
                }
            }
            //可用时间
            var useweek = [];
            $(".yyday input:checked").each(function(){
                useweek.push($(this).val());
            })
            $("#openweek").val(useweek.join(','))
            //可用时间 -- 星期
            if($("#openweek").val() == ''){
                $(".yyday .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择可用时间");
                offsetTop = offsetTop == 0 ? buynote_Top : offsetTop;
            }else{
                $(".yyday .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
            }
            //可用时间 -- 时间段
            var timeArr = [];
            $(".timelist .input-append").each(function(){
                var timeStart = $(this).find('.startime').val();
                var timeStop = $(this).find('.stoptime').val();

                timeArr.push(timeStart+'-'+timeStop);
            })

            $("#limitTime").val(timeArr.join('||'))

            //营业时间/客服在线
            if($("#limitTime").val() == ''){
                $(".yytime .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请添加可用时间段");
                offsetTop = offsetTop == 0 ? buynote_Top : offsetTop;
            }else{
                $(".yytime .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
            }
        }
        

		if(btn.hasClass('tosale')){//销售时需验证 保存货架不需要验证 

			//团购多规格
			if($('#guigetype').val() == 1 && tuanFlag == 1){
				if(!guigeCheck()){

			      	offsetTop = offsetTop == 0 ? $(".choseGuige").position().top-40 : offsetTop;
				}
			}else{//单规格/电商商品
				//电商商品 多规格
				if(tuanFlag == 2 && $("#speList tbody input").size()>0 &&!guigeCheck()){
					offsetTop = offsetTop == 0 ? speList_Top : offsetTop;
				}
				if(!regex.mprice() && offsetTop <= 0){
					offsetTop = mprice_Top;
				}

				if(!regex.price() && offsetTop <= 0){
					offsetTop = price_Top;
				}

				if(!regex.inventory() && offsetTop <= 0){
					offsetTop = inventory_Top;
				}

				
			}
			if(!regex.limit() && offsetTop <= 0){
				offsetTop = limit_Top;

			}

			//销售类型
	    	if($('.saleCon dd input:checked').length == 0){

	      		$(".saleCon .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择销售类型");

	      		offsetTop = offsetTop == 0 ? saleCon_Top : offsetTop;
	      		

	    	}else{
				$(".saleCon .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
	    	//商家配送
	    	if($('.saleCon .sjps').is(':checked') && $('.psWrap .psChose').size() > 0){
	    		if($("#logistic").val() == 0|| $("#logistic").val() == ''){

			      	$.dialog.alert("请选择商家配送运费模板");
	      			offsetTop = offsetTop == 0 ? saleCon_Top : offsetTop;
			    }	
	    	}
	    	//快递
	    	if($('.saleCon .kdps').is(':checked') && $('.psWrap .kdChose').size() > 0){
	    		if($("#express").val() == 0|| $("#express").val() == ''){
			      $.dialog.alert("请选择快递运费模板");
			      offsetTop = offsetTop == 0 ? saleCon_Top : offsetTop;
			    }	
	    	}

			//电商商品 -- 产品参数验证
			$("#proItem").find("dl").each(function(){
				var t = $(this), type = t.data("type"), required = parseInt(t.data("required")), tipTit = t.data("title"), tip = t.find(".tip-inline"), input = t.find("input").val();

				if(required == 1){
					//单选
					if(type == "radio" && offsetTop <= 0){
						if(input == ""){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = proItem_Top;
						}
					}

					//多选
					if(type == "checkbox" && offsetTop <= 0){
						if(t.find("input:checked").val() == "" || t.find("input:checked").val() == undefined){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = proItem_Top;
						}
					}

					//下拉菜单
					if(type == "select" && offsetTop <= 0){
						if(input == ""){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = proItem_Top;
						}
					}
				}

			});

			ue.sync();

			//商品描述
			if(!ue.hasContents() && offsetTop <= 0){
				$.dialog.alert(langData['shop'][4][66]);
				offsetTop = miaoshu_Top;
			}
		}
	



		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}
		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();
		dataArr = form.serializeArray();
		//其他须知
		var notice = [], noticeItem = $("#notice .notice-item");
	    if(noticeItem.length > 0){
	    	noticeItem.each(function(){
	    		var tit = $(this).find(".knowTitle").val();
	    		var con = $(this).find(".knowCont").val();
                tit = tit == '' ? '使用须知' : tit;
	    		if(con!=""){
	    			notice.push(tit+"$$$"+con);
	    		}
	    	})
	    }
	    //销售类型
	    var saleArr = [];
	    $('.saleCon input:checked').each(function(){
	    	saleArr.push($(this).val());

	    })
	    data = data+ "&saletype="+saleArr.join(",");
		dataArr.push({
			name:'saletype',
			value:saleArr.join(",")
		})
	    if(tuanFlag == 1){
			data = data+ "&notice="+notice.join("|||")+"&package="+packages.join("|||");
			dataArr.push({
				name:'notice',
				value:notice.join("|||")
			})
			dataArr.push({
				name:'package',
				value:packages.join("|||")
			})
	    }
	    var fabutype = 0;
	    if (btn.hasClass('nosale')) {
			fabutype = 1;
		}
		data += "&fabutype="+fabutype;
		dataArr.push({
			name:'fabutype',
			value:fabutype
		})
		var skuInfoArr = {}
		$("#speList input").each(function(){
			var inp = $(this);
			var name = inp.attr('name');
			var value = inp.val();
			if(name){
				skuInfoArr[(changeText(name,1))] = value

			}
		})


		dataArr.push({
			name:'skuInfoArr',
			value:JSON.stringify(skuInfoArr)
		})
		data = data +'&skuInfoArr=' + JSON.stringify(skuInfoArr)
		btn.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		
		$.ajax({
			url: action,
			data: dataArr,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];  //发布成功
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];  //修改成功
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){

							location.href = url;
						}
					});

				}else{
					$.dialog.alert(data.info);
					btn.removeClass("disabled").html(langData['siteConfig'][11][19]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				btn.removeClass("disabled").html(langData['siteConfig'][11][19]);
			}
		});




	});


	renderbtn()
	function renderbtn(){

		$('.filePicker1').each(function() {

			  var picker = $(this), type = picker.data('type'), type_real = picker.data('type-real'), atlasMax = count = picker.data('count'), size = picker.data('size') * 1024, upType1, accept_title, accept_extensions = picker.data('extensions'), accept_mimeTypes = picker.data('mime');
				serverUrl = '/include/upload.inc.php?mod='+pubModelType+'&filetype=image&type=atlas&utype='+type;
				accept_title = 'Images';
				accept_extensions = 'jpg,jpeg,gif,png';
				accept_mimeTypes = 'image/*';


				//上传凭证
			    var i = $(this).attr('id').substr(10);
				var $list = picker.siblings('.img_box'),
					ratio = window.devicePixelRatio || 1,
					fileCount = 0,
					thumbnailWidth = 100 * ratio,   // 缩略图大小
					thumbnailHeight = 100 * ratio,  // 缩略图大小
					uploader;


				// 初始化Web Uploader
				uploader = WebUploader.create({
					auto: true,
					swf: pubStaticPath + 'js/webuploader/Uploader.swf',
					server: serverUrl,
					pick: '#filePicker' + i,
					fileVal: 'Filedata',
					accept: {
						title: accept_title,
						extensions: accept_extensions,
						mimeTypes: accept_mimeTypes
					},
		            chunked: true,//开启分片上传
		            // threads: 1,//上传并发数
					fileNumLimit: count,
					fileSingleSizeLimit: size
				});

				uploader.on('fileQueued', function(file) {
					// 创建缩略图
					uploader.makeThumb(file, function(error, src) {
							if(error){
								$list.removeClass("fn-hide");
								$list.html('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
								return;
							}
						$list.append('<img src="'+src+'">');
						}, thumbnailWidth, thumbnailHeight);
				});

				uploader.on('uploadSuccess', function(file,response) {
					$list.find('img').attr('data-url',response.url).attr('src',response.turl)
					$list.siblings(".spePic").val(response.url);
					$list.siblings(".del_img").removeClass("fn-hide");
					picker.addClass("fn-hide");
				});


				// 所有文件上传成功后调用
				uploader.on('uploadFinished', function () {
					//清空队列
					 uploader.reset();
				});



			//错误提示
		  function showErr(error, txt){
		    var obj = error.next('.upload-tip').find('.fileerror');
		    obj.html(txt);
		    setTimeout(function(){
		      obj.html('');
		    },2000)
		  }

		});
	}



	// 删除图片
	$("#specification").delegate(".del_img","click",function(){
		var del = $(this);
		var img_box = del.siblings(".img_box");
		var upimg = del.siblings(".upimg");
		var spePic = del.siblings(".spePic");
		upimg.removeClass("fn-hide");
		del.addClass("fn-hide");
		var picpath = img_box.find("img").attr('data-url');
		var g = {
			mod: pubModelType,
			type: "delatlas",
			picpath: picpath,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g),
			success: function(a) {
				img_box.html('');
				spePic.val('');
			}
		})
	});

});


//生成随机数
function createRandomId() {
	return (Math.random()*10000000).toString(16).substr(0,4)+'_'+(new Date()).getTime()+'_'+Math.random().toString().substr(2,5);
}
