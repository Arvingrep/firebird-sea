var fileCount = 0,uploader,
	ratio = window.devicePixelRatio || 1,
	thumbnailWidth = 100 * ratio,   // 缩略图大小
	thumbnailHeight = 100 * ratio;  // 缩略图大小;
var validTrade = null;
// 录音相关
var recordTimer;




var fabuPage = new Vue({
  el:"#fabuPage",
  data:{
	popInp:{
		title:'',
		placeholder:'',
		value:'',
				id:'',
	},
	touchmove:false,

	showPop:false,
	iswechat:false, //是否是微信中
	isApp:false, //是否是app中
	END:0,        //录音结束时间
	START:0,  //录音开始时间
	recording:false, //是否正在录音,
	addInputArr:addInputArr,  //自定义内容
	features:feature,    //特色标签
	noPosi:false, //是否不显示定位
	address:address,  //定位
	addrArr:addrArr,
	lnglat:lnglat,  //定位
	city:city,  //城市
	cityid:cityid,  //城市id
	districtDetail:'',
	imgArr:(imgList == 'null'?[]:JSON.parse(imgList)), //图片
	successTip:false,  //发布成功
	infoCount:infoCount, //剩余发布次数,
	fabuamount:fabuamount,  //发布金额,
	defaultPrice:defaultPrice,
	countAmount:(defaultPrice*1 + fabuamount*1).toFixed(2),
	dCustomArr:dCustomArr=='null'?[]:JSON.parse(dCustomArr), //自定义内容的值
	labels:(labels == 'null' ?[]:JSON.parse(labels)),
	oldValid:oldValid > parseInt((new Date()).valueOf()/1000) ? oldValid : parseInt((new Date()).valueOf()/1000),
	valid:oldValid,
	setTop:'', //置顶天数
	setToprice:0, //置顶价格
	featureValue:featureValue,
	videoUp:videoUp, //是否上传视频
	video:videoUrl,
	videoPath:videoPath,
	videoPoster:videoPoster,
	videoPosterPath:videoPosterPath,
	showVcode:false,
	dataGeetest:'',

	showOptionPop:false, //选择弹窗
	currShowOptions:'', //当前弹窗所显示的内容
	currChoseItem:'',
	currCustomItem:'',
	onedit:false, //表示弹窗显示处于编辑状态，未点击确定按钮

    agreeProtocol: 0,  //同意发布协议
	topSetList:[], //置顶套餐选项
  },
	created(){
		wx.config({
			debug: false,
			appId: wxconfig.appId,
			timestamp: wxconfig.timestamp,
			nonceStr: wxconfig.nonceStr,
			signature: wxconfig.signature,
			jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
		});
		this.getTypeName()
	},
	
  computed:{
		checkInput(){
			return function(inp){
					var tt = this;
					var obj = {};
					if(opAct == ''){ //不是编辑状态
						
						if(inp.default && inp.default.length >= 1 && inp.default[0] != ''){
							var valArr = [];
							if(inp.options){
								inp.options.forEach(function(val){
									if(inp.default.indexOf(val) > -1){
										valArr.push(val);
									}
								})
								obj = {
									id:inp.id,
									type:inp.title,
									value:valArr.join(','),
									valueArr:valArr
								}
							}else{
								obj = {
									id:inp.id,
									type:inp.title,
									value:inp.default[0],
									valueArr:inp.default
								}
							}
							
						}

					}
					if(typeof(tt.dCustomArr) == 'string'){

						tt.dCustomArr = JSON.parse(tt.dCustomArr)
						
					}
					tt.dCustomArr.forEach(function(val,ind){
						for(var item in val){
							if(val[item] && typeof(val[item]) == 'object' && val[item].length && val[item].indexOf('') > -1){
								val[item] = [];
								tt.dCustomArr[ind] = val;
							}
						}
						if(inp.id == val.id ){
							obj = val;
						}
					});

					// if(inp.id == 127){
					// 	console.log(obj)
					// }
					
				return obj
			}
		},


	},
  mounted(){
    var tt = this;
	this.getSetTop();
	if(typeof(ai2ContentVue) != 'undefined'){
		ai2ContentVue.initAi2Con($('.aiBtnBox'),'info',this,function(d){
			if(d){
				$('#desc').html(d.replace(/\n/g,"<br/>"))
			}
		},tt.getAiKey)
	}
	payVue.paySuccessCall=res=>{
		if (navigator.userAgent.toLowerCase().match(/micromessenger/)) { //微信环境下
			wx.miniProgram.getEnv(res => { //环境判断
				if (res.miniprogram) { //微信小程序 
					let param=$('#tourl').val().split('?')[1];
					wx.miniProgram.redirectTo({
						url: `/pages/packages/info/payreturn/payreturn?${param}`,
					})
				} else { //微信浏览器
					location.replace($('#tourl').val());
				}
			})
		} else { //普通浏览器/APP
			location.replace($('#tourl').val()); //支付成功之后跳转走的url
		}
	}
	// infoCount  => 免费发布次数  membervalid => 有效期  validOff 表示是否还在有效期
	if(iosVirtualPaymentState && window.__wxjs_environment == 'miniprogram' && !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i) && ((validOff <= 0 && opAct == 'edit') ||  ((membervalid <=0 || infoCount <= 0) && opAct == 'do'))){  //开启虚拟支付禁用  小程序环境中  设备是ios系统
		var popOptions = {
			title: '温馨提示', //'确定删除信息？',  //提示文字
			btnCancelColor: '#407fff',
			isShow: true,
			confirmHtml: '<p style="margin-top:.2rem;">' + iosVirtualPaymentTip + '</p>', //'一经删除不可恢复',  //副标题
			btnCancel: '好的，知道了',
			noSure: true
		}
		confirmPop(popOptions);
	}


	// 极验相关
	if(geetest){
		captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)	
	}







		fileCount = tt.imgArr.length;
		if(tt.addInputArr && tt.addInputArr.length){
			for(var i = 0; i < tt.addInputArr.length; i++){
				tt.addInputArr[i].options = tt.trimSpace(tt.addInputArr[i].options);
			}
		}

    toggleDragRefresh('off');  //取消下拉刷新
		
    setTimeout(function (){
			$(".TipBox").removeClass('show')
		},5000)

    tt.uploadImage()

    $('body').delegate('.del_btn','click',function(e){
		var t = $(this)
		var $li = t.closest('.thumbnail')
		if($li.find("img").length > 0){
			tt.delAtlasPic($li.find("img").attr("data-val"));
		}else{
				tt.delAtlasPic($li.find("video").attr("data-val"));
				tt.videoUp = false;
		}
		$li.remove()
		tt.countImgUrl();
		e.stopPropagation()
	})		
    // 聚焦
    $(".popInpbox input").click(function(event) {
      /* Act on the event */
      $(".popInpbox input").focus();
    });

		// 隐藏录音提示
		setTimeout(function(){
			$(".recordtip").css('animation','leftFadeOut .3s forwards')
		},5000);

// 微信相关
		wx.ready(function() {
//
	    tt.iswechat = true;
	    wx.error(function(res){
	       console.log(res);
	    });
	    wx.onVoicePlayEnd({
	      success: function (res) {
					tt.END = new Date().getTime()
	        tt.recording = false; //录音结束
	      }
	    });
	});

	$('body').on('touchstart',function(){
		if(!tt.touchmove){
			tt.touchmove = true;
		}
	})

	// 选择时间
	$('.feeBox .dlbox li').click(function(){


		if($('.feeBox .default_valid').length > 0){
			$(this).toggleClass('on_chose').siblings('li').removeClass('on_chose');
			if($('.feeBox li.on_chose').length == 0){
				$('.feeBox li.default_valid').addClass('on_chose')

			}
		}else{
				$(this).addClass('on_chose').siblings('li').removeClass('on_chose');
		}
		tt.defaultPrice = $('.feeBox li.on_chose').attr('data-price')?$('.feeBox li.on_chose').attr('data-price'):0;
		if(tt.defaultPrice>0&&iosVirtualPaymentState){
			$('#fb_sub').addClass('iOS_miniprogram_nocash');
		}else{
			$('#fb_sub').removeClass('iOS_miniprogram_nocash');
		}
		var validText = $('.feeBox li.on_chose').attr('data-time')?$('.feeBox li.on_chose').attr('data-time'):0;
			tt.countAmount = (tt.defaultPrice * 1 + tt.fabuamount * 1+tt.setToprice*1).toFixed(2);
			tt.valid = tt.oldValid * 1 + Number(validText); //有效期

	})
	$('.feeBox .dlbox li:not(.zhanwei)').eq(0).click()

	//
	$(".inpAll").on('click','.click',function(){
		var t = $(this),dd = t.closest('dd'), type= t.closest('dd').attr('data-type'),Inpname = t.closest('dd').attr('data-name'),id = dd.attr('data-id'),title=dd.attr('data-title');
		console.log(type)
		if(type == 'radio'){
			if($(this).closest('.inpbox').attr('data-required')==0&&t.attr('class').includes('on_chose')){
				t.toggleClass('on_chose')
			}else{
				t.addClass('on_chose').siblings('.inp').removeClass('on_chose')
			}
		}else{
			t.toggleClass('on_chose')
		}
		var fArr = []

		if(Inpname == 'feature'){

			dd.find('.inp').each(function (){
				if($(this).hasClass('on_chose')){
					fArr.push($(this).attr('data-id'))
				}
			});

			tt.featureValue = fArr.join(',')

		}else{
			dd.find('.inp').each(function (){
				if($(this).hasClass('on_chose')){
					fArr.push($(this).text())
				}
			});
			var valhas = false;
			for(var i=0; i < tt.dCustomArr.length; i++){
					var cst = tt.dCustomArr[i]
					if(cst.id == id){
						valhas = true;
						tt.dCustomArr[i].value = fArr.join(',');
						tt.dCustomArr[i].valueArr = fArr;
						break;
					}
				}
				if(!valhas){
					tt.dCustomArr.push({
						id:id,
						type:title,
						value:fArr.join(','),
						valueArr:fArr,
					})
				}
		}

	})


	mobiscroll.settings = {
		theme: 'ios',
		themeVariant: 'light',
		height:40,
		lang:'zh',

		headerText:true,
		calendarText:'',  //时间区间选择
	};

		// 获取本地存储 的数据
		var infoData = localStorage.getItem('infoData');
		if(infoData && infoData != 'undefined'){
			infoData = JSON.parse(infoData);
			$('.TipBox').remove();
			infoData.forEach(function(val){

			  if(tt[val.name] != undefined){    //js中村存 的数据
					if(val.name == 'video' && val.value){
						tt.videoUp = true;
					}
					if(val.name == 'imgArr' && val.value != ''){
						var arrImg = val.value.split('||');
						var arrImg_ = val.source.split('||');
						var imgArr = [];
						arrImg.forEach(function(val, index){
							imgArr.push({
								path:arrImg_[index],
								pathSource:val,
							})
						})
						tt[val.name]  = imgArr;
					}else{
						tt[val.name] = val.value;
					}
				}else if($('input[name="'+val.name+'"]').length && !$('input[name="'+val.name+'"]').hasClass('fields')){
					$('input[name="'+val.name+'"]').val(val.value);
					if(val.name == 'feature'){
						// console.log(111,val.value)
						tt.featureValue = val.value;
					}
				}else{
					if(val.name.indexOf('[]') > -1){
                 if(val.name.indexOf('_custom') > -1){
                   $('dd.inpbox[data-name="'+val.name.split('_custom')[0]+'"]').append('<input type="hidden" name="'+val.name+'" class="fields" value="'+val.value+'">');
                 }else{
                   $('dd.inpbox[data-name="'+val.name.split('[]')[0]+'"]').append('<input type="hidden" name="'+val.name+'" class="fields" value="'+val.value+'">');
                 }
					}else{
						if($('input[name="'+val.name+'"]').length == 0 && $('dd.inpbox[data-name="'+val.name+'"]').length > 0){ //自定义文本框
							$('dd.inpbox[data-name="'+val.name+'"]').append('<input type="hidden" name="'+val.name+'"  value="'+val.value+'">')
						}else{
							if(val.name == 'desc'){
								$("#desc").html(val.value);
							}
						}

					}
				}

			})
		}
		localStorage.removeItem("infoData");

		if(!tt.noPosi ){
			 if(tt.address != '' || tt.addrArr!=''){}else{
			 	var confirmPopShow = false;
				// 定位
				HN_Location.init(function(data){
					if (data == undefined || !data || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
						if(fabuMapConfig == 2){
							if(confirmPopShow) return false;
							confirmPopShow = true;
							// 提醒切换分站
							var popOptions = {
							  	title: '定位失败', //'确定删除信息？', //提示文字
								btnCancelColor: '#407fff',
								isShow:true,
								confirmHtml: '<p style="margin-top:.2rem;">请开启位置权限后重试，或者手动切换定位</p>' , //'一经删除不可恢复', //副标题
								btnSure: '手动定位',
							}
							confirmPop(popOptions,function(){
								tt.toAddrChose()
								confirmPopShow = false;
							},function(){
								location.replace(chanelIndex)
								confirmPopShow = false;
							})
						}else if(fabuMapConfig == 1){
							let txt = '定位失败，请开启位置权限后重试'
							if(data){
								txt = txt + '，' + JSON.stringify(data)
							}
							showErrAlert('定位失败，请开启位置权限后重试');   //'定位失败，请刷新页面'
						}else{
							showErrAlert(langData['info'][4][20]);   //'定位失败，请刷新页面'
						}
						tt.address = '定位失败，请手动选择';
						tt.lnglat = '';
					}else{
						if(fabuMapConfig){
							tt.checkCity(data)
						}else{
							var name = data.name ==''?data.address:data.name;
							tt.lnglat = data.lng+','+data.lat;
							// tt.address = data.city +'  '+ data.district;
							tt.address = name;
							tt.districtDetail = JSON.stringify(data)
							tt.addrArr = data.city + (data.district != 'undefined' && data.district != undefined ? ' ' + data.district : '');
						}
					}
				});
			 };
		}else{
			tt.address = '添加定位';   //'不显示定位
		}


		


		// 图片放大
	 var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
		 $(".imgUpload ").delegate('.thumbnail.litpic', 'click', function(e) {
		 if(device.indexOf('huoniao') <= -1 && e.target != $(this).find('.del_btn')[0]) {

			 var imgBox = $(".imgUpload .thumbnail.litpic");
			 var i = $(".imgUpload .thumbnail.video").length ? $(this).index() - 1 : $(this).index();
			 $(".videoModal .swiper-wrapper").html("");
			 for(var j = 0 ,c = imgBox.length; j < c ;j++){
					 if(j==0){
			 $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img data-val="' + imgBox.eq(j).find("img").attr("data-val") + '" src="' + imgBox.eq(j).find("img").attr("data-url") + '" / ></div>');
						}else{
							 $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img data-val="' + imgBox.eq(j).find("img").attr("data-val") + '" src="' + imgBox.eq(j).find("img").attr("data-url") + '" / ></div>');
						}

			 }
			 videoSwiper.update();
			 $(".videoModal").addClass('vshow');
			 $('.markBox').toggleClass('show');
			 videoSwiper.slideTo(i, 0, false);
		   }
		 });

		 $(".videoModal").delegate('.img_del', 'click', function(e) {
				var index = $('.videoModal .swiper-slide-active').index();
				$('.imgUpload .thumbnail.litpic').eq(index).find('.del_btn').click();
				$(".videoModal").removeClass('vshow');
				return false;
		 });

		 $('.close_img').click(function(){
				$(".videoModal").removeClass('vshow');
				$(".videobox").hide();
		 });


		 // 视频预览
	 	var player;
	 	$('body').delegate('.thumbnail.video', 'click', function(e) {
	 		if(e.target != $(this).find('.del_btn')[0]){
	 			
		 		var src = $(this).find('video').attr('src'), poster = $(this).find('video').attr('data-poster');
		 		$('.videobox').show();
		 		player = new Aliplayer({
		 			"id": "im-video_show",
		 			"source": src,
		 			"width": "100%",
		 			"height": "100%",
		 			"autoplay": false,
		            'cover': "/include/attachment.php?f=" + poster,
		 			"rePlay": false,
		 			"playsinline": true,
		 			"preload": true,
		 			"controlBarVisibility": "hover",
		 			"useH5Prism": true,
		 			'skinLayout': false
		 		}, function(player) {
		 			$('.videobox .v_play').removeClass('fn-hide')
		 			console.log("创建成功");
		 		});

		 		// 监听是否播放结束
		 		player.on('ended',function(){
		 			$('.videobox .v_play').removeClass('fn-hide')
		 		})
	 		}
	 	});
	 	// 播放
	 	$('.videobox .v_play').click(function(e){
	 		player.play();
	 		$('.videobox .v_play').addClass('fn-hide')
	 	});

	 	// 返回
	 	$('.videobox  .close_video').click(function(){
	 		player.dispose();
	 		$('.videobox').fadeOut();
	 	})

		// 删除
	$('.videobox .video_del').click(function(e){
		$('.thumbnail.video .del_btn').click();
		player.dispose();
		$('.videobox').fadeOut();
	});

		 // 图片旋转
$(".rotate_img").click(function(){
	$(".canvasBox").show();
	$(".btn_groups").hide();
	$(".btn_group1").show();
	var  imgSrc = $(".swiper-slide.swiper-slide-active img").attr('src');
	var  val = $(".swiper-slide.swiper-slide-active img").attr('data-val');
	$(".canvasBox img").attr('src',imgSrc).attr('data-val',val);
	rotate_img(imgSrc)

})

$(".rotate2").click(function(){
	var imgSrc = $(".canvasBox img").attr('src');
	 rotate_img(imgSrc)
});

$(".cancel_btn").click(function(){
	$(".btn_groups").show();
	$(".btn_group1,.canvasBox").hide();

});

$(".sure_btn").click(function(){
	$(".canvasBox .loading").show();
	var imageBase64 = $("#image").attr('src');
	$(".swiper-slide.swiper-slide-active img").attr('src',imageBase64)
	var val = $("#image").attr('data-val');
	imageBase64 = imageBase64.replace('data:image/png;base64,', '');

	setTimeout(function(){
		$.ajax({
			url: "/include/upload.inc.php",
			type: "POST",
			data: {
				mod: 'info',
				type: 'img',
				base64: 'base64',
				Filedata: imageBase64,
				randoms: Math.random()
			},
			dataType: "json",
			success: function (response) {
				var random_num = hideFileUrl == 1 ? ("&v="+Math.random()) : ("?v="+Math.random())
				$(".swiper-slide.swiper-slide-active img").attr('src',response.turl+random_num).attr('data-val',response.url+random_num);
				var img  = $("#fileList .img_show img[data-val='"+val+"']");
				img.after("<img src='"+(response.turl + random_num)+"' data-val='"+response.url+"' data-url='"+(response.turl + random_num)+"'>");
				tt.delAtlasPic(val);
				$(".btn_group1,.canvasBox").hide();
				$(".btn_groups").show();
				$(".canvasBox .loading").hide();
				img.remove();
				var i = $(".swiper-slide.swiper-slide-active").index()
				if($(".imgUpload .thumbnail.video").length){
					$(".imgUpload .thumbnail.litpic").eq(i).find('img').attr('src',response.turl + random_num)
					.attr('data-url',(response.turl + random_num))
					.attr('data-val',(response.url))
				}else{
					$(".imgUpload .thumbnail.litpic").eq(i).find('img').attr('src',response.turl + random_num)
					.attr('data-url',(response.turl + random_num))
					.attr('data-val',(response.url))
				}

			},
			error: function (xhr, status, error) {

			}
		})
	},500)


})

function rotate_img(imgSrc){
	var image = new Image();
	image.setAttribute("crossOrigin",'Anonymous');
	image.src = imgSrc;
	image.onload = function() {
		var expectWidth = this.naturalWidth;
		var expectHeight = this.naturalHeight;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = expectWidth;
		canvas.height = expectHeight;
		ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
		var base64 = null;
		rotateImg(this,'left',canvas);
		base64 = canvas.toDataURL('image/png', 1);
		var baseFile = dataURLtoFile(base64, '1');
		$(".canvasBox img").attr('src',base64);

	}
}

function dataURLtoFile(dataurl, filename) { //将base64转换为文件
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename,{
			type: mime
		});
	}

	function rotateImg(img, direction,canvas) {
		//alert(img);
		//最小与最大旋转方向，图片旋转4次后回到原方向
		var min_step = 0;
		var max_step = 3;
		//var img = document.getElementById(pid);
		if (img == null)return;
		//img的高度和宽度不能在img元素隐藏后获取，否则会出错
		var height = img.height;
		var width = img.width;
		//var step = img.getAttribute('step');
		var step = 2;
		if (step == null) {
			step = min_step;
		}
		if (direction == 'right') {
			step++;
			//旋转到原位置，即超过最大值
			step > max_step && (step = min_step);
		} else {
			step--;
			step < min_step && (step = max_step);
		}
		//旋转角度以弧度值为参数
		var degree = step * 90 * Math.PI / 180;
		var ctx = canvas.getContext('2d');
		switch (step) {
			case 0:
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0);
				break;
			case 1:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, 0, -height);
				break;
			case 2:
				canvas.width = width;
				canvas.height = height;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, -height);
				break;
			case 3:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, 0);
				break;
		}
	}

  },

	watch:{
		successTip(val){
			if(val){
				$('html').addClass('noscroll');
				$(".header").addClass('fixed');
			}else{
				$('html').removeClass('noscroll');
				$(".header").removeClass('fixed');
			}
		}
	},
	methods:{
		getValue(featureValue){
			var idArr = [];
			var tt = this;
			for(var i = 0; i<tt.labels.length; i++){
				var lab = tt.labels[i]
				idArr.push(lab.id)
				$(".inpBox[data-name='feature'] .inp[data-id='"+lab.id+"']").addClass('on_chose')
			}
			return idArr.join(',')
		},
		//获取特色表签以及分类信息


    showPopInp(id){
      var tt = this;
			var el = event.currentTarget;
	 	
	  

      tt.showPop = true;
      $("html").addClass('noscroll');
      $(".popInpbox input#txtinp").focus();
		var dd = $(el).closest('dd');
		if(dd.length > 0){
		    // tt.popInp['value'] = $(el).text();

			tt.popInp['title'] = dd.attr('data-title');
			tt.popInp['id'] = dd.attr('data-id');
			tt.popInp['placeholder'] = langData['info'][3][31] + dd.attr('data-title');  //请填写
			
		}else{
			var currShowOptions = tt.currShowOptions
			tt.popInp['title'] = currShowOptions.title;
			tt.popInp['id'] = currShowOptions.id;
			tt.popInp['placeholder'] = langData['info'][3][31] + currShowOptions.title;;  //请填写
		}
		if($(el).hasClass('labs')){
			tt.popInp['value'] = $(el).text();
			
			$('.labs').removeClass('on_edit');
			$(el).addClass('on_edit');
		}
    },

    hidePopInp(){
      var tt = this;
		tt.showPop = false;
		tt.popInp['value'] = '';
			$("html").removeClass('noscroll');
		$('.labs').removeClass('on_edit')
		// tt.onedit = false;
    },

		// 显示上传窗口
		showUpfilePop(){
			var tt = this;

			if(tt.videoUp){ //已经上传过视频
				var userAgent = navigator.userAgent.toLowerCase();
				if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
					var upoptions = {
						btn: '.upload_btn',
						atlasMax:atlasMax,
						del_btn:'.del_btn',
				
					}
				   wxUploader(upoptions,
					// 上传成功后触发
					function(data){
						var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
							var $li   = $('<div id="' + id + '" class="thumbnail litpic" ><img src="'+turl+'" data-val="'+fid+'" data-url="'+turl+'"><div class="del_btn"></div></div>');
							$(".upload_btn").before($li);
				   },function(){
					$(".cancel_btn").click(); //隐藏弹窗
				   })
				}else{
					$("#filePicker0 input").click();
				}
			}else{
				if(fileCount != atlasMax){
					$('.mask_upfile').show();
					$(".upfile_box").css('transform','translateY(0)')
				}else{ //图片已达上限， 只能上传视频
					$("#filePicker1 input").click();
				}
			}
		},

		// 隐藏上传
		hideUpfilePop(){
			$('.mask_upfile').hide();
			$(".upfile_box").css('transform','translateY(100%)')
		},

    /* 上传图片相关 */
		uploadImage:function(){
			var tt = this;
			$('.upfilebtn').each(function(i){

                var i = parseInt($(this).attr('id').replace('filePicker', ''));
			    
			    var multiple = i == 0 && !isAndroidWxmini() ? true:false;

				tt.countImgUrl();




				var userAgent = navigator.userAgent.toLowerCase();
				if (userAgent.match(/MicroMessenger/i) == "micromessenger" && i == 0) {
					var upoptions = {
						btn: '#filePicker0',
						atlasMax:atlasMax,
						del_btn:'.del_btn',
				
					}
				   wxUploader(upoptions,
					// 上传成功后触发
					function(data){
						var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
							var $li   = $('<div id="' + id + '" class="thumbnail litpic" ><img src="'+turl+'" data-val="'+fid+'" data-url="'+turl+'"><div class="del_btn"></div></div>');
							$(".upload_btn").before($li);
				   },function(){
					$(".cancel_btn").click(); //隐藏弹窗
				   })
				}else{

					// 上传图片
					uploader = WebUploader.create({
						 auto: true,
						 swf: '/static/js/webuploader/Uploader.swf',
						//  server: '/include/upload.inc.php?test=1',
						 server: '/include/upload.inc.php?mod='+modelType+'&type=atlas',
						 pick: {
							id:'#filePicker'+i,
							multiple:multiple,
						},
						 fileVal: 'Filedata',
	
						 accept: {
							 title: i == 0 ? 'Images' : 'Video',
							 extensions: i == 0 ? 'jpg,jpeg,gif,png' : 'mp4,wmv,mov',
							 // mimeTypes: i == 0 ? '.jpg,.jpeg,.gif,.png' : '.mp4,.mov'
							 mimeTypes: i == 0 ? 'image/*' : 'video/*'
						 },
						 
						 compress: {
							//  width: 8000,
							//  height: 8000,
							 // 图片质量，只有type为`image/jpeg`的时候才有效。
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
					// 当有文件添加进来的时候
					uploader.on('fileQueued', function(file) {
						//先判断是否超出限制
						if(file.type.indexOf('video') > -1){
							tt.videoUp = true;
							// uploader.options.accept = {
							// 	title: 'Images',
							// 	extensions: 'jpg,jpeg,gif,png',
							// 	mimeTypes: '.jpg,.jpeg,.gif,.png'
							// };
							// $('#filePicker input[name="file"]').attr('accept','.jpg,.jpeg,.gif,.png')
	
						}
						if(fileCount == (atlasMax-1)){
							if(tt.videoUp){
								$(".upload_btn").hide()
							}
						}
						if(fileCount == atlasMax){
							if(file.type.indexOf('video') > -1){
								$(".upload_btn").hide()
							}else{
								showErrAlert(langData['siteConfig'][20][305]);//图片数量已达上限
								return false;
							}
						}
						if(file.type.indexOf('image') > -1){
	
							fileCount++;
						}
						tt.addFile(file);
						tt.hideUpfilePop(); //隐藏上传窗口
					});
					uploader.on('beforeFileQueued', function(file) {
						if(file.type.indexOf('image') > -1){  //上传文件为图片
							uploader.options.server = server_image_url;
						}else{
							uploader.options.server = server_video_url;
						}
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
							$li.find("img").attr('src',response.turl).attr("data-val", response.url).attr("data-url", (response.turl ? response.turl : (response.url.indexOf('http') > -1 ? response.url : '/include/attachment.php?f=' + response.url)));
							$li.find("video").attr("data-val", response.url)
								.attr("data-url", (response.turl ? response.turl : (response.url.indexOf('http') > -1 ? response.url : response.url)))
								// .attr('src',(response.turl ? response.turl : (response.url.indexOf('http') > -1 ? response.url : '/include/attachment.php?f=' + response.url)))
								.attr('src',response.url.indexOf('http') > -1 ? response.url : '/include/attachment.php?f=' + response.url)
								.attr('poster',response.poster)
								.attr('data-poster',response.poster)
								.attr('style', "background:url('/include/attachment.php?f="+response.poster+"');background-size: cover;");
	
						}else{
							this.removeFile(file);
							$li.remove();
							showErrAlert(langData['siteConfig'][20][306]+'！');//上传失败！
							// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
						}
					});
	
					// 文件上传失败，现实上传出错。
					uploader.on('uploadError', function(file){
						this.removeFile(file);
						uploader.removeFile(file);
						if(file.type.indexOf('video') > -1){
							tt.videoUp = false;
							uploader.options.accept = {
								title: 'Images/Video',
								extensions: 'jpg,jpeg,gif,png,mp4,mov',
								mimeTypes: '.jpg,.jpeg,.gif,.png,.mp4,.mov'
							};
							$('#filePicker input[name="file"]').attr('accept','.jpg,.jpeg,.gif,.png')
	
						}
						showErrAlert(langData['siteConfig'][20][306]+'！');//上传失败！
						// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
					});
	
					// 完成上传完了，成功或者失败，先删除进度条。
					uploader.on('uploadComplete', function(file){
						$('#'+file.id).find('.progress').remove();
						tt.countImgUrl();
					});
					//上传失败
					uploader.on('error', function(code){
						var txt = langData['siteConfig'][20][306]+'！';//上传失败！
						switch(code){
							case "Q_EXCEED_NUM_LIMIT":
								txt = langData['siteConfig'][20][305];//图片数量已达上限
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
				}

			})
		},
		addFile:function(file){
			// console.log(file)
			var ifPic = false;
			var uploadHtml = '<video></video><span class="bg_tip">视频</span>'
			if(file.type.indexOf('image') > - 1){
				ifPic = true;
				uploadHtml = '<img>'
			}
			var $li   = $('<div id="' + file.id + '" class="thumbnail '+(ifPic?"litpic":"video")+'" >'+uploadHtml+'</div>'),
				$btns = $('<div class="del_btn"></div>').appendTo($li),
				$img = $li.find('img');
			var tt = this;
			if(ifPic){
				// 创建缩略图
				uploader.makeThumb(file, function(error, src) {
					if(error){
						$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');//不能预览
						return;
					}
					$img.attr('src', src);
				}, thumbnailWidth, thumbnailHeight);
			}
				// 删除图片
				$btns.on('click', function(){
					if($li.hasClass('video')){
						tt.videoUp = false;
					}
					uploader.removeFile(file)
					tt.delimg();
					return false;
				});
				// 预览图片
				// $img.on('click',function(){
				// 	tt.imgShow = !tt.imgShow;
				// 	tt.imgshow(len);
				// 	console.log(len)
				// })
				if(ifPic){
					$(".upload_btn").before($li);
				}else{
					$('.imgUpload').prepend($li)
				}

		},
		// 负责view的销毁
		removeFile:function(file,type) {
			var $li = $('#'+file.id);
			fileCount--;
			// uploader.trigger('fileDequeued');
			$(".upload_btn").show()
			if($li.find("video").length){
				this.delAtlasPic($li.find("video").attr("data-val"));
			}else{
				this.delAtlasPic($li.find("img").attr("data-val"));
			}
			$li.remove();
			this.countImgUrl();
		},
		// 删除图片
		delAtlasPic:function(b){
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
		},
		// 删除图片
		delimg:function(f){
			var el = event.currentTarget, li=$(el).closest(".thumbnail");
			var file = [];
			file['id'] = li.attr("id");
			this.removeFile(file);
			// var index = li.attr('data-index');
			// $(".swiper-box .swiper-wrapper .swiper-slide[data-index='"+index+"']").remove();
			// swipershow.update();
		},
		// 数图片
		countImgUrl:function(){
			var imgUrl = [];
			$(".imgUpload .litpic").each(function(){
				var t = $(this);
				imgUrl.push(t.find('img').attr('data-val'));
			});
			$("#pro_banner").val(imgUrl.join(','));
		},

		// 开始录音
		startRecording(){
			var tt = this;
			tt.START = new Date().getTime();
			tt.recording = true;
			recordTimer = setTimeout(function(){
          wx.startRecord({
            success: function(){
              tt.recording = true;
            },
            cancel: function () {
              showErrAlert(langData['siteConfig'][46][86]);//用户拒绝授权录音
            }
          });
        },300);
		},

		// 停止录音
		stopRecord(){
			var tt = this;
			wx.stopRecord();
			tt.recording = false;
			tt.END = new Date().getTime();
			if((tt.END - tt.START) <= 300){
				showErrAlert(langData['info'][4][21]);  // '录音时间太短，无法识别人声'
			}else{
				showErrAlert(langData['info'][4][22]);  // '没有识别到人声，请重试'
			}
		},

		// 手动输入标签
		changeLab(id){
			var tt = this;
			var el = event.currentTarget;
			if(tt.currShowOptions){
				tt.currCustomItem = $(el).val();
				tt.onedit = true;
			}else{
				var arr = [];
				var editDD = $(".options_toChose dd[data-id='"+id+"']");
				var title = editDD.attr('data-title');
				var type = editDD.attr('data-type');
				if(type == 'text'){
					var valhas = false;  //已经有值
					for(var i=0; i < tt.dCustomArr.length; i++){
						var cst = tt.dCustomArr[i]
						if(cst.id == id){
							tt.dCustomArr[i].value = $(el).val();
							valhas = true;
							tt.hidePopInp();
							break;
						}
					}
					if(valhas) return false;
					tt.dCustomArr.push({
						id:id,
						type:title,
						value:$(el).val()
					})
				}else{
					var valhas = false;  //已经有值
					for(var i=0; i < tt.dCustomArr.length; i++){
						var cst = tt.dCustomArr[i]
						if(cst.id == id){
							if(tt.dCustomArr[i].valueArr_custom){
								if(editDD.find('.on_edit').length){
									var oldVal = editDD.find('.on_edit').text();
									var ind = editDD.find('.on_edit').attr('data-ind')
									if($(el).val()){
										tt.dCustomArr[i].valueArr_custom.splice(ind,1,$(el).val()); //编辑状态
									}else{
										tt.dCustomArr[i].valueArr_custom.splice(ind,1); //编辑状态
									}
									tt.dCustomArr[i].value_custom = tt.dCustomArr[i].valueArr_custom.join(','); //编辑状态
								}else{
									tt.dCustomArr[i].valueArr_custom.push($(el).val()) //新增
									tt.dCustomArr[i].value_custom = tt.dCustomArr[i].valueArr_custom.join(','); //编辑状态
								}
							}else{
								tt.dCustomArr[i]['valueArr_custom'] = [$(el).val()];
								tt.dCustomArr[i]['value_custom'] = $(el).val();
							}
							valhas = true;
							// console.log(tt.dCustomArr[i])
							tt.hidePopInp();
							break;
						}
					}
					if(valhas) return false;
					tt.dCustomArr.push({
						id:id,
						type:title,
						value:'',
						valueArr:[],
						valueArr_custom:[$(el).val()],
						value_custom:$(el).val(),
					})
	
				}
			}
			tt.hidePopInp();

		},

		// 多选
		onChose(id){
			var tt = this;
			var el = event.currentTarget;
			$(el).toggleClass('on_chose');
		},

		// 选定位
		toAddrChose(){
			var tt = this;
			var el = event.currentTarget;


			localStorage.setItem('infoData', JSON.stringify(tt.getAllData()));
			$(el).attr('href',mapUrl);
		},

		// 获取数据
		getAllData(){
			var tt = this;
			var desc = $("#desc").html();  //内容
			console.log(escape(desc))
			var imgArr = [];
			var imgpathArr = []
			var imgpathSourceArr = []
			$('.imgUpload .thumbnail.litpic').each(function(index, el) {
				var path = $(this).find('img').attr('data-url');
				var pathSource = $(this).find('img').attr('data-val');
				imgArr.push({
					path:path,
					pathSource:pathSource,
				});
				imgpathArr.push(pathSource)
				imgpathSourceArr.push(path)
			});
			var video = videoPoster = '';
			if($('.imgUpload .thumbnail.video video').length > 0){
				 video = $('.imgUpload .thumbnail.video video').attr('data-val');
                 videoPoster = $('.imgUpload .thumbnail.video video').attr('data-poster');
			}
			var returnurl = window.location.href;

			var moreValid = 0;  //默认有效期
			if($(".feeContainer .default_valid").length > 0 && !$(".feeContainer .default_valid").hasClass('on_chose')){
				moreValid = $(".feeContainer .default_valid").attr('data-time');
				moreValid = Number(moreValid)
			}

            var validtime = Number($(".feeContainer .on_chose").attr('data-time'));

			var data = [
				{name:'desc',value : desc },
				{name:'video',value : video },  //视频
				{name:'videoPoster',value : videoPoster },  //视频
				{name:'videoUrl',value : videoUrl },  //视频
				{name:'imgArr',value: imgpathArr.join('||'),source: imgpathSourceArr.join('||')},
				{name:'id',value:fabuid},
				{name:'modelType',value:modelType},
				{name:'returnUrl',value:returnurl},
				{name:'valid',value:(tt.valid * 1 + moreValid * 1)},
				{name:'validtime',value: oldValid > parseInt((new Date()).valueOf()/1000) && waitPay == '0' ? 0 : validtime},
				{name:'top',value:tt.setTop},
				{name:'amount',value:tt.countAmount},
				{name:'dCustomArr',value:JSON.stringify(tt.dCustomArr)},
				{name:'districtDetail',value:JSON.stringify(tt.districtDetail)}
			]
			if($("input[name='address']").val() == langData['info'][3][93]){
				$("input[name='address']").val('')
			}
			var formData = [...$("#formbox").serializeArray(),...data];
			return formData;
		},

		// 发布信息
		fabuInfo(haspay){
			var tt = this;
			var t = $(event.currentTarget);

			if(iosVirtualPaymentState && window.__wxjs_environment == 'miniprogram ' && !!navigator.userAgent.match(/(iPhone|iPod|iPad);?/i) && ((validOff <= 0  && opAct == 'edit')|| ((membervalid <= 0 || infoCount <= 0) && opAct == 'do'))){
				var popOptions = {
				    title: '温馨提示', //'确定删除信息？',  //提示文字
				    btnCancelColor: '#407fff',
				    isShow:true,
				    confirmHtml: '<p style="margin-top:.2rem;">'+ iosVirtualPaymentTip +'</p>' , //'一经删除不可恢复',  //副标题
				    btnCancel: '好的，知道了',
				    noSure: true
				}
				confirmPop(popOptions);
			}

			var form = $("#formbox"), action = form.attr("action"), tj = true;
			if(fabuid != 0){
				var dStr = '';
				if(haspay){
					tt.countAmount = 0; //改变钱数
					dStr = '&hasPay=1'
				}
				action = '/include/ajax.php?service=info&action=edit&moneyType=1&id='+fabuid+dStr;
			}


			var desc = $("#desc").html();
			// var username = $("input[name='username']").val();
			var phone = $("input[name='phone']").val();
			if(desc == ''){
				showErrAlert('请输入您要发布的信息内容');
				return false;
			}

			if(phone == ''){
				showErrAlert('请输入联系方式');
				return false;
			}
			// if(!(/^1[0-9][0-9]\d{4,8}$/.test(phone))){
			// 	showErrAlert('请输入正确的联系方式');
			// 	return false;
			// }
			if($("#vercode").hasClass('show') && $("#vercode").val() == ''){
				showErrAlert('请输入手机验证码');
				return false;
			}
			var goPut = true;  //是否继续提交
			$('.options_toChose dd').each(function(index, el) {
				var dd = $(this),inpType = dd.attr('data-type'),title = dd.attr('data-title');
				var tipText = (inpType=='text'?'请输入':'请选择') + title;
				if(dd.attr('data-required') == '1'){
					if((dd.find('input').length == 1 && dd.find('input').val() == '') || dd.find('input').length == 0 ){
						goPut = false;
						showErrAlert(tipText)
					}

				}
			});
			if(!goPut) return false;

            if(!tt.agreeProtocol){
                showErrAlert('请阅读并同意勾选《信息发布协议》');
				return false;
            }

            t.addClass("disabled").html(langData['siteConfig'][6][35]);

			$.ajax({
				url: action,
				data: tt.getAllData(),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						fabuid = data.info.aid;
						// if(data.info.aid != undefined && id == 0){
						// 	var urlNew = fabuSuccessUrl.replace("%id%", data.info.aid);
						// 	url = urlNew;
						// }

						let url=`${fabuSuccessUrl}?id=${fabuid||''}&ordernum=${data.info.ordernum||''}`;
						$('#tourl').val(url);
						if(!haspay && data.info.order_amount > 0){
							t.removeClass("disabled").html(langData['siteConfig'][11][19]);
							tt.check(data, url, t);
						}else{
							// var txt = !id ? '发布成功' : '修改成功'
							// showErrAlert(txt);
							// tt.successTip = true;
							// setTimeout(function(){
                            // window.location.href = !id ? `${fabuSuccessUrl}?id=${fabuid||''}&ordernum=${data.info.ordernum||''}` : manageUrl;
							if(data.amount == 0 || data.info.amount == 0){
								window.location.href = !id ? `${fabuSuccessUrl}?id=${fabuid||''}&ordernum=${data.info.ordernum||''}` : manageUrl;
							}else{
								payVue.paySuccessCall();
							}
							// },2000)
						}

					}else{
						showErrAlert(data.info)
						t.removeClass("disabled").html(langData['siteConfig'][11][19]);
					}
				},
				error: function(){
					showErrAlert(langData['siteConfig'][20][183]);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				}
			});

			// tt.successTip = true;
		},

		//验证支付结果
		checkPayResult(ordernum){
			var tt = this;
			$.ajax({
				type: 'POST',
				async: false,
				url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
				dataType: 'json',
				success: function(str){
					if(str.state == 100 && str.info != ""){
						console.log(222)
						clearInterval(validTrade);
						tt.fabuInfo(1)

					}
				}
			});

		},


		check(data, url, btn){
			url = url.split('#')[0];
			this.btn = btn;
			this.url = url;
			var tt = this;
			var tip = langData['siteConfig'][20][341], icon = "success.png";
			// 修改

				if (typeof (data.info) == 'object') {
					sinfo = data.info;
					service = 'member';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');
					$('#ordertype').val('fabuPay');

					$('#pfinal').val('1');
					$('#aid').val(sinfo.aid);
					$('#tourl').val(url);
					$('#amount').val(sinfo.order_amount);

					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');
					//
					// if (totalBalance * 1 < sinfo.amount * 1) {
					//
					// 	$("#moneyinfo").text('余额不足，');
					//
					// 	$('#balance').hide();
					// }
					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

						$('#balance').hide();
					}

					if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
						$("#bonusinfo").text('额度不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else if( bonus * 1 < sinfo.order_amount * 1){
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
					}
					ordernum = sinfo.ordernum;

					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout, sinfo);
					if(validTrade){
		        clearInterval(validTrade)
		      }
		      validTrade = setInterval(function(){
		        tt.checkPayResult(ordernum)
		      },2000)
				}


		},

		// 获取短信验证码
		getPhoneMsg:function(){
			var t = this;
			var btn =  event.currentTarget;
			var phone = $("#phone").val(),areacode = $("#codeChoose").val();
			if(phone == ''){
				showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
				return false;
			}else if(areacode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(phone)){
					showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
					return false;
				}
			}

			// 需要极验
			if (geetest ) {
				//弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
			}

			// 不需要极验
			if(!geetest){
				t.sendVerCode();
			}

		},

		// 极验
		handlerPopupReg:function(captchaObjReg){
			// 成功的回调
			var t = this;
			captchaObjReg.onSuccess(function () {
				var validate = captchaObjReg.getValidate();
				t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
				t.sendVerCode();

			});
			captchaObjReg.onClose(function () {
			})

			window.captchaObjReg = captchaObjReg;
		},

		// 发送验证码
		sendVerCode :function(captchaVerifyParam,callback){
			var t = this;
			let btn = $('.getcode')
			btn.addClass('noclick');
			var phone = $("#phone").val();
			// var areacode = $("#codeChoose").val();
			// +"&areaCode="+areacode
			var param = "phone="+phone 
			if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
				data: param,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(callback){
                        callback(data)
                      }
					//获取成功
					if(data && data.state == 100){
						t.countDown(60, btn);
						//获取失败
					}else{
						btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
						showErrAlert(data.info);
					}
				},
				error: function(){
					btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
					showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
				}
			});
		},

		// 倒计时
		countDown:function(time, obj, func){
			times = obj;
			obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1',time));  //1s后重新发送
			mtimer = setInterval(function(){
				obj.text(langData['siteConfig'][20][5].replace('1',(--time)));  //1s后重新发送
				if(time <= 0) {
					clearInterval(mtimer);
					obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
				}
			}, 1000);
		},

		// 是否显示
		checkVcode(){
			var tt = this;
			var el = event.currentTarget;
            if(!customFabuCheckPhone) return;
			if($(el).val() != bindTel){
				tt.showVcode = true;
			}else{
				tt.showVcode = false;
			}
		},



		// 显示选择弹窗
		showOptionPopCon(item){
			var tt = this;
			tt.showOptionPop = true;
			tt.currShowOptions = item;
			// console.log(item,tt.dCustomArr)
			// 判断是否有自定义的值
			var presetsArr = [],customArr = []
			var itemValue = ''
			var ind = ''
			if(item.custom == '1'){
				for(var i = 0; i < tt.dCustomArr.length; i++){
					if(item.id == tt.dCustomArr[i].id){ //找到当前正在设置值中的自定义值
						itemValue = tt.dCustomArr[i];  //当前正在编辑的item的设置的值
						ind = i; 
						break;
					}
				}
				if(itemValue && itemValue.valueArr){

					itemValue.valueArr.forEach(function(val){
						if(item.options.indexOf(val) > - 1){ //预设值
							presetsArr.push(val)
						}else{
							customArr.push(val)
						}
					});
					tt.dCustomArr[ind].value = presetsArr.join('、')
					tt.dCustomArr[ind].valueArr = presetsArr;
					
				}

				if(customArr.length > 0 && !tt.dCustomArr[ind].value_custom){
					tt.dCustomArr[ind].value_custom = customArr[0]
					tt.dCustomArr[ind].valueArr_custom = [customArr[0]];
					tt.currCustomItem = customArr[0]; //将自定义值的第一个 设为当前自定义的值
				}
			}


		},

		hideOptionPop(){
			var tt = this;
			tt.showOptionPop = false;
			tt.currShowOptions = '';
			tt.currChoseItem = ''
			tt.currCustomItem = ''
			tt.onedit = false; 
		},

		choseItem(item){
			var tt = this;
			console.log(tt.currShowOptions)
			if(tt.currShowOptions.formtype == 'radio'){
				tt.currChoseItem = [item]
			}else{
				var hasChoseArr = tt.currChoseItem ? tt.currChoseItem : [];
				var index = 0;
				if(!tt.currChoseItem){
					hasChoseArr = JSON.parse(JSON.stringify(tt.currShowOptions.default))
					for(var i = 0; i < tt.dCustomArr.length; i++){
						var dCustom =  tt.dCustomArr[i]
						if(dCustom.id == tt.currShowOptions.id){
							// hasChoseArr = dCustom.valueArr.length ? JSON.parse(JSON.stringify(dCustom.valueArr)) : (dCustom.default && dCustom.default.length ? JSON.parse(JSON.stringify(dCustom.valueArr)) : []);
							if(dCustom.valueArr.length){
								hasChoseArr = JSON.parse(JSON.stringify(dCustom.valueArr))
							}
							console.log(hasChoseArr)
							index = i
							break;
						}
					}
				}
	
				if(hasChoseArr.indexOf(item) > -1){
					hasChoseArr.splice(hasChoseArr.indexOf(item),1)
				}else{
					hasChoseArr.push(item)
				}
	
	
				tt.currChoseItem = hasChoseArr;
			}
			
		},

		confirmChose(){
			var tt = this;
			var index = null; 
			tt.currChoseItem = tt.trimSpace(tt.currChoseItem)
			for(var i = 0; i < tt.dCustomArr.length; i++){
				var dCustom =  tt.dCustomArr[i]
				if(dCustom.id == tt.currShowOptions.id){
					index = i;
					break;
				}
			}
			if(tt.dCustomArr && tt.dCustomArr.length && index != null){
				if(tt.currChoseItem ){
					tt.dCustomArr[index]['value'] = tt.currChoseItem.join(',')
					tt.dCustomArr[index]['valueArr'] = tt.currChoseItem;
				}
				// if(tt.currCustomItem && tt.currShowOptions.custom == '1'){
				if(tt.currShowOptions.custom == '1' && (tt.currCustomItem || tt.onedit)){
					tt.dCustomArr[index]['valueArr_custom'] = tt.currCustomItem && tt.currCustomItem != '' ? [tt.currCustomItem] : []
					tt.dCustomArr[index]['value_custom'] = tt.currCustomItem
				}
			}else{
				var obj = {}
				obj['id'] = tt.currShowOptions.id;
				obj['type'] = tt.currShowOptions.title;
				if(tt.currChoseItem ){
					obj['value'] = tt.currChoseItem.join(',')
					obj['valueArr'] = tt.currChoseItem;
				}else if(tt.currShowOptions.default && tt.currShowOptions.default.length && tt.currShowOptions.default[0] != '' ){
					obj['value'] = tt.currShowOptions.default.join(',')
					obj['valueArr'] = tt.currShowOptions.default;
				}else{
                    obj['value'] = ''
					obj['valueArr'] = [];
                }

				// if(tt.currCustomItem && tt.currShowOptions.custom == '1'){
					console.log(tt.currCustomItem + '1' , tt.onedit+ '2')
				if(tt.currShowOptions.custom == '1' && (tt.currCustomItem || tt.onedit)){
					obj['valueArr_custom'] = tt.currCustomItem &&  tt.currCustomItem != ''   ? [tt.currCustomItem] : []
					obj['value_custom'] = tt.currCustomItem
				}

				tt.dCustomArr.push(obj);
				
			}
			tt.hideOptionPop()
		},


		// 单选
		showSinglePop(item,value){
			var tt = this;
			var el = event.currentTarget;
			var idStr = $(el).attr('id')
			tt.currShowOptions = item;
			var currId = 0;
			var optList = item.options.map(function(val,ind){
				if(val == value){
					currId = ind	
				}
				return {
					id:ind,
					value:val
				}
			})
			var instance = mobiscroll.select('#'+idStr, {
				data:optList,
				headerText:tt.currShowOptions.title,
				dataText:'value',
				dataValue:'id',
				defaultValue:value,
				onSet: function (event, inst) {
					
					var chose_val = event.valueText
					
					if(tt.dCustomArr && tt.dCustomArr.length){

						var index = null;
						for(var i = 0; i < tt.dCustomArr.length; i++){
							var dCustom =  tt.dCustomArr[i]
							if(dCustom.id == tt.currShowOptions.id){
								index = i
								break;
							}
						}
						if(index != null){

							tt.dCustomArr[index].value = chose_val
							tt.dCustomArr[index].valueArr = [chose_val]
						}else{
							var obj = {}
							obj['id'] = tt.currShowOptions.id;
							obj['type'] = tt.currShowOptions.title;
							obj['value'] = chose_val
							obj['valueArr'] = [chose_val];
							tt.dCustomArr.push(obj)
						}
					}else{
						var obj = {}
						obj['id'] = tt.currShowOptions.id;
						obj['type'] = tt.currShowOptions.title;
						obj['value'] = chose_val
						obj['valueArr'] = [chose_val];
						tt.dCustomArr.push(obj)
					}

					tt.currShowOptions = '';
					tt.currChoseItem = ''
					tt.currCustomItem = ''

					instance.destroy()

				},

			})
			instance.show()
			instance.setVal(currId)
			$(el).removeClass("mbsc-sel-hdn");
		},


		trimSpace(array){  
			if(array && array.length ){

				for(var i = 0 ;i<array.length;i++)  
				{  
					if(array[i] == " " || array[i] == "" || array[i] == null || typeof(array[i]) == "undefined")  
					{  
						array.splice(i,1);  
						i= i-1;  
		   
					}  
				}  
			}
			return array;  
	   },
	   async getSetTop(){
		let data={
			service:'siteConfig',
			action:'refreshTopConfig',
			module:'info',
			act:'detail',
			typeid:typeid
		}
		let result=await ajax(data,{dataType:'json'});
		if(result.state==100){
			this.topSetList=result.info.config.topNormal;
		}
	   },
	   setTopFn(item){
		if(this.setTop>=0&&this.setTop==item.day){
			this.setToprice='';
			this.setTop='';
		}else{
			this.setToprice=item.price;
			this.setTop=item.day;
		}
		this.countAmount = (this.defaultPrice * 1 + this.fabuamount * 1+this.setToprice*1).toFixed(2);
		if(this.countAmount>0&&iosVirtualPaymentState){
			$('#fb_sub').addClass('iOS_miniprogram_nocash');
		}else{
			$('#fb_sub').removeClass('iOS_miniprogram_nocash');
		}
	   },

	   //获取分类详情 主要是为获取分类的父级名
	   async getTypeName(){
		let data={
			service:'info',
			action:'searchType',
			key:typename
		}
		let result=await ajax(data,{dataType:'json'});
		if(result.state==100){
			let typeid = $("#typeid").val()
			if(result.info.length){
				let obj = result.info.find(item => {return item.id == typeid})
				
				typename_all = obj && obj.typename.replace(/>/g,'-') || '';
				
			}
		}
	   },

		//   获取ai内容的 搜索关键字
		getAiKey(){
			const that = this;
			var desc = $("#desc").html().replace(/<br>/g,'\n');  //内容
			let customArr = [];
			let feature_text = []
			let featureValue_arr = that.featureValue.split(',')
			for(let i = 0; i < featureValue_arr.length; i++){
				let obj = that.features.find(item => {
					return item.id == featureValue_arr[i]
				})
				if(obj){
					feature_text.push(obj.name)
				}
			}
			if(feature_text && feature_text.length){
				customArr.push(`特色标签:${feature_text.join('、')}`)
			}
			for(let i = 0; i < that.dCustomArr.length; i++){
				if(that.dCustomArr[i].value ){
					customArr.push(`${that.dCustomArr[i].type}:${that.dCustomArr[i].value}`)
				}
			}
			
			
			
			return {
				typename:typename_all,
				note:desc.trim(),
				options:customArr,
				keyword:`我要发布一条${typename_all}信息，帮我生成描述，不要显示联系方式（可以写类似：立即联系、立即咨询，有意咨询，有意私聊或类似说法），已知信息参考：${customArr.join('、')}`,
				lastKey:`不要添加较多未知信息，不要有**、//、##等错误格式重复符号，不要有emoji表情`
			}
		},

		/***********新增验证当前定位是否是城市分站*************/
		// 验证是否开通城市分站
		checkCity:function(posiData){
			const that = this;
			$.ajax({
			    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+posiData.province+"&city="+posiData.city+"&district="+posiData.district+"&town="+posiData.town || '',
			    type: "POST",
			    dataType: "json",
			    success: function(data){
					if(data.state == 100){
						let cityInfo = data.info;
						// 已开通分站
						var name = posiData.name ==''?posiData.address:posiData.name;
						that.lnglat = posiData.lng+','+posiData.lat;
						// that.address = posiData.city +'  '+ posiData.district;
						that.address = name;
						that.districtDetail = JSON.stringify(posiData)
						that.addrArr = posiData.city + (posiData.district != 'undefined' && posiData.district != undefined ? ' ' + posiData.district : '');
					}else{
						if(fabuMapConfig == 2){
							// 提醒切换分站
							var popOptions = {
							  	title: '温馨提示', //'确定删除信息？', //提示文字
								btnCancelColor: '#407fff',
								isShow:true,
								confirmHtml: '<p style="margin-top:.2rem;">当前定位的城市未开通<br/>请先切换至已开通的城市定位</p>' , //'一经删除不可恢复', //副标题
								btnSure: '手动定位',
							}
							confirmPop(popOptions,function(){
								that.toAddrChose()
							},function(){
								location.replace(chanelIndex)
							})
						}else if(fabuMapConfig == 1){
							showErrAlert('您当前定位的城市未开通分站<br/>暂无法发布消息！');
							setTimeout(() => {
								location.replace(chanelIndex)
							},1500)
						}
					}
				},
			})
		},
  }
})
