$(function(){
	$(".mobile_kf #qrcode").qrcode({
	    render: window.applicationCache ? "canvas" : "table",
	    width: 74,
	    height: 74,
	    text: huoniao.toUtf8(window.location.href)
	});
	$('.sub-nav').delegate('li', 'click', function(event) {
		var t = $(this) , i = t.index();
		if(!t.hasClass('on')){
			t.addClass('on').siblings().removeClass('on');
			$('.contbox').eq(i).addClass('conshow').siblings('.contbox').removeClass('conshow');
		}
		$(".pagination").html('').hide();
		if(t.attr("data-action")!='undefined'){
            getList(1);
		}
	});
	var atpage = 1, pageSize = 20;
	function getList(tr){
        var active = $('.sub-nav ul .on'), action = active.attr('data-action'), url;
        if(action=="team"){//团队
        	if(tr){
                atpage = 1;
                $(".allteamlist").html('');
                $(".pagination").html('').hide();
			}
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=zjUserList&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId + "&type=getnormal";
		}else if(action=="esf"){//二手房
            if(tr){
                atpage = 1;
                $(".allteamlist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=saleList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
		}else if(action=="zf"){//租房
            if(tr){
                atpage = 1;
                $(".zulist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=zuList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
        }else if(action=="xzl"){//写字楼
            if(tr){
                atpage = 1;
                $(".xzllist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=xzlList&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
        }else if(action=="sp"){//商铺
            if(tr){
                atpage = 1;
                $(".splist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=spList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
        }else if(action=="cf"){//厂房
            if(tr){
                atpage = 1;
                $(".cflist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=cfList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
        }else if(action=="cw"){//车位
            if(tr){
                atpage = 1;
                $(".cwlist").html('');
                $(".pagination").html('').hide();
            }
            pageSize = 8;//8
            url =  "/include/ajax.php?service=house&action=cwList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&comid=" + storeId;
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
            	var isload = false;
                if (data && data.state == 100) {
                    var list = data.info.list, pageInfo = data.info.pageInfo, page = pageInfo.page, html = [];
                    totalCount = pageInfo.totalCount;
                    if(action=="team"){
                        for (var i = 0, lr; i < list.length; i++) {
                            html.push('<li>');
                            var sf_rz = list[i].certify==1 ? '<i class="isf"></i>' : '';
							var mp_rz = list[i].flag==1 ? '<i class="imp"></i>' : '';
							var level = list[i].level ? '<p><img src="'+list[i].level.icon+'" title="'+list[i].level.name+'" /></p>' : '';
                            html.push('<a href="'+list[i].url+'" class="pershop">个人店铺</a>');
                            html.push('<div class="topbox">');
                            if(list[i].post == 2){
                                html.push('<img class="dz" src="'+templets_skin+'images/dz.png" />');
                            }
                            html.push('<div class="tImgbox"><a href="'+list[i].url+'"><img src="'+list[i].litpic+'" alt=""></a></div><p><a href="'+list[i].url+'">'+list[i].nickname+'</a> '+sf_rz+mp_rz+'</p>'+level+'</div>');

                            html.push('<div class="middbox"><p class="p_icon1"><i></i>'+list[i].zjcomName+'</p>');
							if(list[i].address){
								html.push('<p class="p_icon2"><i></i>'+list[i].address.join(' ')+'</p>');
							}
							html.push('</div>');

                            html.push('<div class="bottombox fn-clear"><p><em>'+list[i].zuCount+'</em><span>出租</span></p><p><em>'+list[i].saleCount+'</em><span>出售</span></p><p><em>'+list[i].sucCount+'</em><span>成交</span></p></div>');

                            html.push('</li>');
						}

                        if(action=="team"){
                        	isload = true;
                        	$(".allteamlist").html(html.join(''));
                        }
					}else if(action=='esf'){
                        for (var i = 0, lr; i < list.length; i++) {
                            lr = list[i];
                            var ivplay = lr.video==1 ? '<i class="ivplay"></i>' : '';
                            var ivr = lr.qj==1 ? '<i class="ivr"></i>' : '';
                            html.push('<li class="fn-clear">');
                            html.push('<div class="imgbox fn-left"><a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>'+ivplay+ivr+'</div>');
                            html.push('<div class="infobox fn-left">');

                            html.push('<div class="lptit fn-clear">');
                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
                            if(lr.price>0){
                                html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>万</span>');
                            }else{
                                html.push('<span class="lpprice"><b>面议</b></span>');
                            }
                            html.push('</div>');
                            var elevatortxt = lr.elevator==1 ? '有电梯' : '无电梯';
                            html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+lr.room+'</span><em>|</em><span>'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.buildage+'年</span><em>|</em><span>'+lr.direction+'</span><em>|</em><span>'+lr.zhuangxiu+'</span><em>|</em><span>'+lr.bno+'/'+lr.floor+'层</span><em>|</em><span>'+elevatortxt+'</span></div><div class="sp_r fn-right">'+parseInt(lr.unitprice).toFixed(0)+' '+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'</div></div>');

                            html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

                            html.push('<div class="lpinf hinf fn-clear">');
                            var user = lr.usertype==0 ? lr.username : lr.nickname;
                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
                            html.push('<div class="hirig fn-right"><a data-type="sale_detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

                            html.push('</div>');

                            html.push('<div class="lpbottom"><div class="lpmark">');
                            for (var j = 0; j < lr.flags.length; j++) {
                                html.push('<span>'+lr.flags[j]+'</span>');
                            }
                            html.push('</div></div>');
                            html.push('</div>');
                            html.push('</li>');
                        }
                        if(action=="esf"){
                        	isload = true;
                            $(".esflist").html(html.join(''));
                        }
					}else if(action=='zf'){
                        for (var i = 0, lr; i < list.length; i++) {
                            lr = list[i];
                            var ivplay = lr.video == 1 ? '<i class="ivplay"></i>' : '';
                            var ivr = lr.qj == 1 ? '<i class="ivr"></i>' : '';


                            html.push('<li class="fn-clear">');

                            html.push('<div class="imgbox fn-left"><a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>'+ivplay+ivr+'</div>');
                            html.push('<div class="infobox fn-left">');

                            html.push('<div class="lptit fn-clear">');
                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
                            if(lr.price>0){
                                html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
                            }else{
                                html.push('<span class="lpprice"><b>面议</b></span>');
                            }
                            html.push('</div>');
                            var elevatortxt = lr.elevator==1 ? '有电梯' : '无电梯';
                            html.push('<div class="lpinf fn-clear"> <div class="sp_l fn-left"><span>'+lr.room+'</span><em>|</em><span>'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.buildage+'年</span><em>|</em><span>'+lr.direction+'</span><em>|</em><span>'+lr.zhuangxiu+'</span><em>|</em><span>'+lr.bno+'/'+lr.floor+'层</span><em>|</em><span>'+elevatortxt+'</span></div> <div class="sp_r fn-right">'+lr.timeUpdate+'更新</div></div>');

                            html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

                            html.push('<div class="lpinf hinf fn-clear">');
                            var user = lr.usertype==0 ? lr.username : lr.nickname;
                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
                            html.push('<div class="hirig fn-right"><a data-type="zu_detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

                            html.push('</div>');

                            html.push('<div class="lpbottom"><div class="lpmark">');
                            for (var j = 0; j < lr.configlist.length; j++) {
                                html.push('<span>'+lr.configlist[j]+'</span>');
                            }
                            html.push('</div></div>');

                            html.push('</div>');
                            html.push('</li>');


                        }
                        if(action=="zf"){
                        	isload = true;
                            $(".zulist").html(html.join(''));
                        }
                    }else if(action=='xzl'){
                        for (var i = 0, lr; i < list.length; i++) {
                            lr = list[i];
                            var ivplay = lr.video == 1 ? '<i class="ivplay"></i>' : '';
                            var ivr = lr.qj == 1 ? '<i class="ivr"></i>' : '';
                            var type = lr.type == 1 ? '<div class="markbox"><span class="m_mark m_cs">出售</span></div>' : '<div class="markbox"><span class="m_mark m_cz">出租</span></div>';



                            html.push('<li class="fn-clear">');

                            html.push('<div class="imgbox fn-left"><a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>'+ivplay+ivr+type+'</div>');
                            html.push('<div class="infobox fn-left">');

                            html.push('<div class="lptit fn-clear">');
                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
                            if(lr.price>0){
                                if(lr.type == 1){
                                    html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>万</span>');
                                }else{
                                    html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>'+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月</span>');
                                }
                            }else{
                                html.push('<span class="lpprice"><b>面议</b></span>');
                            }
                            html.push('</div>');
                            var elevatortxt = '';
                            if(lr.price>0){
								if(lr.type==1){
									elevatortxt = (lr.price / lr.area * 10000).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol');
                            	}else{
                            		elevatortxt = (lr.price * lr.area ).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                            	}
                            }
                            html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span class="priCo">'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.loupan+'</span><em>|</em><span>'+lr.zhuangxiu+'</span><em>|</em><span>'+lr.bno+'/'+lr.floor+'层</span><em>|</em><span>'+lr.protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

                            html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

                            html.push('<div class="lpinf hinf fn-clear">');
                            var user = lr.usertype==0 ? lr.username : lr.nickname;
                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
                            html.push('<div class="hirig fn-right"><a data-type="xzl_detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

                            html.push('</div>');

                            html.push('<div class="lpbottom"><div class="lpmark">');
                            for (var j = 0; j < lr.config.length; j++) {
                                html.push('<span>'+lr.config[j]+'</span>');
                            }
                            html.push('</div></div>');

                            html.push('</div>');
                            html.push('</li>');


                        }
                        if(action=="xzl"){
                        	isload = true;
                            $(".xzllist").html(html.join(''));
                        }
                    }else if(action=='sp'){//商铺
                        for (var i = 0, lr; i < list.length; i++) {
                            lr = list[i];
                            var ivplay = lr.video == 1 ? '<i class="ivplay"></i>' : '';
                            var ivr = lr.qj == 1 ? '<i class="ivr"></i>' : '';
                            var type = lr.type == 1 ? '<div class="markbox"><span class="m_mark m_cs">出售</span></div>' : (lr.type==2 ? '<div class="markbox"><span class="m_mark m_zr">转让</span></div>' : '<div class="markbox"><span class="m_mark m_cz">出租</span></div>');

                            html.push('<li class="fn-clear">');

                            html.push('<div class="imgbox fn-left"><a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>'+ivplay+ivr+type+'</div>');
                            html.push('<div class="infobox fn-left">');

                            html.push('<div class="lptit fn-clear">');
                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
                            if(lr.price>0){
                                if(lr.type == 1){
                                	html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>万</span>');
                                }else{
                                    html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
                                }
                            }else{
                                html.push('<span class="lpprice"><b>面议</b></span>');
                            }
                            html.push('</div>');
                            var elevatortxt = '';
							if(lr.type==1){
								if(lr.price>0){
									elevatortxt = (lr.price / lr.area).toFixed(1) + '万/'+echoCurrency('areaname');
								 }
                           	}else if(lr.type==2){
                           		if(lr.transfer>0){
                           			elevatortxt = '转让费： ' + parseInt(lr.transfer).toFixed(1) + '万';
                           		}
                           	}else if(lr.type==0){
                           		if(lr.price>0){
                           			elevatortxt = (lr.price / lr.area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                           		}
                           	}

                            html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span class="priCo">'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.loupan+'</span><em>|</em><span>'+lr.zhuangxiu+'</span><em>|</em><span>'+lr.bno+'/'+lr.floor+'层</span><em>|</em><span>'+lr.protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

                            html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

                            html.push('<div class="lpinf hinf fn-clear">');
                            var user = lr.usertype==0 ? lr.username : lr.nickname;
                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
                            html.push('<div class="hirig fn-right"><a data-type="sp_detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

                            html.push('</div>');

                            html.push('<div class="lpbottom"><div class="lpmark">');
                            for (var j = 0; j < lr.config.length; j++) {
                                html.push('<span>'+lr.config[j]+'</span>');
                            }
                            html.push('</div></div>');

                            html.push('</div>');
                            html.push('</li>');


                        }
                        if(action=="sp"){
                        	isload = true;
                            $(".splist").html(html.join(''));
                        }
                    }else if(action=='cf'){//厂房
                        for (var i = 0, lr; i < list.length; i++) {
                            lr = list[i];
                            var ivplay = lr.video == 1 ? '<i class="ivplay"></i>' : '';
                            var ivr = lr.qj == 1 ? '<i class="ivr"></i>' : '';

							var type;
                            if(lr.type==2){
								type='<div class="markbox"><span class="m_mark m_cs">出售</span></div>';
							}else if(lr.type==0){
								type='<div class="markbox"><span class="m_mark m_cz">出租</span></div>';
							}else if(lr.type==1){
								type='<div class="markbox"><span class="m_mark m_zr">转让</span></div>';
							}

                            html.push('<li class="fn-clear">');

                            html.push('<div class="imgbox fn-left"><a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>'+ivplay+ivr+type+'</div>');
                            html.push('<div class="infobox fn-left">');

                            html.push('<div class="lptit fn-clear">');
                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
                            if(lr.price>0){
                            	if(lr.type==2){
                            		html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>万</span>');
                            	}else{
									html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
                            	}
                            }else{
                                html.push('<span class="lpprice"><b>面议</b></span>');
                            }
                            html.push('</div>');
                            var elevatortxt = '';
                            if(lr.type==2){
								if(lr.price>0){
									elevatortxt = (lr.price / lr.area).toFixed(0) + '万/'+echoCurrency('areasymbol');
								 }
                           	}else if(lr.type==1){
                           		if(lr.transfer>0){
                           			elevatortxt = '转让费： ' + parseInt(lr.transfer).toFixed(0) + '万';
                           		}
                           	}else if(lr.type==0){
                           		if(lr.price>0){
                           			elevatortxt = (lr.price / lr.area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                           		}
                           	}

                            var typetxt = '';
                            if(lr.type == 0){
                                typetxt = '出租';
                            }else if(lr.type == 1){
                                typetxt = '转让';
                            }else if(lr.type == 2){
                                typetxt = '出售';
                            }


                            html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span class="priCo">'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.bno+'/'+lr.floor+'层</span><em>|</em><span>'+lr.protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

                            html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

                            html.push('<div class="lpinf hinf fn-clear">');
                            var user = lr.usertype==0 ? lr.username : lr.nickname;
                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
                            html.push('<div class="hirig fn-right"><a data-type="cf_detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

                            html.push('</div>');

                            html.push('</div>');
                            html.push('</li>');


                        }
                        if(action=="cf"){
                        	isload = true;
                            $(".cflist").html(html.join(''));
                        }
                    }else if(action=='cw'){//车位
                        for (var i = 0, lr; i < list.length; i++) {
                        	lr = list[i];
                        	html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+lr.url+'"><img src="'+huoniao.changeFileSize(lr.litpic, "large")+'" alt=""></a>');
									if(lr.video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(lr.qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									if(lr.type==1){
										html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									}else if(lr.type==0){
										html.push('<div class="markbox"><span class="m_mark m_cz">出租</span></div>');
									}else if(lr.type==2){
										html.push('<div class="markbox"><span class="m_mark m_zr">转让</span></div>');
									}
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+lr.url+'"><h2>'+lr.title+'</h2></a>');
			                            if(lr.price>0){
			                            	if(lr.type==1){
			                            		html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>万</span>');
			                            	}else{
												html.push('<span class="lpprice"><b>'+parseInt(lr.price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
			                            	}

			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = '';
			                            if(lr.type==1){
											if(lr.price>0){
												elevatortxt = (lr.price / lr.area).toFixed(0) + '万/'+echoCurrency('areasymbol');
											 }
			                           	}else if(lr.type==2){
			                           		if(lr.transfer>0){
			                           			elevatortxt = '转让费： ' + parseInt(lr.transfer).toFixed(0) + '万';
			                           		}
			                           	}else if(lr.type==0){
			                           		if(lr.price>0){
			                           			elevatortxt = (lr.price / lr.area / 30).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
			                           		}
			                           	}

                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+parseInt(lr.area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+lr.community+'</span><em>|</em><span>'+lr.protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

										html.push('<p class="lpinf">['+lr.addr.join(' ')+']  '+lr.address+'</p>');

										html.push('<div class="lpinf hinf fn-clear">');
			                            var user = lr.usertype==0 ? lr.username : lr.nickname;
			                            html.push('<div class="hilef fn-left"><span><i class="iname"></i> '+user+'</span><span><i class="itel"></i> '+lr.contact+'</span></div>');


			                            var classtext = lr.collect==1 ? 'btn_ysc' : '' ;
			                            var classestext = lr.collect==1 ? '已收藏' : '收藏' ;
			                            html.push('<div class="hirig fn-right"><a data-type="cw-detail" data-id="'+lr.id+'" href="javascript:;" class="btn_sc '+classtext+'"><i class="isc"></i> '+classestext+'</a><a href="javascript:;" data-title="'+lr.title+'" class="btn_share" data-url="'+lr.url+'" data-pic="'+lr.litpic+'"><i class="ishare"></i> 分享</a></div>');

			                            html.push('</div>');

									html.push('</div>');
								html.push('</li>');

                        }
                        if(action=="cw"){
                        	isload = true;
                            $(".cwlist").html(html.join(''));
                        }
                    }
					if(isload){
						showPageInfo();
					}
                }else{
                    if(action=="team"){
                        $(".allteamlist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="esf"){
                        $(".esflist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="zf"){
                        $(".zulist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="xzl"){
                        $(".xzllist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="sp"){
                        $(".splist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="cf"){
                        $(".cflist").append('<div class="loading">已加载全部数据！</div>');
                    }else if(action=="cw"){
                        $(".cwlist").append('<div class="loading">已加载全部数据！</div>');
                    }
				}
            }
        });
	}

    //打印分页
    function showPageInfo() {
        var info = $(".pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount/pageSize);
        var pageArr = [];

        info.html("").hide();

        //输入跳转
        var redirect = document.createElement("div");
        redirect.className = "pagination-gotopage";
        redirect.innerHTML = '<label for="">跳转</label><input type="text" class="inp" maxlength="4" /><input type="button" class="btn" value="GO" />';
        info.append(redirect);

        //分页跳转
        info.find(".btn").bind("click", function(){
            var pageNum = info.find(".inp").val();
            if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                atpage = pageNum;
                getList();
            } else {
                info.find(".inp").focus();
            }
        });

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
                prev.onclick = function () {
                    atpage = nowPageNum - 1;
                    getList();
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
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
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
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
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
                    }
                    else {
                        if (i <= 2) {
                            continue;
                        }
                        else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            }
                            else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.onclick = function () {
                                    atpage = Number($(this).text());
                                    getList();
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
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
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
                next.onclick = function () {
                    atpage = nowPageNum + 1;
                    getList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        }else{
            info.hide();
        }
    }

	// 房源委托
	$(".btnWt").bind("click", function(){
		$(".modal-wt").addClass("popup").fadeIn();
		$(".popup_bg").show();
		return false;
	});
	$("body").delegate(".close", "click", function(){
		$(this).parent().hide();
		$(".popup_bg").hide();
	});

	//验证提示弹出层
	function showMsg(msg){
	  $('.modal-wt .dc').append('<p class="ptip">'+msg+'</p>')
	  setTimeout(function(){
		$('.ptip').remove();
	  },2000);
	}

	$('.tab_wt').delegate('li', 'click', function(event) {
		var t = $(this),val = t.attr("data-val");
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
		}
		if(val == "0"){
			$('.zbj').show();
			$('.sbj').hide();
			$('.mprice').hide();
			$('.zrprice').hide();
		}else if(val == "1"){
			$('.sbj').show();
			$('.zbj').hide();
			$('.mprice').hide();
			$('.zrprice').hide();
		}else{
			$('.zbj').hide();
			$('.sbj').hide();
			$('.mprice').show();
			$('.zrprice').show();
		}
	});
	$("body").delegate("#tj", "click", function(){
		var t = $(this), obj = t.closest(".modal-wt");

		if(t.hasClass("disabled")) return false;

		var addr = obj.find("#addr");
		var doorcard = obj.find("#doorcard");
		var area = obj.find("#area");

		var price = obj.find("#price");
		var sprice = obj.find("#sprice");
		var mprice = obj.find("#mprice");
		var zprice = obj.find("#zprice");

		var name = obj.find("#name");
		var phone = obj.find("#telphone");
		var vercode = obj.find("#vercode");

		var errMsg = '';

		if(addr.val() == "" || addr.val() == addr.attr('placeholder')){
			errMsg = "请输入地址";
			showMsg(errMsg);
			return false;
		}else if(doorcard.val() == "" || doorcard.val() == doorcard.attr('placeholder')){
			errMsg = "请输入门牌";
			showMsg(errMsg);
			return false;
		}else if(area.val() == "" || area.val() == area.attr('placeholder')){
			errMsg = "请输入房产证上的面积";
			showMsg(errMsg);
			return false;
		}else{
			if($('.tab_wt li:first-child').hasClass('curr')){
				if(price.val() == "" || price.val() == price.attr('placeholder')){
					errMsg = "请输入您的报价";
					showMsg(errMsg);
					return false;
				}
			}else if($('.tab_wt li:nth-child(2)').hasClass('curr')){
				if(sprice.val() == "" || sprice.val() == sprice.attr('placeholder')){
					errMsg = "请输入您的报价";
					showMsg(errMsg);
					return false;
				}
			}else if($('.tab_wt li:nth-child(3)').hasClass('curr')){
				if(mprice.val() == "" || mprice.val() == mprice.attr('placeholder')){
					errMsg = "请输入您的月租金";
					showMsg(errMsg);
					return false;
				}else if(zprice.val() == "" || zprice.val() == zprice.attr('placeholder')){
					errMsg = "请输入您的转让费";
					showMsg(errMsg);
					return false;
				}
			}
		}

		if(errMsg == ''){
			if(name.val() == "" || name.val() == name.attr("placeholder")){
				errMsg = "请输入您的姓名";
				showMsg(errMsg);
				return false;
			}else if(!userinfo_.phoneCheck){
				if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
					errMsg = "请输入您的手机号码";
					showMsg(errMsg);
					return false;
				}else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
					errMsg = "手机号码格式错误，请重新输入！";
					showMsg(errMsg);
					return false;
				}else if(vercode.val() == "" || vercode.val() == vercode.attr("placeholder")){
					errMsg = "请输入短信验证码";
					showMsg(errMsg);
					return false;
				}
			}
		}


		t.addClass("disabled").html("提交中...");

		var data = [];
		data.push("type=" + $(".tab_wt .curr").attr("data-val"));
		data.push("address=" + $("#addr").val());
		data.push("zjcom=" + $("#zjcom").val());
		data.push("doornumber=" + $("#doorcard").val());
		data.push("area=" + $("#area").val());
		if($(".tab_wt .curr").attr("data-val")==1){
			data.push("price=" + $("#sprice").val());
		}else if($(".tab_wt .curr").attr("data-val")==2){
			data.push("price=" + $("#mprice").val());
		}else{
			data.push("price=" + $("#price").val());
		}
		data.push("username=" + $("#name").val());
		data.push("phone=" + $("#telphone").val());
		data.push("vdimgck=" + $("#vercode").val());
		data.push("transfer=" + $("#zprice").val());
		data.push("sex=" + $("input[name=sex]:checked").val());

		$.ajax({
            url: "/include/ajax.php?service=house&action=putEnturst&"+data.join("&"),
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                if(data.state == 100){
                    $(".modal-wt").removeClass("popup").fadeOut();
					$(".popup_bg").hide();
					alert('提交成功，我们会尽快与您取得联系');
					setTimeout(function(){
						location.reload();
				    },1000);
                }else{
                	t.removeClass("disabled").html('提交');
                    showMsg(data.info);
                }
            },
            error: function(){
            	t.removeClass("disabled").html('提交');
                showMsg('网络错误，提交失败！');
            }
        });
	});

	if(!geetest){
		$(".getCodes").bind("click", function (){
			if($(this).hasClass('disabled')) return false;
			var tel = $("#telphone").val();
			if(tel == ''){
				errMsg = "请输入手机号码";
				showMsg(errMsg);
				$("#telphone").focus();
				return false;
			}else{
				 sendVerCode();
				 //countDown($('.getCodes'), 60);
			}
			$("#vercode").focus();
		})
	}

	var geetestData = "";

	//发送验证码
  function sendVerCode(captchaVerifyParam,callback){
    var phone = $("#telphone").val();
    let param =  "type=verify"+"&phone="+phone+"&areaCode=86"
    if (captchaVerifyParam && geetest == 2) {
        param = param + '&geetest_challenge=' + captchaVerifyParam
    } else if (geetest == 1 && captchaVerifyParam) {
        param = param + captchaVerifyParam
    }
	$.ajax({
	    url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify",
	    data: param,
	    type: "GET",
	    dataType: "jsonp",
	    success: function (data) {
            if(callback){
                callback(data)
            }
	      //获取成功
	      if(data && data.state == 100){
	        countDown($('.getCodes'), 60);
	      //获取失败
	      }else if(data.info != '图形验证错误，请重试！'){
	        alert(data.info);
	      }
	    },
	    error: function(){
	      alert('获取失败');
	    }
	  });
  }


	//倒计时
	function countDown(obj,time){
		obj.html(time+'秒后重发').addClass('disabled');
		mtimer = setInterval(function(){
			obj.html((--time)+'秒后重发').addClass('disabled');
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html('重新发送').removeClass('disabled');
			}
		}, 1000);
	}

	// 收藏
  //$('.btn_sc').click(function(){
  $('.content').delegate('.btn_sc', 'click', function(event) {
    var t = $(this), type = t.hasClass("btn_ysc") ? "del" : "add";
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
      huoniao.login();
      return false;
    }
    if(type == "add"){
      t.addClass("btn_ysc").html("<i></i>已收藏");
    }else{
      t.removeClass("btn_ysc").html("<i></i>收藏");
    }
    var id = t.attr("data-id");
    var temp = t.attr("data-type");
    $.post("/include/ajax.php?service=member&action=collect&module=house&temp="+temp+"&type="+type+"&id="+id);
  });

  //是否使用极验验证码
  var sendvdimgckBtn;

  if(geetest){


        captchaVerifyFun.initCaptcha('web','#codeButton',sendVerCode)
        $(document).on('click','.getCodes',function(){
            var tel = $("#telphone").val();
            if(tel == ''){
                errMsg = "请输入手机号码";
                showMsg(errMsg);
                $("#telphone").focus();
                return false;
            }
            var a = $(this);
            sendvdimgckBtn = a;
            //弹出验证码
			if(geetest == 1){
				captchaVerifyFun.config.captchaObjReg.verify();
			}else{
				$('#codeButton').click()
			}
        });
	}



    //分享功能
    $("html .storeShareBtn").mouseenter(function(){
        var t = $(this), title = t.attr("data-title"), url = t.attr("data-url"), pic = t.attr("data-pic"), site = encodeURIComponent(document.title);
        console.log(url)
        title = title == undefined ? "" : encodeURIComponent(title);
        url   = url   == undefined ? "" : encodeURIComponent(url);
        pic   = pic   == undefined ? "" : encodeURIComponent(pic);
        if(title != "" || url != "" || pic != ""){
            $("#shareBtn").remove();
            var btnHeight = t.height();
            var offset = t.offset(),
                left   = offset.left + "px",
                top    = offset.top + btnHeight + "px",
                shareHtml = [];
            shareHtml.push('<ul>');
            shareHtml.push('<li class="popup_weixin"><a href="javascript:;" class="weixina" data-url="'+url+'">微信</a></li>');
            shareHtml.push('<li class="qzone"><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+url+'&desc='+title+'&pics='+pic+'" target="_blank"  class="sharea">QQ空间</a></li>');
            shareHtml.push('<li class="qq"><a href="http://connect.qq.com/widget/shareqq/index.html?url='+url+'&desc='+title+'&title='+title+'&summary='+site+'&pics='+pic+'" target="_blank"  class="sharea">QQ好友</a></li>');
            shareHtml.push('<li class="sina"><a href="http://service.weibo.com/share/share.php?url='+url+'&title='+title+'&pic='+pic+'" target="_blank"  class="sharea">新浪微博</a></li>');
            shareHtml.push('</ul>');

            $("<div>")
                .attr("id", "shareBtn")
                .css({"left": left, "top": top})
                .html(shareHtml.join(""))
                .mouseover(function(){
                    $(this).show();
                    return false;
                })
                .mouseout(function(){
                    $(this).hide();
                })
                .appendTo("body");


        }
    });
})
