$(function(){
    var objId = $(".QuanList"), isload = false;
    //tab切换
    $('.tabDiv li').click(function(){
        $(this).addClass('curr').siblings('li').removeClass('curr');
        isload = false;
        atpage = 1;
        getList(1);

    })

	getList(1);
    // 上拉加载
    $(window).scroll(function() {
        var allh = $('.QuanList').height();
        var w = $(window).height();
        var scroll = allh  - w;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });
	//结束
	objId.delegate(".end", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            var popOptions = {
              title:'温馨提示',
              confirmTip:'结束后不可继续领券，确定结束吗？',
              isShow:true,
              btnColor:'#1F66F2',
              btnCancelColor:'#000',
              popClass:'shopQuanEnd',
            }
            confirmPop(popOptions,function(){
              $.ajax({
                    url: "/include/ajax.php?service=shop&action=quanEdit&end=1&qid="+id,
                    type:"POST",
                    dataType: "json",
                    success:function (data) {
                        if(data.state ==100){
                            showErrAlert("更新成功");
                            atpage = 1;
                            isload = false;
                            getList(1);
                        }else{
                            showErrAlert("更新失败");
                        }

                    },
                    error:function () {

                    }
                })
            })
		
            
            
		}
	});

    //删除
    objId.delegate(".del", "click", function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
        if(id){
            var popOptions = {
              title:'温馨提示',
              confirmTip:'删除后不可恢复，确定删除优惠券么？',
              isShow:true,
              btnColor:'#1F66F2',
              btnCancelColor:'#000',
              popClass:'shopQuanEnd',
            }
            confirmPop(popOptions,function(){
              $.ajax({
                    url: "/include/ajax.php?service=shop&action=delQuan&qid="+id,
                    type:"POST",
                    dataType: "json",
                    success:function (data) {
                        if(data.state ==100){
                            showErrAlert("更新成功");
                            atpage = 1;
                            isload = false;
                            getList(1);
                        }else{
                            showErrAlert("更新失败");
                        }

                    },
                    error:function () {

                    }
                })
            })
        
            
            
        }
    });

    //点击搜索
    $('.tabDiv .serbtn').click(function(){
        $(this).hide();
        $('.tabDiv').addClass('tabs');
        $('.search_box').addClass('sershow');
    })

    //取消搜索
    $('.tabDiv .qx_btn').click(function(){
        $('.tabDiv .serbtn').show();
        $('.tabDiv').removeClass('tabs');
        $('.search_box').removeClass('sershow');
    })
    //搜索
    $('.ordershopForm form').submit(function(e){
        e.preventDefault();
        atpage = 1;
        getList(1);
        return false;
    })


    function getList(is){
        if(isload) return;
        if (is) {
            objId.html('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
        }
        isload = true;
        var state = $('.tabDiv .curr').attr('data-id');
        var keywd = $("#keyword").val();
    	$.ajax({
            url: "/include/ajax.php?service=shop&action=quanStoreList&state="+state+"&title="+keywd+"&pageSize=7&page="+atpage,       
    		type: "GET",
    		dataType: "jsonp",
    		success: function (data) {
    			if(data && data.state != 200){
                    var emptyTxt = '';
                    if(state == ''){
                        emptyTxt = '还没有添加优惠券哦';
                    }else if(state == '1'){
                        emptyTxt = '还没有领取中的优惠券哦';
                    }else if(state == '2'){
                        emptyTxt = '还没有已领完的优惠券哦';
                    }else if(state == '3'){
                        emptyTxt = '还没有已结束的优惠券哦';
                    }
    				if(data.state == 101){
    					objId.html("<div class='quanEmpty'><div class='imgEmpty'></div><p>"+emptyTxt+"</p></div>");
    				}else{
                        isload = true;
                        $('.loading').remove();
    					var list = data.info.list, pageInfo = data.info.pageinfo, html = [];

    					//拼接列表
    					if(list.length > 0){

    						for(var i = 0; i < list.length; i++){
    							var     item     = [],
    									id       = list[i].id,
    									shoptype = list[i].shoptype,
    									usedate  = huoniao.transTimes(list[i].usedate, 1),
    									promotiotype = list[i].promotiotype,
                                        name = list[i].name,
                                        basicprice = list[i].basic_price,
                                        ktime = list[i].ktime,
    									etime    = list[i].etime,
                                        limit    = list[i].limit,
                                        received    = list[i].received,
                                        number    = list[i].number;
                                ktime = ktime.split(' ')[0].replace(/-/g,'.');
                                etime = etime.split(' ')[0].replace(/-/g,'.');
                                var alluser = allusertxt = '';
                                if(shoptype ==0){
                                    alluser     = 'store';
                                    allusertxt  = '全店通用';
                                }else{
                                    alluser     = 'goods';
                                    allusertxt  = '指定商品';
                                }
                                var statetxt = statecla ='';

                                switch (list[i].state) {
                                    case '0':
                                        statecla = 'blue';
                                        statetxt = '领取中';

                                        if(list[i].sent ==0){
                                            statecla = 'red';
                                            statetxt = '已领完';
                                        }
                                        break;
                                    case '1':
                                        statecla = 'grey';
                                        statetxt = '已结束';
                                        break;

                                }
                                var money = '';
                                if(promotiotype == 0){
                                    money = '<em>'+echoCurrency('symbol')+'</em><strong>'+parseFloat(list[i].promotio)+'</strong>';
                                }else{
                                    money = '<strong>'+parseFloat(list[i].promotio)+'</strong><em>折</em>';
                                }
                                html.push('<div class="item" data-id="'+id+'">');
                                html.push('<div class="itemTop fn-clear">');
                                html.push('    <div class="quanLeft">'+money+'</div>');
                                html.push('    <div class="quanRt">');
                                html.push('        <h2>'+name+'</h2>');
                                html.push('        <div class="quaninfo">');
                                html.push('            <span class="state '+statecla+'">'+statetxt+'</span>');
                                html.push('            <span class="usetype '+alluser+'">'+allusertxt+'</span>');
                                var mktxt = '<em>满'+parseFloat(basicprice)+'可用</em>';
                                if(basicprice == 0){
                                    mktxt = '<em>无门槛</em>'
                                }
                                html.push(mktxt);
                                html.push('        </div>');
                                html.push('        <p class="quanpro">已领取/发行量：'+received+'/'+number+'张</p>');
                                html.push('        <p class="quanpro">已使用：'+list[i].quanCount+'张</p>');
                                html.push('        <p class="quanpro">每人限领：'+limit+'张</p>');
                                html.push('        <p class="quanpro">使用时间：'+ktime+' ~ '+etime+'</p>');
                                html.push('    </div>');
                                html.push('</div>');
                                html.push('<div class="itemBot">');
                                if(list[i].state ==1){//已结束
                                    html.push('    <a href="'+detUrl+'?id='+id+'">查看</a><em></em><a href="javascript:;" class="del">删除</a>');
                                }else{
                                    html.push('    <a href="'+detUrl+'?id='+id+'">查看</a><em></em><a href="'+fabuUrl+'?id='+id+'">修改</a><em></em><a href="javascript:;" class="end">结束</a><em></em><a href="javascript:;" class="copy_btn'+i+' copy_btn" data-clipboard-action="copy" data-clipboard-text="'+list[i].quanurl+'?id='+list[i].id+'">链接</a>');
                                }
                                
                                html.push('</div>');
                                html.push('</div>');
                                
    						}
                            objId.append(html.join(""));
                            var clipboard
                            clipboard = new ClipboardJS('.copy_btn');
                            clipboard.on('success', function(e) {//复制成功
                                $('.suc').addClass('show');
                                setTimeout(function(){
                                    $('.suc').removeClass('show');
                                },1000)
                            });

                            clipboard.on('error', function(e) {//复制失败
                                $('.failed').addClass('show');
                                setTimeout(function(){
                                    $('.failed').removeClass('show');
                                },1000)
                            });
                            totalPage = pageInfo.totalPage;
                             if(atpage <= totalPage){
                                 isload = false;
                             }else{
                                 isload = true;
                             }

    					}else{
                            isload = true;
                            if (objId.html() == "") {
                                objId.append("<div class='quanEmpty'><div class='imgEmpty'></div><p>"+emptyTxt+"</p></div>");
                            }else{
                                objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                            }
    					}

    				}
    			}else{
    				objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
    			}
    		}
    	});
    }


})
