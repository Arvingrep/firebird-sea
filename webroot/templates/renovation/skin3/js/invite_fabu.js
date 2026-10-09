$(function(){
	$(".com_list li:nth-child(7n)").css("margin-right","0");

	$('.com_list').delegate('li','click',function(){
		if($(this).hasClass('active')){
            $(this).toggleClass('active');
            
        }else{
            if($('.com_list li.active').size() < 3){
                $(this).toggleClass('active');


            }else{
                alert(langData['renovation'][4][31]);//最多只能选择三个

            }
        }
	})
	$('.inv_tab li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
	})

	$('#expert').click(function(){
		$('.inv_con').hide();
		$('.apply').removeClass('comApply');
	})
	$('#self').click(function(){
		$('.inv_con').show();
		$('.apply').addClass('comApply');
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
	//搜索公司
	$('.renoform_go').click(function(){
		var keyWords = $('.reno_form3 #keywords').val();
		if(keyWords!=''){
			getCompany(1)
		}
		return false;

	})  
	//加载
	var subpage = 1,teapage = 1,pageSize = 28,pageSize2 = 7;
    var fload = 1; // 是否第一次加载第一页
    var fload2 = 1; // 是否第一次加载第一页
    //初始加载
    getCompany();
    getZb();
    //装修公司
	function getCompany(tr){
		if(tr){
			$('.com_list').html('');
			$('.pagination').html('');
		}
      	$('.noserach').remove();
		var keyWords = $('.reno_form3 #keywords').val();
        if( fload != 1){
            $(".com_list").html('<div class="loading"><span>'+langData['siteConfig'][38][8]+'</span></div>'); //加载中
        }
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=store&title="+keyWords+"&page="+subpage+"&pageSize="+pageSize,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".com_list .loading").remove();
                        var list = data.info.list, html = [],totalCount = data.info.pageInfo.totalCount;
                        $('.num .total').text(totalCount)
                        if(list.length > 0){                            
                            if(fload != 1){
                                for(var i = 0; i < list.length; i++){      
                                    html.push('<li data-id="'+list[i].id+'">');                              
                                    html.push('     <div class="inv_img">');
                                    var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                                    html.push('             <img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                                    html.push('     </div>');
                                    
                                    html.push('     <p class="inv_info">'+list[i].company+'</p>');                                                                
                                    html.push('</li>');
                                }
                            
                                 $(".com_list").append(html.join(""));
                                 $('.com_list li:nth-child(7n)').css('margin-right','0');
                                
                            }
                                                       
                            showPageInfo(totalCount);


                        //没有数据
                        }else{
                          if(tr){
                             $('.num .total').text(0)
                          	$('.com').append('<div class="noserach"><img src="'+templatePath+'images/empty.png" alt=""><p>'+langData['renovation'][14][4]+'</p></div>')//暂无搜到任何数据
                          }else{
                          	$(".com_list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
                          }
                          
                          
                        }

                    //请求失败
                    }else{
                    	if(tr){
                          $('.num .total').text(0)
                    		$('.com').append('<div class="noserach"><img src="'+templatePath+'images/empty.png" alt=""><p>'+langData['renovation'][14][4]+'</p></div>')//暂无搜到任何数据
                    	}else{
                    		$(".com_list .loading").html(data.info);
                    	}
                        
                    }

                //加载失败
                }else{
                    $(".com_list .loading").html(data.info);
                }
            },
            error: function(){
                $(".com_list .loading").html(langData['renovation'][4][29]);//网络错误，加载失败！
            }
        });
    }
	//打印分页1
    function showPageInfo(totalCount) {
        fload++;
        var info = $(".pagination");
        var nowPageNum = subpage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','javascript:;');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getCompany();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getCompany();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getCompany();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','javascript:;');
                                page.onclick = function () {
                                    subpage = Number($(this).text());
                                    getCompany();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            subpage = Number($(this).text());
                            getCompany();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','javascript:;');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getCompany();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }
    //数据列表
    function getZb(tr){
        if( fload2 != 1){
            $(".con3_bottom ul").html('<div class="loading"><span>'+langData['siteConfig'][38][8]+'</span></div>'); //加载中
        }
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=zhaobiao&page="+teapage+"&pageSize="+pageSize2,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".con3_bottom .loading").remove();
                        var list = data.info.list, html = [],html2 = [],totalCount = data.info.pageInfo.totalCount;
                        if(list.length > 0){
                            if( fload2 != 1){
                                for(var i = 0; i < list.length; i++){  						
                                    html.push('<li class="fn-clear">');

                                    html.push('    <div class="info_l"> ');
                                    html.push('     <p class="info_title">'+list[i].title+'</p>');

                                    html.push('     <div class="info_bottom">');
                                    html.push('         <p>');
                                    html.push('         <span class="trim_method">'+langData['renovation'][4][6]+'：其他</span>');//户型结构
                                    var start = list[i].pubdate;  
                        			var pub = huoniao.transTimes(start,2)  
                                    html.push('         <span>'+langData['renovation'][14][69]+'：'+pub+'</span>');//发布时间
                                    html.push('         </p> ');
                                    html.push('      </div>');
                                    html.push('     </div>');
                                    html.push('      <div class="info_m">'+list[i].budget+'</div>');
                                    if(list[i].state==1){
                                    	html.push('<div class="info_r">'+langData['renovation'][14][67]+'</div>');//招标中
                                    }else{
                                    	html.push('<div class="info_r trim_over">'+langData['renovation'][14][68]+'</div>');//招标结束
                                    }
                                    html.push('</li>');
                                }    
                                    

                                $(".con3_bottom ul").append(html.join(""));
                            }
                            
                            showPageInfo2(totalCount);

                        //没有数据
                        }else{

                          $(".con3_bottom ul").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
                        }

                      //请求失败
                    }else{

                        $(".con3_bottom ul .loading").html(data.info);
                    }

                //加载失败
                }else{
                    $(".con3_bottom ul").append('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
                }
            },
            error: function(){
                
                $(".con3_bottom ul .loading").html(langData['renovation'][4][29]);//网络错误，加载失败！
            }
        });
    }

    //打印分页2
    function showPageInfo2(totalCount) {
        fload2++;
        var info = $(".pagination2");
        var nowPageNum = teapage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize2);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','javascript:;');
                prev.onclick = function () {
                    teapage = nowPageNum - 1;
                    getZb();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getZb();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getZb();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','javascript:;');
                                page.onclick = function () {
                                    teapage = Number($(this).text());
                                    getZb();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','javascript:;');
                        page.onclick = function () {
                            teapage = Number($(this).text());
                            getZb();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','javascript:;');
                next.onclick = function () {
                    teapage = nowPageNum + 1;
                    getZb();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }

	//提交立即申请
	$(".apply").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		var txt = f.text();
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = $.trim(par.find('.areaCodeinp').val());
		if(f.hasClass("comApply")){//装修公司申请
			if($('.com_list li.active').size() < 3){
				alert(langData['renovation'][1][40]);//请选择3家装修公司
				r = false;
			}

		}
		// 区域
		var addr1 = $('#addr1');
		if(addr1.val() == 0 || addr1.val() == "") {
			if (r) {
				errmsg(addr1, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 详细地址
		var address = $('#address');
		var addressv = $.trim(address.val());
		// if(addressv == '') {
		// 	if (r) {
		// 		address.focus();
		// 		errmsg(address, langData['renovation'][14][56]);//请填写详细地址
		// 	}
		// 	r = false;
		// }
		// 户型结构
		var house_type = $('#house_type');
		// if(house_type.val() == 0 || house_type.val() == "") {
		// 	if (r) {
		// 		errmsg(house_type, langData['renovation'][4][33]);//请选择户型
		// 	}
		// 	r = false;
		// }
		// 装修预算
		var price = $('#price');
		// if(price.val() == 0 || price.val() == "") {
		// 	if (r) {
		// 		errmsg(price, langData['renovation'][1][43]);//请选择装修预算
		// 	}
		// 	r = false;
		// }
		// 小区名字
		var vill_name = $('#vill_name');
		var vill_namev = $.trim(vill_name.val());
		// if(vill_namev == '') {
		// 	if (r) {
		// 		vill_name.focus();
		// 		errmsg(vill_name, langData['renovation'][1][5]);//请填写您的小区
		// 	}
		// 	r = false;
		// }
		// 房屋面积
		var work_year = $('#work_year');
		var work_yearv = $.trim(work_year.val());
		// if(work_yearv == '') {
		// 	if (r) {
		// 		work_year.focus();
		// 		errmsg(work_year, langData['renovation'][14][57]);//请填写房屋面积
		// 	}
		// 	r = false;
		// }
		// 称呼
		var name = $('#name');
		var namev = $.trim(name.val());
		// if(namev == '') {
		// 	if (r) {
		// 		name.focus();
		// 		errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var phone = $('#phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		}

		if(!r) {
			return false;
		}		
		f.addClass("disabled").text(langData['renovation'][14][59]);//申请中...

		var data = [];
		data.push("addrid="+addr1.val());
		data.push("address="+addressv);
		data.push("unittype="+house_type.val());
		data.push("budget="+price.val());
		data.push("community="+vill_namev);
		data.push("area="+work_yearv);
		data.push("people="+namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);
		if(f.hasClass("comApply")){//装修公司申请
			var comp = [];
			$('.com_list li.active').each(function(){
				var cid = $(this).attr('data-id')
				comp.push(cid);
			})
			data.push("company="+comp.join(','));
		}

		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendZhaobiao",
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				f.removeClass("disabled").text(txt);//
				if(data && data.state == 100){
					$('.order_mask').show()
					
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['renovation'][14][87]);//申请失败，请重试！
				f.removeClass("disabled").text(txt);//
			}
		});


	});
	$('.order_mask .close_alert').click(function(){
        location.href = channelDomain+"/index.html";
    })
     $('.order_mask .see').click(function(){
        location.href = channelDomain+"/index.html";
    })

    //数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};
	

})
