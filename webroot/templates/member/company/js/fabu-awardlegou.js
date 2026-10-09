var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";
var imgbtn = 0;


//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "member",
		type: "delImage",
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


//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl,filedata){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".imgshow").html('<img src="'+fileurl+'" data-val="'+file+'" class="crop"/><a href="javascript:;" class="reload">重新上传</a>');
	$("#"+obj).siblings(".imgshow").show().removeClass('fn-hide');
	$("#"+obj).siblings("iframe").hide();
	
}

$(function(){

/* * * * * * * * * * * * * * * * * * * * * * * *  * * * *  *   *  *   *  *     *    */

// 红包怎么设置
$(".radio.hbset span").click(function(){
	var t = $(this);
	var type = t.attr('data-id');
	if(type=='1'){
		var price = $("#price").val();
		$(".hbamount").addClass('fn-hide');
		$(".hbpercent").removeClass('fn-hide');
	}else{
		$(".hbpercent").addClass('fn-hide');
    	$(".hbamount").removeClass('fn-hide');
	}
});



// 红包金额按比例
$("#hbpercent").blur(function(){
	var t = $(this),val = t.val();
	var dl = t.closest('.hbpercent');
	var price = $("#price").val();
	var point = $("#point").val();
	dl.find('.tip-inline').remove();
	if(!price){
		dl.find('dd').append('<span class="tip-inline error"><s></s>请先输入商品价格</span>');
		return false;
	}
	if(val==''){
		dl.find('dd').append('<span class="tip-inline error"><s></s>'+langData['siteConfig'][27][134]+'</span>');
	}else{
		dl.find('dd').append('<span class="tip-inline focus"><s></s>红包金额：'+((price*1)*val/100).toFixed(2)+echoCurrency('short')+'</span>');
	}
});

// 人数

$("#people").blur(function(){
	var val = $(this).val();
	var dl = $(this).closest('dl');
	dl.find('.tip-inline').remove();
	if(!val){
		dl.find('dd').append('<span class="tip-inline error"><s></s>请先输入参与人数</span>');
	}else{
		if(("#gifttype").val()!='1'){
		 giftList(val)
		}
		if($("#gifttype").val()!='1') return false;

	}
})




// 礼品类型
$(".radio.gifttype span").click(function(){
	var t = $(this);
	var type = t.attr('data-id');
	var people = $("#people").val();
	var dl = t.closest('dl');
	dl.find('.tip-inline').remove();
	if(type == '0' && !people){
		dl.find('dd').append('<span class="tip-inline error"><s></s>请先输入参与人数</span>');
		return false;
	}
	if(type == '0' && people <2){
		dl.find('dd').append('<span class="tip-inline error"><s></s>最少2人</span>');
		return false;
	}
	if(type == '0'){
		$(".hbBox").addClass('fn-hide');
		$(".giftBox").removeClass('fn-hide');
		giftList(people)
	}else{
		$(".hbBox").removeClass('fn-hide');
		$(".giftBox").addClass('fn-hide').find('.tbList .tb_row').html('')
	}
});

// 分配方式
$(".radio.hbfenpei span").click(function(){
	var t = $(this);
	var type = t.attr('data-id');
	if(type == '0'){
		$(".random_fenpei").removeClass('fn-hide');
	}else{
		$(".random_fenpei").addClass('fn-hide')
	}
});

//重新上传
$("body").delegate('.reload',"click", function(){
	var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
	delFile(input.val(), false, function(){
		input.val("");
		t.prev(".sholder").html('');
		parent.hide();
		iframe.attr("src", src).show();
	});
});



function giftList(num){
	var html = [];
	
	for(var i = 0; i<num; i++){
		html.push('<div class="tb_row fn-clear">');
		html.push('<div class="tb_img"><div class="imgbox">');
		html.push('<input name="giftlitpic" type="hidden" id="litpic_'+i+'" value="" />');
		html.push('<div class="imgshow fn-hide"></div>');
		html.push('<iframe id="iframe'+i+'" src ="/include/upfile.inc.php?mod=member&type=card&obj=litpic_'+i+'&filetype=image" " scrolling="no" frameborder="0" marginwidth="0" marginheight="0"></iframe>');
		html.push('</div>')
		html.push('</div>	');
		html.push('<div class="tb_tit fn-clear">');
		html.push('<input type="text" name="gtitle" placeholder="请输入标题">');
		html.push('</div>	');
		html.push('<div class="tb_price fn-clear">');
		html.push('<input type="text" name="gprice"  placeholder="请输入价格"  onkeyup="if(isNaN(value))execCommand(\'undo\')" onafterpaste="if(isNaN(value))execCommand(\'undo\')">');
		html.push('</div>');
				
		html.push('<div class="tb_con fn-clear">');
		html.push('<input type="text" name="gcon"  placeholder="请输入内容">');
		html.push('</div>');
		html.push('</div>');
	}
	$(".giftBox .tbList .tb_row").remove();
	$(".giftBox .tbList").append(html.join(''))
}










/* * * * * * * * * * * * * * * * * * * * * * * *  * * * *  *   *  *   *  *     *    */

  var inputObj = "";

	
	

	







    getEditor("mbody");
	// getEditor("body");


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

		//库存
		,inventory: function(){
			return this.regexp($("#inventory"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}

		//购买限制
		,limit: function(){
			return this.regexp($("#limit"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}
		
		// 参与人数
		,people: function(){
			return this.regexp($("#people"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}
		
		// 红包金额
		,hbamount: function(){
			return this.regexp($("#hbamount"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		}
		
		// 红包金额比例
		,hbpercent: function(){
			return this.regexp($("#hbpercent"), "[0-9]\\d*", langData['siteConfig'][27][92]);
		},
		minhb: function(){
			return this.regexp($("#minhb"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		},
		maxhb: function(){
			return this.regexp($("#maxhb"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		},


	}


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),
			litpic   = $("#litpic").val();

	    $("#typeid").val(typeid);
	    $("#id").val(id);

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		var giftData = [];
		// 礼品为商品时
		if($("#gifttype").val() == '0'){

			var gflag = false;
			$(".giftBox .tb_row").each(function(){
				var t = $(this);
				var gimg =  t.find('input[name="giftlitpic"]').val();
				var gtit =  t.find('input[name="gtitle"]').val();
				var gprice =  t.find('input[name="gprice"]').val();
				var gcon =  t.find('input[name="gcon"]').val();
				if(gtit==''||gprice==''||gcon==''){
					alert('请将礼品信息补充完整')
					gflag = true;
					return false;
				}
				giftData.push({
					'litpic':gimg,
					'title':gtit,
					'price':gprice,
					'descon':gcon,
				})
			})
			if(gflag) return false;
		}

		if(!regex.title() && offsetTop <= 0){
			console.log(1)
			offsetTop = $("#title").position().top;
		}

		if(!regex.price() && offsetTop <= 0){
			console.log(2)
			offsetTop = $("#price").position().top;
		}

		if(!regex.people() && offsetTop <= 0){
			console.log(3)
			offsetTop = $("#people").position().top;
		}
		
		if(!$("#gifttype").val() && !$("#hbset").val() && !regex.hbamount() && offsetTop <= 0){
			console.log(4)
			offsetTop = $("#hbamount").position().top;
		}
		
		
		if($("#gifttype").val() && $("#hbset").val() && !regex.hbpercent() && offsetTop <= 0){
			console.log(5)
			offsetTop = $("#hbpercent").position().top;
		}
		if(!regex.minhb() && offsetTop <= 0){
			console.log(3)
			offsetTop = $("#minhb").position().top;
		}
		if(!regex.maxhb() && offsetTop <= 0){
			console.log(3)
			offsetTop = $("#maxhb").position().top;
		}


	    //规格表值验证
	    // if(offsetTop <= 0){
	  		// $("#speList tbody").find("input").each(function(index, element) {
	    //     var val = $(this).val();
	  		// 	if(!/^0|\d*\.?\d+$/.test(val)){
	  		// 		$(document).scrollTop(Number($("#speList").offset().top)-8);
	  		// 		$("#speList").find(".tip-inline").removeClass().addClass("tip-inline error");
	  		// 		$("#speList").find(".tip-inline").html('<s></s>'+langData['siteConfig'][27][93]);

	  		// 		offsetTop = $("#speList").position().top;
	  		// 	}else{
	  		// 		$("#speList").find(".tip-inline").removeClass().addClass("tip-inline success");
	  		// 		$("#speList").find(".tip-inline").html('<s></s>'+langData['siteConfig'][27][94]);
	  		// 	}
	    //   });
	    // }

		// if(!regex.inventory() && offsetTop <= 0){
		// 	offsetTop = $("#inventory").position().top;
		// }

		// if(!regex.limit() && offsetTop <= 0){
		// 	console.log(6)
		// 	offsetTop = $("#limit").position().top;
		// }

		if(litpic == "" && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][78]);
			console.log(7)
			offsetTop = $("#listSection1").position().top;
		}

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $(".list-holder").position().top;
		}

		ue.sync();

		if(!ue.hasContents() && offsetTop <= 0){
			
			$.dialog.alert(langData['shop'][4][66]);
			offsetTop = $("#body").position().top;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action+'&prize='+JSON.stringify(giftData),
			data: data,
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
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				$("#verifycode").click();
			}
		});




	});


	
});


//生成随机数
function createRandomId() {
	return (Math.random()*10000000).toString(16).substr(0,4)+'_'+(new Date()).getTime()+'_'+Math.random().toString().substr(2,5);
}
