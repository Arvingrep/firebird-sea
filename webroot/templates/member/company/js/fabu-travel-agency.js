$.fn.extend({textareaAutoHeight:function(a){this._options={minHeight:0,maxHeight:1e3},this.init=function(){for(var b in a)this._options[b]=a[b];0==this._options.minHeight&&(this._options.minHeight=parseFloat($(this).height()));for(var b in this._options)null==$(this).attr(b)&&$(this).attr(b,this._options[b]);$(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight)},this.resetHeight=function(){var a=parseFloat($(this).attr("minHeight")),b=parseFloat($(this).attr("maxHeight"));$.browser.msie||$(this).height(0);var c=parseFloat(this.scrollHeight);c=a>c?a:c>b?b:c,$(this).height(c).scrollTop(c),c>=b?$(this).css("overflow-y","scroll"):$(this).css("overflow-y","hidden")},this.init()}});
$(function(){
	getEditor("detail_text");
	getEditor("fee_content");
	getEditor("know_content");

	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=travel",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
			}
			$("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
			$("#markDitu").attr("src", src);
			$("#markPopMap").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#markDitu").attr("src", "");
			$("#markPopMap").hide();
		}
	};

	$(".map-pop .pop-close, #cloPop").bind("click", function(){
		init.pophide();
	});

	$("#mark").bind("click", function(){
		init.popshow();
	});

	$("#okPop").bind("click", function(){
		var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});
	
	//景点特色
	$(".tags_enter").blur(function() { //焦点失去触发
        var txtvalue=$(this).val().trim();
        if(txtvalue!=''){
            addTag($(this));
        }
    }).keydown(function(event) {
        var key_code = event.keyCode;
        var txtvalue=$(this).val().trim();
        if (key_code == 13 && txtvalue != '') { //enter
            addTag($(this));
        }
        if (key_code == 32 && txtvalue!='') { //space
            addTag($(this));
        }
        if (key_code == 13) {
            return false;
        }
	});
	$(".close").live("click", function() {
        $(this).parent(".tag").remove();
    });

	//旅游类型 
	$('.lvType .radio span').click(function(){
    	var tie = $(this).attr('data-id');
    	if(tie==1){//跟团游
    		$('dl.fatuanType').show();
    	}else{//一日游
    		$('dl.fatuanType').hide();
    	}
    })
    //发团时间
    $('.fatuanType label').click(function(){
    	var tic = $(this).find('input').val();
    	if(tic==1){//自选发团
    		$('dl.choseDate').show();
    	}else{//天天发团
    		$('dl.choseDate').hide();
    	}
    	var hline = $('.fatuanType').find(".tip-inline");
		hline.removeClass().addClass("tip-inline success").html("<s></s>");
    })





	var nowDa = new Date();


	$(".w-form").delegate("input[type=text]", "blur", function(){
		var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
		var errrTip = t.attr('data-title');
		if(dl.attr("data-required") == 1){
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
			}
		}
		if(dl.attr("data-required") == 2){//针对后面已给提示语
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline").html("<s></s>")
			}
		}
		
	})

	$(".w-form").delegate("input[type=text]", "focus", function(){
		var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
		var errrTip = t.attr('data-title');

		if(dl.attr("data-required") == 1){
			if($(this).val() ==" " || $(this).val() ==""){
				hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
			}
		}
		

	})
	var obj = $(".stage-wrap");

	//获取门票信息
	$.ajax({
		url: '/include/ajax.php?service=travel&action=agencyDetail&id='+id,
		type: 'get',
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){
				var html2 = [], list = data.info.workArr;
				if(list.length > 0){
					for (var i = 0; i < list.length; i++) {
						html2.push('<section class="sectionStage item normal">');
					    html2.push('  <div class="result" data-id="'+list[i].id+'" data-info=\''+JSON.stringify(list[i].specialtime)+'\' >');
				      	html2.push('    <div class="table">');
				      	html2.push('<table>');
				      	html2.push('<thead>');
			
						html2.push('<th>'+langData['travel'][14][143]+'</th>'); //门票标题
						html2.push('<th>'+langData['travel'][14][145]+'</th>'); //门票价格
						html2.push('</thead>');	
						html2.push('<tbody>');
						html2.push('<tr>');

						html2.push('<td class="if_rname">'+list[i].title+'</td>')
						html2.push('<td class="if_rprice" data-value="'+list[i].price+'">'+echoCurrency('symbol')+list[i].price+'</td>')
						html2.push('</tr>');
						html2.push('</tbody>');	
						html2.push('</table>');	
						html2.push('</div>');	
		
					  	// 特殊时刻
					  	html2.push('    <div class="timeCon">');		
					  	var  slen = list[i].specialtime.length;
					  	if(slen > 0){
						  	html2.push('<h2>特殊时段</h2>');
							html2.push('<ul>');
							for(var j = 0; j < slen; j++){
								var time = list[i].specialtime[j];

								html2.push('  <li>'+time.stime+'~'+time.etime+' <span>'+echoCurrency('symbol')+time.price+'</span></li>');		    	    				
							}
							html2.push('  </ul>');			    
					  	}
				      	html2.push('  </div>');
				      	html2.push('  </div>');

				      	html2.push('  <div class="edit">');
					    
					    getComhtml(html2,1,list[i]);
					       
					    html2.push('  </section>');
					}
					obj.html(html2.join(''));
					speTime();//重新循环时间
				}
			}
		}

	});

	//特殊时段
	speTime();
	function speTime(){
		//时间
		var nowDa = new Date();
		//开始时间
		$(".form_datetime .startTime").datetimepicker({		
			minView: 2,//设置只显示到月份
			format: 'yyyy-mm-dd',
			linkFormat: 'yyyy-mm-dd',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			timePicker : false,
			startDate:new Date(),
			linkField: "startTime",
		});
		//结束时间
		$(".form_datetime .endTime").datetimepicker({		
			minView: 2,//设置只显示到月份
			format: 'yyyy-mm-dd',
			linkFormat: 'yyyy-mm-dd',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			timePicker : false,
			startDate:new Date(),
			linkField: "endTime",
		});
	}
	

	//添加特殊时段
	obj.delegate('.xuan_add','click',function(){
		var btnHtml = [];
		btnHtml.push('<div class="speTimeCon fn-clear">');
		btnHtml.push('<dl class="spePrice fn-clear"><dt>特殊价格：</dt><dd><input type="text" class="inp sprice" onkeyup="xiaoshu(this)"><em>'+echoCurrency('short')+'</em></dd></dl>');
		btnHtml.push('<dl class="speTime fn-clear">');
		btnHtml.push('	<dt>选择时段：</dt>');
		btnHtml.push('	<dd>');
		btnHtml.push('		<div class="form_datetime speDateTime fn-clear">');
		btnHtml.push('			<input type="text" class="inp startTime"><em>-</em><input type="text" class="inp endTime">');
		btnHtml.push('		</div>');
		btnHtml.push('		<div class="xuan_btns">');
		btnHtml.push('			<a href="javascript:;" class="icon icon_del2 xuan_del" title="删除"></a>');
		btnHtml.push('			<a href="javascript:;" class="icon icon_add xuan_add" title="新增"></a>');
		btnHtml.push('		</div>');
		btnHtml.push('	</dd>');
		btnHtml.push('</dl>');
		btnHtml.push('</div>');

		$(this).closest('.speTimeWrap').append(btnHtml.join(''));
		speTime();
	})

	//删除特殊时段
	obj.delegate('.xuan_del','click',function(){
		var spar = $(this).closest('.speTimeWrap');		
		var par = $(this).closest('.speTimeCon');		
		if(spar.find('.speTimeCon').length == 1){
			spar.find('.sprice').val('');
			spar.find('.startTime').val('');
			spar.find('.endTime').val('');
		}else{
			par.remove();
		}
	})

	
	// 添加阶段
	$('.addNew').click(function(){				
		var html = addCustomInput();
		var $html = $(html);
		obj.append($html);
		speTime();//重新循环时间
	})


	// 编辑状态获取问题html或者选项html
	var addCustomInput = function(st){

	    var html = [],html2=[];	    
	    var count = obj.children('.item').length+5;
	    html.push('<section class="sectionStage item editing">');
	    html.push('  <div class="result"  data-info="" data-img="" data-id="">');
      	html.push('    <div class="table"><table></table></div>');
      	html.push('    <div class="timeCon"></div>');
      	html.push('  </div>');
      	html.push('  <div class="edit">');
	    
	    getComhtml(html,'');
	       
	    html.push('  </section>');

	    return html.join("");

	}
	var oldfakehtml = $('.fakeCon').html(); 
	function getComhtml(htmlarr,ifedit,editlist){//ifedit 判断是添加还是编辑

		var titleTxt = ifedit==1?editlist.title:'';//门票标题
		var priceTxt = ifedit==1?editlist.price:'';//门票价格

		htmlarr.push('  <dl class="fn-clear" data-required="1">');//门票标题
	    htmlarr.push('  <dt><span>*</span>'+langData['travel'][14][143]+'：</dt>');//门票标题
	    htmlarr.push('  <dd>');
	    htmlarr.push('  <input type="text" class="inp roomname" data-title="'+langData['travel'][14][144]+'" value="'+titleTxt+'">');//请输入门票标题
	    htmlarr.push('  <span class="tip-inline"></span>');					
		htmlarr.push('	</dd>');
	    htmlarr.push(' </dl>');

	    htmlarr.push(' <dl class="fn-clear" data-required="1">');
	    htmlarr.push(' <dt><span>*</span>'+langData['travel'][14][145]+'：</dt>');//房间价格
	    htmlarr.push(' <dd>');
	    htmlarr.push(' <div class="input-append input-prepend">');
	    htmlarr.push(' <input type="text" name="roomprice" class="inp roomprice" autocomplete="off" value="'+priceTxt+'" data-title="'+langData['travel'][14][146]+'！"  onkeyup="xiaoshu(this)"/>');//请输入门票价格
	    htmlarr.push(' <span class="add-aft">'+echoCurrency('short')+'</span>');//元
	    htmlarr.push(' </div>');
	    htmlarr.push(' <span class="tip-inline"></span>');
	    htmlarr.push(' </dd>');
	    htmlarr.push(' </dl>');

	    htmlarr.push(' <div class="speTimetit">特殊时段</div>');
	    htmlarr.push(' <div class="speTimeWrap fn-clear">');

	    if(ifedit==1 && editlist.specialtime.length > 0 ){
	    	for(var n =0;n<editlist.specialtime.length;n++){
	    		var timen = editlist.specialtime[n];
		    	htmlarr.push(' <div class="speTimeCon fn-clear">');
			    htmlarr.push(' <dl class="spePrice fn-clear"><dt>特殊价格：</dt><dd><input type="text" class="inp sprice" onkeyup="xiaoshu(this)" value="'+timen.price+'"><em>'+echoCurrency('short')+'</em></dd></dl>');
			    htmlarr.push(' <dl class="speTime fn-clear">');
			    htmlarr.push(' <dt>选择时段：</dt>');
			    htmlarr.push('	<dd>');
				htmlarr.push('		<div class="form_datetime speDateTime fn-clear">');
				htmlarr.push('			<input type="text" class="inp startTime" readonly value="'+timen.stime+'"><em>-</em><input type="text" class="inp endTime" readonly value="'+timen.etime+'">');
				htmlarr.push('		</div>');
				htmlarr.push('		<div class="xuan_btns">');
				htmlarr.push('			<a href="javascript:;" class="icon icon_del2 xuan_del" title="删除"></a>');
				htmlarr.push('			<a href="javascript:;" class="icon icon_add xuan_add" title="新增"></a>');
				htmlarr.push('		</div>');
				htmlarr.push('	</dd>');
				htmlarr.push('</dl>');
				htmlarr.push('</div>');
			}
	    }else{
		    htmlarr.push(' <div class="speTimeCon fn-clear">');
		    htmlarr.push(' <dl class="spePrice fn-clear"><dt>特殊价格：</dt><dd><input type="text" class="inp sprice" onkeyup="xiaoshu(this)"><em>'+echoCurrency('short')+'</em></dd></dl>');
		    htmlarr.push(' <dl class="speTime fn-clear">');
		    htmlarr.push(' <dt>选择时段：</dt>');
		    htmlarr.push('	<dd>');
			htmlarr.push('		<div class="form_datetime speDateTime fn-clear">');
			htmlarr.push('			<input type="text" class="inp startTime" readonly><em>-</em><input type="text" class="inp endTime" readonly>');
			htmlarr.push('		</div>');
			htmlarr.push('		<div class="xuan_btns">');
			htmlarr.push('			<a href="javascript:;" class="icon icon_del2 xuan_del" title="删除"></a>');
			htmlarr.push('			<a href="javascript:;" class="icon icon_add xuan_add" title="新增"></a>');
			htmlarr.push('		</div>');
			htmlarr.push('	</dd>');
			htmlarr.push('</dl>');
			htmlarr.push('</div>');
	    }
	    

		htmlarr.push('</div>');

	    
	    htmlarr.push('<div class="finishEdit">'+langData['siteConfig'][31][79]+'</div>');//完成编辑
	    htmlarr.push('    </div>');
	    htmlarr.push('    <div class="g-btns-right g-btns">');
	    htmlarr.push('      <a href="javascript:;" class="edit secEdit"><i class="icon icon_edit"></i>'+langData['siteConfig'][6][6]+'</a>');   //编辑
	    htmlarr.push('      <a href="javascript:;" class="down"><i class="icon icon_down2"></i>'+langData['siteConfig'][6][159]+'</a>');  //下移
	    htmlarr.push('      <a href="javascript:;" class="up"><i class="icon icon_up2"></i>'+langData['siteConfig'][6][158]+'</a>');  //上移
	    htmlarr.push('      <a href="javascript:;" class="gotop"><i class="icon icon_top"></i>'+langData['siteConfig'][31][87]+'</a>');  //最前
	    htmlarr.push('      <a href="javascript:;" class="gobottom"><i class="icon icon_bottom"></i>'+langData['siteConfig'][31][88]+'</a>');  //最后
	    htmlarr.push('      <a href="javascript:;" class="del"><i class="icon icon_del1"></i>'+langData['siteConfig'][6][8]+'</a>');  //删除
	    htmlarr.push('    </div>');	

	    return htmlarr;

	}

	
	// 上移下移
	obj.delegate(".g-btns .up, .g-btns .down, .g-btns .gotop, .g-btns .gobottom", "click", function(){
		var t = $(this), item = t.closest('.item');
		if(t.hasClass('up')){
		  if(!item.prev().length) return;
		  item.prev().before(item);
		}else if(t.hasClass('down')){
		  if(!item.next().length) return;
		  item.next().after(item);
		}else if(t.hasClass('gotop')){
		  obj.prepend(item);
		}else if(t.hasClass('gobottom')){
		  obj.append(item);
		}
	})
	// 删除
	obj.delegate(".g-btns .del", "click", function(){
		var item = $(this).closest('.item');
		delPic(item);

	})

	// 删除
	function delPic(obj){
		obj.hide();
		var $imgitem = obj.find('.pubitem');
		$imgitem.each(function(){
		  var img = $(this).find('img').attr('data-val');
		  if(img != ''){
		    delAtlasPic(img)
		  }
		})
		obj.remove();
	}
	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
		  mod: "travel",
		  type: "delthumb",
		  picpath: picpath,
		  randoms: Math.random()
		};
		console.log(g)
		$.ajax({
		  type: "POST",
		  url: "/include/upload.inc.php",
		  data: $.param(g)
		})
	};
	// 进入编辑状态
	obj.delegate(".secEdit", "click", function(){
		var t = $(this), p = t.closest('.item');
		if(p.hasClass('editing')) return;
		p.addClass('editing').removeClass('normal');
	})
	// 退出编辑状态
	obj.delegate(".finishEdit", "click", function(){
		var t = $(this), p = t.closest('.item');
		p.find('input.error').removeClass('error');

		var config = getQuestConfg(p);

		if(config){
			var d = config.imgList;
			var tableHtml = [];
			tableHtml.push('<thead>');
			
				tableHtml.push('<th>'+langData['travel'][14][143]+'</th>');//门票标题
				tableHtml.push('<th>'+langData['travel'][14][145]+'</th>');//门票价格
			tableHtml.push('</thead>');	
			tableHtml.push('<tbody>');
				tableHtml.push('<tr>');
					tableHtml.push('<td class="if_rname">'+config.roomname+'</td>')
					tableHtml.push('<td class="if_rprice" data-value="'+config.roomprice+'">'+echoCurrency('symbol')+config.roomprice+'</td>')
				tableHtml.push('</tr>');
			tableHtml.push('</tbody>');	
			p.find('.result table').html(tableHtml.join(""));
		  	// 特殊时刻

		  	var timeHtml = [], len = config.spetimeList.length;
		  	if(len > 0){
			  	timeHtml.push('<h2>特殊时段</h2>');
				timeHtml.push('<ul>');
				for(var i = 0; i < len; i++){
					var time = config.spetimeList[i];

					timeHtml.push('  <li>'+time.stime+'~'+time.etime+' <span>'+echoCurrency('symbol')+time.price+'</span></li>');		    	    				
				}
				timeHtml.push('  </ul>');			    
		  	}
		  	p.find('.result').attr('data-info',JSON.stringify(config.spetimeList));
		  	p.find('.result .timeCon').html(timeHtml.join(""));
			

		  // 没有任何修改的情况下，body部分会有抖动？
		  setTimeout(function(){
		    p.removeClass('editing').addClass('normal');
		  }, 200)
		}
	})

	// 判断阶段表单
	function getQuestConfg(item){
		var config = {}, imgList = [],spetimeList = [];
		var roomname  = item.find('.edit .roomname').val(),
		    roomprice = item.find('.edit .roomprice').val(),
		    timeItem   = item.find('.speTimeCon');

		if(!roomname){
			var pardl = item.find('.edit .roomname').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('.roomname').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
		    return false;
		}
		if(!roomprice){
			var pardl = item.find('.edit .roomprice').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('.roomprice').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
		    return false;
		}


		timeItem.each(function(){
			var tprice = $(this).find('.sprice').val();
			var stime = $(this).find('.startTime').val();
			var etime = $(this).find('.endTime').val();
			if(tprice && stime && etime){
				var stime1 = ((new Date(stime)).getTime())/1000;
				var etime1 = ((new Date(etime)).getTime())/1000;
				if(stime1 > etime1){//开始时间大于结束时间时
					var b = etime,a = stime;
					stime = b;
					etime = a;
					$(this).find('.startTime').val(b);
					$(this).find('.endTime').val(a);
				}
				spetimeList.push({"price":tprice, "stime" : stime, "etime" : etime});
			}
		})

		config = {
		  roomname: roomname,
		  roomprice: roomprice,
		  spetimeList: spetimeList
		}
		return config;

	}

	//添加行程
	var noticeHtml = '<div class="notice-item fn-hide"><div class="label"><input type="text" placeholder="'+langData['siteConfig'][19][0]+'" /></div><div class="dd"><textarea placeholder="'+langData['siteConfig'][19][1]+'"></textarea></div><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span class="btn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span></div>';
	$(".addRoute").bind("click", function(){
		var newnotice = $(noticeHtml);
		newnotice.appendTo("#route");
		newnotice.slideDown(300);
	});
	$("#route").delegate(".add", "click", function(){
		var t = $(this).closest(".notice-item");
		var newnotice = $(noticeHtml);
		newnotice.insertAfter(t);
		newnotice.slideDown(300);
	});

	//删除行程
	$("#route").delegate(".del", "click", function(){
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

	$("#route textarea").textareaAutoHeight({minHeight:52, maxHeight:100});
	$("#route").dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="notice-item"></div>' });

	

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        //景点特色
        var tags = [];
        $('.tags').find('.tag').each(function(){
            var t = $(this), val = t.attr('data-val');
            tags.push(val);
        })
        $('#tag_shop').val(tags.join('|'));

        //开放时间
        var typeArr = [];
        $('.opentime').find('input[type="checkbox"]:checked').each(function(){
            var t = $(this), val = t.val();
            typeArr.push(val);
        })
        $('#open_week').val(typeArr.join(','));

		var t           = $(this),
				addrid      = $("#addrid"),
				address      = $("#address"),
				lvyou_type    = $("#lvyou_type"),
				shopname    = $("#shopname"),
				missiontime    = $("#missiontime"),//发团时间
				tag_shop    = $("#tag_shop"),//景点特色
				level       = $("#level");//景点星级
		var fTime = $('input[name="missiontype"]:checked').val();//发团时间		

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		//景点名称
		if($.trim(shopname.val()) == "" || shopname.val() == 0){
			var stip = shopname.data('title');
			shopname.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? shopname.position().top : offsetTop;
		}		

		//景点图集
		if($('#listSection2').find('.pubitem').size() == 0){
			$.dialog.alert('请上传景点图集');
			offsetTop = offsetTop == 0 ? $('#listSection2').position().top : offsetTop;
		}


		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}
		//详细地址
		if($.trim(address.val()) == ""){
			var tips =  address.data("title");
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		if(lvyou_type.val() == 1){//跟团游
			if(!fTime){
				var hline = $('.fatuanType').find(".tip-inline");
				hline.removeClass().addClass("tip-inline error").html("<s></s>请选择发团时间");
				offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
			}

			if(fTime == 1){//自选发团
				if(missiontime.val() == ''){
					var hline = $('.choseDate').find(".tip-inline"), tips = missiontime.data("title");
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
					offsetTop = offsetTop == 0 ? $('.fatuanType').position().top : offsetTop;
				}else{
					var hline = $('.choseDate').find(".tip-inline");
					hline.removeClass().addClass("tip-inline success").html("<s></s>");
				}
			}
		}

	
		
		//景点特色
		if(tag_shop.val()==''){
			$.dialog.alert('请输入景点特色标签');
			offsetTop = offsetTop == 0 ? $('#tags').position().top : offsetTop;
		}


		//景点星级
		if(level.val() == ''){
			var pardl = level.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = level.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? level.position().top : offsetTop;
		}

	
		var ue1 = UE.getEditor("detail_text");
		var ue2 = UE.getEditor("fee_content");
		var ue3 = UE.getEditor("know_content");
		ue1.sync();
		ue2.sync();
		ue3.sync();

		if(!ue1.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['travel'][14][148]);   //请输入图文内容！
			offsetTop = offsetTop == 0 ? $("#detail_text").offset().top : offsetTop;
		}
		if(!ue2.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['travel'][14][149]);   //请输入费用说明！
			offsetTop = offsetTop == 0 ? $("#fee_content").offset().top : offsetTop;
		}
		if(!ue3.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['travel'][14][147]);   //请输入购票须知！
			offsetTop = offsetTop == 0 ? $("#know_content").offset().top : offsetTop;
		}



		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}
		//获取房间信息列表
		var ticketlist = [],room_len = $('.sectionStage.normal').length;
		if(room_len!=0){
			$('.sectionStage.normal').each(function(){
				var d = $(this).find('.result'), 
				name_r = d.find('td.if_rname').text(),
				price_r = d.find('td.if_rprice').attr('data-value'),
				specialtime = d.attr('data-info'),
				id = d.attr('data-id');
				ticketlist.push({
					"id":id,
					"title":name_r,
					"price":price_r,
					"specialtime":specialtime,
	
					
				})
			});
		}
		//购买须知
	    var routeList = [], noticeItem = $("#route .notice-item");
	    if(noticeItem.length > 0){
	    	noticeItem.each(function(){
	    		var obj = $(this);
	    		var tit = obj.find("input").val();
	    		var con = obj.find("textarea").val();
	    		routeList.push(tit+"$$$"+con);
	    	});
	    }

		var form = $("#fabuForm"), action = form.attr("action"),url=form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var data = form.serialize() + "&ticketlist=" + JSON.stringify(ticketlist)+"&routeList="+routeList.join("|||") ;
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					setTimeout(function(){location.href = url;},500)
					
				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});


	});
});
function addTag(obj) {
	var tag = obj.val();
	if (tag != '') {
		var i = 0;
		$(".tag").each(function() {
			if ($(this).text() == tag + "×") {
				$(this).addClass("tag-warning");
				setTimeout("removeWarning()", 400);
				i++;
			}
		})
		obj.val('');
		if (i > 0) { //说明有重复
			return false;
		}
		$("#tag_shop").before("<span class='tag' data-val='"+tag+"'>" + tag + "<button class='close' type='button'>×</button></span>"); //添加标签
	}
}

function removeWarning() {
    $(".tag-warning").removeClass("tag-warning");
}