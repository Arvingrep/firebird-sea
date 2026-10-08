var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
var pubModelType = (typeof modelType != "undefined") ? modelType : "siteConfig";
var keywords='';
var editpro = 0,editid= 0;
$(function(){
	 //提示窗
	 var showErrTimer;
	 var showMsg = function(txt,time){
	 	ht = time?time:1500
	 	showErrTimer && clearTimeout(showErrTimer);
	 	$(".popMsg").remove();
	 	$("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
	 	$(".popMsg p").css({ "left": "50%"});
	 	$(".popMsg").css({"visibility": "visible"});
	 	showErrTimer = setTimeout(function(){
	 	    $(".popMsg").fadeOut(300, function(){
	 	        $(this).remove();
	 	    });
	 	}, ht);
	 }
	
	function renderbtn(){
				
		$('.filePicker').each(function() {
			
			  var picker = $(this), type = picker.data('type'), type_real = picker.data('type-real'), atlasMax = 1, size = 4 * 1024;
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
					fileNumLimit: 1,
					//fileSingleSizeLimit: size
				});
				
				uploader.on( 'uploadError', function( file ) {
					uploader.refresh()
				});
				uploader.on('fileQueued', function(file) {
					// 创建缩略图
					uploader.makeThumb(file, function(error, src) {
							$list.removeClass("fn-hide");
							picker.addClass("fn-hide");
							if(error){
								$list.removeClass("fn-hide");
								$list.html('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
								return;
							}
						$list.append('<img src="'+src+'"><p class="reupload">'+langData["live"][5][19]+'</p>');  //重新上传
						
						}, thumbnailWidth, thumbnailHeight);
						uploader.refresh()
				});
				
				uploader.on('uploadSuccess', function(file,response) {
					
					$list.find('img').attr('data-url',response.url).attr('data-src',response.turl).attr('src',response.turl)
					$list.siblings(".spePic").val(response.url)
					$list.siblings(".del_img").removeClass("fn-hide");
					picker.addClass("fn-hide");
				});
				
				
				// 所有文件上传成功后调用
				uploader.on('uploadFinished', function () {
					//清空队列
					 uploader.reset();
				});
					
		huoniao.checkhtml(); //过滤可编辑输入框的html	
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
	$(".prolist_box").delegate(".reupload","click",function(){
		var del = $(this);
		var img_box = del.parents(".img_box");
		var upimg = img_box.siblings(".upload_btn");
		upimg.removeClass("fn-hide");
		img_box.addClass("fn-hide");
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
			}
		})
	});
	
	
	// 新增上传商品
	var pii = $(".prolist_box li").length + 1;
	$(".add_pro").click(function(){
		editpro = 0;
		$(".prolist_box .loading").html("")
		$(".prolist_box ul").append('<li class="pro_li">'
					+'<div class="pinfo_box fn-clear fn-hide">   '
					+'	<div class="limg"></div>   '
					+'	<div class="rinfo">   '
					+'		<h3></h3>   '
					+'		<p class="price_show">'+echoCurrency("symbol")+'<em>0</em>.00</p>   '
					+'	</div>   '
					+'	<div class="btn_group fn-clear"><a href="javascript:;" class="edit_btn">'+langData["live"][2][38]+'</a><a href="javascript:;" class="del_btn">'+langData["live"][0][36]+'</a></div>   '   //编辑  删除
					+'</div>   '
					+'<div class="pinfo_edit fn-clear">   '
					+'	<div class="limg">   '
					// +'		<i>'+(pii<=9?("0"+pii):pii)+'</i>   '
					+'		<div class="img_box fn-hide"></div>   '
					+'		<div class="upload_btn filePicker" id="filePicker0'+pii+'" data-type="des">   '
					+'			<p>'+langData["live"][5][20]+'</p>   '   //封面
					+'		</div>   '
					+'	</div>   '
					+'	<div class="rinfo">   '
					+'		<div class="tit_inp" contenteditable="true" placeholder="'+langData["live"][5][21]+'"></div>   '  //请输入商品标题
					+'		<p class="price_show">'+echoCurrency("symbol")+'<input type="text" name="pro_price" class="pro_price" placeholder="'+langData["live"][5][22]+'"></p>   '  //输入价格
					+'	</div>   '
					+'	<div class="plink"><input type="text" class="pro_link" placeholder="'+langData["live"][5][23]+'"></div>   '   //输入商品链接
					+'	<div class="btn_group fn-clear"><a href="javascript:;" class="sure_btn">确定</a><a href="javascript:;" class="cancel_btn">'+langData["live"][0][9]+'</a></div>   '
					+'</div>   '
					
			+'	</li>');
			pii++;
		renderbtn();
		$(window).scrollTop($(document).height());
	});
	
	
	$(".prolist_box").on("keyup",".pro_price",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		var nowval = val.replace(/[^\d\.]/g,'')
		 t.val(nowval)
	});
	$(".prolist_box").on("blur",".pro_price",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if(val!=''){
			t.val(Number(val).toFixed(2))
		}
		
	});
	
	// 确认增加
	$(".prolist_box").on("click",".sure_btn",function(){
		var t = $(this),pfrom = t.parents('.pinfo_edit'),pshow = pfrom.siblings(".pinfo_box"),imgbox = pshow.find('.limg') ;
      
      	if(t.hasClass('disabled')) return false;
      
		var plink = pfrom.find(".plink input").val();
		var pimg = pfrom.find(".img_box img").attr('src');
		var img = pfrom.find(".img_box img").attr('data-url');
		var ptit = pfrom.find(".tit_inp").html();
		var pprice = pfrom.find(".pro_price").val();
		var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
		if(ptit==''&& ptit!='undefined'){
			alert(langData["live"][2][41]);   //请输入商品标题
			return false;
		}else if(!img && img!='undefined'){
			alert(langData["live"][5][24]);   //请上传商品图片
			return false;
		}else if(!reg.test(plink) && plink != '' && plink != 'undefined'){
			alert(langData["live"][5][25]);   //这是不正确的链接
			return false;
		}else if(pprice=='' && pprice!='undefined'){
			alert(langData["live"][5][26]);   //请输入价格
			return false;
		}
		
		data = {
			'title' : ptit,
			'price' : pprice,
			'pic'   : img,
			'url'   : plink
		}
      	
      	t.addClass('disabled');
      
		var url = editpro?('/include/ajax.php?service=live&action=editProduct&id='+editid):('/include/ajax.php?service=live&action=putProduct&aid='+chatid)
		$.ajax({
		      url: url,
		      type: 'post',
		      data: data,
		      dataType: 'json',
		      success: function(res){
		        if(res && res.state == 100){
		         	location.reload();
		        }else{
				  alert(res.info);
		          t.removeClass('disabled');
		        }
		      },
		      error: function(){
		        $.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
		        t.removeClass("disabled"); //立即投稿
		      }
		 })
		
		
		//pfrom.addClass('fn-hide');
		//pshow.removeClass('fn-hide');
		//pfrom.find(".price_show").attr('data-price',pprice)
		//pfrom.find(".pro_link").attr('data-link',plink)
		//imgbox.find("img").remove();
		//imgbox.append('<img src="'+pimg+'">');
		//pshow.find('.rinfo h3').text(ptit);
		//pshow.find(".price_show").html(echoCurrency("symbol")+'<em>'+(pprice.split('.')[0])+'</em>.'+(pprice.split('.')[1]));
	});
	
	
	
	// 编辑
	$(".prolist_box").on("click",".edit_btn",function(){
		var t = $(this),pshow = t.parents('.pinfo_box'),pfrom = pshow.siblings(".pinfo_edit");
		var img = pshow.find('.limg').attr('src');
		var plink = pshow;
		pshow.addClass("fn-hide");
		pfrom.removeClass('fn-hide');
		editpro = 1,editid=t.attr('data-id');
	});
	
	// 删除
	$(".prolist_box").on("click",".del_btn",function(){
		var t = $(this),pshow = t.parents('.pinfo_box'),pfrom = pshow.siblings(".pinfo_edit");
		var li = t.closest('li');
		$.ajax({
			url: "/include/ajax.php?service=live&action=delProduct&id="+(li.attr('data-id')),
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
		
					li.find('.reupload').click();
					li.remove();
					$(".prolist_box li").each(function(){
						var index = $(this).index();
						$(this).find('.limg i').text(index+1);
						$(this).find('.filePicker').attr('id',"filePicker0"+(index+1));
					});
					pii = $(".prolist_box li").size()+1;
					renderbtn();
		
				}else{
					console.log(111)
					showMsg(langData['siteConfig'][20][183])
				}
			},
			error: function(){
				showMsg(langData['siteConfig'][20][183])
			}
		});
		
	});
	
	// 取消
	$(".prolist_box").on("click",".cancel_btn",function(){
		var t = $(this),pfrom = t.parents('.pinfo_edit'),pshow = pfrom.siblings(".pinfo_box");
		var li = t.closest('li');
		var link = pfrom.find('.pro_link').attr('data-link');
		var price = pfrom.find('.price_show').attr('data-price');
		var title = pshow.find('h3').text();
		var img = pshow.find('.limg img').attr('src');
		console.log(pshow.find('.limg img').size())
		if(pshow.find('.limg img').size()>0){
			pfrom.find('.img_box img').attr('src',img);
			pfrom.find('.tit_inp').text(title);
			pfrom.find('.pro_price').val(price);
			pfrom.find('.pro_link').val(link);
			pfrom.addClass('fn-hide');
			pshow.removeClass("fn-hide");
		}else{
			li.remove();
			pii = $(".prolist_box ul li").length + 1;
		}
		
	});
	
	getlist();
	function getlist(){
		pii = 1;
		$.ajax({
				url: "/include/ajax.php?service=live&action=product&aid="+chatid+"&orderby=asc&zero=1&u=1&pageSize=100&page="+atpage,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data){
						if(data.state == 100){
							$(".prolist_box .loading").html('');
							var list = data.info.list, lr, html = [];
							if(list.length > 0){
								//var pro_num = (atpage - 1)*pageSize
								for(var i = 0; i < list.length; i++){
									lr  =  list[i];
								//	pro_num = pro_num + 1;
									var price = (lr.price*1).toFixed(2);
									html += '<li class="pro_li" data-id="'+lr.id+'">'
												+'<div class="pinfo_box fn-clear">   '
												+'	<div class="limg"><i>'+lr.px+'</i><img src="/include/attachment.php?f='+lr.pic+'"></div>   '
												+'	<div class="rinfo">   '
												+'		<a href="'+lr.url+'" style="display:block;"><h3>'+lr.title+'</h3><p class="click_num">'+lr.click+langData['live'][6][8]+'</p></a>   '   //	   '8' => '次点击',
												+'		<p class="price_show">'+echoCurrency("symbol")+'<em>'+(lr.price.split('.')[0])+'</em>.'+lr.price.split('.')[1]+'</p>   '
												+'	</div>   '
												+'	<div class="btn_group fn-clear"><a href="javascript:;" data-id="'+lr.id+'" class="edit_btn">编辑</a><a href="javascript:;" class="del_btn">'+langData['live'][0][36]+'</a></div>   '  //删除
												+'</div>   '
												+'<div class="pinfo_edit fn-clear fn-hide">   '
												+'	<div class="limg">   '
												+'		<i>'+(pii<=9?("0"+pii):pii)+'</i>   '
												+'		<div class="img_box"><img data-url="'+lr.pic+'" src="/include/attachment.php?f='+lr.pic+'"><p class="reupload">'+langData['live'][5][19]+'</p></div>   '    //重新上传
												+'		<div class="upload_btn filePicker fn-hide" id="filePicker0'+pii+'" data-type="des">   '
												+'			<p>'+langData['live'][5][5]+'</p>   '    //封面
												+'		</div>   '
												+'	</div>   '
												+'	<div class="rinfo">   '
												+'		<div class="tit_inp" contenteditable="true" placeholder="请输入商品标题">'+lr.title+'</div>   '
												+'		<p class="price_show" data-price="'+lr.price+'">'+echoCurrency("symbol")+'<input type="text" name="pro_price" class="pro_price" placeholder="'+langData['live'][5][22]+'" value="'+lr.price+'"></p>   '
												+'	</div>   '
												+'	<div class="plink"><input type="text" class="pro_link" data-link="'+lr.url+'" placeholder="'+langData['live'][5][23]+'" value="'+lr.url+'"></div>   '  //输入商品链接
												+'	<div class="btn_group fn-clear"><a href="javascript:;" class="sure_btn">'+langData['live'][0][8]+'</a><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a></div>   '   //确定   取消
												+'</div>   '
												
										+'	</li>';
										pii++;
								}
		
								$(".prolist_box ul").append(html);
								renderbtn()
							
		
							//没有数据
							}else{
								$(".prolist_box  .loading").html(data.info);//没有符合条件的宝贝
							}
		
						//请求失败
						}else{
							$(".prolist_box .loading").html(data.info);//没有符合条件的宝贝
						}
		
					//加载失败
					}else{
						$(".prolist_box .loading").html(langData['siteConfig'][20][462]);//加载失败！
					}
				},
				error: function(){
					$(".prolist_box .loading").html(langData['siteConfig'][20][227]);//网络错误，加载失败！
				}
	
		});
	}
});