

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
            url: '/include/ajax.php?service=huodong&action=hlist&uid=' + uid,
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
                                item.push('<li>');
                                item.push(' <a href="'+obj.url+'">');
                                item.push('    <div class="top_img">');
                                item.push(`     <img src="${obj.litpic}" onerror="this.src='/static/images/404.jpg'">`);
                                item.push('     <span class="addr"><i class="addr_icon"></i>'+obj.addrname[1] + ' ' + (obj.addrname[2] && obj.addrname[2] != undefined ? obj.addrname[2] : "")+' </span>');
                                if(obj.feetype == 0){
                                    item.push('    <i class="free_icon"></i>');//活动免费时的图标
                                }
                                item.push('    </div>');
                                item.push('    <h2>'+obj.title+'</h2>');
                                item.push('    <div class="huodongInfo">');
                                item.push('        <div class="fn-left info">');
                                item.push('          <h3><i class="clock"></i>'+huoniao.transTimes(obj.began,1)+ langData['business'][5][126]+'</h3>');//开始
                                item.push('          <p>'+langData['business'][5][120].replace('1',obj.reg)+'</p>');//已报名<strong>1</strong>人
                                item.push('         </div>')
                                item.push('         <div class="fn-right go">'+langData['business'][5][121]+'</div>');//去报名
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
            $('.loading').text(langData['business'][5][127]);//暂无相关活动
            isend = true;
        }else{
            if(pageInfo.totalPage == page){
                isend = true;
                $('.loading').addClass('toend').text(langData['business'][5][128]);//已显示全部活动
            }else{
                $('.loading').remove();
                isload = false;
            }
        }
    }


})
