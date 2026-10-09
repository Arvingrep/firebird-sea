var fileCount = 0,
	ratio = window.devicePixelRatio || 1,
	thumbnailWidth = 100 * ratio,   // 缩略图大小
	thumbnailHeight = 100 * ratio;  // 缩略图大小;
new Vue({
	el: '#page',
	data: {
		LOADING: false,
		shopType:[],
		tipShow:false,
	},
	mounted() {
		// 选择城市
		this.selectCity();
		this.uploadImg();

		var otherpeisongArr = []
		for(ps in otherpeisong){

			otherpeisongArr.push({
				id:ps,
				title:otherpeisong[ps]
			})
		}
		var billingpeisongArr = []
		for(ps in billingpeisong){

			billingpeisongArr.push({
				id:ps,
				title:billingpeisong[ps]
			})
		}
		var otherpeisongStrArr = []
		for(ps in otherpeisongStr){

			otherpeisongStrArr.push({
				id:ps,
				title:otherpeisongStr[ps]
			})
		}
		var thingcategoryStrArr = []
		for(ps in thingcategoryStr){

			thingcategoryStrArr.push({
				id:ps,
				title:thingcategoryStr[ps]
			})
		}





		mobiscroll.settings = {
			theme: 'ios',
			themeVariant: 'light',
			height:40,
			lang:'zh',

			headerText:true,
			calendarText:'',  //时间区间选择
		};

		var opeisong_chose = mobiscroll.select('#otherpeisong', {
			data:otherpeisongArr,
			dataText:'title',
			dataValue:'id',
			onSet: function (event, inst) {
				$("#otherpeisongid").val(inst._wheelArray)
			},
		});

		var billingpeisong_chose = mobiscroll.select('#billingpeisong', {
			data:billingpeisongArr,
			dataText:'title',
			dataValue:'id',
			onSet: function (event, inst) {
				$("#billingpeisongid").val(inst._wheelArray)
				if (inst._wheelArray == 3){
					$("#specify").show()
				}else{
					$("#specify").hide()

				}
			},
		});

		var otherpeisong_chose = mobiscroll.select('#otherpeisongStr', {
			data:otherpeisongStrArr,
			dataText:'title',
			dataValue:'id',
			onSet: function (event, inst) {
				$("#otherpeisongStrid").val(inst._wheelArray)
			},
		});
		var thingcategoryStr_chose = mobiscroll.select('#thingcategoryStr', {
			data:thingcategoryStrArr,
			dataText:'title',
			dataValue:'id',
			onSet: function (event, inst) {
				$("#thingcategoryStrid").val(inst._wheelArray)
			},
		});
		if($("#typeList li").length > 0) {
			if(defaultValue[0]=='' || defaultValue[1]==''){
				$("#Config_category_id_2").val($("#typeList li").eq(0).attr('data-val')+','+$("#typeList li").eq(0).find('li').eq(0).attr('data-val'))
				defaultValue = [$("#typeList li").eq(0).attr('data-val'),$("#typeList li").eq(0).find('li').eq(0).attr('data-val')]
			}
			var treelist = $('#typeList').mobiscroll().treelist({
				display: 'bottom',
				circular:false,
				defaultValue:defaultValue,
				onInit:function(){
					$("#Config_category_id").val($("#typeList li[data-val="+defaultValue[1]+"]").text())
				},
				onSet:function(valueText, inst){
					var val = valueText.valueText.split(' ')
					$("#Config_category_id_2").val(val[0]+','+val[1])
					$("#Config_category_id").val($("#typeList li[data-val="+val[1]+"]").text())

				},

			})
		}


	},
	methods: {
		// 显示提示
		showTip(){
			var tt = this;
			tt.tipShow = !tt.tipShow;
			setTimeout(function(){
				tt.tipShow = false;
			},3000)

		},
		/* 选择分类 */
		shopTypeShow:function(){
			$(".mask_scroll").show();
			$(".scroll_box").css('bottom',0)
		},
		// 确定选择的
		sureChose:function(){
			$(".scroll_box li").removeClass('chose_now');
			$(".scroll_box li.chosed").addClass('chose_before');
			this.cancelChose();
			var str = []
			$(".scroll_box li.chosed").each(function(){
				str.push($(this).text())
			})
			$("#Config_type_id").val(str.join(' '))
		},
		select:function(){
			var el = event.currentTarget;
			$(el).toggleClass('chosed');
			if($(el).hasClass('chosed')){
				$(el).addClass('chose_now')
			}else{
				$(el).removeClass('chose_now')
			}

		},
		// 取消选择
		cancelChose:function(){
			$(".mask_scroll").hide();
			$(".scroll_box").css('bottom','-6.6rem');
			$(".scroll_box li.chose_now").removeClass('chose_now chosed')
		},

		dataSubmit:function(){
			var form = $("#submitForm"), btn = $('.save_btn');
			var dotype = btn.attr('data-type');
			var license_image = $("#filePicker1").siblings('.litpic').find('img').attr('data-val');
			license_image=license_image?license_image:"";
			var license_image2 = $("#filePicker2").siblings('.litpic').find('img').attr('data-val');
			license_image2 = license_image2?license_image2:"";

			$(".scroll_box .chosed").each(function(){
				var id = $(this).attr('data-id');
				form.append('<input type="hidden" class="typeids" name="typeid[]" value="'+id+'">');
			})
			btn.attr('disabled');
			this.LOADING = true;
			axios({
				method: 'post',
				url: '?id='+shopid,
				data:form.serialize()+'&dotype='+dotype+'&business_license_img='+license_image+'&food_license_img='+license_image2,
			}).then((response)=>{
				var data = response.data
				if(data.state==100){

				}
				this.LOADING = false;
				btn.removeAttr('disabled');
				showErr(data.info);
			})
		},
		getCoord: function() {
			var tt = this;
			tt.LOADING = true;
			HN_Location.init(function(data) {
				$('input[name="coordX"]').val(data.lat);
				$('input[name="coordY"]').val(data.lng);
				tt.LOADING = false;
			})
		},
		uploadImg: function() {
			var tt = this;
			$(".upload_btn").each(function(){
				fileCount = 0;
				var t = $(this);
				let pick = t.attr('id');
				uploader = WebUploader.create({
					auto: true,
					swf: '/static/js/webuploader/Uploader.swf',
					server: '/include/upload.inc.php?mod=waimai&type=certificate',
					pick: '#'+pick,
					fileVal: 'Filedata',
					accept: {
						title: 'Images',
						extensions: 'jpg,jpeg,gif,png',
						mimeTypes: 'image/*'
					},
					compress: {
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
					fileNumLimit: 2,
					fileSingleSizeLimit: atlasSize
				});
				// 当有文件添加进来的时候
				uploader.on('fileQueued', function(file) {
					//先判断是否超出限制
					if(fileCount == (atlasMax-1)){
						$("#"+pick).hide()
					}
					if(fileCount == atlasMax){
						showErr(langData['siteConfig'][20][305]);//图片数量已达上限
						return false;
					}
					fileCount++;
					tt.addFile(file,pick)
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
				// 完成上传完了，成功或者失败，先删除进度条。
				uploader.on('uploadComplete', function(file){
					$('#'+file.id).find('.progress').remove();
					// tt.countImgUrl();
				});
				// 文件上传成功，给item添加成功class, 用样式标记上传成功。
				uploader.on('uploadSuccess', function(file, response){
					var $li = $('#'+pick).siblings('.litpic');
					if(response.state == "SUCCESS"){
						console.log(file.id)
						$li.find("img").attr("data-val", response.url).attr("data-url", response.turl);

					}else{
						this.removeFile(file);
						showErr(langData['siteConfig'][20][306]+'！');//上传失败！
					}
				});

			});
		},
		delimg:function(){
			var el = event.currentTarget,li=$(el).closest("dd").find(".upload_btn");
			var file = [];
			file['id'] = li.attr("id");
			this.removeFile(file);
		},
		// 负责view的销毁
		removeFile:function(file) {
			var $li = $('#'+file.id);
			fileCount--;
			$li.show();
			var $div = $li.siblings('.litpic');
			this.delAtlasPic($div.find("img").attr("data-val"));
			$div.remove();
		},
		// 删除图片
		delAtlasPic:function(b){
			var g = {
				mod: 'waimai',
				type: "delcertificate",
				picpath: b,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				url: "/include/upload.inc.php",
				data: $.param(g)
			})
		},
		addFile:function(file,pick){
			var tt = this;
			var $div = $('<div id="' + file.id + '" class="thumbnail litpic"><img></div>');
			var $btns = $('<div class="del_btn"></div>').appendTo($div);
			$img = $div.find('img');
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
			$("#"+pick).before($div)
			$("#"+pick).hide();

		},
		// 城市选择
		selectCity: function() {
			var sortBy = function(prop) {
				return function(obj1, obj2) {
					var val1 = obj1[prop];
					var val2 = obj2[prop];
					if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
						val1 = Number(val1);
						val2 = Number(val2);
					}
					if (val1 < val2) {
						return -1;
					} else if (val1 > val2) {
						return 1;
					} else {
						return 0;
					}
				}
			}

			var gzAddress = $(".gz-address"), //选择地址页
				gzAddrListObj = $(".gz-addr-list"), //地址列表
				gzAddNewObj = $("#gzAddNewObj"), //新增地址页
				gzSelAddr = $("#gzSelAddr"), //选择地区页
				gzSelMask = $(".gz-sel-addr-mask"), //选择地区遮罩层
				gzAddrSeladdr = $(".gz-addr-seladdr"), //选择所在地区按钮
				gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"), //关闭选择所在地区按钮
				gzSelAddrList = $(".gz-sel-addr-list"), //区域列表
				gzSelAddrNav = $(".gz-sel-addr-nav"), //区域TAB
				gzSelAddrSzm = "gz-sel-addr-szm", //城市首字母筛选
				gzSelAddrActive = "gz-sel-addr-active", //选择所在地区后页面下沉样式名
				gzSelAddrHide = "gz-sel-addr-hide", //选择所在地区浮动层隐藏样式名
				showErrTimer = null,
				gzAddrEditId = 0, //修改地址ID
				gzAddrOffsetTop = 0,
				gzAction = gzAddrSeladdr.attr("data-action") ? gzAddrSeladdr.attr("data-action") : "addr",
				gzAddrInit = {

					showChooseAddr: function() {
						$("html").addClass("fixed");
						gzAddress.show();
					}



					//获取区域
					,
					getAddrArea: function(id) {

						//如果是一级区域
						if (!id) {
							gzSelAddrNav.html('<li class="gz-curr"><span>' + langData['siteConfig'][7][2] + '</span></li>');
							gzSelAddrList.html('');
						}

						var areaobj = "gzAddrArea" + id;
						if ($("#" + areaobj).length == 0) {
							gzSelAddrList.append('<ul id="' + areaobj + '"><li class="loading">' + langData['siteConfig'][20][184] +
								'...</li></ul>');
						}

						gzSelAddrList.find("ul").hide();
						$("#" + areaobj).show();

						var param = gzAddrSeladdr.data('param') ? gzAddrSeladdr.data('param') : '';

						$.ajax({
							url: "/include/ajax.php?service=" + (window.modelType ? window.modelType : 'siteConfig') + "&action=" +
								gzAction,
							data: "type=" + id + param,
							type: "GET",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var list = data.info,
										hotList = [],
										cityArr = [],
										areaList = [],
										html1 = [];
									for (var i = 0, area, lower; i < list.length; i++) {
										area = list[i];
										lower = area.lower == undefined ? 0 : area.lower;
										areaList.push('<li data-id="' + area.id + '" data-lower="' + lower + '"' + (!lower ? 'class="n"' : '') +
											'>' + area.typename + '</li>');
										var pinyin = list[i].pinyin.substr(0, 1);
										if (cityArr[pinyin] == undefined) {
											cityArr[pinyin] = [];
										}
										cityArr[pinyin].push(list[i]);
									}
									//如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
									if (list.length > 20 && id == 0) {
										var szmArr = [],
											areaList = [];
										for (var key in cityArr) {
											var szm = key;
											// 右侧字母数组
											szmArr.push(key);
										}
										szmArr.sort();

										for (var i = 0; i < szmArr.length; i++) {
											html1.push('<li><a href="javascript:;" data-id="' + szmArr[i] + '">' + szmArr[i] + '</a></li>');

											cityArr[szmArr[i]].sort(sortBy('id'));

											// 左侧城市填充
											areaList.push('<li class="table-tit table-tit-' + szmArr[i] + '" id="' + szmArr[i] + '">' + szmArr[i] +
												'</li>');
											for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

												cla = "";
												if (!lower) {
													cla += " n";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}

												lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
												areaList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '"' + (cla !=
												"" ? 'class="' + cla + '"' : '') + '>' + cityArr[szmArr[i]][j].typename + '</li>');

												if (cityArr[szmArr[i]][j].hot == 1) {
													hotList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '">' + cityArr[
														szmArr[i]][j].typename + '</li>');
												}
											}
										}

										if (hotList.length > 0) {
											hotList.unshift('<li class="table-tit table-tit-hot" id="hot">' + langData['siteConfig'][37][79] +
												'</li>'); //热门
											html1.unshift('<li><a href="javascript:;" data-id="hot">' + langData['siteConfig'][37][79] +
												'</a></li>'); //热门

											areaList.unshift(hotList.join(''));
										}

										//拼音导航
										$('.' + gzSelAddrSzm + ', .letter').remove();
										gzSelAddr.append('<div class="' + gzSelAddrSzm + '"><ul>' + html1.join('') + '</ul></div>');

										$('body').append('<div class="letter"></div>');

										var szmHeight = $('.' + gzSelAddrSzm).height();
										szmHeight = szmHeight > 380 ? 380 : szmHeight;

										$('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight / 2 + 'px');

										$("#" + areaobj).addClass('gzaddr-szm-ul');

									} else {
										$('.' + gzSelAddrSzm).hide();
									}
									$("#" + areaobj).html(areaList.join(""));
								} else {
									$("#" + areaobj).html('<li class="loading">' + data.info + '</li>');
								}
							},
							error: function() {
								$("#" + areaobj).html('<li class="loading">' + langData['siteConfig'][20][183] + '</li>');
							}
						});


					}

					//初始区域
					,
					gzAddrReset: function(i, ids, addrArr, index) {

						var gid = i == 0 ? 0 : ids[i - 1];
						var id = ids[i];
						var addrname = addrArr[i];
						//全国区域
						if (i == 0) {
							gzSelAddrNav.html('');
							gzSelAddrList.html('');
						}

						var cla = i == addrArr.length - 1 ? ' class="gz-curr"' : '';
						gzSelAddrNav.append('<li data-id="' + id + '"' + cla + '><span>' + addrname + '</span></li>');

						var areaobj = "gzAddrArea" + (i == 0 ? 0 : ids[i - 1]);
						if ($("#" + areaobj).length == 0) {
							gzSelAddrList.append('<ul class="fn-hide" id="' + areaobj + '"><li class="loading">' + langData['siteConfig']
								[20][184] + '...</li></ul>');
						}
						$.ajax({
							url: "/include/ajax.php?service=" + (window.modelType ? window.modelType : 'siteConfig') + "&action=" +
								gzAction,
							data: "type=" + gid,
							type: "GET",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var list = data.info,
										areaList = [],
										hotList = [],
										cityArr = [],
										hotCityHtml = [],
										html1 = [];
									for (var i = 0, area, cla, lower; i < list.length; i++) {
										area = list[i];
										lower = area.lower == undefined ? 0 : area.lower;

										var pinyin = list[i].pinyin.substr(0, 1);
										if (cityArr[pinyin] == undefined) {
											cityArr[pinyin] = [];
										}
										cityArr[pinyin].push(list[i]);

										cla = "";
										if (!lower) {
											cla += " n";
										}
										if (id == area.id) {
											cla += " gz-curr";
										}
										areaList.push('<li data-id="' + area.id + '" data-lower="' + lower + '"' + (cla != "" ? 'class="' +
											cla + '"' : '') + '>' + area.typename + '</li>');
									}

									//如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
									if (list.length > 20 && index == 0) {
										var szmArr = [],
											areaList = [];
										for (var key in cityArr) {
											var szm = key;
											// 右侧字母数组
											szmArr.push(key);
										}
										szmArr.sort();

										for (var i = 0; i < szmArr.length; i++) {
											html1.push('<li><a href="javascript:;" data-id="' + szmArr[i] + '">' + szmArr[i] + '</a></li>');

											cityArr[szmArr[i]].sort(sortBy('id'));

											// 左侧城市填充
											areaList.push('<li class="table-tit table-tit-' + szmArr[i] + '" id="' + szmArr[i] + '">' + szmArr[i] +
												'</li>');
											for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

												cla = "";
												if (!lower) {
													cla += " n";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}


												lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
												areaList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '"' + (cla !=
												"" ? 'class="' + cla + '"' : '') + '>' + cityArr[szmArr[i]][j].typename + '</li>');

												if (cityArr[szmArr[i]][j].hot == 1) {
													hotList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '">' + cityArr[
														szmArr[i]][j].typename + '</li>');
												}
											}
										}

										if (hotList.length > 0) {
											hotList.unshift('<li class="table-tit table-tit-hot" id="hot">' + langData['siteConfig'][37][79] +
												'</li>'); //热门
											html1.unshift('<li><a href="javascript:;" data-id="hot">' + langData['siteConfig'][37][79] +
												'</a></li>'); //热门

											areaList.unshift(hotList.join(''));
										}

										//拼音导航
										$('.' + gzSelAddrSzm + ', .letter').remove();
										gzSelAddr.append('<div class="' + gzSelAddrSzm + '"><ul>' + html1.join('') + '</ul></div>');

										$('body').append('<div class="letter"></div>');

										var szmHeight = $('.' + gzSelAddrSzm).height();
										szmHeight = szmHeight > 380 ? 380 : szmHeight;

										$('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight / 2 + 'px');

										$("#" + areaobj).addClass('gzaddr-szm-ul');

									} else {
										$('.' + gzSelAddrSzm).hide();
									}

									$("#" + areaobj).html(areaList.join(""));
								} else {
									$("#" + areaobj).html('<li class="loading">' + data.info + '</li>');
								}
							},
							error: function() {
								$("#" + areaobj).html('<li class="loading">' + langData['siteConfig'][20][183] + '</li>');
							}
						});

					}

					//隐藏选择地区浮动层&遮罩层
					,
					hideNewAddrMask: function() {
						gzAddNewObj.removeClass(gzSelAddrActive);
						gzSelMask.fadeOut(500, function() {
							window.scrollTo(0, gzAddrOffsetTop);
						});
						gzSelAddr.addClass(gzSelAddrHide);
					}

				}


			//选择收货地址
			gzAddrInit.showChooseAddr();



			//选择所在地区
			gzAddrSeladdr.bind("click", function() {
				toggleDragRefresh('off');
				gzAddrOffsetTop = $(window).scrollTop();
				gzAddNewObj.addClass(gzSelAddrActive);
				gzSelMask.fadeIn();
				gzSelAddr.removeClass(gzSelAddrHide);

				var t = $(this),
					ids = t.attr("data-ids"),
					id = t.attr("data-id"),
					addrname = $("#cityName").text();
				gzAddrInit.getAddrArea(0);

			});

			//关闭选择所在地区浮动层
			gzSelAddrCloseBtn.bind("touchend", function() {
				gzAddrInit.hideNewAddrMask();
			})

			//点击遮罩背景层关闭层
			gzSelMask.bind("touchend", function() {
				gzAddrInit.hideNewAddrMask();
			});

			//选择区域
			gzSelAddrList.delegate("li", "click", function() {
				var t = $(this),
					id = t.attr("data-id"),
					addr = t.text(),
					lower = t.attr("data-lower"),
					par = t.closest("ul"),
					index = par.index();
				$('.' + gzSelAddrSzm).hide();
				if (id && addr) {

					t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
					gzSelAddrNav.find("li:eq(" + index + ")").attr("data-id", id).html("<span>" + addr + "</span>");


					//直接只选一级城市
					var addrname = [],
						ids = [];

					//把子级清掉
					gzSelAddrNav.find("li:eq(" + index + ")").nextAll("li").remove();
					gzSelAddrList.find("ul:eq(" + index + ")").nextAll("ul").remove();


					gzSelAddrNav.find("li").each(function() {
						addrname.push($(this).text());
						ids.push($(this).attr("data-id"));
					});

					gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd p").html(
						addrname.join(" "));
					gzAddrInit.hideNewAddrMask();
					$('#addr, #addrid, #cityid').val(id);
					$('#cityName').val(addrname.join(" "));


					//}

				}
			});

			//区域切换
			gzSelAddrNav.delegate("li", "touchend", function() {
				var t = $(this),
					index = t.index();
				t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
				gzSelAddrList.find("ul").hide();
				gzSelAddrList.find("ul:eq(" + index + ")").show();
				if (index == 0) {
					$('.' + gzSelAddrSzm).show();
				} else {
					$('.' + gzSelAddrSzm).hide();
				}
				gzSelAddrList.scrollTop(gzSelAddrList.find('ul:eq(' + index + ')').find('.gz-curr').position().top);
			});


			gzSelAddr.delegate("." + gzSelAddrSzm, "touchstart", function(e) {
				var navBar = $("." + gzSelAddrSzm);
				$(this).addClass("active");
				$('.letter').html($(e.target).html()).show();
				var width = navBar.find("li").width();
				var height = navBar.find("li").height();
				var touch = e.touches[0];
				var pos = {
					"x": touch.pageX,
					"y": touch.pageY
				};
				var x = pos.x,
					y = pos.y;
				$(this).find("li").each(function(i, item) {
					var offset = $(item).offset();
					var left = offset.left,
						top = offset.top;
					if (x > left && x < (left + width) && y > top && y < (top + height)) {
						var id = $(item).find('a').attr('data-id');
						var cityHeight = $('#' + id).position().top;
						gzSelAddrList.scrollTop(cityHeight);
						$('.letter').html($(item).html()).show();
					}
				});
			});

			gzSelAddr.delegate("." + gzSelAddrSzm, "touchmove", function(e) {
				var navBar = $("." + gzSelAddrSzm);
				e.preventDefault();
				var width = navBar.find("li").width();
				var height = navBar.find("li").height();
				var touch = e.touches[0];
				var pos = {
					"x": touch.pageX,
					"y": touch.pageY
				};
				var x = pos.x,
					y = pos.y;
				$(this).find("li").each(function(i, item) {
					var offset = $(item).offset();
					var left = offset.left,
						top = offset.top;
					if (x > left && x < (left + width) && y > top && y < (top + height)) {
						var id = $(item).find('a').attr('data-id');
						var cityHeight = $('#' + id).position().top;
						gzSelAddrList.scrollTop(cityHeight);
						$('.letter').html($(item).html()).show();
					}
				});
			});


			gzSelAddr.delegate("." + gzSelAddrSzm, "touchend", function() {
				$(this).removeClass("active");
				$(".letter").hide();
			})



			//自动定位
			if (typeof HN_Location == 'object' && gzAddrSeladdr.attr('data-ids') == '' && gzAddrSeladdr.attr('data-action') !=
				'type') {

				HN_Location.init(function(data) {
					if (data != undefined && data.province != "" && data.city != "" && data.district != "") {
						var province = data.province,
							city = data.city,
							district = data.district;
						$.ajax({
							url: "/include/ajax.php?service=siteConfig&action=verifyCityInfo&region=" + province + "&city=" + city +
								"&district=" + district,
							type: "POST",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var info = data.info;
									var cid = info.ids[info.ids.length - 1];
									gzAddrSeladdr
										.attr('data-ids', info.ids.join(" "))
										.attr('data-id', cid)
										.find("dd p").html(info.names.join(" "));
									$('#addr, #addrid').val(cid);
								}
							}
						})
					}
				})
			}

			// 扩展zepto
			$.fn.prevAll = function(selector) {
				var prevEls = [];
				var el = this[0];
				if (!el) return $([]);
				while (el.previousElementSibling) {
					var prev = el.previousElementSibling;
					if (selector) {
						if ($(prev).is(selector)) prevEls.push(prev);
					} else prevEls.push(prev);
					el = prev;
				}
				return $(prevEls);
			};

			$.fn.nextAll = function(selector) {
				var nextEls = [];
				var el = this[0];
				if (!el) return $([]);
				while (el.nextElementSibling) {
					var next = el.nextElementSibling;
					if (selector) {
						if ($(next).is(selector)) nextEls.push(next);
					} else nextEls.push(next);
					el = next;
				}
				return $(nextEls);
			};
		}
	}
})

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
