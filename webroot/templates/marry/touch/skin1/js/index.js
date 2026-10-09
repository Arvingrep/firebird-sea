$(function () {

    // banner轮播图

    new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination'} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,slidesPerView : 1.22,spaceBetween : 25,centeredSlides : true,autoplay:{delay: 2500,}});





    getStoreList();

    function getStoreList(){

	    $.ajax({

	        url : "/include/ajax.php?service=marry&action=storeList&filter=8&orderby=1&page=1&pageSize=6",

	        type : "GET",

	        dataType : "json",

	        success : function (data) {

	            if(data.state == 100){

	                var list = data.info.list,html = [],length = list.length;

	                for (var i = 0; i < length; i++){

	                    html.push('<div class="swiper-slide">')

	                    // html.push('<a href="'+channelDomain+'/hotel_detail.html">')

                        html.push('<li><a href="'+list[i].url+'">')

                        html.push('<div class="org_img">')

	                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";

	                    html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">')

	                    html.push('</div>')

	                    html.push('<div class="storeInfo">')

	                    html.push('<div class="titInfo">')

	                    var cla='';



	                     if(list[i].flagAll!=''){

	                     	var fLen = list[i].flagAll.length

	                     	if(fLen >= 3){

	                     		cla='has3';

	                     	}else if(fLen == 2){

	                     		cla='has2';

	                     	}else{

	                     		cla='has';

	                     	}



	                     }

	                    html.push('<h2 class="sTitle '+cla+'">'+list[i].title+'</h2>')

	                    if(list[i].flagAll!=''){

	                        for(var m=0;m<list[i].flagAll.length;m++){

	                            var className = '';

	                            if(m==0){

	                                className = 'dt';

	                            }else if(m==1){

	                                className = 'dl';

	                            }else if(m==2){

	                                className = 'gg';

	                            }

	                            if(m>2) break;

	                            html.push('<span class="'+className+'">'+list[i].flagAll[m].jc+'</span>');

	                        }

	                    }

	                    html.push('</div>')

	                    html.push('<div class="otherInfo">')

	                    html.push('<span class="table">'+list[i].typename+'<em>|</em>0-70桌</span>')

	                    html.push('<strong class="price">'+echoCurrency('symbol')+list[i].hotelprice+'</strong>')

	                    html.push('</div>')

	                    html.push('</div>')

	                    html.push('</a>')

	                    html.push('</div>')

	                }

	                $('.hotelCon .swiper-wrapper').html(html.join(""));



	                //横向滚动

				    var swiper = new Swiper('.hotelCon .swiper-container', {

				      slidesPerView: 'auto',

				    });

	            }

	        }

	    });

    }

    var len = $('.nav-tab li').length,tabH =[];

    for (var i = 0; i < len; i++) {

    	tabH.push('<div class="swiper-slide"><ul class="mealList"></ul></div>')

    }

    $('#tabs-container .swiper-wrapper').html(tabH.join(''));

    //左右导航切换

    var tabsSwiper = new Swiper('#tabs-container',{

        speed: 350,

        touchAngle: 35,

        observer: true,

        observeParents: true,

        freeMode: false,

        longSwipesRatio: 0.1,

        autoHeight: true,

        on: {

            slideChangeTransitionStart: function(){



                $(".nav-tab .curr").removeClass('curr');

                $(".nav-tab li").eq(tabsSwiper.activeIndex).addClass('curr');

                styleS();

                //$("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height());

                getList();



            },

        },



    })



    $('.nav-tab li').click(function(){

    	var i = $(this).index();

    	if(!$(this).hasClass('curr')){

	    	$(this).addClass('curr').siblings().removeClass('curr');

	    	styleS();

	    	tabsSwiper.slideTo($(this).index());

    	}



    })

    function styleS(){

    	var of = $('.nav-tab li.curr').position().left,ot = $('.nav-tab li.curr').offset().left;

    	var thisw = $('.nav-tab li.curr').width(),tbody = $('html').width();

    	var ow = $('.nav-tab li.curr').width()/2;

    	var tw = $('.tabDiv i').width()/2;

    	$('.tabDiv i').animate({'left':of+ow-tw+'px'},200);

    	var end = $('.nav-tab li.curr').offset().left - $('body').width() /2;

        var star = $(".tabDiv").scrollLeft();



        if((ot + thisw) >= tbody || ot < 0){

			$('.tabDiv').scrollLeft(end + star);

        }

    }



    var page = 1,isload = false;

    //滚动底部加载

	$(window).scroll(function() {

        var allh = $('body').height();

        var w = $(window).height();

        var s_scroll = allh - 100 - w;

        if ($(window).scrollTop() > s_scroll && !isload) {

            var page = parseInt($('.nav-tab .curr').attr('data-page')),

                totalPage = parseInt($('.nav-tab .curr').attr('data-totalPage'));

            if (page < totalPage) {

                ++page;

                $('.nav-tab .curr').attr('data-page', page);

                getList();

            }

        };

    });

    getList();

    function getList(tr) {

		isload = true;

		var active = $('.nav-tab .curr');

		var page = active.attr('data-page');



		var tid = $('.nav-tab li.curr').attr('data-id');

		var objId = $('#tabs-container .swiper-slide-active ul')

		objId.find('.loading').remove();

		objId.append('<div class="loading">' + langData['siteConfig'][38][8] + '</div>');//加载中...





		var url;

		if (tid == 7)

		{

			url = "/include/ajax.php?service=marry&action=marryhostList&page=" + page + "&pageSize=6";

		}

		else if (tid == 9)

		{

			url = "/include/ajax.php?service=marry&action=marryplancaseList&page="+page+"&type="+tid+"&pageSize=6";

		}

		else if (tid == 10 ){

			url = "/include/ajax.php?service=marry&action=marrycarList&page=" + page + "&pageSize=6";



		}

		else

		{

			url="/include/ajax.php?service=marry&action=planmealList&page="+page+"&type="+tid+"&pageSize=6";

		}





	    $.ajax({

	        url : url,

	        type : "GET",

	        dataType : "json",

	        success : function (data) {

	        	if(data && data.state == 100){

	        		var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

	        		if(list.length > 0){

	        			$('.loading').remove();

	        			for (var i = 0; i<list.length; i++) {

	        				html.push('<li><a href="'+list[i].url+'">')

		        			if(i == 0){

			        			html.push('<span class="tj">'+langData['siteConfig'][23][109]+'</span>');//推荐

			        		}

		        			html.push('<span class="clafy">'+ list[i].typename+'</span>')

		        			html.push('<div class="topImg">')

		        			var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";

		        			html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">')

		        			html.push('</div>')

		        			html.push('<div class="mealInfo">')

		        			html.push('<h2>'+list[i].title+'</h2>')
		        			var len = list[i].addrname.length;
                            html.push('<p class="addr">'+ list[i].addrname[len-2]+' | '+ list[i].companyname+'</p>')



                            html.push('<div class="other">')

		        			var tLen = list[i].tagAll.length <2 ?list[i].tagAll.length : 2;

		                    for(var m=0;m<tLen;m++){

		                        html.push('<span class="'+list[i].tagAll[m].py+'">'+list[i].tagAll[m].jc+'</span>');

		                    }
		                    var sameTxt = '';
							if(tid == 10){//租婚车
		                    	sameTxt = list[i].carname;
		                    }else if(tid == 9){//婚礼策划
		                    	sameTxt = list[i].classificationname;
		                    }else{
		                    	sameTxt = list[i].stylename;
		                    }
		                    html.push('<span class="same">'+sameTxt+'</span>')

		        			html.push('<strong class="pri">'+echoCurrency('symbol')+list[i].price+'</strong>')

		        			html.push('</div>')

		        			html.push('</div>')

		        			html.push('</a></li>')

	        			}

	        			if(page == 1){

							objId.html(html.join(""));

	        			}else{

	        				objId.append(html.join(""));

	        			}



	                    isload = false;

	                    if(page >= pageinfo.totalPage){

	                        isload = true;

	                        objId.append('<div class="loading">'+langData['sfcar'][1][6]+'</div>');//没有更多了

	                    }







	        		}else{

	        			isload = false;

                        objId.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！

	        		}

	        	}else{

	        		isload = false;

                    objId.find('.loading').html(data.info);

	        	}



	        	tabsSwiper.updateAutoHeight(100);

	        },

	        error : function(){

	        	isload = false;

                objId.find('.loading').html(langData['siteConfig'][20][227]); // 网络错误，加载失败

	        }

	    })

    }





});

