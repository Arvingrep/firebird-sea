$(function(){
	var cpage = 1;
	//查看更多小区
	$('#selCommunity').delegate('.moreCum','click',function(){
		cpage++;
		var addr = $('.addrBtn').attr('data-id');
		getXq(addr);
	})
	//选择小区
	$("#selCommunity #communityName").bind("click", function(){
        cpage = 1;
		if($(this).hasClass('on')){
			$(this).removeClass('on');
			$('.communityList').slideUp();
			return false;
		}else{
			$(this).addClass('on');
			setTimeout(function(){
				$('.communityList').slideDown()
			},200)
		}
		
		var t = $(this);
		var addr = $('.addrBtn').attr('data-id');
		if(!addr){
			$.dialog.alert(langData['siteConfig'][20][68]);//请选择所在区域
			return false;
		}else{
			getXq(addr);
		}
		
		
	})
	function getXq(adr){
		$('.moreCum').remove();
		$.ajax({
			url: "/include/ajax.php?service=renovation&action=community&page="+cpage+"&pageSize=15&addrid="+adr,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info.list, community = [],totalPage = data.info.pageInfo.totalPage;
					if(list.length > 0){
						for (var i = 0; i < list.length; i++) {
							community.push('<p data-id="'+list[i].id+'">'+list[i].title+'</p>')
						};

                        if(cpage == 1){
                            $('.communityList').html('');
                        }
						$('.communityList').append(community.join(""));
	
						if(cpage < totalPage){
							$('.communityList').append('<div class="moreCum">查看更多小区 ></div>');
						}
					}else{
						$('.communityList').html('<div class="loading">'+langData['renovation'][15][28]+'</div>');//该区域没有相关小区，请重新选择！
						$('#communityName').val('');
						$('#community').val('');
					}
					

				}else{					
					$('.communityList').html('<div class="loading">'+langData['renovation'][15][28]+'</div>');//该区域没有相关小区，请重新选择！
					$('#communityName').val('');
					$('#community').val('');
				}
			},
	        error: function(){

	            $('.communityList').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
	            $('#communityName').val('');
				$('#community').val('');
	        }
		});	
	}
	//选择小区
	$('.communityList').delegate('p','click',function(){
		var tid = $(this).attr('data-id');
		var txt = $(this).text();
		$(this).addClass('curr').siblings().removeClass('curr');
		$('#communityName').val(txt);
		$('#community').val(tid);

		$('#communityName').removeClass('on');
		$('.communityList').slideUp();


	})

	// 添加阶段
	$('.addNew').click(function(){				
		var html = addCustomInput();
		var $html = $(html);
		obj.append($html);
		filepickerEach();//继续添加下阶段时 上传图片需要重新each
		wxUpFileEach();//继续添加下阶段时 上传图片需要重新each
	})
	// 编辑状态获取问题html或者选项html
	var addCustomInput = function(st){

	    var html = [],html2=[];	    
	    var count = obj.children('.item').length+1;
	    html.push('<section class="sectionStage item editing">');
	    html.push('  <div class="result"  data-id="">');
      	html.push('    <div class="title"><span class="px">'+count+'</span>.<span class="tit"></span></div>');
      	html.push('    <div class="descrip"></div>');
      	html.push('    <div class="img_wrap fn-clear" data-img=""></div>');
      	html.push('  </div>');
      	html.push('  <div class="edit">');
	    html.push('  <dl class="fn-clear" data-required="1">');
	    html.push('  <dt><span>*</span>'+langData['renovation'][9][43]+'：</dt>');//选择阶段
	    html.push('  <dd>');
	    html.push('  <select class="inp stageChose">');
	    $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=9",
          dataType: "json",
          async:false,
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;
                    html2.push('<option value="">'+langData['siteConfig'][7][2]+'</option>');
                    for(var j = 0;j<list.length;j++){
                    	
						html2.push('<option value="'+list[j].id+'">'+list[j].typename+'</option>');
                    						
                     	
                    }                   
                }
            },
        })
		html.push(html2)
		html.push('	</select>');							
		html.push('	</dd>');
	    html.push(' </dl>');
	    html.push(' <dl class="fn-clear" data-required="1">');
	    html.push(' <dt><span>*</span>'+langData['renovation'][9][44]+'：</dt>');//阶段描述
	    html.push(' <dd>');
	    html.push(' <textarea class="note"></textarea>');
	    html.push(' </dd>');
	    html.push(' </dl>');
	    html.push(' <dl class="fn-clear">');
	    html.push(' <dt><span>*</span>	'+langData['siteConfig'][19][2]+'：</dt>');//图集
	    html.push(' <dd class="listImgBox fn-hide">');
	    html.push(' <div class="list-holder">');
	    html.push(' <ul id="listSection'+count+'" class="fn-clear listSection fn-hide">');
	    html.push(' </ul>');
	    html.push(' <input type="hidden" name="imglist" value="" class="imglist-hidden">');
	    html.push(' </div>');
	    html.push(' <div class="btn-section fn-clear">');
	    html.push(' 	<div class="wxUploadObj fn-clear">');
	    html.push(' 		<div class="uploadinp filePicker" id="filePicker'+count+'" data-type="album" data-count="20" data-size="'+atlasSize+'" data-imglist=""><div id="flasHolder'+count+'"></div><span>'+langData['siteConfig'][6][168]+'</span></div>');//添加图片

	    html.push(' <span class="upload-split fn-hide">'+langData['siteConfig'][13][0]+'</span>');//或
	    html.push(' <dl class="wxUpload fn-hide fn-clear">');
	    html.push(' <dt><img id="wxUploadImg'+count+'"  class="wxUploadImg"/></dt>');

	    //使用 -- 微信 -- 扫描左侧二维码 -- 关注 -- 公众号后 -- 将图片 -- 发送 -- 给公众号即可传图
	    html.push(' <dd>'+langData['siteConfig'][19][362]+'<em class="wx">'+langData['siteConfig'][27][139]+'</em>'+langData['siteConfig'][27][140]+'<br />'+langData['siteConfig'][19][846]+''+wxName+''+langData['siteConfig'][27][141]+'<br />'+langData['siteConfig'][27][142]+'<em class="fs">'+langData['siteConfig'][6][139]+'</em>'+langData['siteConfig'][27][143]+'</dd>');
	    html.push(' </dl>');
	    html.push(' </div>');
	    html.push('<div class="upload-tip">');
	    html.push('<p>');
	    html.push('<a href="javascript:;" class="fn-hide deleteAllAtlas">'+langData['siteConfig'][6][79]+'</a>');
	    html.push('&nbsp;&nbsp;'+langData['siteConfig'][54][19].replace(' 1 ','2').replace(' 2 ',20)+' <span class="fileerror"></span></p>');//单张最大 1 M，最多 2 张
	    html.push('</div>');
	    html.push('</div>');
	    html.push('</dd>');
	    html.push('</dl>');
	    html.push('<div class="finishEdit">'+langData['siteConfig'][31][79]+'</div>');//完成编辑
	    html.push('    </div>');
	    html.push('    <div class="g-btns-right g-btns">');
	    html.push('      <a href="javascript:;" class="edit secEdit"><i class="icon icon_edit"></i>'+langData['siteConfig'][6][6]+'</a>');   //编辑
	    html.push('      <a href="javascript:;" class="down"><i class="icon icon_down2"></i>'+langData['siteConfig'][6][159]+'</a>');  //下移
	    html.push('      <a href="javascript:;" class="up"><i class="icon icon_up2"></i>'+langData['siteConfig'][6][158]+'</a>');  //上移
	    html.push('      <a href="javascript:;" class="gotop"><i class="icon icon_top"></i>'+langData['siteConfig'][31][87]+'</a>');  //最前
	    html.push('      <a href="javascript:;" class="gobottom"><i class="icon icon_bottom"></i>'+langData['siteConfig'][31][88]+'</a>');  //最后
	    html.push('      <a href="javascript:;" class="del"><i class="icon icon_del1"></i>'+langData['siteConfig'][6][8]+'</a>');  //删除
	    html.push('    </div>');	    
	    html.push('  </section>');

	    return html.join("");

	}

	var obj = $(".stage-wrap");
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
		checkQuesNum();
	})
	// 删除
	obj.delegate(".g-btns .del", "click", function(){
		var item = $(this).closest('.item');
		delPic(item);
		checkQuesNum();
	})
	// 修改问题编号
	function checkQuesNum(){
		obj.children('.item').each(function(i){
		  $(this).find('.px').text((i+1));
		})
	}
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
		  mod: "renovation",
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

		  // 阶段
		  p.find('.result .tit').text(config.stageName);
		  p.find('.result').attr('data-id',config.stage);
		  //描述
		  p.find('.result .descrip').text(config.description);

		  // 选项
		  var imgHtml = [], len = config.imgList.length,imgvalList=[];
		  for(var i = 0; i < len; i++){
		    var d = config.imgList[i];
		    imgvalList.push(d.dataVal)
		    imgHtml.push('  <div class="pic">');		    
		    imgHtml.push('    <img src="'+d.dataSrc+'" alt="" data-val="'+d.dataVal+'" data-url="'+d.dataUrl+'">');		    
		    imgHtml.push('  </div>');
		  }
		  p.find('.img_wrap').attr('data-img',imgvalList.join('||'));
		  p.find('.img_wrap').html(imgHtml.join(""));

		  // 没有任何修改的情况下，body部分会有抖动？
		  setTimeout(function(){
		    p.removeClass('editing').addClass('normal');
		  }, 200)
		}
	})
	// 判断阶段表单
	function getQuestConfg(item){
		var config = {}, imgList = [];
		var tit    = item.find('.edit .stageChose'),
		    descrip = item.find('.note'),
		    imgItem  = item.find('.pubitem');
		var stageName =  tit.find('option:selected').text();
		var stage = tit.val();

		if(!stage){
		  showError(tit, langData['renovation'][14][63]);//请选择阶段
		  return false;
		}

		var stList = []
		$('.item.normal .result').each(function(){
			var tid = $(this).attr('data-id');							
		  	stList.push(tid)			
		})
		if(stList.indexOf(stage) >-1){
			showError(tit, langData['renovation'][15][53]);//请选择不同的阶段
		  	return false;
		}

		var description = $.trim(descrip.val());
		if(!description){
		  showError(descrip, langData['renovation'][14][64]);//请输入阶段描述
		  return false;
		}
		if(imgItem.length == 0){
			$.dialog.alert(langData['renovation'][15][52]);//请上传阶段图集
			return false;
		}else{
			// 图集
			imgItem.find('img').each(function(){
			  var t = $(this),
				  imgval = t.attr('data-val'),
				  imgsrc = t.attr('src'),
				  imgurl = t.attr('data-url');
			  imgList.push({"dataVal":imgval, "dataSrc" : imgsrc, "dataUrl" : imgurl});
			})
		}

		config = {
		  stageName: stageName,
		  stage: stage,
		  description: description,
		  imgList: imgList
		}

		return config;

	}
	// 错误提示
	function showError(t, info){
		t.addClass('error').focus();
		$.dialog.alert(info);
	}
	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			title    = $("#title"),			
			address = $("#address").val(),//详细地址
			type = $("#type").val(),//类别
			area = $("#area").val(),//面积
			apartment = $("#apartment").val(),//造价
			community = $("#community").val(),//小区
			btype = $("#btype").val(),//装修方式
			style = $("#style").val();//风格

		var addrId = $('.addrBtn').attr('data-id');
		var addrname = $('.addrBtn').text();
		$('#addrid').val(addrId);
		$('#addrname').val(addrname);
		var addr = $("#addrid").val();//所在区域	
        var liptic = $('#thumb').val();
		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if($.trim(title.val()) == ""){
			var hline = title.next(".tip-inline"), tips = title.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(!addr){
			var par = $("#selAddr");
			var hline = par.find(".tip-inline"), tips = par.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#selAddr");
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(!address){//详细地址
			var par = $("#address").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#address").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}

		if(style == ""){//风格
			var par = $("#style").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#style").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;

		}


		if(area == ""){//面积
			var par = $("#area").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#area").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}

		if(apartment == ""){//造价
			var par = $("#apartment").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#apartment").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#apartment").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(!community){//小区
			var par = $("#community").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#community").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}else{
			var par = $("#community").closest('dd');
			par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if(btype == ""){//装修方式
			var par = $("#btype").closest('dd');
			var hline = par.find(".tip-inline"), tips = $("#btype").data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#selTeam").position().top;
		}
      	if(liptic == ''){
        	$.dialog.alert(langData['siteConfig'][27][78]);//请上传缩略图
        	offsetTop = $("#selTeam").position().top;
      	}

		//获取施工详情列表
        var stagelist = [],stage_len = $('.stage-wrap .normal').length;
        if(stage_len == 0){
        	$.dialog.alert(langData['renovation'][15][54]);//请至少添加一个阶段
        	offsetTop = $("#selTeam").position().top;
        }else{
        	$('.stage-wrap').find('.normal').each(function(){
              var d = $(this), stage_name = d.find('.tit').text(),
              stage_id = d.find('.result').attr('data-id'),
              note = d.find('.descrip').html(),
              imgL = d.find('.img_wrap').attr('data-img');
              stagelist.push({
                "stageName":stage_name,
                "stage":stage_id,
                "description":note,
                "imgList":imgL                
              })
            });
        }




		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		var community = $("#communityName").val();
		data = form.serialize();
		data += "&stagelist=" + JSON.stringify(stagelist);
		data += "&cityId=" +cityId;
		data += "&community=" +community;
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
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
					t.removeClass("disabled").html(langData['shop'][1][7]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][7]);
				$("#verifycode").click();
			}
		});

	});

});
