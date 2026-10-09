function xiaoshu(obj){
	obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符   
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数   
    if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
        obj.value = parseFloat(obj.value);
    }

}
function zhengshu(obj){

    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}
$(function(){

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
	
	//酒店特色
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

	//获取房间信息
	$.ajax({
		url: '/include/ajax.php?service=travel&action=hotelDetail&id='+id,
		type: 'get',
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){
				var html2 = [], list = data.info.workArr;
				if(list.length > 0){
					for (var i = 0; i < list.length; i++) {
						var count = i+5;
						html2.push('<section class="sectionStage item normal">');
					    html2.push('  <div class="result"  data-info=\''+JSON.stringify(list[i].specialtime)+'\' data-img="'+(list[i].roomImgPath.join(','))+'" data-id="'+list[i].id+'">');
				      	html2.push('    <div class="table">');
				      	html2.push('<table>');
				      	html2.push('<thead>');
						if(list[i].roomImgPath && list[i].roomImgPath.length>0){
							html2.push('<th>房间图片</th>');
						}				
						html2.push('<th>房间标题</th>');
						html2.push('<th>房间价格</th>');
						html2.push('<th>房间大小</th>');
						html2.push('<th>房间类型</th>');
						html2.push('<th>有无窗户</th>');
						html2.push('<th>是否含早餐</th>');
						html2.push('</thead>');	
						html2.push('<tbody>');
						html2.push('<tr>');
						if(list[i].roomImgPath && list[i].roomImgPath.length>0){
							html2.push('<td><img src="/include/attachment.php?f='+list[i].roomImgPath[0]+'" alt=""></td>');
						}
						html2.push('<td class="if_rname">'+list[i].title+'</td>')
						html2.push('<td class="if_rprice" data-value="'+list[i].price+'">'+echoCurrency('symbol')+list[i].price+'</td>')
						html2.push('<td class="if_rarea" data-value="'+list[i].area+'">'+list[i].area+echoCurrency('areasymbol')+'</td>');
						html2.push('<td class="if_food" data-value="'+list[i].breakfast+'">'+list[i].breakfastname+'</td>');
						html2.push('<td class="if_win" data-value="'+list[i].iswindow+'">'+list[i].iswindowname+'</td>');
						html2.push('<td class="if_bed" data-value="'+list[i].typeid+'">'+list[i].typename+'</td>');
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

				      	html2.push(' <dl class="fn-clear">');
					    html2.push(' <dt>'+langData['travel'][14][139]+'：</dt>');//房间图片
					    html2.push(' <dd class="listImgBox fn-hide">');
					    html2.push(' <div class="list-holder">');
					    html2.push(' <ul id="listSection'+count+'" class="fn-clear listSection fn-hide" '+((list[i].roomImgPath.length>0)?'style="display: block;"':'')+'>');
					    if(list[i].roomImgPath && list[i].roomImgPath.length>0){
					    	for(var k =0;k<list[i].roomImgPath.length;k++){
					    		var img = list[i].roomImgPath[k];
					    	 html2.push('<li class="pubitem fn-clear" id="WU_FILE_room_'+k+'">');	
					    	 html2.push('<a class="li-rm" href="javascript:;">×</a>');	
					    	 html2.push('<div class="li-thumb" style="display: block;">');	
					    	 html2.push('<div class="r-progress"><s></s></div>');	
					    	 html2.push('<span class="ibtn">');	
					    	 html2.push('<a href="javascript:;" class="Lrotate" title="'+langData['siteConfig'][23][43]+'"></a>');	
					    	 html2.push('<a href="javascript:;" class="Rrotate" title="'+langData['siteConfig'][23][44]+'"></a>');	
					    	 html2.push('<a href="'+i.path+'" target="_blank" class="enlarge" title="'+langData['siteConfig'][23][45]+'"></a>');	
					    	 html2.push('</span>');	
					    	 html2.push('<span class="ibg"></span>');	
					    	 html2.push('<img data-val="'+img+'" src="/include/attachment.php?f='+img+'" />');	
					    	 html2.push('</div>');	
					    	 html2.push('</li>');	
					    	}
						    
						}
					    html2.push('</ul>');
					    html2.push(' <input type="hidden" name="imglist" value="'+(list[i].roomImgPath.join(','))+'" class="imglist-hidden roomImg" >');
					    html2.push(' </div>');
					    html2.push(' <div class="btn-section fn-clear">');
					    html2.push(' 	<div class="fn-clear">');
					    html2.push(' 		<div class="uploadinp filePicker" id="filePicker'+count+'" data-type="album" data-count="'+atlasMax+'" data-size="'+atlasSize+'" data-imglist=""><div id="flasHolder'+count+'"></div><span>'+langData['siteConfig'][6][168]+'</span></div>');//添加图片
					    html2.push(' </div>');
					    html2.push('<div class="upload-tip">');
					    html2.push('<p><a href="javascript:;" class="fn-hide deleteAllAtlas">'+langData['siteConfig'][6][79]+'</a><span class="fileerror"></span></p>');
					    html2.push('</div>');
					    html2.push('</div>');
					    html2.push('</dd>');
					    html2.push('</dl>');
					    
					    getComhtml(html2,1,list[i]);
					       
					    html2.push('  </section>');
					}
					obj.html(html2.join(''));

					filepickerEach();//继续添加下阶段时 上传图片需要重新each
					wxUpFileEach();//继续添加下阶段时 上传图片需要重新each
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
		filepickerEach();//继续添加下阶段时 上传图片需要重新each
		wxUpFileEach();//继续添加下阶段时 上传图片需要重新each
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

      	html.push(' <dl class="fn-clear">');
	    html.push(' <dt>'+langData['travel'][14][139]+'：</dt>');//房间图片
	    html.push(' <dd class="listImgBox fn-hide">');
	    html.push(' <div class="list-holder">');
	    html.push(' <ul id="listSection'+count+'" class="fn-clear listSection fn-hide"></ul>');
	    html.push(' <input type="hidden" name="imglist" value="" class="imglist-hidden roomImg">');
	    html.push(' </div>');
	    html.push(' <div class="btn-section fn-clear">');
	    html.push(' 	<div class="fn-clear">');
	    html.push(' 		<div class="uploadinp filePicker" id="filePicker'+count+'" data-type="album" data-count="'+atlasMax+'" data-size="'+atlasSize+'" data-imglist=""><div id="flasHolder'+count+'"></div><span>'+langData['siteConfig'][6][168]+'</span></div>');//添加图片
	    html.push(' </div>');
	    html.push('<div class="upload-tip">');
	    html.push('<p><a href="javascript:;" class="fn-hide deleteAllAtlas">'+langData['siteConfig'][6][79]+'</a><span class="fileerror"></span></p>');
	    html.push('</div>');
	    html.push('</div>');
	    html.push('</dd>');
	    html.push('</dl>');
	    
	    getComhtml(html,'');
	       
	    html.push('  </section>');

	    return html.join("");

	}
	var oldfakehtml = $('.fakeCon').html(); 
	function getComhtml(htmlarr,ifedit,editlist){//ifedit 判断是添加还是编辑

		var titleTxt = ifedit==1?editlist.title:'';//房间标题
		var priceTxt = ifedit==1?editlist.price:'';//房间价格
		var areaTxt = ifedit==1?editlist.area:'';//房间大小

		htmlarr.push('  <dl class="fn-clear" data-required="1">');//房间标题
	    htmlarr.push('  <dt><span>*</span>'+langData['travel'][14][140]+'：</dt>');//房间标题
	    htmlarr.push('  <dd>');
	    htmlarr.push('  <input type="text" class="inp roomname" data-title="'+langData['travel'][14][141]+'" value="'+titleTxt+'">');//请输入房间标题
	    htmlarr.push('  <span class="tip-inline"></span>');					
		htmlarr.push('	</dd>');
	    htmlarr.push(' </dl>');

	    htmlarr.push(' <dl class="fn-clear" data-required="1">');
	    htmlarr.push(' <dt><span>*</span>'+langData['travel'][11][68]+'：</dt>');//房间价格
	    htmlarr.push(' <dd>');
	    htmlarr.push(' <div class="input-append input-prepend">');
	    htmlarr.push(' <input type="text" name="roomprice" class="inp roomprice" autocomplete="off" value="'+priceTxt+'" data-title="'+langData['travel'][11][47]+'！"  onkeyup="xiaoshu(this)"/>');//请输入房间价格
	    htmlarr.push(' <span class="add-aft">'+echoCurrency('short')+'</span>');//元
	    htmlarr.push(' </div>');
	    htmlarr.push(' <span class="tip-inline"></span>');
	    htmlarr.push(' </dd>');
	    htmlarr.push(' </dl>');

	    htmlarr.push(' <dl class="fn-clear" data-required="1">');
	    htmlarr.push(' <dt><span>*</span>'+langData['travel'][11][72]+'：</dt>');//房间大小
	    htmlarr.push(' <dd>');
	    htmlarr.push(' <div class="input-append input-prepend">');
	    htmlarr.push(' <input type="text" name="roomarea" class="inp roomarea" autocomplete="off" value="'+areaTxt+'" data-title="'+langData['travel'][14][142]+'！" onkeyup="zhengshu(this)"/>');//请输入房间大小
	    htmlarr.push(' <span class="add-aft">'+echoCurrency('areasymbol')+'</span>');//㎡
	    htmlarr.push(' </div>');
	    htmlarr.push(' <span class="tip-inline"></span>');
	    htmlarr.push(' </dd>');
	    htmlarr.push(' </dl>');
	    if(ifedit ==1){
	    	$('.fakeCon .hasfood input.food').val(editlist.breakfast);
	    	$('.fakeCon .haswindow input.win').val(editlist.iswindow);
	    	$('.fakeCon .hasroomtype input.bed_c').val(editlist.typeid);

	    	$('.fakeCon .hasfood .radio').find('span').each(function(){
	    		var tid = $(this).attr('data-id');
	    		if(tid == editlist.breakfast){
	    			$(this).addClass('curr').siblings('span').removeClass('curr');
	    		}
	    	})
	    	$('.fakeCon .haswindow .radio').find('span').each(function(){
	    		var tid = $(this).attr('data-id');
	    		if(tid == editlist.iswindow){
	    			$(this).addClass('curr').siblings('span').removeClass('curr');
	    		}
	    	})
	    	$('.fakeCon .hasroomtype .radio').find('span').each(function(){
	    		var tid = $(this).attr('data-id');
	    		if(tid == editlist.typeid){
	    			$(this).addClass('curr').siblings('span').removeClass('curr');
	    		}
	    	})
	    	var fakehtml = $('.fakeCon').html();
	    	htmlarr.push(fakehtml);
	    }else{
	    	
	    	htmlarr.push(oldfakehtml);
	    }

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
      var t = $(this);
      var id = item.find('.result').attr("data-id");
      console.log(id)
      if(id.indexOf("A")==-1){
          $.ajax({
              url: '/include/ajax.php?service=travel&action=operHotel&oper=delhotelroom&id='+id,
              type: 'post',
              dataType: 'json',
              success: function(data){
                  if(data && data.state == 100){
                      item.remove();
                  }else{
                      $.dialog.alert(data.info)
                  }
              },
              error: function(){
                  $.dialog.alert(langData['siteConfig'][6][203]);
              }
          })
      }else{
          delPic(item);
      }

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
  var m = 0;
	obj.delegate(".finishEdit", "click", function(){
		var t = $(this), p = t.closest('.item');
		p.find('input.error').removeClass('error');
		var id = $('#roomid').val();    //房间id
		var config = getQuestConfg(p);

		if(config){
			var d = config.imgList;
			var tableHtml = [];
			tableHtml.push('<thead>');
				if(d.length > 0){
					tableHtml.push('<th>房间图片</th>');
				}				
				tableHtml.push('<th>房间标题</th>');
				tableHtml.push('<th>房间价格</th>');
				tableHtml.push('<th>房间大小</th>');
				tableHtml.push('<th>房间类型</th>');
				tableHtml.push('<th>有无窗户</th>');
				tableHtml.push('<th>是否含早餐</th>');
			tableHtml.push('</thead>');	
			tableHtml.push('<tbody>');
				tableHtml.push('<tr>');
					if(config.imgList.length > 0){
						tableHtml.push('<td><img src="'+d[0].dataSrc+'" alt=""></td>');
					}
					tableHtml.push('<td class="if_rname">'+config.roomname+'</td>')
					tableHtml.push('<td class="if_rprice" data-value="'+config.roomprice+'">'+echoCurrency('symbol')+config.roomprice+'</td>')
					tableHtml.push('<td class="if_rarea" data-value="'+config.roomarea+'">'+config.roomarea+echoCurrency('areasymbol')+'</td>');
					tableHtml.push('<td class="if_food" data-value="'+config.if_food+'">'+config.food+'</td>');
					tableHtml.push('<td class="if_win" data-value="'+config.if_win+'">'+config.win+'</td>');
					tableHtml.push('<td class="if_bed" data-value="'+config.if_bed+'">'+config.bed_c+'</td>');
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
         	 id = id!=0 && id!='' && id!=undefined && id!=null ? id : 'A' + m;
            m = m + 1;
            p.find('.result').attr('data-id',id);
		  	p.find('.result').attr('data-info',JSON.stringify(config.spetimeList));
		  	p.find('.result').attr('data-img',config.imgarr);
		  	p.find('.result .timeCon').html(timeHtml.join(""));
           $('#roomid').val(0);
			

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
		    roomarea  = item.find('.edit .roomarea').val(),
		    food  	  = item.find('.edit .food').val(),
		    win       = item.find('.edit .win').val(),
		    bed_c     = item.find('.edit .bed_c').val(),
		    imgItem   = item.find('.pubitem'),
		    hasfood   = item.find('.hasfood'),
		    haswindow   = item.find('.haswindow'),
		    hasroomtype   = item.find('.hasroomtype'),
		    imgarr   = item.find('.roomImg').val(),
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
		if(!roomarea){
			var pardl = item.find('.edit .roomarea').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('.roomarea').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
		    return false;
		}

		if(imgItem.length > 0){
			// 图集
			imgItem.find('img').each(function(){
			  var t = $(this),
				  imgval = t.attr('data-val'),
				  imgsrc = t.attr('src');
			  imgList.push({"dataVal":imgval, "dataSrc" : imgsrc});
			})
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
		  roomarea: roomarea,
		  if_win: win,
		  if_food: food,
		  if_bed: bed_c,
		  food: hasfood.find('.curr').text(),
		  win: haswindow.find('.curr').text(),
		  bed_c: hasroomtype.find('.curr').text(),
		  spetimeList: spetimeList,
		  imgList: imgList,
		  imgarr: imgarr
		}

		return config;

	}
	

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        //酒店特色
        var tags = [];
        $('.tags').find('.tag').each(function(){
            var t = $(this), val = t.attr('data-val');
            tags.push(val);
        })
        $('#tag_shop').val(tags.join('|'));

        //酒店设施
        var typeArr = [];
        $('.facilities').find('input[type="checkbox"]:checked').each(function(){
            var t = $(this), val = t.val();
            typeArr.push(val);
        })
        $('#shop_type').val(typeArr.join('|'));

		var t           = $(this),
				addrid      = $("#addrid"),
				address      = $("#address"),
				shopname       = $("#shopname"),
				hotel_c   = $("#hotel_c"),
				shop_type   = $("#shop_type"),
				tag_shop     = $("#tag_shop");
				//note        = $("#note");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//酒店名称
		if($.trim(shopname.val()) == "" || shopname.val() == 0){
			var stip = shopname.data('title');
			shopname.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? shopname.position().top : offsetTop;
		}

		//酒店类型
		if(hotel_c.val() == ''){
			var pardl = hotel_c.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = hotel_c.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? hotel_c.position().top : offsetTop;
		}

		//酒店图集
		if($('#listSection2').find('.pubitem').size() == 0){
			$.dialog.alert('请上传酒店图集');
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

	
		
		//酒店特色
		if(tag_shop.val()==''){
			$.dialog.alert('请输入酒店特色标签');
			offsetTop = offsetTop == 0 ? $('#tags').position().top : offsetTop;
		}

		//酒店设施
		if(shop_type.val() == ''){
			var pardl = shop_type.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = shop_type.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? $('.facilities').position().top : offsetTop;
		}



		var video = "";
	    if($("#listSection3 li").length){
	      video = $("#listSection3 li").eq(0).children("video").attr("data-val");
	    }
        $("#video").val(video);

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}
		//获取房间信息列表
		var roomlist = [],room_len = $('.sectionStage.normal').length;
		if(room_len!=0){
			$('.sectionStage.normal').each(function(){
				var d = $(this).find('.result'), 
				name_r = d.find('td.if_rname').text(),
				area_r = d.find('td.if_rarea').attr('data-value'),
				price_r = d.find('td.if_rprice').attr('data-value'),
				if_win = d.find('td.if_win').attr('data-value'),
				bed_r = d.find('td.if_bed').attr('data-value'),
				if_food = d.find('td.if_food').attr('data-value'),
				specialtime = d.attr('data-info'),
				id = d.attr('data-id'),
				imgpath = d.attr('data-img');
              	if(isNaN(id) || id == null || id == undefined){
                  id = 0;
              	}
              	id = id ? id : 0;
				roomlist.push({
					"id":id,
					"title":name_r,
					"area":area_r,
					"iswindow":if_win,
					"typeid":bed_r,
					"breakfast":if_food,
					"price":price_r,
					"specialtime":specialtime,
					"imgpath":imgpath,
					
				})
			});
		}

		var form = $("#fabuForm"), action = form.attr("action"),url=form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var data = form.serialize() + "&roomlist=" + JSON.stringify(roomlist);
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
						ok: function(){
							location.href = url;
						}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					
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
// 错误提示
function showError(t, info){
	t.addClass('error').focus();
	$.dialog.alert(info);
}
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