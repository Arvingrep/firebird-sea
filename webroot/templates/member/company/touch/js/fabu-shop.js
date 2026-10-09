var slider1, slider;
var guigeFull = false;  //是否填充多规格
//多语言包
if(typeof langData == "undefined"){
    document.head.appendChild(document.createElement('script')).src = '/include/json.php?action=lang';
}

var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";

huoniao.rowspan = function(t, colIdx) {
  return t.each(function() {
      var that;
      $('tr', this).each(function(row) {
          $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {
              if (that != null && $(this).html() == $(that).html()) {
                  rowspan = $(that).attr("rowSpan");
                  if (rowspan == undefined) {
                      $(that).attr("rowSpan", 1);
                      rowspan = $(that).attr("rowSpan");
                  }
                  rowspan = Number(rowspan) + 1;
                  $(that).attr("rowSpan", rowspan);
                  $(this).hide();
              } else {
                  that = this;
              }
          });
      });
  });
}

$(function(){
$(".checkbox input[type=checkbox]").click(function(){
	var t = $(this);
	t.parent('label').toggleClass("curr");
})




    //APP端取消下拉刷新
    toggleDragRefresh('off');

  slider = new Swiper('#slider .swiper-container', {pagination : '.pagination'});
  slider1 = new Swiper('#slider1 .swiper-container', {
  	pagination : '.pagination',
  	onSlideChangeEnd:function(swiper){

  		$('#drag img').eq(swiper.activeIndex).addClass('curr').siblings('img').removeClass('curr');
  	}
  });
  if(id && $('.pagination span').length) $('.pagination').show();


  try{
		var upType1 = upType;
	}catch(e){
		var upType1 = 'atlas';
	}

	//选择商品类型
	$('.choseGoods .radio span').click(function(e){
		var inpval = $(this).attr('data-id');
		if(inpval == 0){//实物
			$('.quanAll').addClass('fn-hide');
		}else{//电子券
			$('.quanAll').removeClass('fn-hide');
		}
		$('#goodstype').val(inpval)
	})
	//选择截止时间类型
	$(".quanCart input[type=text]").focus(function(){
	    var itemList = $(this).siblings(".popup_key");
	    if(itemList.html() != undefined){
	      itemList.show();
		  $(this).parents("dd").removeClass("slideup");
		  $(this).parents("dd").addClass("slidedown");
	    }
	    return false;
	  }).blur(function(){
		  var t = $(this);
			setTimeout(function(){
				$(".popup_key").hide();
				 t.parents("dd").removeClass("slidedown");
				 t.parents("dd").addClass("slideup");
			},200)
	  });
  	


// 库存计数,支持退款，是否多规格
$(".radiobox .radio span").click(function(){
	var t = $(this), par = t.closest('.radiobox');
	var val = t.attr("data-id");
	t.addClass("curr").siblings("span").removeClass("curr");
	if(par.hasClass('choseTuikuan')){
		$("#tuikuantype").val(val);
	}else if(par.hasClass('kunJishu')){
		$("#inventoryCount").val(val);
	}else if(par.hasClass('choseGuige')){
		$("#guigetype").val(val)
	}
	
})


// 商品规格
/* 清除不相关的s */

$(".sure_add").html('+自定义值');
$('#specification dl').each(function(){
	var t = $(this);
	if(t.find('dd').attr("data-title")=='颜色'){
		t.addClass("color_dl");
	}
	t.find('.self_box').append(t.find(".sure_add"));
	t.find('.self_box .inp').addClass("binp")
	t.find('.self_add').remove();


})
/* 清除不相关的e */

// 新增自定义值
	var pii = 1;
	$("#specification").delegate(".sure_add","click",function(){
		var t = $(this),dd = t.closest('dd');
		//var par = t.parents('.self_add');
		var selfadd = t.parents(".self_box");
		var id = dd.attr('data-id');
		if(dd.attr("data-title")=="颜色"){

			var len = $(".self_inp").size();
			t.before('<div class="self_inp color_inp fn-clear"><input class="fn-hide"  type="checkbox" name="speCustom'+changeText(id)+'[]"  title="" value=""><input type="text" class="inp" size="12" value="" placeholder="请输入自定义值"><i class="del_inp"></i><div class="img_box"></div><div class="upimg filePicker1" id="filePicker0'+pii+'" data-type="des">选择图片</div><div class="del_img fn-hide">删除图片</div><input class="spePic" type="hidden" name="speCustomPic'+changeText(id)+'[]" value="" /></div>');
			renderbtn();
			pii++;
		}else{
			t.before('<div class="self_inp fn-clear"><input class="fn-hide"  type="checkbox" name="speCustom'+changeText(id)+'[]"  title="" value="0"><input type="text" class="inp"  size="20" value="" placeholder="请输入自定义值" /><i class="del_inp"></i></div>')
		}
		t.prev(".self_inp").find("input").focus();
		// createSpecifi()
	});


// 删除自定义
$("#specificationForm").delegate(".del_inp","click",function(){
	var t = $(this),par = t.parents(".self_inp"),del_img = par.find(".del_img");
	del_img.click();
	par.remove();

	createSpecifi()
});

// 监听input是否有值~~~~自定义规格名称同步
$("#specificationForm").on("input propertychange",".self_inp .inp",function(){
	var t = $(this),check = t.siblings("input[type='checkbox']");
	var id = t.closest('dd').attr('data-id');
	check.val('custom_'+changeText(id+'_'+t.val())).attr("title",changeText(t.val()))
	if(t.val()!="" && t.val()!=undefined){
		t.addClass("binp");
		check.attr("checked","checked");
	}else{
		t.removeClass("binp");
		check.removeAttr("checked");
	}
});

// 监听input是否有值
$("#dianGuige").on("blur",".self_inp .inp",function(){
	var t = $(this),check = t.siblings("input[type='checkbox']");
	var p = t.parents(".self_box");
	var val = changeText(t.val());
	var num = 0 ;
	p.find(".self_inp").each(function(){
		var inp = $(this).find(".inp");
		var val1 = inp.val();
		if(val1==val && val!==""){
			num = num + 1;
		}
	});
	if(num>1){
		t.focus().addClass("err");
		showErr("输入的值重复")
		return false;
	}

	createSpecifi();
});

$('#dianGuige .self_dl').on("blur",".self_div h2 .inp",function(){
	var t = $(this),p = t.closest('.self_dl');
	var num = 0 ,val = changeText(t.val());
	p.find('.self_div h2 .inp').each(function(){
		if(val == changeText($(this).val()) && val !==''){
			num = num + 1;
		}
	})
	if(num > 1){
		t.focus().addClass("err");
		showErr("输入的值重复")
		return false;
	}
	adddl();
})
// 自定义属性
$(".self_dl").on("input propertychange",".self_div li .inp",function(){
	var t = $(this) , par_li = t.parents("li") , par_ul = t.parents("ul");
	t.removeClass("err");
	setTimeout(function(){
		if(t.val()!="" && t.val()!=undefined ){
			par_li.find(".del_prop").show();
			// t.val(t.val().replace(/[,./<>?;':"\\|!@#$%^&*()=+~`｛｝【】；‘’：“”，。《》、？！￥……（）-]/g, ''));
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
	},100)

});

// 自定义属性值
// $(".self_add, .self_box, .self_div h2").on("input propertychange",".inp",function(){
// 	var t = $(this);
// 	if(t.val()!=''&&t.val()!=undefined){
// 		t.val(t.val().replace(/[,./<>?;':"\\|!@#$%^&*()=+~-`｛｝【】；‘’：“”，。《》、？！￥……（）]/g, ''));
// 	}
// });

$(".self_dl").on("blur",".self_div li .inp",function(){
	var t = $(this) , par_li = t.parents('li'),par_ul = t.parents('ul'),p = t.parents(".self_div");
	var val = t.val(),sx_name = p.find('h2 .inp').val();
	var num = 0;
	if(val!=''){
		par_ul.find('li').each(function(){
			var val1 = $(this).find(".inp").val();
			if(val==val1 && val!=''){
				num = num + 1;
			}
		});
		if(num>1){
			showErr("输入的值重复");
			t.focus();
			return false;
		}
		adddl();   //遍历自定义属性
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

// 新增自定义属性
$(".self_dl").delegate(".adddiv","click",function(){
		$(this).before('<div class="self_div"><h2 class="fn-clear"><input type="text" class="inp" size="22" maxlength="50" placeholder="输入属性名称"> <a href="javascript:;" class="del_dd"></a></h2><ul class="fn-clear propbox"><li class="fn-clear propli"><input type="text" class="inp" size="22" maxlength="50" placeholder="请输入属性值"><i class="del_prop "></i></li></ul></div>');
});

//删除自定义产品参数
$('#proItem').delegate('.icon-trash', 'click', function(){
    var t = $(this), dl = t.closest('dl');
    if(confirm('确认要删除吗？')){
        dl.remove();
    }
});

// 新增自定义参数
$("#proItem").delegate(".adddiv","click",function(){
    $(this).before('<dl class="clearfix cusItem" data-type="select"><dt><input type="text" class="inp" name="cusItemKey[]" placeholder="请输入参数名" data-regex="S+" value=""></dt><dd style="position:static;"><input type="text"  class="inp" name="cusItemVal[]" placeholder="请输入参数值" data-regex="S+" value=""><a style="float: none; vertical-align: middle; margin-left: 5px;" class="icon-trash">删除</a></dd></dl>');
    $('#proItem .icon-trash').tooltip();
});




// 删除自定义属性
	$(".self_dl").delegate(".del_dd","click",function(){
		var t = $(this);
		//if($(".self_dl .self_div").size()>1){
			t.parents(".self_div").remove();
			if($('#tuanGuige').size() > 0){//团购商品
				tuanadddl();//
			}else{
				adddl();
			}
			
		//}else{
		//	showErr("已经不能再删除啦~")
		//}
	})
  if(tuanFlag ==1){
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
				if(tval!=''){
					sx_val.push(tval);
				}
			})
			var fid = createRandomId();
			
			if(sx_name!=''&& sx_val!=[]){
				var sxval = []
				for(var i=0;i<sx_val.length;i++){
					sxval.push('<div class="self_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox"  name="speNew['+sx_name+'][]" title="'+sx_val[i]+'" value="'+sx_val[i]+'"><input type="text" class="inp" size="20" value="'+sx_val[i]+'"><i class="del_inp"></i></div>')
				}

				html.push('<dl class="fn-clear dl"><dt>'+sx_name+'：</dt><dd data-title="'+sx_name+'" data-id="'+fid+'">'+sxval.join('')+'</dd></dl>')
			}
			$('#speList').before(html.join(''))
		});
	
		createSpecifi();
	}


// 查看图片
$("#specificationForm").delegate(".img_box","click",function(){
	var t = $(this) , img = t.find("img");
	// alert("1111")
	 url = img.attr("data-url");
	 src = img.attr("src");
	 $(".layer-img").show();
	 $(".layer-img img").attr("src",src);
	 showWin();
	$(".layer-img .del_Img").click(function(){
		t.siblings(".del_img").click();
		$(".layer-img img").attr("src","");
		$(".layer-img").hide();
		showWin('close');
	})
});


$(".layer-img .confirm").click(function(){
	$(".layer-img").hide();
	// showWin('close');
})

// 批量上传
$(".pl_btn").click(function(){
	$(".mask_pop,.pop_box").show();
});

$(".pop_box .cancel_btn").click(function(){
	$(".mask_pop,.pop_box").hide();
});
$(".pop_box .sure_btn").click(function(){
	var flag = 1;
	var kucun = '',mprice = '', price =''
	$(".pop_box li").each(function(){
		var datatype = $(this).find("input").attr('name'),
		val = $(this).find("input").val();
		if(val !="" && val!=undefined){
			flag = 0;
			if(datatype=="pl_mprice"){
				$(".inp.oprice").val(val)
			}else if(datatype=="pl_price"){
				$(".inp.nprice").val(val)
			}else{
				$(".inp.countkc").val(val)
			}
		}
	});
	if(flag){
		showErr("请至少输入一个值");
	}else{
		$(".mask_pop,.pop_box").hide();
		inventory = 0;
		$("#speList").find("input").each(function(index, element) {
		  var val = Number($(this).val()), type = $(this).attr("data-type");
		  if(type == "inventory" && val){
		    inventory = Number(inventory + val);
		  }
		});
		$("#inventory").val(parseInt(inventory)).attr('data-moreGuige',parseInt(inventory));

	}

});



$(".pop_box").on("keyup",".pl_ul input",function(){
	var t = $(this),name = t.attr("name");
	var val = t.val();
	if(name=='pl_mprice'||name=='pl_price'){
		var nowval = val.replace(/[^\d\.]/g,'')
		t.val(nowval)
	}else if(name=='pl_kucun'){
		var nowval = val.replace(/\D/g,'')
		t.val(nowval)
	}
});
$(".pop_box").on("blur",".pl_ul input",function(){
	var t = $(this),name = t.attr("name");
	var val = t.val();
	if((name=='pl_mprice'||name=='pl_price') && val!=''){
		var nowval = val.replace(/[^\d\.]/g,'')*1
		t.val(nowval.toFixed(2))
	}
})

$(".speTab").on("keyup",".inp_box .inp",function(){
	var t = $(this),name = t.attr("data-type");
	var val = t.val();
	if(name=='mprice'||name=='price'){
		var nowval = val.replace(/[^\d\.]/g,'');
		t.val(nowval)
	}else if(name=='inventory'){
		var nowval = val.replace(/\D/g,'')
		t.val(nowval)
	}
});
$(".speTab").on("blur",".inp_box .inp",function(){
	var t = $(this),name = t.attr("data-type");
	var val = t.val();
	if((name=='mprice'||name=='price') && val!=''){
		var nowval = val.replace(/[^\d\.]/g,'')*1
		t.val(nowval.toFixed(2))
	}


})

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
          //showErr(etip);
        }
        return check;
      }
    }

    //名称
    ,title: function(){
      return this.regexp($("#title"), ".{5,50}", langData['siteConfig'][27][90]);
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
        //showErr(etip);
        return false;
      }else{
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

  var inputObj = "";
  //商品属性选择或输入：点击
  $("#proItem input[type=text]").focus(function(){
    var itemList = $(this).siblings(".popup_key");
    inputObj = $(this).attr("id");
    if(itemList.html() != undefined){
      itemList.show();
	  $(this).parents("dd").removeClass("slideup");
	  $(this).parents("dd").addClass("slidedown");
    }
    return false;
  }).blur(function(){
	  var t = $(this);
		setTimeout(function(){
			$(".popup_key").hide();
			 t.parents("dd").removeClass("slidedown");
			 t.parents("dd").addClass("slideup");
		},200)
  });
 $("#proItem dl").each(function(){
	 if($(this).find(".popup_key").size()>0){
		 $(this).children("dd").addClass("slideup")
	 }
 })
  //商品属性选择或输入：输入
  $("#proItem").delegate("input[type=text]", "input", function(){
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
	var t = $(this);
    var id = $(this).attr("data-id"), val = $(this).attr("title"), parent = $(this).parent().parent();
    if(id && val){
      parent.siblings("input[type=text]").val(val);
	  t.addClass("select").siblings("li").removeClass("select");
    }
    parent.hide();
    var par = t.closest('.ml4r');
    if(par.hasClass('quanCart')){
    	$('#quantype').val(id)
    	//电子券属性
		if(id == 1){//有效天数
			$('.yxdays').removeClass('fn-hide');
			$('.yxdate').addClass('fn-hide');
			$('.deadline').val('');
		}else if(id == 2){//截止日期
			$('.yxdays').addClass('fn-hide');
			$('.yxdate').removeClass('fn-hide');
			$('#validity').val('');
		}
		
    }
  });
  $("#proItem").on("input",".inp",function(){
	  var t = $(this);
	  var sib = t.siblings(".popup_key");
	  sib.find('li').each(function(){
		  if(t.val()!=$(this).attr("title"));
		  $(this).removeClass("select");
	  })
  })

  // 商品属性单选
  $("#proItem .radio span").click(function(){
    var t = $(this), id = t.data('id');
    t.addClass('curr').siblings('span').removeClass('curr').siblings('input').val(id);
  })


  //获取运费模板详细
  function getLogisticDetail(id){
    $.ajax({
      type: "GET",
      url: "/include/ajax.php?service=shop&action=logisticTemplate&sid="+$("#store").val()+"&id="+id,
      dataType: "jsonp",
      success: function(a) {
        if(a.state == 100){
          $("#logisticDetail").html(a.info).show();
        }
      }
    });
  }
  $("#logistic").change(function(){
    var id = $(this).val();
    if(id == 0){
      $("#logisticDetail").hide();
    }else{
      getLogisticDetail(id);
    }
  });



	//错误提示
  var showErrTimer;
  function showErr(txt){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      showErrTimer = setTimeout(function(){
          $(".popErr").fadeOut(300, function(){
              $(this).remove();
          });
      }, 1500);
  }




$('.filePicker').each(function(){
  var pid = $(this).attr('data-id');
  //上传凭证
	var $list = $('#fileList'+pid),
		uploadbtn = $('.uploadbtn'),
			ratio = window.devicePixelRatio || 1,
			fileCount = 0,
			thumbnailWidth = 100 * ratio,   // 缩略图大小
			thumbnailHeight = 100 * ratio,  // 缩略图大小
			uploader;

	fileCount = $list.find(".thumbnail").length;

	// 初始化Web Uploader
	uploader = WebUploader.create({
		auto: true,
		swf: staticPath + 'js/webuploader/Uploader.swf',
		server: '/include/upload.inc.php?mod='+modelType+'&type='+upType1,
		pick: '#filePicker'+pid,
		fileVal: 'Filedata',
		accept: {
			title: 'Images',
			extensions: 'jpg,jpeg,gif,png',
			mimeTypes: 'image/jpeg,image/png,image/gif'
		},
		compress: {
			width: 750,
	    height: 750,
	    // 图片质量，只有type为`image/jpeg`的时候才有效。
	    quality: 90,
	    // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
	    allowMagnify: false,
	    // 是否允许裁剪。
	    crop: false,
	    // 是否保留头部meta信息。
	    preserveHeaders: true,
	    // 如果发现压缩后文件大小比原来还大，则使用原来图片
	    // 此属性可能会影响图片自动纠正功能
	    noCompressIfLarger: false,
	    // 单位字节，如果图片大小小于此值，不会采用压缩。
	    compressSize: 1024*200
		},
		fileNumLimit: atlasMax,
		fileSingleSizeLimit: atlasSize
	});


	//删除已上传图片
	var delAtlasPic = function(b){
		var g = {
			mod: modelType,
			type: "delAtlas",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	//更新上传状态
	function updateStatus(){
		if(fileCount == 0){
			$('.imgtip').show();
		}else{
			$('.imgtip').hide();
			if(atlasMax > 1 && $list.find('.litpic').length == 0){
				$list.children('li').eq(0).addClass('litpic');
			}
		}
		$(".uploader-btn .utip").html(langData['siteConfig'][20][303].replace('1',(atlasMax-fileCount)));//还能上传1张图片
	}

	// 负责view的销毁
	function removeFile(file) {
		//console.log(file)
		var $li = $('#'+file.id);
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}

	//从队列删除
	$('body').off("click").delegate(".del", "click", function(){
		var t = $(this), li = t.closest(".thumbnail"), slide = t.closest('.swiper-slide'), index = slide.index();
		var file = [];

		slider1.removeSlide(index);
		file['id'] = $("#slider .swiper-slide").eq(index).attr("id");
		removeFile(file);
		updateStatus();
		setTimeout(function(){
			getDelImg();
		},500)
	});

  //宝贝描述删除图片
  $('body').delegate(".cancel", "click", function(){
    var t = $(this), li = t.closest(".thumbnail"), slide = t.closest('.desc-box'), index = slide.index();
    var file = [];
    file['id'] = slide.attr("id");

    removeFile(file);
    updateStatus();
  });

	// 切换litpic
	if(atlasMax > 1){
		$list.delegate(".item img", "click", function(){
			var t = $(this).parent('.item');
			if(atlasMax > 1 && !t.hasClass('litpic')){
				t.addClass('litpic').siblings('.item').removeClass('litpic');
			}
		});
	}

	// 当有文件添加进来时执行，负责view的创建
	function addFile(file) {
    if (pid == 1) {
  		var $li   = $('<div class="swiper-slide" id="' + file.id + '"><div class="thumbnail"><img></div></div>'),
  				$btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
  				$img = $li.find('img');
    }else {
      var $li = $('<div class="desc-box" contenteditable="false" id="' + file.id + '"><div class="thumbnail"><img></div></div>'),
          $btns = $('<span class="cancel"></span>').appendTo($li),
          $img = $li.find('img');
    }

		// 创建缩略图
		uploader.makeThumb(file, function(error, src) {
				if(error){
					$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][203]+'</span>');//不能预览
					return;
				}
				$img.attr('src', src);
			}, thumbnailWidth, thumbnailHeight);

			$('body').delegate('.cancel', 'click', function(){
				uploader.removeFile(file, true);
			});

      $('body').delegate('.del', 'click', function(){
				uploader.removeFile(file, true);
			});

      if (pid == 1) {
        $('.slider').addClass('active');
        $('.slider .pagination').show();
        slider.appendSlide($li);
		slider.slideTo($li.index())
        scrollbox();
      }else {
        $('.desc-container').append($li);
       	$('.desc-container').append('<div class="placeholderDiv"></div>')
      }


	}

	// 当有文件添加进来的时候
	uploader.on('fileQueued', function(file) {

		//先判断是否超出限制
		if(fileCount == atlasMax){
			showErr(langData['siteConfig'][20][305]);//图片数量已达上限
			return false;
		}

		fileCount++;
		addFile(file);
		updateStatus();
	});

	// 文件上传过程中创建进度条实时显示。
	uploader.on('uploadProgress', function(file, percentage){
		var $li = $('#'+file.id),
		$percent = $li.find('.progress span');

		// 避免重复创建
		if (!$percent.length) {
			$percent = $('<p class="progress"><span></span></p>')
				.appendTo($li)
				.find('span');
		}
		$percent.css('width', percentage * 100 + '%');
	});

	// 文件上传成功，给item添加成功class, 用样式标记上传成功。
	uploader.on('uploadSuccess', function(file, response){
		var $li = $('#'+file.id);
		if(response.state == "SUCCESS"){
			$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
		}else{
			removeFile(file);
			showErr(langData['siteConfig'][44][88]);//上传失败！
		}
	});

	// 文件上传失败，现实上传出错。
	uploader.on('uploadError', function(file){
		removeFile(file);
		showErr(langData['siteConfig'][44][88]);//上传失败！
	});

	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on('uploadComplete', function(file){
		$('#'+file.id).find('.progress').remove();
	});

	//上传失败
	uploader.on('error', function(code){
		var txt = langData['siteConfig'][44][88];//上传失败！
		switch(code){
			case "Q_EXCEED_NUM_LIMIT":
				txt = langData['siteConfig'][20][305]+',最多只能上传20张';//图片数量已达上限
				break;
			case "F_EXCEED_SIZE":
				txt = langData['siteConfig'][20][307].replace('1',(atlasSize/1024/1024));//图片大小超出限制，单张图片最大不得超过1MB
				break;
			case "F_DUPLICATE":
				txt = langData['siteConfig'][20][308];//此图片已上传过
				break;
		}
		showErrAlert(txt);
	});

})

  // 隐藏弹出层
  $('.back-btn').click(function(){
    $(this).closest('.layer').hide();
  })

  // 图片排序弹出层显示
  $('#slider').delegate('.swiper-slide', 'click', function(){
    $('.layer-slider').show();
    getSliderImg();
    showWin();
  })

  // 首页幻灯片变化
  var sliderImg = [], dragHtml = [];
  function getSliderImg(){
    sliderImg = [];
    dragHtml = [];
    $('#slider .swiper-slide').each(function(){
      var t = $(this), imgsrc = t.find('img')[0].src, id = t.attr('id');
       sliderImg.push({
      	src:imgsrc,
      	val:t.find('img').attr('data-val'),
      	id:id
      });
    });

    slider1.removeAllSlides();
    for (var i = 0; i < sliderImg.length; i++) {
    	var cla = i == 0?'curr':'';
      dragHtml.push('<img src="'+sliderImg[i].src+'" data-val="'+sliderImg[i].val+'" class="'+cla+'">');
      slider1.appendSlide('<div class="swiper-slide" id="'+id+'"><div class="thumbnail"><img src="'+sliderImg[i].src+'" data-val="'+sliderImg[i].val+'"><span class="del"></span></div></div>');
    }
    $('#drag').html(dragHtml.join(''));

  }

  // 弹出层编辑图片删除操作
  var delImg = [], dragHtml1 = [];
  function getDelImg(){
    delImg = [];
    dragHtml1 = [];
    $('#slider1 .swiper-slide').each(function(){
      var t = $(this), imgsrc = t.find('img')[0].src;
      delImg.push({
      	src:imgsrc,
      	val:t.find('img').attr('data-val'),
      });
    });

    slider.removeAllSlides();
    if (delImg.length > 0) {
      for (var i = 0; i < delImg.length; i++) {
        dragHtml1.push('<img src="'+delImg[i].src+'" data-val="'+delImg[i].val+'">');
        slider.appendSlide('<div class="swiper-slide"><div class="thumbnail"><img src="'+delImg[i].src+'"  data-val="'+delImg[i].val+'"></div></div>');
      }
    }else {
      $('.layer-slider').hide();
      $('#slider').removeClass('active');
      $('.slider .pagination').hide();
      showWin('close');
    }
    $('#drag').html(dragHtml1.join(''));
  }





  // 图片拖拽排序
  var drag = document.getElementById("drag");
  new Sortable(drag);

  var winSct = 0;
  function showWin(type){
    var type = type ? type : 'open';
    if(type == 'open'){
      $('html').addClass('openwin');
      winSct = $(window).scrollTop();
      $('.header').hide();
      $(window).scrollTop(0);

    }else{
      $(window).scrollTop(winSct);
      $('.header').show();
      $('html').removeClass('openwin');
    }
  }

  // 商品规格弹出层显示
  $('.guige-btn').click(function(){
 //    if($("#modAdrr").val() == '1'){
	// 	$(".guigeMask,.guigePop").addClass('show')
	// }else{
	// 	$('.layer-size').show();
	// 	showWin();
	// 	scrollbox();
	// }
	$(".guigeMask,.guigePop").addClass('show')
  })

  $(".guigeFan").click(function(){
  	$(".guigeMask,.guigePop").removeClass('show')
  })

  if($('#category').length){
    var config = [];
    $('#category').children().each(function(i){
      var t = $(this), val, txt, id = t.data('id'), pid = t.data('pid');
      if(!id) return;
      if(t.is('optgroup')){
        val = t.attr('label').split('|--')[1];
        if(config[id] == undefined){
          config[id] = {
            typename: val,
            list: []
          };
        }
      }else if(t.is('option')){
        var val = t.attr("value"), txt = t.text().split('|--')[1];
        if(val){
          var selected = t.attr('selected') ? 1 : 0;
          if(pid == undefined){
            config[id] = {
              typename: txt,
              list: [{id: val, 'typename': txt, selected: selected}]
            }
          }else{
            config[pid]['list'].push({id: val, 'typename': txt, selected : selected});
          }
        }
      }
    })

    var html = [];
    for(var i in config){
      var d = config[i];
      html.push('<dl class="fn-clear">');
      html.push('  <dt>');
      html.push('    <label>'+d.typename+'：</label></dt>');
      html.push('  <dd>');
      html.push('    <div class="fn-clear checkbox">');
      for(var s = 0; s < d.list.length; s++){
        if(d.list[s].selected){
          html.push('      <label class="active"><input type="checkbox" name="category[]" value="'+d.list[s].id+'" checked="checked">'+d.list[s].typename+'</label>');
        }else{
          html.push('      <label><input type="checkbox" name="category[]" value="'+d.list[s].id+'">'+d.list[s].typename+'</label>');
        }
      }
      html.push('    </div>');
      html.push('  </dd>');
      html.push('</dl>');
    }

    $('#category').parent().html(html.join(""));

  }

  // 分类弹出层
  $('.storetype-btn').click(function(){

    // $('.layer-storetype').show();
    // showWin();
    // scrollbox();
    $('.categoryMask ,.categoryPop').addClass('show')
  })

  $(".categoryPop .categorySure,.categoryPop .categoryFan").click(function(){
  	$('.categoryMask ,.categoryPop').removeClass('show')
  })
  // 选择分类
  $("#storeType").delegate("input[type=checkbox]", "click", function(){
    var t = $(this);
    if(!t.is(":checked")){
      t.parent().removeClass('active');
    }else{
      t.parent().addClass('active');
    }
  });
  // 商品确定分类
  $('.categoryPop .categorySure').click(function(){
    var res = [];
    $("#storeType").find("input").each(function(index, element) {
      var t = $(this), txt = t.parent().text();
      if(t.is(":checked")){
        res.push(txt);
      }
    });
    $('#storeTypeCon .selgroup p').text(res.length ? res.join(",") : langData['siteConfig'][20][119]);
    // $('.layer-storetype').hide();
    // showWin('close');
  })
  //商品分类--返回
  $('.layer-storetype .spFan').click(function(){
  	$('.layer-storetype').hide();
    showWin('close');
  })

  // 确定商品详情
  $('.layer-desc .confirm').click(function(){
    $('.layer-desc').hide();
    showWin('close');
  })

    // 关闭图片幻灯
    $('.layer-slider .confirm').click(function(){
        $('.layer-slider').hide();
        showWin('close');
    })


  //选择规格
 	var fth;
 	$("#specification").delegate("input[type=checkbox]", "click", function(){
    var t = $(this);
    if(!t.is(":checked")) t.parent().removeClass('active');
   
 		createSpecifi();
 	});

 	if(specifiVal.length > 0){
 		if(tuanFlag == 1){
           createtuanSpecifi();
           }else{
           createSpecifi();
           }
 		
 	}

 	//规格选择触发
 	function createSpecifi(){
 		if($("#specification").size()==0) return false;
 		var checked = $("#specification input[type=checkbox]:checked");
 		if( checked.length > 0 ){
 			$("#inventory").val("0").attr("disabled", true);
 			$("#inventory").closest('.ml4r').addClass('fn-hide')
 			//thead
 			var thid = [], thtitle = [], th1 = [],
 				th2 = '<th>'+langData['siteConfig'][45][101]+' <font color="#f00">*</font></th><th>'+langData['siteConfig'][42][30]+' <font color="#f00">*</font></th><th>'+langData['siteConfig'][19][525]+' <font color="#f00">*</font></th>';//原价 -- 价格 -- 库存
 			for(var i = 0; i < checked.length; i++){
 				var t = checked.eq(i),
 					title = t.parents("dd").attr("data-title"),
 					id = t.parents("dd").attr("data-id");

 				if(thid.indexOf(id) < 0){
 					thid.push(id);
 					thtitle.push(changeText(title));
 				}
 			}
 			for(var i = 0; i < thtitle.length; i++){
 				th1.push('<th>'+thtitle[i]+'</th>');
 			}
 			$("#speList thead").html(th1.join('')+th2);

 			//tbody 笛卡尔集
 			var th = new Array(), dl = $("#specification dl");
 			for(var i = 0; i < dl.length - 1; i++){
 				var tid = [];

 				//取得已选规格
 				dl.eq(i).find("input[type=checkbox]:checked").each(function(index, element) {
          var id = $(this).val(), val = $(this).attr("title");
          $(this).closest('label').addClass('active');
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

 				//输出
				// console.log(fth)
 				createTbody(fth);
 			}

 		}else{
 			$("#inventory").removeAttr("disabled");
 			$("#inventory").closest('.ml4r').removeClass('fn-hide')
 			$("#speList thead, #speList tbody").html("");
 			$("#speList").hide();
 		}
 	}

 	//输出规格内容
 	function createTbody(fth){

		if(fth.length > 0){
			var html = [];
			var inventory = 0;
			for(var i = 0; i < fth.length; i++){
				var fthItem = fth[i].split("***"), id = [], val = [];
				if(i!=0 && (fth[i].split("###")[0]==fth[i-1].split("###")[0])){
				}else{
					html.push('<ul>')
				}

				html.push('<li class="item_div"><h4>')
				for(var f = 0 ; f<fthItem.length; f++){
					var proid = changeText(fthItem[f].split("###")[0])
					var proname = changeText(fthItem[f].split("###")[1])
					id.push(proid);
					val.push(proname);
					if((f+1)==fthItem.length){
						html.push(proname)
					}else{
						html.push(proname+'+')
					}
				}

				html.push('</h4>');
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
				html.push('<div class="inp_box">');
				html.push('<input type="text" id="f_mprice_'+id.join("-")+'" name="f_mprice_'+id.join("-")+'" data-type="mprice" value="'+mprice+'" class="inp oprice" placeholder="输入原价" /><input type="text" id="f_price_'+id.join("-")+'" name="f_price_'+id.join("-")+'" data-type="price" class="inp nprice" value="'+price+'" placeholder="输入现价" /><input type="text" id="f_inventory_'+id.join("-")+'" name="f_inventory_'+id.join("-")+'" data-type="inventory" class="inp countkc" placeholder="输入库存" value="'+f_inventory+'" />')
				html.push('</div></li>');
				if((i+1)<fth.length && (fth[i].split("###")[0] == fth[i+1].split("###")[0])){

				}else{
					html.push('</ul>')
				}
			}
			if(specifiVal.length > 0){
				$("#inventory").val(inventory);
			}
			$("#speList .speTab").html(html.join(""))
			$("#speList").show();
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
  	// //商品规格返回
  	// $('.layer-size .confirm .guigeFan').click(function(){
  	// 	$('.layer-size').hide();
   //    	showWin('close');
  	// })
  // 商品规格验证
  $('.guigePop .guigeSure').click(function(){
    if(guigeCheck()){
      $("#speList").find(".tip-inline").hide();
      $(".guigePop ,.guigeMask").removeClass('show');
    }else{
	  showErr("请补全价格和库存，字段类型为数字！")
      $("#speList").find(".tip-inline").html(langData['siteConfig'][27][93]).show();//
      $("#specification").scrollTop(999);
    }
  })

  // 宝贝描述弹出层出现
  $('.describe-btn').click(function(){
    // $('.layer-desc').show();
    // showWin();
    // scrollbox();

    $(".detailMask,.detailPop").addClass('show')
  })


  // 隐藏宝贝描述
  $(".detailFan").click(function(){
  	$(".detailPop .desc-container").html(htmlDom)
  	 $(".detailMask,.detailPop").removeClass('show')
  })


  // 确定宝贝描述

$(".detailSure").click(function(){
  	 $(".detailMask,.detailPop").removeClass('show')
  })


  // 弹出层中间滑动部分
  function scrollbox(drift){
    var headerHeight = $('.header').height(), footHeight = $('.footer').height(),
        winHeight = $(window).height();
    $('.scrollbox').not('#mainBox').css('height', winHeight - headerHeight - footHeight - 20);
    $('.scrollbox#specification').css('height', winHeight - headerHeight - footHeight); 
  }
  scrollbox();


  if($("#speList").find("input").length > 0){
  	guigeCheck()
  }
  function guigeCheck(){

    var r = true;
    var min_mprice = '',min_price =  '';
    //规格表值验证
    $("#speList").find("input").each(function(index, element) {
      var val = $(this).val();
      if(!/^0|\d*\.?\d+$/.test(val)){
        // $(window).scrollTop(Number($("#speList").offset().top)-8);
        $("#speList").find(".tip-inline").removeClass().addClass("tip-inline tip-error");
        $("#speList").find(".tip-inline").html('<s></s>'+langData['siteConfig'][27][93]);
        r = false;
      }else{      
        $("#speList").find(".tip-inline").removeClass().addClass("tip-inline success");
        $("#speList").find(".tip-inline").html('<s></s>'+langData['siteConfig'][27][94]);
      }
    });


    if(r && $("#speList").find("input").length > 0){
    	$("#mprice,#price").closest('.ml4r').addClass('fn-hide');
    	$("#speList .item_div").each(function(ind){
    		var oprice = $(this).find('.oprice').val();
    		var nprice =  $(this).find('.nprice').val();
    		if(oprice && !min_mprice){
    			min_mprice = oprice
    		}else if(oprice && min_mprice <=  oprice){
    			min_mprice = oprice
    		}

    		if(nprice && !min_price){
    			min_price = nprice
    		}else if(nprice && min_price <=  nprice){
    			min_price = nprice
    		}
    	})
    	$("#mprice").val(min_mprice)
    	$("#price").val(min_price)
    	$('.guige-btn .selgroup p').text('设置/查看')
    }else{
    	$("#mprice,#price").closest('.ml4r').removeClass('fn-hide')
    	$('.guige-btn .selgroup p').text('请选择商品规格')
    }

    return r;
  }


// 切换分类
$(".proCategory").click(function(){
	var t =$(this),url = t.attr('href')
	var popOptions = {
        title:'确定更改分类么？',
        confirmTip:'修改分类后部分已填内容可能会丢失',
        isShow:true,
        btnSure:'确定'
      }
    
	  confirmPop(popOptions,function(){
	    window.location.href = url;
	  })
	  return false;
})





  	//电商发布--品牌
  	var defaultValuee = [0,0]
    getbrandList();
  	function getbrandList(){
	  	$.ajax({
			url: '/include/ajax.php?service=shop&action=brandType&gettype=1',
			type: "POST",
			dataType: "json",
			async:false,
			success: function (data) {
				if(data.state == 100){
					var plist = data.info;
					var typeList = [],html = [];

					html.push('<ul id="brandList" data-type="treeList" style="display: none;">')
						defaultValuee = [plist[0].id]
						if(plist[0].lower.length){
						    defaultValuee.push(plist[0].lower[0].id)
						}
    					for(var i = 0; i < plist.length; i++){
    						var lower = plist[i].lower;
    							var id = plist[i].id;
    							var typename = plist[i].typename;
    						if(plist[i].lower && plist[i].lower.length > 0){
    							html.push('<li data-val="'+id+'"><span>'+typename+'</span><ul>');
    							
    							for(var m = 0; m < lower.length; m++){
    								html.push('<li data-val="'+lower[m].id+'">'+lower[m].title+'</li>');
    								if(brandId == lower[m].id){
    									defaultValuee = [id,brandId]
    								}
    							}
    							html.push('</ul></li>');
    						}else{
    						    html.push('<li data-val="'+id+'"><span>'+typename+'</span></li>');
    						}
    					}
					html.push('</ul>');
					console.log(html)
					$("#brandname").after(html.join(''));

					var treelist = $('#brandList').mobiscroll().treelist({
						theme: 'ios',
						themeVariant: 'light',
						height:40,
						lang:'zh',
						headerText:'选择品牌',
						display: 'bottom',
						circular:false,
						defaultValue:defaultValuee,
						onInit:function(){
							$("#brandname").val($("#brandList li[data-val="+(defaultValuee.length > 1 ? defaultValuee[1]:defaultValuee[0])+"]").text())
						},
						onSet:function(valueText, inst){
						    console.log(inst,valueText)
							var typename = $("#brandList li[data-val="+(inst._wheelArray.length > 1 ? inst._wheelArray[1] : inst._wheelArray[0])+"]").text()
							var typeid = inst._wheelArray.length > 1 ? inst._wheelArray[1] : inst._wheelArray[0];
							
							$("#brandname").val(typename);
							$("#brand").val(typeid);
						},
				        onShow:function(){
				             toggleDragRefresh('off');
				        },
				        onHide:function(){
				             toggleDragRefresh('on');
				        }

					})

				}
			},
			error: function(){}
		});
  	}
  	function getLowerList(id,html){
	  	$.ajax({
		  	url: '/include/ajax.php?service=business&action=type&type='+id,
		  	type: "POST",
		  	dataType: "json",
		  	success: function (data) {
		  		if(data.state = 100){
		  			var clist = data.info;
		  			for(var m = 0; m < clist.length; m++){
						html.push('<li data-val="'+clist[m].id+'">'+clist[m].typename+'</li>');
						if(typeid == clist[m].id){
							defaultValuee = [id,typeid]
						}
					}

		  		}
		  	},
		  	error: function(){}
	  	});
  	}

  /***************************** 团购发布 **********************************/
  //团购套餐 -- 增加商品信息
  //商品--原价
  	$('.mealWrap').delegate('.goodMarket','focus',function(){
	  	var mrlval = $(this).val();
	  	if(mrlval == ''){
	  		$(this).val(echoCurrency('symbol'))
	  	}
  	})
  	$('.mealWrap').delegate('.goodMarket','blur',function(){
	  	var mrlval = $(this).val();
	  	if(mrlval == echoCurrency('symbol')){
	  		$(this).val('')
	  	}
  	})

  	$('.mealWrap').on('input','.goodMarket',function(){
	  	var mrlval = $(this).val();
	  	if(mrlval == ''){
	  		$(this).val(echoCurrency('symbol'))
	  	}else{
	  		$(this).val(echoCurrency('symbol') + mrlval.replace(/[^\-?\d.]/g,''))
	  	}
  	})


  	//商品 -- 数量/规格
  	$('.mealWrap').delegate('.numTip','click',function(e){
  		e.preventDefault();
	  	if(!$(this).hasClass('numcick')){
	  		$(this).addClass('numcick');
	  		$(this).siblings('.numtAlert').show();
	  	}else{
	  		$(this).removeClass('numcick');
	  		$(this).siblings('.numtAlert').hide();
	  	}
  	})
  	//监听数量规格
  	$('.mealWrap').delegate('.goodNum','keyup',function(){
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
   	$('.mealWrap').delegate('input','focus',function(){
  		$('.numtAlert').hide();
  		$('.numTip').removeClass('numcick');
  	})

  	//商品--增加商品信息
 	$('.mealWrap').delegate('.mealGoodAdd','click',function(){
  		var sbm = $(this).siblings('.mealMid');
  		var goodHtml = [];
  		goodHtml.push('<div class="form-item">');
	    goodHtml.push('    <div class="frmtop fn-clear">');
	    goodHtml.push('        <div class="fn-left">');
	    goodHtml.push('          <input type="text" class="goodName" placeholder="输入商品名称">');
	    goodHtml.push('        </div>');
	    goodHtml.push('        <div class="fdiv">');
	    goodHtml.push('          <input type="text" class="goodNum" placeholder="数量/规格">');
	    goodHtml.push('        </div>');
	    goodHtml.push('        <div class="fakediv"><input type="text" class="goodMarket" placeholder="原价" ></div>   ');
	            
	    goodHtml.push('    </div>');
		goodHtml.push('	<div class="frmbot">');
		goodHtml.push('		<a href="javascript:;" class="goodUp"></a>');
		goodHtml.push('		<a href="javascript:;" class="goodDown"></a>');
		goodHtml.push('		<a href="javascript:;" class="goodDel"></a>');
		goodHtml.push('	</div>');
	    goodHtml.push('</div>');
	    sbm.append(goodHtml.join(''));
  	})

  	//商品上移
  	$('.mealWrap').delegate('.goodUp','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    var par = $(this).closest('.form-item');
	    $('.goodUp').addClass('disabled');

	    if(par.prev().size()>0){
	      par.addClass('slide-top');
	      par.prev().addClass('slide-bottom');
	      setTimeout(function(){
	        $('.mealWrap .form-item').removeClass('slide-top');
	        $('.mealWrap .form-item').removeClass('slide-bottom');
	        par.prev().before(par);
	      },500)
	    }
	    setTimeout(function(){
	      $('.goodUp').removeClass('disabled')
	    },500)
  	})

    //商品下移
  	$('.mealWrap').delegate('.goodDown','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    var par = $(this).closest('.form-item');
	    $('.goodDown').addClass('disabled');
	    if(par.next().size()>0){
	      par.addClass('slide-bottom');
	      par.next().addClass('slide-top');
	      setTimeout(function(){
	        $('.mealWrap .form-item').removeClass('slide-top');
	        $('.mealWrap .form-item').removeClass('slide-bottom');
	        par.next().after(par);
	      },500)
	    }
	    setTimeout(function(){
	      $('.goodDown').removeClass('disabled')
	    },500)
  	})
  	//商品删除
  	$('.mealWrap').delegate('.goodDel','click',function(){
  		var par = $(this).closest('.form-item');
  		if($('.form-item').length == 1){
  			showErrAlert('最少一个商品哦!');
  			return false;
  		}else{
  			par.remove();
  		}

  	})

  	//团购套餐--新增套餐
  	$('.mealAdd').click(function(){
  		var sbm = $(this).siblings('.mealWrap');
  		var mealHtml = [];
  		mealHtml.push('<div class="mealform">');
        mealHtml.push('  <div class="mealTop">');
        mealHtml.push('    <input type="text" class="mealName" placeholder="输入内容标题（选填）">');
        mealHtml.push('    <div class="oprmeal">');
        mealHtml.push('    	<a href="javascript:;" class="opra"></a>');
		mealHtml.push('    	<div class="downItem">');
		mealHtml.push('	        <ul class="downList">');
		mealHtml.push('	          <li class="mealUp"><span>上移</span></li>');
		mealHtml.push('	          <li class="mealDown"><span>下移</span></li>');
		mealHtml.push('	          <li class="mealDel"><span>删除</span></li>');
		mealHtml.push('	        </ul>');
		mealHtml.push('    	</div>');
        mealHtml.push('    </div>');
            
        mealHtml.push('  </div>');
        mealHtml.push('<div class="mealTitle"> <div class="nameTit">商品名称</div>  <div class="numTit">规格/数量 <i class="numTip"></i> <div class="numtAlert">建议填写：1份、2串、2杯等，不填写单位默认为份</div> </div> <div class="priceTit">原价</div></div>') ;
        mealHtml.push('  <div class="mealMid">');
        mealHtml.push('    <div class="form-item">');
        mealHtml.push('      <div class="frmtop fn-clear">');
        mealHtml.push('        <div class="fn-left">');
        mealHtml.push('          <input type="text" class="goodName" placeholder="输入商品名称">');
        mealHtml.push('        </div>');
        
        mealHtml.push('        <div class="fdiv">');
        mealHtml.push('          <input type="text" class="goodNum" placeholder="数量/规格">');
        // mealHtml.push('          <i class="numTip"></i>');
        mealHtml.push('          <div class="numtAlert">建议填写：1份、2串、2杯等，不填写单位默认为份</div>');
        mealHtml.push('        </div>');  
        mealHtml.push('        <div class="fakediv"><input type="text"  class="goodMarket" placeholder="原价"></div>');            
                
        mealHtml.push('      </div>');
        mealHtml.push('      <div class="frmbot">');
        mealHtml.push('        <a href="javascript:;" class="goodUp"></a>');
        mealHtml.push('        <a href="javascript:;" class="goodDown"></a>');
        mealHtml.push('        <a href="javascript:;" class="goodDel"></a>');
        mealHtml.push('      </div>');
        mealHtml.push('    </div> '); 
        mealHtml.push('  </div>');
        mealHtml.push('  <div class="mealGoodAdd"><a href="javascript:;"><i></i><span>增加商品信息</span></a></div>');
        mealHtml.push('</div>');
	    sbm.append(mealHtml.join(''));
  	})

  

  	//上移下移-显示
  	$('.mealWrap').delegate('.opra','click',function(){
	  	if(!$(this).hasClass('opcick')){
	  		$(this).addClass('opcick');
	  		$('.downItem').removeClass('show');
	  		$(this).siblings('.downItem').addClass('show');
	  	}else{
	  		$(this).removeClass('opcick');
	  		$(this).siblings('.downItem').removeClass('show');
	  	}
	})

  	//套餐上移
  	$('.mealWrap').delegate('.mealUp','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    $('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
	    var par = $(this).closest('.mealform');
	    $('.mealUp').addClass('disabled');
	    if(par.prev().size()>0){
	      var hh1 = par.outerHeight(true);
	      var hh2 = par.prev().outerHeight(true);
	      par.animate({'transform':'translateY(-'+hh2+'px)'},300);
	      par.prev().animate({'transform':'translateY('+hh1+'px)'},300);
	      setTimeout(function(){
	        $('.mealWrap .mealform').css('transform','translateY(0)');
	        par.prev().before(par);
	      },1000)
	    }
	    setTimeout(function(){
	      $('.mealUp').removeClass('disabled')
	    },500)
  	})

    //套餐下移
  	$('.mealWrap').delegate('.mealDown','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    $('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
	    var par = $(this).closest('.mealform');
	    $('.mealDown').addClass('disabled');
	    if(par.next().size()>0){
	      var hh1 = par.outerHeight(true);
	      var hh2 = par.next().outerHeight(true);
	      par.animate({'transform':'translateY('+hh2+'px)'},300);
	      par.next().animate({'transform':'translateY(-'+hh1+'px)'},300);
	      setTimeout(function(){
	        $('.mealWrap .mealform').css('transform','translateY(0)');
	        par.next().after(par);
	      },500)
	    }
	    setTimeout(function(){
	      $('.mealDown').removeClass('disabled')
	    },500)
  	})
  	//套餐删除
  	$('.mealWrap').delegate('.mealDel','click',function(){
  		$('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
  		var par = $(this).closest('.mealform');
  		if($('.mealform').length == 1){
  			showErrAlert('最少一个套餐哦!');
  			return false;
  		}else{
  			par.remove();
  		}

  	})
  	//单规格 多规格
  	$('.choseGuige .radio span').click(function(e){
		var inpval = $(this).attr('data-id');
		if(inpval == 0){//单规格
			$('.spguige').addClass('fn-hide');
			$("#mprice,#price").closest('.ml4r').removeClass('fn-hide')
			$("#inventory").val($('#inventory').attr('data-singleGuige')).removeAttr('disabled')
			$("#inventory").closest('.ml4r').removeClass('fn-hide')
		}else{//多规格
			$("#mprice,#price").closest('.ml4r').addClass('fn-hide')
			$('.spguige').removeClass('fn-hide');
			$("#inventory").val($('#inventory').attr('data-moreGuige')).attr('disabled',true)
			$("#inventory").closest('.ml4r').addClass('fn-hide')

		}
		$('#guigetype').val(inpval)
	})
	$("#inventory").change(function(){
		$(this).attr('data-singleGuige',$(this).val())
	})

  	// 团购--添加自定义规格
	$(".self_dl").delegate(".tuanadddiv","click",function(){
		$(".tuanadddiv").before('<div class="self_div"><h2><input type="text" class="inp" size="22" maxlength="50" placeholder="规格名称"> <a href="javascript:;" class="del_dd"></a></h2></div>');
	});

	$("#tuanGuige .self_dl").on("blur",".self_div .inp",function(){
		var t = $(this) ,par_dd = t.parents("dd");
		var val = t.val();
		var num = 0;
		if(val!=''){
			par_dd.find('.self_div').each(function(){
				var val1 = $(this).find(".inp").val();
				if(val==val1 && val!=''){
					num = num + 1;
				}
			});
			if(num>1){
				showErr("输入的值重复");
				t.focus();
				return false;
			}
			tuanadddl();   //遍历自定义属性
		}

	});

    
	function tuanadddl(){
		$('.dl').remove()
		$('.self_div').each(function(){
			var html = [];
			var t = $(this);
			var index_ = t.index()
			sx_name = t.find('h2 .inp').val();

			var fid = createRandomId();
			if(sx_name!=''){

				html.push('<dl class="fn-clear dl"><dt>'+sx_name+'：</dt><dd data-title="'+sx_name+'" data-id="'+fid+'"><input class="fn-hide" checked="checked" type="checkbox"  name="speNew['+sx_name+'][]" title="'+sx_name+'" value="'+sx_name+'"></dd></dl>')
			}
			$('#speList').before(html.join(''))
		});

		createtuanSpecifi();
	}

	function createtuanSpecifi(){
		if($("#specification").size()==0) return false;
 		var checked = $("#specification input[type=checkbox]:checked");
 		if( checked.length > 0){

 			$("#inventory").val("0").attr("disabled", true);
			var th = new Array(), dl = $("#specification dl");
 			for(var i = 0; i < dl.length - 1; i++){
 				var tid = [];

 				//取得已选规格
 				dl.eq(i).find("input[type=checkbox]:checked").each(function(index, element) {
	          		var id = $(this).val(), val = $(this).attr("title");
	          		$(this).closest('label').addClass('active');
	 				tid.push(id);
        		});

 				//已选规格分组
 				if(tid.length > 0){
 					th.push(tid);
 				}
 			}

 			if(th.length > 0){
 				//fth = th[0];
 				//for (var i = 1; i < th.length; i++) {
 					//descartes(th[i]);
 				//}
 				//输出
 				createtuanTbody(th);
 			}
 		}else{
 			console.log('隐藏')
 			$("#inventory").removeAttr("disabled");
 			$("#speList thead, #speList tbody").html("");
 			$("#speList").hide();
 		}

	}

	function changeText(text) {
		regObj = {
			// "&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#x27;",
			"`": "&#x60;"
		}
		var changeText = text;
		if(Array.isArray(changeText) && changeText.length == 1){
			changeText = text[0]
		}
		for (var item in regObj) {
			var reg = new RegExp( item , "g" )
			changeText = changeText.replace(reg, regObj[item])
		}
		return changeText;
	}
	//输出团购规格内容
 	function createtuanTbody(fth){

		if(fth.length > 0){
			var html = [];
			var inventory = 0;
			for(var i = 0; i < fth.length; i++){
				html.push('<ul>')
				html.push('<li class="item_div"><h4>'+changeText(fth[i])+'</h4>')
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
				var item = changeText(fth[i])
				html.push('<div class="inp_box">');
				html.push('<input type="text" id="f_mprice_'+item+'" name="f_mprice_'+item+'" data-type="mprice" value="'+mprice+'" class="inp oprice" placeholder="输入原价" /><input type="text" id="f_price_'+item+'" name="f_price_'+item+'" data-type="price" class="inp nprice" value="'+price+'" placeholder="输入现价" /><input type="text" id="f_inventory_'+item+'" name="f_inventory_'+item+'" data-type="inventory" class="inp countkc" placeholder="输入库存" value="'+f_inventory+'" />')
				html.push('</div></li>');

				html.push('</ul>')
				
			}
			if(specifiVal.length > 0){
				$("#inventory").val(inventory);
			}
			$("#speList .speTab").html(html.join(""))
			$("#speList").show();
		}

 	}
	

 	//其他须知---新增
 	$('.konwAdd').click(function(){
  		var sbm = $(this).siblings('.knowWrap');
  		var konwHtml = [];
  		konwHtml.push('<div class="knowItem fn-clear">');
        konwHtml.push('  <div class="knowLeft">');
        konwHtml.push('    <input type="text" placeholder="填写须知标题" class="knowTitle">');
        konwHtml.push('    <div class="textarea knowCont" contenteditable="true" placeholder="填写须知详细内容"></div>');
        konwHtml.push('  </div>');
        konwHtml.push('  <a href="javascript:;" class="knowDel"></a>');
        konwHtml.push('</div>');

	    sbm.append(konwHtml.join(''));
  	})

  	//其他须知--删除
  	$('.knowWrap').delegate('.knowDel','click',function(){
  		var par = $(this).closest('.knowItem');
  		//if($('.knowItem').length == 1){
  			//showErrAlert('最少一个套餐哦!');
  			//return false;
  		//}else{
  			par.remove();
  		//}

  	})

 	//销售类型
 	$('.saleCon dd a').click(function(){
 		$(this).toggleClass('curr');
 		pshow();
 		// if(!$('.nopsmod').hasClass('fn-hide')){
 		// 	$('.footer a.tosale').addClass('disabled')
		// }else{
		// 	$('.footer a.tosale').removeClass('disabled')
		// }
 	})

 	if($("#modAdrr").val() == '2' && $(".saleCon .curr").length == 0){
		$(".saleCon .kdps").click()
	}
 	function pshow(){
 		$('.psWrap dd>div').addClass('fn-hide');
 		if($('.saleCon .curr').size() > 0){
 			var pidArr = [];
	 		$('.saleCon .curr').each(function(){
	 			var ptid = $(this).attr('data-id');
	 			if(ptid != '1'){
					if($('.psWrap dd>div[data-id="'+ptid+'"]').size() > 0){
						$('.psWrap dd>div[data-id="'+ptid+'"]').removeClass('fn-hide');
					}else{
						$('.nopsmod').removeClass('fn-hide');
					}
				}

				pidArr.push(ptid)
	 		});
	 		if( pidArr.indexOf('2') > -1 && $("#modAdrr").val() == '1'){
	 			if(pidArr.indexOf('4') > -1 ){
	 				$(".psWrap dt em").html('买家地址超出模板设置的配送范围则按快递收费')
	 			}else if(pidArr.indexOf('1') > -1){
	 				$(".psWrap dt em").html('买家地址超出超出模板设置的配送范围则只能选择到店消费')
	 			}else{
	 				$(".psWrap dt em").html('买家地址超出模板设置的商家配送范围则无法下单')
	 			}
	 			
	 		}else if(pidArr.indexOf('2') <= -1){
	 			$(".psWrap dt em").html('')
	 		}

          	if($('.saleCon .todian').hasClass('curr')){
              $('.buynote').removeClass('fn-hide');
              $('.otherTit').removeClass('ohide');
              if($('.saleCon .curr').size() == 1){//只选了到店消费
                $('.psWrap').addClass('fn-hide');
              }else{
                $('.psWrap').removeClass('fn-hide');
              }
              
            }else{
              $('.buynote').addClass('fn-hide');
              $('.otherTit').addClass('ohide');
              $('.psWrap').removeClass('fn-hide');
            }

            if(pidArr.length == 1 && pidArr[0] == '3'){
                $('.psWrap').addClass('fn-hide');
            }else{
                $('.psWrap, .nopsmod').removeClass('fn-hide');
            }
	 		
 		}else{
 			$('.psWrap').addClass('fn-hide');
          	$('.buynote').addClass('fn-hide');
            $('.otherTit').addClass('ohide');
 		}
      
 		
 	}

    pshow();


 	//销售类型 --说明弹窗
 	$('.saleCon .xsAlert').click(function(){
 		$('.sale_mask').show();
 		$('.sale_pop').addClass('show');
 	})	
 	//销售类型 --弹窗关闭
	$('.sale_mask,.sale_pop .sale_know').click(function(){
 		$('.sale_mask').hide();
 		$('.sale_pop').removeClass('show');
 	})	
 	//使用有效期 弹窗
 	$('.canusewrap').click(function(){
 		$('.canuse_mask').show();
 		$('.canuse_alert').addClass('show');
 	})
 	//使用有效期 --弹窗关闭
	$('.canuse_mask,.canuse_alert .back').click(function(){
 		$('.canuse_mask').hide();
 		$('.canuse_alert').removeClass('show');
 	})	
 	//使用有效期--选择
 	$('.canuse_alert li').click(function(){
 		var t = $(this), txt = t.text(),tid = t.attr('data-id');
 		t.addClass('select').siblings('li').removeClass('select');
 		$('.tuanqtimetype,.qtimetype').val(txt);
 		$('#qtimetype,#quantype').val(tid);
 		$('.canuse_mask').hide();
 		$('.canuse_alert').removeClass('show');
 		if(tid == 1){//有效天数
 			$('.yxdays').removeClass('fn-hide');
 			$('.yxdate').addClass('fn-hide');
 		}else{//有效日期
 			$('.yxdate').removeClass('fn-hide');
 			$('.yxdays').addClass('fn-hide');
 		}

 	})

  	//选择星期
  	$('.indusel').click(function(){
	    $(".mask_scroll").show();
	    $(".scroll_box").css('bottom',0)

  	})
  	$('.mask_scroll,.cancel_btn').click(function(){
	    $(".mask_scroll").hide();
	    $(".scroll_box").css('bottom','-6.6rem');
	    $(".scroll_box li.chose_now").removeClass('chose_now chosed')
  	})

  	$('.scroll_box .sure_btn').click(function(){
	    $(".scroll_box li").removeClass('chose_now');
	    $(".scroll_box li.chosed").addClass('chose_before');
	    $(".mask_scroll").hide();
	    $(".scroll_box").css('bottom','-6.6rem');
	    var str = [], ids = [];
	    $(".scroll_box li.chosed").each(function(){
	      if(!$(this).hasClass('allchose')){
	        str.push($(this).text());
	        ids.push($(this).attr('data-id'));
	      }
	    })
	    $("#weeks_show").val(str.join(' '))
	    $("#openweek").val(ids.join(','))
  	})

  	$(".weekselect li").click(function(){
	    var t = $(this);
	    
	    if(t.hasClass('allchose')){//全选
	      if(!t.hasClass('selectd')){
	        $(".weekselect li").addClass('chosed');
	        t.removeClass('chosed').addClass('selectd')
	      }else{
	      	 t.removeClass('selectd')
	        $(".weekselect li").removeClass('chosed');
	      }
	    }else{
	      t.toggleClass("chosed"); 
	      $(".weekselect li.allchose").removeClass('chosed');
	      if($(".weekselect li.chosed").length == 7){
	      	$(".allchose").addClass('selectd')
	      }
	      if($(".weekselect li.chosed").length == 0){
	      	$(".allchose").removeClass('selectd')
	      }
	    }
  	})

  	// 时间格式化
  	var timeint={
	    formatTime:function(date,type){
	      var yy = date.getFullYear();
	      var mm = date.getMonth()+1;
	      var dd = date.getDate();
	      var hh = date.getHours();
	      var min = date.getMinutes();
	      yy = yy>9?yy:('0'+ yy);
	      mm = mm>9?mm:('0'+ mm);
	      dd = dd>9?dd:('0'+ dd);
	      hh = hh>9?hh:('0'+ hh);
	      min = min>9?min:('0'+ min);
	      var data ;
	      if(type==1){
	        data = yy+'-'+mm+'-'+dd
	      }else{
	        data = hh+':'+min
	      }
	      return data;
	    },
  	}
  	//营业时间段

    // 时间段
    if($('.date_chose').size() > 0){
	    mobiscroll.range('#stime', {
	    	theme: 'ios',
	        themeVariant: 'light',
	      	height:40,
	      	lang:'zh',
	      	headerText:true,
	      	calendarText:'选择时间段',  //选择时间段

	        controls: ['time'],
	        endInput: '#etime',
	      	autoCorrect:false,
	      	hourText:'点',  //'点'
	      	minuteText:'分',  //分
	      	autoCorrect:false,
	      	onSet: function (event, inst) {
		        var enddate = inst._endDate;
		        enddateFormat = timeint.formatTime(enddate);
		        var tlen = $(".chose_inp").size();
		        if(tlen==3){
		          showErrAlert('最多只能添加3个哦~')
		          return false;
		        }
		        $(".time_list").prepend('<span class="chose_inp">'+event.valueText+'-'+enddateFormat+'<em class="del_time"></em><input type="hidden" name="limit_time['+(tlen+1)+'][start]"  value="'+event.valueText+'" /><input type="hidden" name="limit_time['+(tlen+1)+'][stop]"  value="'+enddateFormat+'" /></span>')
		        
		      	}
	    });
    }


    
    // 删除选择的时间
    $("body").delegate('.del_time','click',function(){
      var t =$(this);
      t.closest('.chose_inp').remove();
    });

    $('.date_box .add_btn').click(function(){
      $("#stime").click();
    })
    //戒指日期
    mobiscroll.date('#Coupon_deadline',{
    	theme: 'ios',
        themeVariant: 'light',
      	height:40,
      	lang:'zh',
      	headerText:'选择日期',
      	min:new Date(),
      	dateFormat: 'yy-mm-dd',
      	onSet: function (event, inst) {

      	}
    })

    //运费模板
    var defaultValue = [0]
    getTypeList();
  	function getTypeList(){
	  	$.ajax({
			url: '/include/ajax.php?service=shop&action=logistic&logistype=1',
			type: "POST",
			dataType: "json",
			async:false,
			success: function (data) {

				if(data.state == 100){
					var plist = data.info;
					var typeList = [],html = [];
					defaultValue = [plist[0].id]
					html.push('<ul id="peisList" data-type="treeList" style="display: none;">')
					for(var i = 0; i < plist.length; i++){
							var id = plist[i].id;
							var typename = plist[i].title;
							html.push('<li data-val="'+id+'"><span>'+typename+'</span>');
							html.push('</li>');
							if(yfId == id){
								defaultValue = [yfId]
							}
					}
					html.push('</ul>');
					$(".psChose #logisticname").after(html.join(''));

					var treelist = $('#peisList').mobiscroll().treelist({
						theme: 'ios',
						themeVariant: 'light',
						height:40,
						lang:'zh',
						headerText:'配送运费模板',
						display: 'bottom',
						circular:false,
						defaultValue:defaultValue,
						onInit:function(){
							$("#logisticname").val($("#peisList li[data-val="+defaultValue[0]+"]").text())
							$("#logistic").val(defaultValue[0]);
						},
						onSet:function(valueText, inst){
							var typename = $("#peisList li[data-val="+inst._wheelArray[0]+"]").text()
							var typeid = inst._wheelArray[0];
							$("#logisticname").val(typename);
							$("#logistic").val(typeid);
						},
				        onShow:function(){
				             toggleDragRefresh('off');
				        },
				        onHide:function(){
				             toggleDragRefresh('on');
				        }

					})

				}else{
					$('.psChose').remove();

					if($(".sjps").hasClass('curr')){
						$(".nopsmod").removeClass('fn-hide');
						$(".kdChose").addClass('fn-hide')
					}
				}
			},
			error: function(){}
		});
  	}

  	//快递模板
	var defaultVall = [0]
  	getexpressList();
  	function getexpressList(){
	  	$.ajax({
			url: '/include/ajax.php?service=shop&action=logistic&logistype=0&modAdrr=' + $('#modAdrr').val(),
			type: "POST",
			dataType: "json",
			async:false,
			success: function (data) {
				if(data.state == 100){
					var plist = data.info;
					var typeList = [],html = [];
					defaultVall = [plist[0].id]
					html.push('<ul id="expressList" data-type="treeList" style="display: none;">')
					for(var i = 0; i < plist.length; i++){
							var id = plist[i].id;
							var typename = plist[i].title;
							html.push('<li data-val="'+id+'"><span>'+typename+'</span>');
							html.push('</li>');
							if(expressId == id){
								defaultVall = [expressId]
							}
					}

					html.push('</ul>');
					$(".kdChose #expressname").after(html.join(''));

					var treelist = $('#expressList').mobiscroll().treelist({
						theme: 'ios',
						themeVariant: 'light',
						height:40,
						lang:'zh',
						headerText:'快递运费模板',
						display: 'bottom',
						circular:false,
						defaultValue:defaultVall,
						onInit:function(){
							$("#expressname").val($("#expressList li[data-val="+defaultVall[0]+"]").text())
							console.log(defaultVall)
							$("#express").val(defaultVall[0])
						},
						onSet:function(valueText, inst){
							var typename = $("#expressList li[data-val="+inst._wheelArray[0]+"]").text()
							var typeid = inst._wheelArray[0];
							$("#expressname").val(typename);
							$("#express").val(typeid);
						},
				        onShow:function(){
				             toggleDragRefresh('off');
				        },
				        onHide:function(){
				             toggleDragRefresh('on');
				        }

					})

				}else{
					if($(".kdps").hasClass('curr')){
						$(".nopsmod").removeClass('fn-hide');
						$(".kdChose").addClass('fn-hide')
					}
				}
			},
			error: function(){}
		});
  	}



  	var isClick = 0;
    //左侧导航点击
    $(".tuanTab li").bind("click", function(){
        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop;
        var t = $(this), index = t.index(), theadTop;
        if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
          theadTop = $(".bigWrap:eq("+index+")").offset().top - 160;
        }else{
          theadTop = $(".bigWrap:eq("+index+")").offset().top - 70;
        }
        t.addClass("curr").siblings("li").removeClass("curr");
        $(window).scrollTop(theadTop);
        setTimeout(function(){
          isClick = 0;//开启滚动监听
        },500);
    });


    // 最小起订量 随装箱数量改变而改变

    $("#packingCount").change(function(){
    	var t = $(this);
    	if(Number(t.val()) > Number($("#smallCount").val())){
    		$("#smallCount").val(t.val())
    	}
    });

    $("#smallCount").change(function(){
    	var t = $(this);
    	if(Number(t.val()) < Number($("#packingCount").val())){
    		$("#smallCount").val($("#packingCount").val())
    	}
    });

    //滚动监听  
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();
        var thh =scroH + h;
        var h=$(window).height();
        if(isClick) return false;//点击切换时关闭滚动监听

        var theadLength = $(".bigWrap").length;
        $(".tuanTab li").removeClass("curr");

        $(".bigWrap").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
               
                var offsetNextTop;
                if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
                  offsetNextTop = $(".bigWrap:eq(" + (index + 1) + ")").offset().top - 140;
                }else{
                  offsetNextTop = $(".bigWrap:eq(" + (index + 1) + ")").offset().top - 70;
                }
                if (scroH < offsetNextTop) {
                    $(".tuanTab li:eq(" + index + ")").addClass("curr");
                    return false;
                }
            } else {
                $(".tuanTab li:last").addClass("curr");
                return false;
            }
        });
    });
    

    //保存到货架
    $('.nopsmod .saveBook').click(function(){
    	$('.fabubtn.nosale').click();
    })

  // 提交
  $('.fabubtn').click(function(){
    var btn = $(this);
    var litpic   = '', imglist  = [];
    var empty = false;

    if(btn.hasClass("disabled")) return;

    $("#typeid").val(typeid);
    $("#id").val(id);
    
    var body = $('.desc-container').html();
    body = body.replace(/WU_FILE_/g, 'WU_FILE_LAST_', body);
    $('#body').val(body);

    $('#slider .swiper-slide').each(function(i){
      var val = $(this).find('img').attr('data-val');
      if(i == 0){
        litpic = val;
      }else{
        imglist.push(val);
      }
    })
    $('#litpic').val(litpic);
    $('#imglist').val(imglist.join(","));

    if($(this).hasClass('tosale')){//销售时需验证 保存货架不需要验证  
	    //缩略图
	    if(litpic == ""){
	      showErr(langData['siteConfig'][27][78]);
	      $(window).scrollTop(0);
	      return false;
	    }

	    //图集
	    if(imglist.length <= 0){
	      showErr('图集至少两张');
	      $(window).scrollTop(0);
	      return false;
	    }
	    
	}

	//保存到货架，标题必须填写
	if($("#title").val() == ''){
      offsetTop = $("#title").offset().top - 50;
      showErr('请输入标题');
      $(window).scrollTop(offsetTop);
      return false;
    }

    if($("#title").val().length < 5){
      offsetTop = $("#title").offset().top - 50;
      showErr('标题至少5个字');
      $(window).scrollTop(offsetTop);
      return false;
    }
    // var data = [];
    // $('#storeType .active input').each(function(){
    //   var t = $(this);
    //   t.attr('checked', true);
    //   data.push(t.prop('outerHTML'));
    // })
    // $('.layer-size input:checked').each(function(){
    //   data.push($(this).prop('outerHTML'));
    // })
    // $('#storetype_data').html(data.join("")+$('#speList .speTab').html());

    var offsetTop = 0;
    //自定义字段验证
    $("#proItem").find("dl").each(function(){
      var t = $(this), type = t.data("type"), required = parseInt(t.data("required")), tipTit = t.data("title"), tip = t.find(".tip-inline"), input = t.find("input").val();

      if(required == 1){
        //单选
        if(type == "radio"){
          if(input == ""){
            tip.removeClass().addClass("tip-inline tip-error").html("<s></s>"+tipTit);
            if(offsetTop <= 0) offsetTop = t.offset().top;
            empty = true;
          }
        }

        //多选
        if(type == "checkbox"){
          if(t.find("input:checked").val() == "" || t.find("input:checked").val() == undefined){
          	if(offsetTop <= 0) offsetTop = t.offset().top;
            tip.removeClass().addClass("tip-inline tip-error").html("<s></s>"+tipTit);
            empty = true;
          }
        }

        //下拉菜单
        if(type == "select"){
          if(input == ""){
            tip.removeClass().addClass("tip-inline tip-error").html("<s></s>"+tipTit);
            if(offsetTop <= 0) offsetTop = t.offset().top;
            empty = true;
          }
        }
      }
    });

    if(empty){
    	if($(this).hasClass('tosale')){//销售时需验证 保存货架不需要验证 
      		$(window).scrollTop(offsetTop - $('.header').height());
      		return false;
      	}
    }

    
    //团购发布
    if(tuanFlag == 1){
    	var  packages = [];
    	$('.mealWrap .mealform').each(function(){
    		var mealname = $(this).find('.mealName').val();
    		var manyItem = [], mtit = $(this).find(".mealName").val();
    		$(this).find(".form-item").each(function(){
    			var t = $(this), tit = t.find(".goodName").val(), pric = t.find(".goodMarket").val(), coun = t.find(".goodNum").val();
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
    		});
			if(btn.hasClass('tosale')) {//销售时必填
				if( manyItem.length>0){
					packages.push(mtit+"@@@"+manyItem.join("~~~"));
				}
			}else{
				if(manyItem.length>0 || mtit != '') {
					packages.push(mtit + "@@@" + manyItem.join("~~~"));
				}
			}
    	})
    	if($(this).hasClass('tosale')){//销售时需验证 保存货架不需要验证 
	    	if(packages.length == 0){
	    		offsetTop = $(".tuantit").offset().top;
	     	 	showErr("请填写套餐类容");
	      		$(window).scrollTop(offsetTop);
	      		return false;
	    	}
	    }

    }

    //商品类型
    if($(this).hasClass('tosale')){//销售时需验证 保存货架不需要验证 
	    if($('#goodstype').val() == 1){//电子券
	    	if($('#quantype').val() == 0){
	    		showErr("请选择截止时间类型");
	    		offsetTop = $(".quanAll").offset().top;
	      		$(window).scrollTop(offsetTop);
				return false;
	    	}else if($('#quantype').val() == 1){//指定有效天数
	    		if($('#validity').val() <= 0){
		    		showErr("请填写有效天数");
		    		offsetTop = $(".quanAll").offset().top;
	      			$(window).scrollTop(offsetTop);
					return false;
		    	}
	    	}else if($('#quantype').val() == 2){//请选择截止时间类型
	    		if($('#Coupon_deadline').val() == ''){
		    		showErr("请选择有效日期");
		    		offsetTop = $(".quanAll").offset().top;
	      			$(window).scrollTop(offsetTop);
					return false;
		    	}
	    	}
	    }

	    if(!regex.mprice() && $("#guigetype").val() != '1'){
	      offsetTop = $("#mprice").offset().top-50;
	      showErr("请输入原价");
	      $(window).scrollTop(offsetTop);
	      return false;
	    }

	    if(($("#mprice").val() != '' && Number($("#mprice").val()) < 0) || ($("#price").val() != '' && Number($("#price").val()) < 0)){
	    	showErr("价格不能小于0");
	    }

	    if(!regex.price() && $("#guigetype").val() != '1'){
	      offsetTop = $("#price").offset().top-50;
	      showErr("请输入现价");
	      $(window).scrollTop(offsetTop);
	      return false;
	    }
	    if (tuanFlag ==1) {
	    	// if(!regex.limit()){
		    //   offsetTop = $("#limit").offset().top-50;
		    //   showErr("请输入限购数量");
		    //   $(window).scrollTop(offsetTop);
		    //   return false;
		    // }
	    	if(!regex.inventory()){
	      		offsetTop = $("#inventory").offset().top-50;
	      		if($("#guigetype").val() == '1'){
	      			showErr("请设置多规格");
	      		}else{
	      			showErr("请输入库存");
	      		}
	      		
	      		$(window).scrollTop(offsetTop);
	     	 	return false;
	    	}
	    	//销售类型
	    	if($('.saleCon dd .curr').length == 0){
	    		offsetTop = $(".saleCon").offset().top-50;
	      		showErr("请选择销售类型");
	      		$(window).scrollTop(offsetTop);
	     	 	return false;
	    	}
	    	//商家配送 并且有模板
	    	if($('.saleCon .sjps').hasClass('curr') && $('.psWrap .psChose').size() > 0){
	    		if($("#logistic").val() == 0|| $("#logistic").val() == ''){
			      offsetTop = $(".psWrap").offset().top - 50;
			      showErr("请选择配送运费模板");
			      $(window).scrollTop(offsetTop);
			      return false;
			    }	
	    	}
	    	//快递并且有模板
	    	if($('.saleCon .kdps').hasClass('curr')&& $('.psWrap .kdChose').size() > 0){
	    		if($("#express").val() == 0|| $("#express").val() == ''){
			      offsetTop = $(".psWrap").offset().top - 50;
			      showErr("请选择快递运费模板");
			      $(window).scrollTop(offsetTop);
			      return false;
			    }	
	    	}
	    	//团购有效期
			if($(".todian").hasClass('curr')){
				if($('#qtimetype').val() == 0){
					showErr("请选择有效期类型");
					offsetTop = $(".canusewrap").offset().top -40;
					$(window).scrollTop(offsetTop);
					return false;
				}else if($('#qtimetype').val() == 1){//指定有效天数
					if($('#validity').val() <= 0){
						showErr("请填写有效天数");
						offsetTop = $(".canusewrap").offset().top;
						$(window).scrollTop(offsetTop);
						return false;
					}
				}else if($('#qtimetype').val() == 2){//请选择截止时间类型
					if($('#Coupon_deadline').val() == ''){
						showErr("请选择截止日期");
						offsetTop = $(".canusewrap").offset().top;
						$(window).scrollTop(offsetTop);
						return false;
					}
				}

				//可用时间 -- 星期
				if($("#openweek").val() == 0|| $("#openweek").val() == ''){
					offsetTop = $(".indusel").offset().top - 40;
					showErr("请选择可用时间");
					$(window).scrollTop(offsetTop);
					return false;
				}
				//可用时间 -- 时间段
				if($(".time_list .chose_inp").size() == 0){
					offsetTop = $(".date_chose").offset().top - 40;
					showErr("请添加可用时间段");
					$(window).scrollTop(offsetTop);
					return false;
				}
			}



			if($('#guigetype').val() == 1 && !guigeCheck()){//多规格
				$('.guige-btn').click();
		      	offsetTop = $("#speList").offset().top;
		      	$('#specification').scrollTop(999);
		      	return false;
			}

	    
	    }else{

		    //销售类型
	    	if($('.saleCon dd .curr').length == 0){
	    		offsetTop = $(".saleCon").offset().top-50;
	      		showErr("请选择销售类型");
	      		$(window).scrollTop(offsetTop);
	     	 	return false;
	    	}
	    	//商家配送
	    	if($('.saleCon .sjps').hasClass('curr')){
	    		if($("#logistic").val() == 0|| $("#logistic").val() == ''){
			      offsetTop = $(".psWrap").offset().top - 50;
			      showErr("请选择配送运费模板");
			      $(window).scrollTop(offsetTop);
			      return false;
			    }	
	    	}
	    	//快递
	    	if($('.saleCon .kdps').hasClass('curr')){
	    		if($("#express").val() == 0|| $("#express").val() == ''){
			      offsetTop = $(".psWrap").offset().top - 50;
			      showErr("请选择快递运费模板");
			      $(window).scrollTop(offsetTop);
			      return false;
			    }	
	    	}
		    if(!regex.inventory()){
	      		offsetTop = $("#inventory").offset().top;
	      		$(window).scrollTop(offsetTop);
	      		showErr("请输入库存");
	     	 	return false;
	    	}
	    	// if(!regex.limit()){
		    //   offsetTop = $("#limit").offset().top;
		    //   showErr("请输入限购数量");
		    //   $(window).scrollTop(offsetTop);
		    //   return false;
		    // }
		    //规格表值验证
		    if(!guigeCheck()){
		      $('.guige-btn').click();
		      offsetTop = $("#speList").offset().top;
		      $('#specification').scrollTop(999);
		      return false;
		    }
	    }
	    

	    if(body == ''){
	      showErr(langData['shop'][4][66]);
	      $('.describe-btn').click();
	      return false;
	    }
    }
    //其他须知
	var notice = [], noticeItem = $(".knowWrap .knowItem");
    if(noticeItem.length > 0){
    	noticeItem.each(function(){
    		var tit = $(this).find(".knowTitle").val();
    		var con = $(this).find(".knowCont").html();
    		if(tit !="" && con!=""){
    			notice.push(tit+"$$$"+con);
    		}
    	})
    }
    if($("#packingCount").val() == ''){
    	$("#packingCount").val(1)
    }
    if($("#smallCount").val() == ''){
    	$("#smallCount").val(1)
    }
    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
    data = form.serialize();
	var dataArr = form.serializeArray()
    $('.layer-storetype input:checked').each(function(){
      var inp = $(this), name = inp.attr('name'), val = inp.attr('value');
      data += '&'+name+'='+val;
    })

    if($('#specificationForm').length){
      var specification = $('#specificationForm').serialize();
      if(specification != '='){
        data += '&' + specification;
      }
    }
    //销售类型
    var saleArr = [];
    $('.saleCon .curr').each(function(){
    	saleArr.push($(this).attr('data-id'));

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
    
    btn.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

    var fabutype = 0;
    var param = '';
    if (btn.hasClass('nosale')) {
		fabutype = 1;
		param = '?state=2'
	}
	  data += "&fabutype="+fabutype;
	  dataArr.push({
		name:'fabutype',
		value:fabutype
	})

	var skuInfoArr = {}
	$("#speList input").each(function () {
		var inp = $(this);
		var name = inp.attr('name');
		var value = inp.val();
		// skuInfoArr[encodeURIComponent(changeText(name))] = value
		skuInfoArr[(changeText(name))] = value
	})

	data = data + '&skuInfoArr=' + JSON.stringify(skuInfoArr)
	dataArr.push({
		name:'skuInfoArr',
		value:JSON.stringify(skuInfoArr)
	})
    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          var tip = langData['siteConfig'][20][341];  //发布成功
          if(btn.hasClass('nosale')){//保存货架
          	tip="保存成功";
          }
          if(id != undefined && id != "" && id != 0){
            tip = langData['siteConfig'][20][229];  //修改成功
          }

          showErr(tip);
          setTimeout(function(){
            location.href = url + param;
          }, 1000)
        }else{
          showErr(data.info);
          if(btn.hasClass('nosale')){//保存货架
          	btn.removeClass("disabled").html('保存到货架');
          }else{
          	btn.removeClass("disabled").html('发布销售');
          }
          
          //$("#verifycode").click();
        }
      },
      error: function(){
        showErr(langData['siteConfig'][20][183]);
        if(btn.hasClass('nosale')){//保存货架
      		btn.removeClass("disabled").html('保存到货架');
      	}else{
      		btn.removeClass("disabled").html('发布销售');
      	}
        //$("#verifycode").click();
      }
    });
  })
  $("#fabuForm").submit(function(e){
    e.preventDefault();
    $('.fabubtn').click();
  })


	// 上传的颜色
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
					$list.find('img').attr('data-url',response.url).attr('data-src',response.turl)
					$list.siblings(".spePic").val(response.url)
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
				img_box.siblings(".spePic").val('');
			}
		})
	});



	// 跳转页面
	// $('.linkTo').click(function(){
	// 	var t = $(this);
	// 	var form = $("#fabuForm"),data1 = form.serializeArray();
	// 	console.log(data1)


	// 	return false;
	// })

})

//点击弹出层拖拽的图片 大图切换
function dragImgClick(dragel){
	var siIndex = $(dragel).index();
	slider1.slideTo(siIndex);
	$(dragel).addClass('curr').siblings('img').removeClass('curr');
}


// 弹出层图片排序
var sortImg = [];
function getImgSort(){
  sortImg = [];
  $('#drag img').each(function(){
    var t = $(this), imgsrc = t[0].src;
    sortImg.push({
    	src:imgsrc,
      	val:t.attr('data-val'),
      });
  });

  slider.removeAllSlides();
  slider1.removeAllSlides();
  for (var i = 0; i < sortImg.length; i++) {
    slider.appendSlide('<div class="swiper-slide"><div class="thumbnail"><img src="'+sortImg[i].src+'" data-val="'+sortImg[i].val+'"></div></div>');
    slider1.appendSlide('<div class="swiper-slide"><div class="thumbnail"><img src="'+sortImg[i].src+'" data-val="'+sortImg[i].val+'"><span class="del"></span></div></div>');
  }
}
// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}


function in_array(arr, str){
  for(var i in arr){
    if(arr[i] == str) return true;
  }
  return false
}


//生成随机数
function createRandomId() {
	return (Math.random()*10000000).toString(16).substr(0,4)+'_'+(new Date()).getTime()+'_'+Math.random().toString().substr(2,5);
}
