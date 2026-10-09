var fileCount = 0,
	ratio = window.devicePixelRatio || 1,
	thumbnailWidth = 100 * ratio,   // 缩略图大小
	thumbnailHeight = 100 * ratio;  // 缩略图大小;
var swipershow;
var propLen = $(".propList .catybox").length;  //属性的长度

var dataprop = {
	'name':'',
	'maxchoose':'1',
	'data':[
		{
			'value':'',
			'price':'',
		}
	]

}
var windowHeight = $(window).height();
new Vue({
	el:'#page',
	data:{
		menuList:[],
		submit_on:false,
		LOADING:false,
		imgShow:false,
		is_nature:Number(is_nature),
		propData:(propData==''||propData=='[]')?[{'name':'','maxchoose':'1','data':[{'value':'','price':''}]}]:JSON.parse(propData),
		windowHeight:windowHeight,  //窗口高度
		fileUpEnd:{},
	},
	// components:{
	// 	 'propComp' : propComp,
	// },
	created() {
		 this.getMenuList();
	},
	mounted() {
		swipershow = new Swiper('.swiper-container', {
		  slidesPerView:'auto',
		  observer:true,
		  observeParents:true,
		  pagination: {
			  el: '.pagenation',
			  type:"fraction",
			},
		});
		var tt = this;


		// 监听窗口高度变化
        window.onresize = () => {
            return (() => {
                window.screenHeight = $(window).height();
                tt.windowHeight = window.screenHeight
            })()
        }


		mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			height:40,
			lang:'zh',

			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
		};

		// 时间段
		mobiscroll.range('#stime', {
		    controls: ['time'],
		    endInput: '#etime',
			autoCorrect:false,
			hourText:langData['waimai'][11][218],  //'点'
			minuteText:langData['waimai'][6][125],  //分
			onSet: function (event, inst) {
				var enddate = inst._endDate;
				enddateFormat = tt.formatTime(enddate);
				var tlen = $(".chose_inp").size();
				$(".time_list").prepend('<span class="chose_inp">'+event.valueText+'-'+enddateFormat+'<em class="del_time"></em><input type="hidden" name="limit_time['+tlen+'][start]"  value="'+event.valueText+'" /><input type="hidden" name="limit_time['+tlen+'][stop]"  value="'+enddateFormat+'" /></span>')
				if($(".time_list .chose_inp").size()==6){
					$(".time_list .add_btn").hide()
				}else{
					$(".time_list .add_btn").show()
				}
			}
		});

		// 日期
		mobiscroll.range('#sdate', {
			controls: ['date'],
			min: new Date(),
			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
			lang:'zh',
			endInput: '#edate',
			dateFormat: 'yy-mm-dd',
			onSet: function (event, inst) {
				var enddate = inst._endDate;
				enddateFormat = tt.formatTime(enddate,1);
				$("#date_show").val(event.valueText+langData['waimai'][11][70]+enddateFormat)
			},

		});
		var Numlist = [];
		for(var i = 1; i <= 100; i++ ){
			Numlist.push({
				'id':i,
				'num':i,
			i})
		}
		var max_choose = mobiscroll.select('.change_value', {
					data:Numlist,
					dataText:'num',
					dataValue:'id',
					headerText:'最多可选',
					onSet: function (event, inst) {
						$(".onSelect input").val(event.valueText);
						var dl = $(".onSelect").closest('dl');
						var index = dl.attr('data-index');
						tt.propData[index].maxchoose = event.valueText
					},
				});


		// 删除选择的时间
		$("body").delegate('.del_time','click',function(){
			var t =$(this);
			t.closest('.chose_inp').remove();
			$(".time_list .add_btn").show()
		});


		this.uploadImage();

	},
	methods:{
		// 保存数据
		saveData:function(){
			var tt = this;
			let el = event.currentTarget;
			if($(el).hasClass('disabled')){
				showErrAlert('图片上传中,请稍后')
				return false;
			}

			let bool = false;
			for(let item in tt.fileUpEnd){
				if(tt.fileUpEnd[item] == false){
					bool = true;
					showErrAlert('图片上传中,请稍后')
					break;
				}
			}

			if(tt.submit_on || bool ) return false;
			tt.LOADING = true;
			tt.submit_on = true;
			var form = $("#formSumbmit")
			var stockvalid = $("input[name='stockvalid']").val(); //是否开启库存
			var stock = $("input[name='stock']").val(); //库存
			var is_day_limitfood = $("input[name='is_day_limitfood']").val(); //是否开启每日限购
			var day_limitfood = $("input[name='day_foodnum']").val(); //库存
			var is_limitfood = $("input[name='is_limitfood']").val(); //是否开启限购
			var foodnum = $("input[name='foodnum']").val(); //库存
			if(stockvalid=='1' && !stock){
				showErr(langData['waimai'][5][22]);   //请输入库存
				tt.LOADING = false;
				tt.submit_on = false;
				return false;
			}else if(is_day_limitfood=='1' && !day_limitfood){
				showErr(langData['waimai'][11][67]);   //请输入每日限购数量
				tt.LOADING = false;
				tt.submit_on = false;
				return false;
			}else if(is_limitfood=='1' && !foodnum){
				showErr(langData['waimai'][11][219]);   //请输入每人限购数量
				tt.LOADING = false;
				tt.submit_on = false;
				return false;
			}
			axios({
				method: 'post',
				url: 'waimaiFoodAdd.php?sid='+sid+'&id='+id,
				data:form.serialize() + '&body=' + encodeURIComponent($('.textarea').html()),
			})
			.then((response)=>{
				var data = response.data;
				showErr(data.info);
				if(data.state==100){
					location.href = '/wmsj/shop/manage-goods.php?sid='+sid+'&currentPageOpen=1';
				}
				tt.submit_on = false;
				tt.LOADING = false;
			})
		},

		// 删除商品
		del_pro:function(){
			var tt = this;
			if(tt.submit_on) return false;
			tt.submit_on = true;
			let param = new URLSearchParams();
			param.append('action', 'delete');
			param.append('id', id);
			axios({
				method: 'post',
				url: 'waimaiFoodList.php',
				data:param
			})
			.then((response)=>{
				var data = response.data;
				showErr(data.info);
				$(".delMask").removeClass('show');
				$(".delAlert").hide();
				tt.submit_on = false;
				location.href = '/wmsj/shop/manage-goods.php?sid='+sid+'&currentPageOpen=1';
			})
		},
		// 隐藏删除确认框
		hideConfirm:function(){
			$(".delMask").removeClass('show');
			$(".delAlert").hide();
		},
		// 显示删除确认框
		showConfirm:function(){
			$(".delMask").addClass('show');
			$(".delAlert").show();
		},
		// 时间格式化
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
		// 删除图片
		delimg:function(f){
			var el = event.currentTarget,li=$(el).closest("dd");
			var file = [];
			file['id'] = li.attr("id");
			this.removeFile(file);
			var index = li.attr('data-index');
			$(".swiper-box .swiper-wrapper .swiper-slide[data-index='"+index+"']").remove();
			swipershow.update();
		},
		show_delimg:function(){
			var index = $(".swiper-box .swiper-wrapper .swiper-slide-active").attr('data-index');
			$('.imgBox.catybox dd[data-index="'+index+'"]').find(".del_btn").click();
		},
		imgshow:function(index = 0){
			swipershow.slideTo(index)
		},
		/* 上传图片相关 */
		uploadImage:function(){
			var tt = this;
			tt.countImgUrl()
			// 上传图片
			uploader = WebUploader.create({
			 	auto: true,
			 	swf: '/static/js/webuploader/Uploader.swf',
			 	server: '/include/upload.inc.php?mod='+modelType+'&type=atlas',
			 	pick: '#filePicker',
			 	fileVal: 'Filedata',
			 	accept: {
			 		title: 'Images',
			 		extensions: 'jpg,jpeg,gif,png',
			 		mimeTypes: 'image/*'
			 	},
			 	compress: {
			 		width: 750,
				 	height: 750,
				 	// 图片质量，只有type为`image/jpeg`的时候才有效。
				 	quality: 100,
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
				if(fileCount == (atlasMax-1)){
					$(".upbtn").hide()
				}
				if(fileCount == atlasMax){
					alert(langData['siteConfig'][20][305]);//图片数量已达上限
					// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
					return false;
				}

				fileCount++;
				tt.addFile(file);
				$(".btn_save").addClass('disabled');

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
				$(".btn_save").removeClass('disabled')
				if(response && response.state == "SUCCESS"){
					$li.find("img").attr("data-val", response.url).attr("data-url", response.turl);
					var len = $(".swiper-wrapper .swiper-slide:last-child").attr('data-index')*1+1;
					$(".swiper-wrapper").append('<div class="swiper-slide" data-index="'+len+'"><img src="'+response.turl+'" alt=""></div>');
					swipershow.update();
				}else{
					this.removeFile(file);
					alert(langData['siteConfig'][20][306]+'！');//上传失败！
					// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
				}
			});

			// 文件上传失败，现实上传出错。
			uploader.on('uploadError', function(file){
				this.removeFile(file);
				alert(langData['siteConfig'][20][306]+'！');//上传失败！
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
				alert(txt);
				// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
			});

		},
		addFile:function(file){
			let picLen = $(".thumbnail.litpic").length > 0 ? $(".thumbnail.litpic").length : 1
			var len = ($(".thumbnail.litpic").eq(picLen - 1).attr('data-index')*1 || 0 ) + 1;
			var $li   = $('<dd id="' + file.id + '" class="thumbnail litpic" data-index="'+len+'"><img></dd>'),
				$btns = $('<div class="del_btn"></div>').appendTo($li),
				$img = $li.find('img');
			var tt = this;
				// 创建缩略图
				uploader.makeThumb(file, function(error, src) {
						if(error){
							$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');//不能预览
							return;
						}
						$img.attr('src', src);
					}, thumbnailWidth, thumbnailHeight);
				// 删除图片
				$btns.on('click', function(){
					tt.delimg();
				});
				// 预览图片
				$img.on('click',function(){
					tt.imgShow = !tt.imgShow;
					let ind = $li.attr('data-index') - 1
					tt.imgshow(ind);
				})
				$(".upbtn").before($li);

		},
		// 负责view的销毁
		removeFile:function(file) {
			var $li = $('#'+file.id);
			fileCount--;
			$(".upbtn").show()
			this.delAtlasPic($li.find("img").attr("data-val"));
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
		// 数图片
		countImgUrl:function(){
			var imgUrl = [];
			$(".imgBox dd.litpic").each(function(){
				var t = $(this);
				imgUrl.push(t.find('img').attr('data-val'));
			});
			$("#pro_banner").val(imgUrl.join(','));
		},

		// 获取分类
		getMenuList:function(){
			var tt = this;
			axios({
				method: 'post',
				url: 'goods-type.php?sid='+sid+'&gettype=ajax',

			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					tt.menuList = data.info.list;
					var instance = mobiscroll.select('#typename', {
						data:tt.menuList,
						dataText:'title',
						dataValue:'id',
						onSet: function (event, inst) {
							$("#typeid").val(inst._wheelArray)
						},
					})
					if(typeid){
						instance.setVal(typeid,true);
						// instance.select(typeid)
					}else{
						// console.log(tt.menuList[0].id)
						typeid = tt.menuList[0].id;
						$("#typeid").val(tt.menuList[0].id);
						// console.log($("#typeid").val())
					}



				}
			})
		},

		// 日期选择
		dataChose:function(){
			$("#sdate").click();
		},

		// 时间选择
		timeChose:function(){
			$("#stime").click();
		},

		// input 监听
		onInput:function(){
			var el = event.currentTarget;
			var val = $(el).val();
			var inpName = $(el).attr('name')
			if(val.indexOf(echoCurrency('symbol'))>-1){
				$(el).val(echoCurrency('symbol') + val.split(echoCurrency('symbol'))[1]);
				$(el).next('input').val(val.split(echoCurrency('symbol'))[1])
				if(inpName == 'dabao_money_r' ){
					var is_dabao = (val.split(echoCurrency('symbol'))[1] && Number(val.split(echoCurrency('symbol'))[1]) > 0)? 1 : 0;
					$("#is_dabao").val(is_dabao)
					console.log(is_dabao)
				}
			}else if(val!=''){
				$(el).val(echoCurrency('symbol') + val);
				$(el).next('input').val(val)
			}

		},
		setMain:function(){
			var el = event.currentTarget;
			var index = $(".swiper-slide.swiper-slide-active").attr('data-index');
			var html1 = $("dd.litpic[data-index='"+index+"']");
			var html2 = $(".swiper-slide.swiper-slide-active");
			$(".swiper-box .swiper-wrapper").prepend(html2)
			$(".imgBox.catybox dt").after(html1);
			swipershow.update();
			swipershow.slideTo($(".swiper-slide[data-index='"+index+"']").index());
			this.countImgUrl()
		},
		// 滑动按钮
		switchTrggle:function(){
			var el = event.currentTarget;
			var val = $(el).attr("data-val");
			$(el).toggleClass('active');
			val = val=='0'?"1":"0";
			$(el).attr("data-val",val);
			$(el).next('input').val(val)
		},

		// 新增属性
		addPro:function(){
			propLen = $(".propList .catybox").length;
			console.log(this.propData)
			if(!this.propData) {
				this.propData = [];
			}
			this.propData.push({
					'name':'',
					'maxchoose':'1',
					'data':[
						{
							'value':'',
							'price':'',
						}
					]})
		},

		// 删除属性
		delDl:function(){
			var el = event.currentTarget;
			var dl = $(el).closest('dl');
			var index = $(dl).attr('data-index');
			this.propData.splice(index,1);
		},

		// 增加属性值
		addppValue:function(){
			var el = event.currentTarget;
			var dl = $(el).closest('dl');
			var index = $(dl).attr('data-index');
			this.propData[index].data.push({
				'value':'',
				'price':'',
			})
		},

		// 删除属性值
		delpopValue:function(){
			var el = event.currentTarget;
			var dl = $(el).closest('dl');
			var index = $(dl).attr('data-index');
			var pvIndex = $(el).closest('dd').attr('data-index');
			this.propData[index].data.splice(pvIndex,1)
		},

		// 值变化
		valChange: function(){
			var el = event.currentTarget;
			var dl = $(el).closest('dl'),index = dl.attr('data-index');
			var dd = $(el).closest('dd'),ii = dd.attr('data-index');
			var pv = $(el).attr('data-prop')
			if(dd.length > 0){
				this.propData[index].data[ii][pv] = $(el).val()
			}else{
				this.propData[index][pv] =  $(el).val()
			}

		},

		changeMax: function(){
			$(".right_box").removeClass('onSelect');
			var el = event.currentTarget;
			$(el).addClass('onSelect');
			$(".change_value").click();
		},

		// 属性图片
		fileChange(obj,e){
			const that = this
			let file = e.target['files'][0]   
			let inputName = $(e.currentTarget).closest('.picbox').find('input[type="hidden"]').attr('name').replace(/\[/g,'_').replace(/\]/g,'')     
			
			that.$set(that.fileUpEnd,inputName,false)   
            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsDataURL(file); 
                reader.onload = function(e) {
                    var formData = new FormData();
                    let tempPath = this.result;
					that.$set(obj,'pic',tempPath)
                    formData.append("Filedata", file);
                    formData.append("name", file.name);
                    formData.append("lastModifiedDate", file.lastModifiedDate);
                    formData.append("size", file.size);
                    that.uploadImg(formData,obj,inputName)
                    
                }
            } 
		},

		 /**
         * 逐个上传图片
         * @param {object} data 上传图片所需的formdata格式的数据
         * @param {string} paramStr  上传成功之后 要修改的对应的值
		 * @param {string} key  上传成功之后 要修改的对应的值
         * */ 
         uploadImg(data,obj,key){
            const that = this;
            $.ajax({
                accepts:{},
                url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
                data: data,
                type: "POST",
                processData: false, // 使数据不做处理
                contentType: false,
                dataType: "json",
                success: function (data) {
					that.$set(that.fileUpEnd,key,true); //表示图片上传成功 
                    if(data.state == 'SUCCESS'){
                        let imgPath = data.turl
						that.$set(obj,'pic',imgPath)
                    }else{
                        alert('图片上传失败，请稍后重试');
                    }
                },
                xhr:function(){
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.onprogress = function(e) {
                            if (e.lengthComputable) {
                                var percent = Math.floor( e.loaded / e.total * 100);
                                console.log(percent);
                                if(percent == 100){
                                    // $(".barColor").hide();
                                }else{
                                   console.log(percent)
                                }
                            }
                        };
                    }
                    return xhr;
                },
                error: function () { }
            });
        },
	},

	watch:{
		windowHeight(){
			var tt = this;
			if(tt.windowHeight < windowHeight){
			  $('body').css('padding-bottom',(windowHeight - tt.windowHeight)+'px')

			}else{
				$('body').removeAttr('style')
			}
		}
	}
});


var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }
