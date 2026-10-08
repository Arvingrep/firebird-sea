

$(function(){

	var con = $('.content'), clist = con.children('ul');
    var isload = false;
    var pageInfo = {totalCount:-1,totalPage:0};
	//下拉加载
	$(window).scroll(function(){

		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			getlist();
		}
	});
	getlist();
	//获取数据的方法
	function getlist(is){
        isload = true;
        $('.loading').remove();
        con.append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');//正在加载，请稍后······
        var  data = [];
        data.push('page='+page);
        data.push('pageSize='+pageSize);
		$.ajax({
            url: '/include/ajax.php?service=vote&action=vlist&uid=' + uid,
            type: 'GET',
            data: data.join('&'),
            dataType: 'json',
            success: function(data){
                if(data){
                    if(data.state == 100){
                        var info = data.info, list = info.list, html = [];
                        if(pageInfo.totalCount == -1){
                            pageInfo.totalCount = info.pageInfo.totalCount;
                            pageInfo.totalPage = info.pageInfo.totalPage;
                        }
                        if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                var obj = list[i], item = [];
                                state = obj.state;
                                var stateTxt = '',baotxt='';
                                if (state == 1) {
                                    stateTxt = langData['business'][5][115];//投票进行中
                                    baotxt = langData['business'][5][114];//去投票
                                }else {
                                    stateTxt = langData['business'][5][116];//投票已结束
                                    baotxt = langData['siteConfig'][6][175];//查看
                                }
                                var pic = obj.litpic == false || obj.litpic == '' ? '/static/images/blank.gif' : obj.litpic;
                                item.push('<li>');
                                item.push(' <a href="'+obj.url+'">');
                                item.push('    <div class="top_img">');
                                item.push('     <img src="'+pic+'" alt="">');

                                item.push('     <span class="addr">'+stateTxt+'</span>');
                                item.push('    </div>');
                                item.push('    <h2>'+obj.title+'</h2>');
                                item.push('    <div class="huodongInfo">');
                                item.push('        <div class="fn-left info">');
                                item.push('          <h3><i class="clock"></i>'+ langData['business'][5][112]+'：'+obj.click+'</h3>');//访问量
                                item.push('          <p>'+langData['business'][5][113].replace('1',obj.join)+'</p>');//已投<strong>1</strong>票
                                item.push('         </div>')
                                item.push('         <div class="fn-right go">'+baotxt+'</div>');//去报名
                                item.push('    </div>');
                                item.push(' </a>');
                                item.push('</li>');

                                html.push(item.join(""));
                            }
                        }

                        checkResult();
                        clist.append(html.join(""));
                    }else{
                        checkResult();
                    }
                }else{
                    checkResult();
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][528]);//网络错误，请刷新重试
            }
        })
	}

    function checkResult(){
        if(pageInfo.totalCount <= 0){
            $('.loading').text(langData['siteConfig'][20][126]);//暂无相关信息！
            isend = true;
        }else{
            if(pageInfo.totalPage == page){
                isend = true;
                $('.loading').addClass('toend').text(langData['siteConfig'][45][87]);//已加载全部信息！
            }else{
                $('.loading').remove();
                isload = false;
            }
        }
    }


})
