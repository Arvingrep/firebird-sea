$(function(){

	// 相关变量定义
	var page = 1, pageSize = 20;

	var loadMoreLock = false;

  	var qindex = 0 ;

	var device = navigator.userAgent;
	// 判断设备类型，ios全屏
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
		$('.header').addClass('padTop20');
	}

	var swiper = new Swiper('.swiper-container.fb_swiper', {
	      autoHeight: true,
		  observer:true,
		  observeSlideChildren:true,
		  observeParents:true,
		  touchAngle : 30,
      	  // initialSlide :qindex,
		  on: {
			  init:function(){

				  //var type = $('.fbtab_li li').eq(this.activeIndex).attr('data-type');  //获取当前页的模块名称
				  getlist();
			  },
			  slideChangeTransitionStart: function(){
				  // $(".swiper-container").css({"height":$(window).height()})
			  },
			  slideChangeTransitionEnd: function(){

				$('.fbtab_li li').removeClass('on_tab');
				$('.fbtab_li li').eq(this.activeIndex).addClass('on_tab');

				var end = $('.on_tab').offset().left + $('.on_tab').width() / 2 - $('body').width() /2;
				var star = $(".fbtab_li ul").scrollLeft();
				$('.fbtab_li ul').scrollLeft(end + star);  //靠边的使其居中
				var type = $('.fbtab_li li').eq(this.activeIndex).attr('data-type');  //获取当前页的模块名称
				// $(".swiper-container").css({"height":"auto"})
				if($(".swiper-slide[data-type='"+type+"']>ul>li").length==0){
					console.log('111')
					getlist();
				}else{
					console.log('已经加载了')
				}


			  },

		  },
	});
	if(qmodule!='circle' && qmodule){
		qindex = $('.fb_swiper .swiper-slide[data-type="'+qmodule+'"]').index();
		swiper.slideTo(qindex)
	}

	$('.fbtab_li li').click(function(){
		swiper.slideTo($(this).index())
	})

	//数据获取
	function getlist(){
		var active = $(".fbtab_li .on_tab");

		if(active.size() <= 0){
			return;
		}

		var type = active.attr("data-type");
		var page = active.attr('data-page');
		if(type=='tieba'){  //贴吧
			url = "/include/ajax.php?service=tieba&action=tlist&uid="+uid+"&page="+page+"&pageSize="+pageSize;
		}else if(type=='live'){   //直播
			url = "/include/ajax.php?service=live&action=alive&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='huodong'){  //活动
			url = "/include/ajax.php?service=huodong&action=hlist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='vote'){   //投票
			url = "/include/ajax.php?service=vote&action=vlist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='info'){  //二手
			url = "/include/ajax.php?service=info&action=ilist_v2&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='house'){ // 房产
			url = "/include/ajax.php?service=house&action=allhouseFabu&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='education'){  //教育
			url = "/include/ajax.php?service=education&action=coursesList&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='marry'){  //婚嫁
			url = "/include/ajax.php?service=marry&action=storeList&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='homemaking'){  //家政
			url = "/include/ajax.php?service=homemaking&action=hlist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='travel'){   //旅游
			// 此处只是旅游攻略的接口
			url = "/include/ajax.php?service=travel&action=getAlldata&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='car'){  //汽车
			url = "/include/ajax.php?service=car&action=car&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}else if(type=='video'){  //视频
			url = "/include/ajax.php?service=video&action=alist&userid="+uid+"&page=" + page + "&pageSize="+pageSize;
		}

		$('.loading').remove();
		$('.'+type+'_slide').append('<div class="loading loadimg"></div>');
		loadMoreLock = true;
		$.ajax({
		      url: url,
		      type: "GET",
		      dataType: "jsonp",
		      success: function(data){
				  if(data && data.state!=200){
					  if (data.state == 101) {
							$('.loading').remove();
							$('.'+type+'_slide').append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
					   }else{
						   var list = data.info.list,
						   tiebaHtml = [], voteHtml = [], huodongHtml = [], carHtml = [], homemakingHtml = [], travelHtml = [],
						   eduHtml = [], videoHtml = [], houseHtml = [], infoHtml = [], liveHtml=[], marryHtml = [];
						   var bimgHtml = []; //大图模式；
						   var flowHtml1 = [],flowHtml2 = []; //瀑布流模式；
						   var totalPage = data.info.pageInfo.totalPage;
						   active.attr('data-totalPage', totalPage);

						   for(var i=0; i<list.length; i++){
							   if(type == 'tieba'){
								  tiebaHtml.push('<li class="tie_li"><a href="'+list[i].url+'">');
								  tiebaHtml.push('<p class="fb_time">'+list[i].pubdate1+'</p>');
								  tiebaHtml.push('<h3 class="tie_title" >'+list[i].title+'</h3>');
								  tiebaHtml.push('<div class="imggroup">');
								  for(let m=0; m<((list[i].imgGroup.length>3)?3:(list[i].imgGroup.length));m++){
									  tiebaHtml.push('<div class="pro_img"><img data-url="'+list[i].imgGroup[m]+'" src="/static/images/blank.gif" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
								  }

								  tiebaHtml.push('</div>');
								  tiebaHtml.push('<div class="tie_count"><span class="tie_read"><i></i><em>'+list[i].click+'</em></span><span class="tie_com"><i></i><em>'+list[i].reply+'</em></span></div>');
								  tiebaHtml.push('</a></li>');

							   }//以上为贴吧数据拼接

							   else if(type == 'live' || type == 'vote' || type == 'huodong'){
								   bimgHtml.push('<li data-id="'+list[i].id+'"><a href="'+list[i].url+'">');
								   bimgHtml.push('<div class="pro_img">');
								   bimgHtml.push('<img data-url="'+list[i].litpic+'"  src="/static/images/blank.gif"  onerror="this.src=\'/static/images/404.jpg\'" alt="">');
								   if(type == 'live' ){
									   var state = (list[i].state==0)?"live_before":list[i].state==1?"living":"live_after";
									   bimgHtml.push('<i class="video_state '+state+'">'+(list[i].state==0?list[i].ftime:"")+'</i>');
									   bimgHtml.push('<p><i></i> <em>'+list[i].click+'</em></p>');
								   }
								   bimgHtml.push('</div>');
								   bimgHtml.push('<div class="pro_info"><h2>'+list[i].title+'</h2>');
								   if(type == 'huodong'){
									   bimgHtml.push('<div class="pro_detail">');
									   bimgHtml.push('<p class="act_time"><i></i><span>'+timestampToTime(list[i].began)+'</span></p>');
									   bimgHtml.push('<p class="act_addr"><i></i><span>'+list[i].addrname.join(' ')+'</span></p>');
									   bimgHtml.push('<p class="act_bm"><i></i><span>'+langData['siteConfig'][51][44].replace('1',list[i].reg)+'</span></p>');  //已报名<em>'+list[i].baoming+'</em>人
									   bimgHtml.push('</div>');
									   bimgHtml.push('<span class="price '+(list[i].feetype=="0"?"free":"")+'">'+(list[i].feetype=="0"?langData['siteConfig'][19][427]:echoCurrency('symbol')+"<em>"+Number(list[i].mprice).toFixed(0)+"</em>起")+'</span>');
									   //免费----收费
								   }else if(type == 'vote'){
									   bimgHtml.push('<div class="count_li">');
									   bimgHtml.push('<span class="vote_num"><em>'+list[i].join+'</em></span>');
									   bimgHtml.push('<span class="read_num"><em>'+list[i].click+'</em></span>');
									   bimgHtml.push('</div><button class="vote_btn" type="button">'+langData['siteConfig'][51][45]+'</button>');   //去投票
								   }else if(type == 'live'){
									   bimgHtml.push('<p>#'+list[i].typename+' <em>'+list[i].ftime+'</em></p>');
									   if(uid != loginId){
										   let txt = list[i].booking==0?langData['siteConfig'][26][80]:langData['siteConfig'][51][46];   //预约   已预约
										   let yued = list[i].booking==0?"":"yued";
										   let hide = list[i].state==0?"":"fn-hide"
										   bimgHtml.push('<button class="yuyue_btn '+yued+' '+hide+'" type="button"><i class="yue_icon"></i><em>'+txt+'</em></button>');
									   }

								   }
								   bimgHtml.push('</div></a></li>');
							   }//以上为单张大图展示

							   else if(type == 'house' || type == 'travel' || type == 'video' || type == 'info' || type == 'car' || type == 'marry' || type == 'homemaking' || type == 'education' ){
								var li_class = "", idiv='',ifdiv= '',price='';
								var imgsrc = page==1?list[i].litpic:"/static/images/blank.gif";
								if(list[i].price && type != 'info'){
									price='<div class="price">'+echoCurrency('symbol')+'<i>'+(list[i].price.split('.')[0])+'</i>.'+list[i].price.split('.')[1]+'</div>';
								}

								// if(type == 'info'){
								// 	price = 'video_li'
								// }
								if(type == 'video'){
									li_class = 'video_li'
								}
								if(type == 'travel'){
									var typename = "攻略";
									//此处需判断是攻略还是视频
									li_class = 'gl_li';
									if(list[i].moduletype == 'video'){
										li_class = 'video_li';
										var typename = "视频";

									}
									idiv='<div class="pro_label">'+typename+'</div>';
									// price='<div class="price">'+echoCurrency('symbol')+'<i>3600</i>.00</div>'
								}
								if(type == 'house'){
									// 此处需判断房源类型
									var pro_label = '';
									var priceinfo 	  = '';
									switch (list[i].moduletype) {
										case 'zu':
											pro_label = langData['siteConfig'][19][219];  //租房
											priceinfo = list[i].price > 0 ? (list[i].price+echoCurrency('short')+'/'+langData['siteConfig'][40][45]) : langData['siteConfig'][51][16];
											break;
										case 'sale':
											pro_label = langData['siteConfig'][19][218];  //二手房
											priceinfo = list[i].price > 0 ? (list[i].price+ langData['siteConfig'][13][27] + echoCurrency('short')) : langData['siteConfig'][51][16];  //价格面议
											break;
										case 'xzl':

											if(list[i].type == 0)
											{
												var priceinfo = list[i].price>0 ? parseInt(list[i].price * list[i].area).toFixed(0) + echoCurrency('short')+'/'+langData['siteConfig'][40][45] : langData['siteConfig'][46][70];

											}else{

												var priceinfo = list[i].price>0 ? list[i].price + langData['siteConfig'][13][27] : langData['siteConfig'][46][70];  //面议

											}
											pro_label = langData['siteConfig'][19][220];  //写字楼
											break;
										case 'sp':
											if(list[i].price != 0){
												var ptype = echoCurrency('short')+ '/'+langData['siteConfig'][40][45];
												if(list[i].type == 1){
													ptype = langData['siteConfig'][13][27];
												}
												priceinfo = list[i].price+ptype;
											}else{
												priceinfo =  langData['siteConfig'][51][16];
											}
											pro_label = langData['siteConfig'][19][221];  //商铺
											break;
										case 'cf':

											var price = '';
											if(list[i].price > 0) {
			                                    if (list[i].type == 0) {
			                                        priceinfo = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];  //月
			                                    } else if (list[i].type == 1) {
			                                        priceinfo = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];
			                                    } else if (list[i].type == 2) {
			                                        priceinfo = list[i].price + '万';
			                                    }
			                                }else{
											    priceinfo = langData['siteConfig'][46][70];  //面议
			                                }
											pro_label = langData['siteConfig'][19][761];  //厂房
											break;
										case 'cw':
											if(list[i].price > 0) {
			                                    if (list[i].type == 0) {
			                                        priceinfo = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];  //月
			                                    } else if (list[i].type == 2) {
			                                        priceinfo = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];  //月
			                                    } else if (list[i].type == 1) {
			                                        priceinfo = list[i].price +langData['siteConfig'][13][27]; // '万';
			                                    }
			                                }else{
											    priceinfo = langData['siteConfig'][46][70];  //面议
			                                }
											pro_label = langData['siteConfig'][31][7];  //车位
											break;
										default:
											pro_label = '';
											break;
									}
									idiv = '<div class="pro_label">'+pro_label+'</div>'
									// price='<div class="price"><i>'+priceinfo+'</i>'+langData['siteConfig'][31][111]+'</div>';   //   元/月
									price='<div class="price"><i>'+priceinfo+'</i></div>';   //   元/月
								}

								if(type == 'car'){
									// 年1万公里
									ifdiv = '<div class="pro_time">'+(list[i].cardtime1.split('-')[0])+langData['siteConfig'][13][14]+' / '+langData['siteConfig'][51][22].replace("1",list[i].mileage)+'</div>';
									//万
									price='<div class="price"><i>'+list[i].price+'</i>'+langData['siteConfig'][13][27]+'</div>';
								}else if(type =='education'  ){
									ifdiv = '<div class="pro_type">'+list[i].classname+'</div>'
								}else if(type =='homemaking'){

									ifdiv = '<div class="pro_type">'+list[i].flagAll.jc[0]+'</div>'
								}

								// 有小程序的模块
								var clsName = '';
								if(type == 'info' || type == 'sfcar' || type == 'tuan' || type == 'task' || type == 'info' || type == 'shop' || type == 'job' || type == 'waimai'){
									clsName = 'toMini'
								}
								if(i%2==1){
									flowHtml1.push('<li data-id="'+list[i].id+'" class="'+li_class+'"><a href="'+list[i].url+'" data-module="'+type+'" data-temp="detail" data-id="'+list[i].id+'" class="'+clsName+'">');
									flowHtml1.push('<div class="pro_img">');
									flowHtml1.push('<img data-url="'+(list[i].litpic?list[i].litpic:'/static/images/miniprograme/info/default_info.png')+'"  src="'+imgsrc+'"  onerror="this.src=\'/static/images/404.jpg\'" alt="">');
									flowHtml1.push(idiv+'</div>');
									flowHtml1.push('<div class="pro_info">');
									flowHtml1.push('<h2 style="color:'+(list[i].color?list[i].color:"")+'; font-weight:'+(list[i].titleBlod=="1"?"bold":"normal")+'">'+list[i].title+'</h2>');
									if(li_class=='video_li'){
									   flowHtml1.push('<div class="pro_detail"><div class="up_info"><div class="up_hphoto"><img src="'+(list[i].user.photo?list[i].user.photo:"/static/images/noPhoto_100.jpg")+'"></div><p>'+list[i].user.username+'</p></div>');
									   flowHtml1.push('<div class="sc_num"><i></i><em>'+list[i].zan+'</em></div></div>');
									}else{
										flowHtml1.push(ifdiv);
										flowHtml1.push('<div class="pro_detail">'+price+'<div class="num_store '+(list[i].collect?"":"fn-hide")+'">'+langData['siteConfig'][51][47].replace("1",list[i].collect)+'</div></div>');  //1人收藏
									}

									flowHtml1.push('</div></a></li>');

								}else{
									flowHtml2.push('<li data-id="'+list[i].id+'" class="'+li_class+'"><a href="'+list[i].url+'" data-module="'+type+'" data-temp="detail" data-id="'+list[i].id+'" class="'+clsName+'">');
									flowHtml2.push('<div class="pro_img">');
									flowHtml2.push('<img data-url="'+(list[i].litpic?list[i].litpic:'/static/images/miniprograme/info/default_info.png')+'"  src="'+imgsrc+'" alt=""  onerror="this.src=\'/static/images/404.jpg\'">');
									flowHtml2.push(idiv+'</div>');
									flowHtml2.push('<div class="pro_info">');
									flowHtml2.push('<h2>'+list[i].title+'</h2>');
									if(li_class=='video_li'){
									   flowHtml2.push('<div class="pro_detail"><div class="up_info"><div class="up_hphoto"><img src="'+(list[i].user.photo?list[i].user.photo:"/static/images/noPhoto_100.jpg")+'"></div><p>'+list[i].user.username+'</p></div>');
									   flowHtml2.push('<div class="sc_num"><i></i><em>'+list[i].zan+'</em></div></div>');
									}else{
										flowHtml2.push(ifdiv);
										flowHtml2.push('<div class="pro_detail">'+price+'<div class="num_store '+(list[i].collect?"":"fn-hide")+'">'+langData['siteConfig'][51][47].replace("1",list[i].collect)+'</div></div>');  //1人收藏
									}

									flowHtml2.push('</div></a></li>');
								}

							   }//以上为瀑布流展示


						   }

						   if(type=="tieba"){
							   $('.'+type+'_slide>ul').append(tiebaHtml.join(''))
						   }else if(type == 'live' || type == 'vote' || type == 'huodong'){
							    $('.'+type+'_slide>ul').append(bimgHtml.join(''))
						   }else{
							   $('.'+type+'_slide>ul.right_list').append(flowHtml1.join(''));
							   $('.'+type+'_slide>ul.left_list').append(flowHtml2.join(''))
						   }
						   console.log(type)
						   $('.loading').remove();
						   
                           if(typeof swiper != 'undefined'){
						    swiper.updateAutoHeight(1000);
						   }

						   loadMoreLock = false;
						   $("img").scrollLoading();
					   }
				  }
			  },
			  error:function(data){}
		 })
	}



	// 首页其他url
	 var advswiper = new Swiper('.module_swiper.swiper-container', {
	      slidesPerView: 'auto',
	    });

	// 编辑
	$('.btn_edit').click(function(){
		$('html').addClass('noscroll');
		$(".mask_pop").fadeIn();
		$(".info_pop.pop_box").animate({
			"bottom":"0"
		},150)
	});

	// 取消编辑
	$(".pop_box .cancel_btn,.mask_pop").click(function(){
		$('html').removeClass('noscroll');
		$(".mask_pop").fadeOut();
		$(".pop_box").animate({
			"bottom":"-4.2rem"
		},150)
	})

	// 发布的圈子

	var tpage = 1,isload = 0;

	getTlist();
	function getTlist(type) {
			isload = 1;
			$('.trends_box').append('<div class="loading_tip"><img src="' + templets_skin + 'images/index_4.8/loading.png" ></div>');
			url = "/include/ajax.php?service=circle&action=tlist&orderby=pubdate&pageSize=5&uid="+uid+"&u=1&page="+tpage;
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json", //指定服务器返回的数据类型
				crossDomain: true,
				success: function(data) {
					if (data.state == 100) {
						var list = [];
						var datalist = data.info.list;
						// $('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);
						for (var i = 0; i < datalist.length; i++) {
							var d = datalist[i];
	                     	var clsname = ''
	                        if(d.isfollow==1){
	                          clsname = 'cared'
	                          ctxt = langData['circle'][0][50] ;//已关注
	                        }else{
	                          clsname = '';
	                          ctxt = langData['circle'][0][1] ;//关注
	                        }
	                        var level = (d.level!="0")?Number(d.level):0;
	                      	var levicon = (d.level!="0")?"":"fn-hide"
							var levelname = d.levelname?d.levelname:langData['circle'][3][25];   //普通会员
	                        //是否热门
	                        var hottag = (d.zan*1>customhot*1?"hot_con":"");
							list.push('<li class="li_box" data-id="' + d.id + '" data-url="' + d.url + '">');
							// if (p == $('.recgz_ul')) { //关注板块的
							// 	list.push('<div class="rec_tip"><p>'+langData['circle'][3][26]+'</p></div>')  //来自你参与的话题
							// }
							/* 作者信息s */
							list.push('<a href="'+masterDomain+'/user/'+d.userid+'" class="art_ib"><div class="left_head">');
							if (d.photo) {
									var phonimg = d.photo;
								}else{
									var phonimg = "/static/images/noPhoto_40.jpg";
								}
							list.push('<img src="' +phonimg + '" /><div class="v_log '+levicon+'">');
							list.push('<img src="' + templets_skin + 'images/index_4.8/vip_icon.png" /></div></div>');
							list.push('<div class="r_info vip_icon">');
							list.push('<h4><span class="artname">' + (d.username) + '</span></h4>');
							list.push('<p class="pub_time">' + d.pubdate1 +'</p></div>');

							// if (p[0] == $('.recgz_ul')[0]) { //关注板块的
							// 	list.push('<a href="javascript:;" class="care_btn '+clsname+'" data-userid ="'+d.userid+'">'+ ctxt +'</a>');
							// }
	                      list.push('</a>')
							/* 作者信息e */

							list.push('<div class="art_con '+hottag+'"><a href="' + d.url + '?uid='+uid+'" class="dt_detail">' + (d.content ? "<h2>" + d.content +
								"</h2>" : ""));
							//图片内容
							if (d.media.length == 2 || d.media.length == 4) {
								list.push('<div class="img_box fn-clear">');
								for (var m = 0; m < d.media.length; m++) {
									list.push('<div class="img_item d_img"><img data-url=' + d.media[m] + ' src= src="/static/images/blank.gif"  onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								list.push('</div>');
							} else if (d.media.length > 4 || d.media.length == 3) {
								var imglen = d.media.length > 9 ? 9 : d.media.length
								list.push('<div class="img_box fn-clear">');
								for (var l = 0; l < imglen; l++) {
									list.push('<div class="img_item m_img"><img data-url=' + d.media[l] + ' src="/static/images/blank.gif"  onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								list.push('</div>');
							} else if (d.media.length == 1) {
								list.push('<div class="img_box fn-clear">');
								/*一张图片判断尺寸   <div class="img_item h_img video_item"><img src="{#$templets_skin#}upfiles/bg1.jpg"><em>0:56</em></div>*/
								list.push('<div class="img_item v_img"><img data-url=' + d.media[0] + '  src="/static/images/blank.gif"  onerror="this.src=\'/static/images/404.jpg\'"></div>')
								list.push('</div>');
							}else if(d.media.length==0 && d.videoadr!=''){
								list.push('<div class="img_box fn-clear">');
								var img_v = (d.thumbnail=="")?templets_skin+'images/sv_icon.png':d.thumbnail
								list.push('<div class="img_item h_img video_item"><img data-url="'+img_v+'" src=/static/images/blank.gif"  onerror="this.src=\'/static/images/404.jpg\'"></div>')
								list.push('</div>');
							}

							list.push('</a>')
							// 链接
	                        if(d.commodity != ''&& d.commodity!=null && d.commodity.length>0){
	                           list.push('<a class="link_out" href="'+d.commodity[0]['url']+'"><div class="left_img"><img src="' +d.commodity[0]['litpic']+
								 '"></div><p>'+d.commodity[0]['title']+'</p></a>');
	                           }


							// 话题链接
	                      if(d.topictitle){
	                         list.push('<a class="topic_link" href="'+d.topicurl+'">'+d.topictitle+'</a>');
	                        }

							// 定位
	                       if(d.addrname){
	                         list.push('<a href="javascript:;" class="posi_link">'+d.addrname+'</a>');
	                       }


							// 点赞按钮
							list.push('<div class="btn_group"><a href="javascript:;" class="r_btn"></a>');
							list.push('<div class="left_btns"><a href="javascript:;" class="comt_btn">' + (d.reply > 0 ? d.reply : "") +
								'</a>');
							if(d.isdz == '1'){
								var zclass = "zan_btn zaned";
							}else{
								var zclass = "zan_btn ";
							}
							list.push('<a href="javascript:;" class="'+zclass+'" data-did ="'+d.id+'" data-uid = "'+d.userid+'"><div class="canvas_box"><img src="' + templets_skin +
								'images/index_4.8/zan.gif" /></div><em>' + (d.up > 0 ? d.up : "") + '</em></a>');
							list.push('<a href="javascript:;" class="share_btn "></a><a href="javascript:;" class="HN_PublicShare hidea"  style="display:none;"></a></div></div>');

							// 点赞列表
							if (d.up != 0 || d.reply != 0) {
								list.push('<div class="comt_box">');

								if (d.up != 0) {
									list.push('<div class="zan_box"><ul class="zan_ul fn-clear">');
									// console.log(d);
									for (var a = 0; a < ((d.dianres.length)>8?8:(d.dianres.length)); a++) {

										list.push('<li class="zan_li"> <a href="'+masterDomain+'/user/'+ d.dianres[a].id +'#circle"><img src="/include/attachment.php?f=' +  d.dianres[a].photo + ' " onerror="this.src= \'/static/images/noPhoto_100.jpg\'"></a> </li>')
									}
									list.push('<a href="javascript:;" class="zan_count"><em>' + d.up + langData['siteConfig'][46][57]+'</em></a>'); //赞
									list.push('</ul></div>');
								}
								if (d.reply != 0) {
									list.push('<div class="comt_list" style="'+(d.up>0?"margin-top:.3rem;":"")+'"><ul class="comt_ul">');
									for (var n = 0; n < d.lastReply.length; n++) {
										list.push('<li class="comt_li" data-plid = "'+d.lastReply[n].id+'"> <a href="javascript:;">'+d.lastReply[n].nickname+'</a>：'+d.lastReply[n].content+' </li>')
									}
									if (d.lastReply.length == "3") {
										list.push('<a href="'+d.url+'" class="comt_detail">全部'+d.reply+'条评论></a>');  // 全部1条评论
									}
									list.push('</ul><div class="commt_btn">'+langData['circle'][0][53]+'</div></div>');  /* 写评论*/

								}
								list.push('</div>')
							}

							list.push('</div></li>')
						}
						$('.trends_box').find('.loading_tip').remove();
						if(tpage==1){
							$('.trends_box ul.ulbox').html(list.join(''));
						}else{
							$('.trends_box ul.ulbox').append(list.join(''));
						}

						setTimeout(function() {
							isload = 0;
							tpage++;
							// $('.nav_box .li_on').attr('data-page', page);
							if (tpage > data.info.pageInfo.totalPage) {
								$('.trends_box ul.ulbox').append('<div class="loading_tip">'+ langData['circle'][0][54]+'</div>');   /*  没有更多了~  */
								isload = 1;
							}

						}, 1000)

						 $("img").scrollLoading();

					} else {
						isload = 0;
						$('.trends_box').find('.loading_tip').remove();
						$('.trends_box').find('.loading_tip').remove();
						$('.trends_box').append('<div class="loading_tip">'+ langData['circle'][0][55] +'</div>'); /*  暂无数据  */

					}
				},
				error: function(err) {
					console.log('fail');
					isload = 0;
					console.log("改变isload")
				}
			});
		}

	//打赏
		var dashangElse = false;
		$('.ds_btn').click(function() {
			var t = $(this),
				newsid = t.parents('.more_box').attr('data-id');
			name = t.parents('.more_box').attr('data-name')
			if (t.hasClass("load")) return;
			t.addClass("load");
			//验证文章状态
			$.ajax({
				"url": "/include/ajax.php?service=circle&action=checkRewardState",
				"data": {
					"aid": newsid
				},
				"dataType": "jsonp",
				success: function(data) {
					t.removeClass("load");
					if (data && data.state == 100) {

						$('.mask').show();
						$('.shang-box').show();
						$('.shang-item-cash').show();
						$('.shang-item .inp').show();
						$('.shang-item .shang-else').hide();
						$('body').bind('touchmove', function(e) {
							e.preventDefault();
						});
						$('.shang_to').find('span').text(name)

					} else {
						showErr(data.info);
					}
				},
				error: function() {
					t.removeClass("load");
					showErr(langData['circle'][0][65]);     /* 网络错误，操作失败，请稍候重试！*/
				}
			});
		});

		// 其他金额
		$('.shang-item .inp').click(function() {
			$(this).hide();
			$('.shang-item-cash').hide();
			$('.shang-money .shang-item .error-tip').show()
			$('.shang-item .shang-else').show();
			dashangElse = true;
			$(".shang-else input").focus();
		})

		// 遮罩层
		$('.mask').on('click', function() {
			$('.mask').hide();
			$('.shang-money .shang-item .error-tip').hide()
			$('.shang-box').hide();
			$('.paybox').animate({
				"bottom": "-100%"
			}, 300)
			setTimeout(function() {
				$('.paybox').removeClass('show');
			}, 300);
			$('body').unbind('touchmove')
		})

		// 关闭打赏
		$('.shang-money .close').click(function() {
			$('.mask').hide();
			$('.shang-box').hide();
			$('.shang-money .shang-item .error-tip').hide()
			$('body').unbind('touchmove')
		})

		// 选择打赏支付方式
		var amount = 0;
		$('.shang-btn').click(function() {
			var newsid = $('.more_box').attr('data-id')
			amount = dashangElse ? parseFloat($(".shang-item input").val()) : parseFloat($(".shang-item-cash em").text());
			var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
			var re = new RegExp(regu);
			if (!re.test(amount)) {
				amount = 0;
				alert(langData['circle'][0][66]);   /* 打赏金额格式错误，最少0.01元！*/
				return false;
			}

			var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
			location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount + "&app=" +app;
			return;

			$('.shang-box').animate({
				"opacity": "0"
			}, 300);
			setTimeout(function() {
				$('.shang-box').hide();
			}, 300);

			//如果不在客户端中访问，根据设备类型删除不支持的支付方式
			if (appInfo.device == "") {
				// 赏
				if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
					$("#shangAlipay, #shangGlobalAlipay").remove();
				}
				// else{
				//  $("#shangWxpay").remove();
				// }
			}
			$(".paybox li:eq(0)").addClass("on");

			$('.paybox').addClass('show').animate({
				"bottom": "0"
			}, 300);
		})

		$('.paybox li').click(function() {
			var t = $(this);
			t.addClass('on').siblings('li').removeClass('on');
		})

		//提交支付
		$("#dashang").bind("click", function() {

			var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
			var re = new RegExp(regu);
			if (!re.test(amount)) {
				amount = 0;
				alert(langData['circle'][0][66]);  /* 打赏金额格式错误，最少0.01元！*/
				return false;
			}

			var paytype = $(".paybox .on").data("id");
			if (paytype == "" || paytype == undefined) {
				alert(langData['circle'][0][67]);   /* 请选择支付方式！*/
				return false;
			}

			//非客户端下验证支付类型
			if (appInfo.device == "") {
				if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/)) {
					showErr(langData['circle'][0][68]);  /*微信浏览器暂不支持支付宝付款<br />请使用其他浏览器！ */
					return false;
				}

				location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
					"&paytype=" + paytype;
			} else {
				location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
					"&paytype=" + paytype + "&app=1";
			}


		});


		//举报按钮
		$('.jb_btn').click(function() {
			JubaoConfig.id = $(this).parents('.more_box').attr('data-id');
			$('.jubao_box').show();
			$('.jubao_detail h4').find('em').text($(this).parents('.more_box').attr('data-name'));
			$('.jubao_title').text($(this).parents('.more_box').attr('data-title'));

		});


		// 举报提交
		var JuMask = $('.JuMask'),
			JubaoBox = $('.jubao_box');
		$('.content_box .sub').click(function() {

			var t = $(this);
			if (t.hasClass('disabled')) return;
			if ($('.jubap_type input').val() == '') {
				showErr(langData['siteConfig'][24][2]); //请选择举报类型
			} else if ($('.contact input').val() == "") {
				showErr(langData['siteConfig'][20][459]); //请填写您的联系方式
			} else {

				var type = $('.jubap_type input').val();
				var desc = $('.jubao_content .con textarea').val();
				var phone = $('.contact input').val();

				if (JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0) {
					showErr('Error!');
					setTimeout(function() {
						JubaoBox.hide();
						JuMask.removeClass('show');
					}, 1000);
					return false;
				}

				t.addClass('disabled').html(langData['circle'][0][69]);   /* 正在提交*/

				$.ajax({
					url: "/include/ajax.php",
					data: "service=member&template=complain&module=" + JubaoConfig.module + "&dopost=" + JubaoConfig.action +
						"&aid=" + JubaoConfig.id + "&type=" + encodeURIComponent(type) + "&desc=" + encodeURIComponent(desc) +
						"&phone=" + encodeURIComponent(phone),
					type: "GET",
					dataType: "jsonp",
					success: function(data) {
						t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
						if (data && data.state == 100) {
							showErr(langData['siteConfig'][21][242]); //举报成功！
							setTimeout(function() {
								JubaoBox.hide();
								JuMask.removeClass('show');
							}, 1500);

						} else {
							showErr(data.info);
						}
					},
					error: function() {
						t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
						showErr(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
					}
				});

			}
		});

	//关闭举报窗口
	$('.jubao .close_btn').click(function() {
		$('.jubao_box').hide();
		$('.jubao_box').find('input').val('');
		$('.jubao_box').find('textarea').val('');
		$('.chosebox').removeClass('show');
	});

	//举报类型选择
	$('.jubap_type').click(function(e) {
		$('.chosebox').addClass('show');
		$(document).one('click', function() {
			$('.chosebox').removeClass('show');
		});
		e.stopPropagation();
	});
	$('.chose_ul li').click(function() {
		var txt = $(this).text();
		$('.chosebox').removeClass('show');
		$('.jubap_type input').val(txt);
		return false;
	});

	//计算输入的字数
	$(".jubao_content ").bind('input propertychange', 'textarea', function() {
		var length = 100;
		var content_len = $(".jubao_content textarea").val().length;
		var in_len = length - content_len;
		if (content_len >= 100) {
			$(".jubao_content textarea").val($(".jubao_content textarea").val().substring(0, 100));
		}
		$('.jubao_content dt em').text($(".jubao_content textarea").val().length);

	});

	// 背景图片上传
		var change = false;
		var upImg = new Upload({
			btn: '.change_bg',
			bindBtn: '',
			title: 'Image',
			mod: 'member',
			msg_maxImg: langData['circle'][2][35],   /*视频数量已达上限 */
			params: 'type=atlas&filetype=image',
			atlasMax: 1,
			deltype: 'delImage',
			replace: false,
			chunked: true,
			accept: {
				title: 'Image',
				extensions: 'jpg,jpeg,bmp,png,gif',
				mimeTypes: 'image/*'
			},
			uploadStart:function(){
				$(".img_loading").show();
			},
			fileQueued: function(file) {
				console.log(file)
			},
			uploadSuccess: function(file, response) {

				if (response.state == "SUCCESS") {
					$.post("/include/ajax.php?service=member&action=updateCoverBg", {type:'m',mtempbgurl: response.url}, function(){
						alert(langData['siteConfig'][6][39]);  //保存成功
						change = true;
						$(".img_loading").hide();
						setTimeout(function(){
							//$(".bg_img").html('<img src="/include/attachment.php?f='+response.url+'" data-url="' + response.url +'">');
							$(".bg_img img").attr('src',"/include/attachment.php?f="+response.url).attr('data-url',response.url)
						},500)


						$(".mask_pop").click();

					});


				}
			},
			uploadFinished: function(response) {
				  var imgUrl = $(".bg_img").attr('data-url')

				if (this.sucCount == this.totalCount) {
					//         showErr('所有图片上传成功');
				} else {
					//showErr((this.totalCount - this.sucCount) + langData['circle'][2][36]);  /* 个视频上传失败*/

					// 上传失败时，删除之前生成的video_li
				//	$(".upload_btn").hide();
					$('.li_r .del_liimg').remove();
					$('.liup_btn').show();
				}


			},
			uploadError: function() {

			},
			showErr: function(info) {
				// showErr(info);
				console.log(info);
				$(".img_loading").hide();
			}
		});
		$(".change_bg").click(function(){
			if(change){
				upImg.del($(".bg_img img").attr('data-url'));
			}
		})

	 //错误提示
	 	var showErrTimer;
	 	function showErr(txt) {
	 		showErrTimer && clearTimeout(showErrTimer);
	 		$(".popErr").remove();
	 		$("body").append('<div class="popErr"><p>' + txt + '</p></div>');
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

	// 分享
	$('body').delegate('.share_btn', 'click', function() {
		var t = $(this),
			p = t.parents('.li_box');
		var url = p.attr('data-url'),
			desc = p.find('.art_con h2').text()
		img_url = p.find('.img_item:nth-child(1) img').attr('src');
		wxconfig['link'] = url;
		wxconfig['title'] = desc;
		wxconfig['img_url'] = img_url;
		wxconfig['description'] = desc;
		if(device.indexOf('huoniao') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("appShare", {
					"platform": "all",
					"title": wxconfig.title,
					"url": wxconfig.link,
					"imageUrl": wxconfig.imgUrl,
					"summary": wxconfig.description
				}, function(responseData){
					var data = JSON.parse(responseData);

				})
		  });
		}else{
			$('.HN_PublicShare').click();
		}
	});

	// 评论
		$('body').delegate('.commt_btn,.comt_btn', 'click', function() {

            // 给表情添加对应的字符
            if($(".bq_box").html() == ''){
	            $(".bq_box").html(appendEmoji());
            }

			scroll = $(this).offset().top;
			var id = $(this).parents('.li_box').attr('data-id')
			pHeight = $(this).parents('.li_box').height()
			$('.bottom_box,.mask_re').show();
			$('.bottom_box').attr('data-reply',id);
			$('.bottom_box').removeAttr('data-type');
			$('#reply').focus();
			$('html').addClass('noscroll');
		});
		$('.mask_re').on('click', function() {
			$('.bottom_box #reply').blur();
			$('.bottom_box,.mask_re').hide();
			$('.bq_box').removeClass('show');
			$('.bq_btn').removeClass('bq_open');
		});
		$('#reply').click(function(){
			var t = $(this);
			 $('.bq_btn').removeClass('bq_open');
			 $('.bq_box').removeClass('show')
		})
		// 隐藏评论框
		$('.bottom_box #reply').blur(function() {
			// $('.bottom_box,.mask_re').hide();
			// setTimeout(function() {
			// 	window.scroll(0, 400); //失焦后强制让页面归位
			// }, 100);
			scroll = 0;
			$('html').removeClass('noscroll');
		});


		// 更多
		$('body').delegate('.btn_group .r_btn', 'click', function() {
			var t = $(this),
				id = t.parents('.li_box').attr('data-id');
			var name = t.parents('.li_box').find('.r_info h4 .artname').text();
			var title = t.parents('.li_box').find('.art_con h2').text();
			$('.mask_more').show();
			$('html').addClass('noscroll');
			$('.more_box').animate({
					'bottom': 0
				}, 150)
				.attr('data-id', id)
				.attr('data-name', name)
				.attr('data-title', title);
		});

		// 隐藏更多
		$('.mask_more,.cancel_btn').click(function() {
			$('.mask_more').hide();
			$('html').removeClass('noscroll')
			$('.more_box').animate({
					'bottom': '-4.1rem'
				}, 150)
				.removeAttr('data-id')
				.removeAttr('data-name')
				.removeAttr('data-title');
		});

		// 点赞
		$('body').delegate('.zan_btn', 'click', function() {
			var userid = $.cookie(cookiePre + "login_user");
			if (userid == null || userid == "") {
				window.location.href = masterDomain + '/login.html';
				return false;
			}
			var t = $(this),
				num = t.find('em').text() == "" ? 0 : Number(t.find('em').text())
			var did = t.attr("data-did");
			var uid = t.attr("data-uid");
			$.ajax({
				url: "/include/ajax.php?service=circle&action=Fabulous",
				data:{'did':did,'fbuid':uid,'dzuid':dzuid},
				type:"POST",
				dataType:"json",
				success:function(data){
					// console.log(data.info);
					if(data.info =="ok"){
						if (t.hasClass('zaned')) {
								t.removeClass('zaned');
								num = num - 1;
						} else {
							t.find('.canvas_box').show();
							setTimeout(function() {
								t.find('.canvas_box').hide();
								t.addClass('zaned');
							}, 500)
							num = num + 1;
							}
						}
				t.find('em').text(num > 0 ? num : "");
				},
				error:function(){

				}
			});

		});

		$('.reply_box a').click(function() {
			if (!$(this).hasClass('bq_btn')) {
				$('.bq_box').removeClass('show');
				$('bq_btn').addClass()
			} else {
				var t = $(this);

				if (!t.hasClass('bq_open')) {
					$('.bq_btn').addClass('bq_open');
					$('.bq_box').addClass('show');
				} else {
					$('.bq_btn').removeClass('bq_open');
					$('.bq_box').removeClass('show');
				}
				// $(window).scrollTop(0)
			}
		});

		//点击表情，输入
		var memerySelection;
		var userAgent = navigator.userAgent.toLowerCase();
		if (/iphone|ipad|ipod/.test(userAgent)) {
			$(".bottom_box").css('padding-bottom',".28rem");
		}else{
			$(".bottom_box").css('padding-bottom',"3rem");
		}
		set_focus($('#reply:last'));
		$('.bq_box').delegate(".emot_li","click",function() {
			var t = $(this),txt = t.attr('data-txt');
			var emojsrc = t.find('img').attr('src');

			memerySelection = window.getSelection();
			if (/iphone|ipad|ipod/.test(userAgent)) {
				$('#reply').append('<img data-txt="'+txt+'" src="' + emojsrc + '" class="emotion-img" />');
				return false;

			} else {
				set_focus($('#reply:last'));
				pasteHtmlAtCaret('<img  data-txt="'+txt+'"  src="' + emojsrc + '" class="emotion-img" />');
			}
			document.activeElement.blur();
			return false;
		})

		//根据光标位置插入指定内容
		function pasteHtmlAtCaret(html) {
			var sel, range;
			if (window.getSelection) {
				sel = memerySelection;
				// console.log(sel)
				if (sel.anchorNode == null) {
					return;
				}
				if (sel.getRangeAt && sel.rangeCount) {

					range = sel.getRangeAt(0);
					range.deleteContents();
					var el = document.createElement("div");
					el.innerHTML = html;
					var frag = document.createDocumentFragment(),
						node, lastNode;
					while ((node = el.firstChild)) {
						lastNode = frag.appendChild(node);
					}
					range.insertNode(frag);
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				}

			} else if (document.selection && document.selection.type != "Control") {
				document.selection.createRange().pasteHTML(html);
			}
		}
		//光标定位到最后
		function set_focus(el) {
			el = el[0];
			el.focus();
			if ($.browser.msie) {
				var rng;
				el.focus();
				rng = document.selection.createRange();
				rng.moveStart('character', -el.innerText.length);
				var text = rng.text;
				for (var i = 0; i < el.innerText.length; i++) {
					if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
						result = i + 1;
					}
				}
				return false;
			} else {
				var range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}

		// 发送评论
	$('.send_btn').click(function(){
		var t = $(this);
		var replyid = t.parents('.bottom_box').attr('data-reply');
		var rtype = t.parents('.bottom_box').attr('data-type');
		if(rtype=='reply'){
			var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + replyid;
		}else{
			var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=circle-dynamic&aid=' + replyid;
		}
		var userid = $.cookie(cookiePre + "login_user");

		$('#reply img').each(function(){
			var t = $(this),txt= t.attr('data-txt');
			t.after('<em>'+txt+'</em>');
			t.remove()
		});
		var con = $('#reply').html();  //去掉回车和空格
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		if(con==''){
			showErr(langData['circle'][3][20]);return false;  //请输入评论内容
		}else{
			$.ajax({
					url: url,
					data: "content=" + encodeURIComponent(con),
					type: "POST",
					dataType: "json",
					success: function(data) {
						if (data && data.state == 100) {
							if (data.info.ischeck == 1) {
								showErr(langData['circle'][3][21]);    //回复成功！
								$('#reply').html('');
								pullrefresh();
								$(".mask_re").click();
								// setTimeout(function(){
								// 	location.reload();
								// },500)

							} else {
								showErr(langData['circle'][3][22]);  //评论成功，请等待管理员审核！
								$(".mask_re").click();
							}


						} else {
							alert(data.info);
						}
					},
					error: function() {
						alert(langData['circle'][3][23]);  //网络错误，发表失败，请稍候重试！
					}
			});
		}

	});
	// 首页和发布切换
	$(".tab_a a").click(function(){
		$(".tab_a a").removeClass('onclick')
		$(this).addClass('onclick');
		let i = $(this).index();
		$(".con_box").eq(i).addClass('show').siblings('.con_box').removeClass('show');
		if(i==1){
			$(".topFixed").addClass('fb_show');
		}else{
			$(".topFixed").removeClass('fb_show');
		}
	})

	// 导航栏吸顶，滚动加载
	$(window).scroll(function(){
		var sct = $(window).scrollTop();  //滚动条滚动到距离
		var navH = $('.user_content').offset().top;  //导航条距离顶部的距离
		if($(".trends_box").size()==0){
			navH = $('.fb_con.con_box').offset().top;
			console.log(navH)
		}
		if(sct>=navH){
			$('.topFixed').append($(".tab_a"));
			$('.topFixed').append($(".fbtab_li"));

		}else{
			$('.tab_box').append($(".tab_a"));
			$('.fbtab_box').append($(".fbtab_li"));
		}

		if($('.on_tab').size() > 0){
			var end = $('.on_tab').offset().left + $('.on_tab').width() / 2 - $('body').width() /2;
			var star = $(".fbtab_li ul").scrollLeft();
			$('.fbtab_li ul').scrollLeft(end + star);
		}

		// 滚动加载
		if(sct + $(window).height() + 50 > $(document).height()  ) {
			if($('.fb_con').hasClass('show') && !loadMoreLock){  //发布页
				var page = parseInt($('.fbtab_li .on_tab').attr('data-page')),
				    totalPage = parseInt($('.fbtab_li .on_tab').attr('data-totalPage'));
				if(page < totalPage) {
					++page;
					$('.fbtab_li .on_tab').attr('data-page', page);
					getlist();
				}
			}else if($('.sy_con').hasClass('show') && !isload){
				getTlist();
			}


		}

	});

	// 点击关注按钮
	$(".btn_gz").click(function(){
		var x = $(this);
		if (x.hasClass('follow')) {
			$('.mask_pop').fadeIn();
			$('.gz_pop.pop_box').animate({"bottom":0},200);
			$("html").addClass('noscroll');
			$(".gz_pop .sure_btn").click(function(){
				  follow(x, function(){
				  	x.removeClass('follow').find('em').text(langData['siteConfig'][19][846]);  //关注
				  });
				  $('.mask_pop').fadeOut();
				  $('.pop_box').animate({"bottom":'-4.2rem'},200);
				  $("html").removeClass('noscroll');
			})
		}else{

			follow(x, function(){
				showErr(langData['siteConfig'][51][50]); //关注成功
				x.addClass('follow').find('em').text(langData['siteConfig'][19][845]);   //已关注
			});
		}
	})

	// 关注方法
	function follow(t, func){
	    var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }

	    if(t.hasClass("disabled")) return false;
	    t.addClass("disabled");
	    $.post("/include/ajax.php?service=member&action=followMember&id="+uid, function(){
	      t.removeClass("disabled");
	      func();
	    });
	};

	// 视频收藏
	$(".fb_swiper").delegate('.sc_num',"click",function(){
		var t = $(this),p = t.parents('li.video_li'),vid = p.attr('data-id');
		var num = Number(t.find('em').text());  //已收藏数目
		if(t.hasClass('sced')){
			t.removeClass('sced');
			num = num - 1;
		}else{
			t.addClass('sced');
			num = num + 1;
		}
		t.find('em').text(num)
		// 此处写收藏功能

		return false;
	})



	// 直播预约
	$('.fb_swiper').delegate(".yuyue_btn","click",function(){
		var userid = $.cookie(cookiePre+"login_user");
		 if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		var t =$(this);liveid=t.parents('li').attr('data-id');
		$.ajax({
				url: "/include/ajax.php?service=live&action=liveBooking&aid="+liveid,
				type: "GET",
				dataType: "json", //指定服务器返回的数据类型
				success: function (data) {
				 if(data.state == 100){
					if(!t.hasClass('yued')){
						t.addClass('yued');
						t.find('em').text(langData['siteConfig'][51][46]);  //'已预约'

					}else{
						t.removeClass('yued');
						t.find('em').text(langData['siteConfig'][26][80]);  //'预约'

					}
					console.log(data)
				 }else{
					alert(data.info)
				 }
				},
				error:function(err){
					console.log('fail');
				}
		});
		return false;
	})

	// 时间戳转换
	function timestampToTime(timestamp) {
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const Y = dateFormatter.year;
        const M = dateFormatter.month;
        const D = dateFormatter.day;
        const h = dateFormatter.hour;
        const m = dateFormatter.minute;
        const s = dateFormatter.second;
        
        return Y+M+D+h+m+s;
    }



})
