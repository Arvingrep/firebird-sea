$(function(){
	//数字滚动
	var sum2 = totalCount1 == 0 ? 1:totalCount1;
	var sum = 0;
	var begin;
	$(function() {
		begin = window.setInterval(function(){
			show_num1(sum)
		},1000);
	});

	function show_num1(n) {
		sum=sum+1;
		
		var it = $(".t_num1 i");
		var len = String(n).length;
		for(var i = 0; i < len; i++) {
			if(it.length <= i) {
				$(".t_num1").append("<i></i>");
			}
			var num = String(n).charAt(i);
			//根据数字图片的高度设置相应的值
			var y = -parseInt(num) * 35;
			var obj = $(".t_num1 i").eq(i);
			obj.animate({
				backgroundPosition: '(0 ' + String(y) + 'px)'
			}, 'slow', 'swing', function() {});
		}
      if(sum2 == sum){
			console.log('333')
			clearInterval(begin)
		}
		$("#cur_num").val(n);
	}

	 //控制标题的字数
    $('.vill_info').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });

    $(".lay_con li:nth-child(3n)").css("margin-right","0");
    $(".img_ul li:nth-child(3n)").css("margin-right","0");
   
    $(".build_con ul li:nth-child(5n)").css("margin-right","0");



    $('.vill_tab li').click(function(){
    	
    	$(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.tab_container .tab_content').eq(i).addClass('tab_show').siblings().removeClass('tab_show');
        $('.tab_wrap').show();
    	$('.site_wrap').hide(); 
    
    })

    $('.img_tab li').click(function(){
    	
    	$(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.img_container .img_con').eq(i).addClass('img_show').siblings().removeClass('img_show');
    
    })
    var st = $('.vill_tab').offset().top;
    $('.lay_head .img_more').click(function(){

    	$('#img_li').addClass('active').siblings().removeClass('active');
    	$('.img_content').addClass('tab_show').siblings().removeClass('tab_show');   
      	if($(this).hasClass('hxmore')){
          $('.img_tab li').eq(1).click();
        }else{
          $('.img_tab li').eq(2).click();
        }
        $('html, body').animate({scrollTop:st}, 300);

    })
    //小区案例列表页 预约参观
    $('.right_b').delegate('.visit','click',function(){

    	$('.order_mask2').show();
    	var par = $(this).closest('tr')
    	//参观工地
    	var home_tit = par.find('.green').text();  	
    	$('.free_p .home_tit').text(home_tit);
    	//房屋类型
    	var home = par.find('.styles').text();  	
    	$('.free_p .home').text(home);
    	//建筑面积
    	var home_area = par.find('.areas').text();  	
    	$('.free_p .home_area').text(home_area);

    	//工地id
    	var conid = $(this).attr("data-id");  	

    	$("#conid").val(conid);
    })

    //国际手机号获取
	  getNationalPhone();
	  function getNationalPhone(){
	    $.ajax({
          url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
          type: 'get',
          dataType: 'JSONP',
          success: function(data){
              if(data && data.state == 100){
                 var phoneList = [], list = data.info;
                 for(var i=0; i<list.length; i++){
                      phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                 }
                 $('.areaCode_wrap ul').append(phoneList.join(''));
              }else{
                 $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                }
          },
          error: function(){
                $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                  }

	      })
	  }
	  //显示区号
	  $('.areaCode').bind('click', function(){
	    var par = $(this).closest('form');
	    var areaWrap =par.find('.areaCode_wrap');
	    if(areaWrap.is(':visible')){
	      areaWrap.fadeOut(300)
	    }else{
	      areaWrap.fadeIn(300);
	      return false;
	    }
	  });
	  //选择区号
	  $('.areaCode_wrap').delegate('li', 'click', function(){
	    var t = $(this), code = t.attr('data-code');
	    var par = t.closest('form');
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    par.find('.areaCodeinp').val(code);
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });

    //小区案例详情页 首页预约参观
    $('.lr_con').delegate('.visit','click',function(){
    	$('.order_mask2').show();
    	var par= $(this).closest('.lr_con');
    	//参观工地
    	var home_tit=par.find('.tit').text();  	
    	$('.free_p .home_tit').text(home_tit);
    	//房屋类型
    	var home = par.find('.styles').text();  	
    	$('.free_p .home').text(home);
    	//建筑面积
    	var home_area=par.find('.area').text();  	
    	$('.free_p .home_area').text(home_area);
    	//工地id
    	var conid = $(this).attr("data-id");  	

    	$("#conid").val(conid);

    })

    //小区案例详情页 装修工地预约参观
    $('.lr_content').delegate('.visit','click',function(){
    	$('.order_mask2').show();
    	var par= $(this).closest('.lr_content')
    	//参观工地
    	var h1 = par.find('.build_title')
    	var home_tit=h1.find('a').text();  	
    	$('.free_p .home_tit').text(home_tit);
    	//房屋类型
    	var home = par.find('.styles').text();  	
    	$('.free_p .home').text(home);
    	//建筑面积
    	var home_area=par.find('.area_num').text();  	
    	$('.free_p .home_area').text(home_area);

    	//工地id
    	var conid = $(this).attr("data-id");  	

    	$("#conid").val(conid);

    })
    //楼盘介绍 查看更多
    $('.intro').click(function(){
    	$('.vill_tab li.detail-li').click();
    	var st = $('.tab_content .con3').offset().top-20;

    	$("html,body").animate({scrollTop: st}, 400); 
    	
    })

    //查看工地详情
    $('.site_list').delegate('.siteLi','click',function(){
    	$('.tab_wrap').hide();
    	$('.site_wrap').show();
    	var t=$(this);
    	var id = t.attr('data-id'),
    		imgHtml= t.find('.lf_img2').html(),
    		lrHtml= t.find('.lr_content').html();
    	$('.site_detail .lf_img2').html(imgHtml);	
    	$('.site_detail .detaiCon').html(lrHtml);	
    	$('.site_detail .visit').attr('data-id',id);	
    	siteDetail(id)
    })

    $('.tab_content .index_con a').click(function(){
    	var parid = $(this).closest('.index_con').attr('data-id');
    	console.log(parid);
    	$('.site_list .siteLi[data-id="'+parid+'"]').click();
    })

    function siteDetail(id){
    	var url ="/include/ajax.php?service=renovation&action=constructionDetail&page=1&id="+id;
    	$.ajax({
          url: url,
          type: "GET",
          dataType: "json",
          success: function (data) {           
            if(data && data.state == 100){
              var list 		= data.info;
              var list 		= data.info;
              var stagearr 	= list.stagearr;
              var html=[];
              if(stagearr.length > 0){
                for(var i=0;i<stagearr.length;i++){
                  html.push('<div class="build_con">');
                  var pic = stagearr[i].listpicarr[0].path != "" && stagearr[i].listpicarr[0].path  != undefined ? stagearr[i].listpicarr[0].path  : "/static/images/404.jpg";
                  html.push('<div class="build_tit"><h3 class="buil_state">'+stagearr[i].stageName+'</h3></div>');
                  html.push('<p class="tip">'+stagearr[i].description+'</p>');
                  html.push('<ul class="fn-clear img_ul2">');

                  var listpicarr = stagearr[i].listpicarr;
                  for ( var a = 0; a < listpicarr.length; a++){

					  html.push('<li><img src="'+listpicarr[a].path+'" alt=""></li>');
				  }
                  html.push('</ul>');               
                  html.push('</div> ');                                 
                }
                $(".build_wrap").html(html.join(""));   
                }             
              
            }
          }
         
      })


    }

    //返回工地列表
    $('.fan_a').click(function(){
    	$('.vill_tab li.site-li').click();
    })
	//工地筛选
    $('.tab_content .screen a').click(function(){

    	if(!$(this).hasClass('curr')){
    		$(this).addClass('curr').siblings('').removeClass('curr');
    		getSite(1);
    	}
    	

    })
    var page =1,pageSize = 99;
    //装工地
    getSite();
	function getSite(tr){
		if(tr){
			page =1;
			$(".site_list").html('<div class="loading"><span>'+langData['siteConfig'][38][8]+'</span></div>'); //加载中 

		}
      	var data=[];
      	data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("communityid="+detaiId);
		$('#J_crumbs a.curr').each(function(){
			var type = $(this).closest('dl').attr('data-type');
			var tid = $(this).attr('data-id');
			data.push(type +"="+tid)
		})

        $.ajax({
            url: "/include/ajax.php?service=renovation&action=constructionList&"+data.join("&"),
            type: "GET",
            dataType: "json",
            async:false,
            success: function (data) {
                if(data && data.state == 100){
                   
                    $(".site_list .loading").remove();
                    var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;
                    
                    if(list.length > 0){                      
                        $('.siteNum .red').text(totalCount)
                        for(var i = 0; i < list.length; i++){   
                        	var lId = list[i].stageid;
                        	var html2=[];   
                            html.push('<div class="site_con fn-clear siteLi" data-id="'+list[i].id+'">');                              
                            html.push('     <div class="lf_img2"><a href="javascript:;">');
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                            html.push('             <img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            html.push('     </a></div>');
                            
                            html.push('     <div class="lr_content">');                                                    
                            html.push('     <h3 class="build_title"><a href="javascript:;">'+list[i].title+'</a></h3>');
                            html.push('     <div class="build_info">');                                                                
                            html.push('     <span class="address">'+list[i].company+'</span>');                                                                
                            html.push('     <ul>');                                                                
                            html.push('     <li><span class="area_num">'+list[i].area+'</span>m²</li>');                                                                
                            html.push('     <li>'+list[i].budget+'万</li>');
                            html.push('<li><span class="styles">'+list[i].style+'</span></li>')                                                                
                            html.push('<li>'+list[i].btype+'</li>')                                                                
                            html.push('</ul>')                                                                
                            html.push('</div>')                                                                
                            html.push('<div class="dot_ul">')                                                                
                            html.push('<ul>')  
                            $.ajax({
					            url: "/include/ajax.php?service=renovation&action=type&type=9",
					            type: "GET",					            
					            dataType: "json",
					            async:false,
					            success: function (data) {
					                if(data && data.state == 100){
					                	var list2 = data.info;
					                	
					                	for(var j =0;j < list2.length; j++){
					                		var lisId = list2[j].id;
					                		var cla = lisId == lId ? 'active' : '';
											html2.push('<li class="'+cla+'">'+list2[j].typename+'</li>')
					                	}
					                	
					                }
					            }
                			})                                                             
                            html.push(html2.join(''))                                                                
                            html.push('</ul>')                                                                
                            html.push('</div>')                                                                
                            html.push('</div>')                                                                
                            html.push('</div>')                                                                
                        }
                    
                         $(".site_list").append(html.join(""));                                                                                                 

                    //没有数据
                    }else{
                    	$('.siteNum .red').text('0');
                      	$(".site_list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息                                         
                      
                    }           

                //加载失败
                }else{
                	$('.siteNum .red').text('0');
                    $(".site_list .loading").html(data.info);
                }
            },
            error: function(){
            	$('.siteNum .red').text('0');
                $(".site_list .loading").html(langData['renovation'][4][29]);//网络错误，加载失败！
            }
        });
    }


	//
	//获取装修报价
	$(".reno_submit").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		var txt = f.text();
		console.log(txt)
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		// 区域
		var addr1 = $('#addr1');
		if(addr1.val() == 0 || addr1.val() == "") {
			if (r) {
				errmsg(addr1, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 街道
		var addr2 = $('#addr2');
        if(!$('#addr1').hasClass('noSon')){ 
          if(addr2.val() == 0 || addr2.val() == "") {
              if (r) {
                  errmsg(addr2, langData['renovation'][14][48]);//请选择街道
              }
              r = false;
          }
        }
		// 户型
		var house_type = $('#house_type');
		if(house_type.val() == 0 || house_type.val() == "") {
			if (r) {
				errmsg(house_type, langData['renovation'][4][33]);//请选择户型
			}
			r = false;
		}

		// 请输入面积
		var house_area = $('#house_area');
		var house_areav = $.trim(house_area.val());
		if(house_areav == '') {
			if (r) {
				house_area.focus();
				errmsg(house_area, langData['renovation'][9][28]);//请输入面积
			}
			r = false;
		}

		// 称呼
		var name = $('#price_name');
		var namev = $.trim(name.val());
		if(namev == '') {
			if (r) {
				name.focus();
				errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var phone = $('#price_phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		} else {
			var telReg = !!phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
			if(!telReg){
		    if (r) {
		    	phone.focus();
		    	errmsg(phone,langData['renovation'][14][46]);//请输入正确手机号码
		    }
		    r = false;
			}
		}
		
		var select_l = $("#addr1").find("option:selected").text();
		var select_r = $("#addr2").find("option:selected").text();
      	if(!$('#addr1').hasClass('noSon')){ 
			var address  = select_l+"  "+select_r;
        }else{
          	var address  = select_l;
        }

		if(!r) {
			return false;
		}		
		$('.price_mask').show();
		var data = [];
		data.push("units="+house_type.val());
		data.push("are="+house_areav);
		data.push("people="+namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);
		data.push("type=3");
		data.push("address="+address);
		data.push("resetype=1");
      	if(!$('#addr1').hasClass('noSon')){ 
			data.push("addrid="+addr2.val());
        }else{
          	data.push("addrid="+addr1.val());
        }

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(txt);
				if(data && data.state == 100){//
					$('.price_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][88]);//获取失败，请重试！
				f.removeClass("disabled").text(txt);//
			}
		});		

	});

    //数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;padding:0 5px">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};

	
	$('.map_mask .close_alert').click(function(){
		$('.map_mask').hide()
	})





})
