

$(function(){
    function transTimes(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
          return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
          return (year+'-'+month+'-'+day);
        }else if(n == 3){
          return (month+'-'+day);
        }else if(n == 4){
          return (hour+':'+minute);
        }else{
          return 0;
        }
    }

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
            url: '/include/ajax.php?service=tieba&action=tlist&orderby=pubdate&uid='+uid,
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
                                var lr = list[i], item = [];
                                item.push('<li>');
                                item.push(' <a href="'+lr.url+'">');
                                item.push('    <h2>'+lr.title+'</h2>');
                                item.push('     <h3 class="descrp">'+lr.content+'</h3>');
                                // 图集
                                if(lr.imgGroup && lr.imgGroup.length > 0){
                                    item.push('    <div class="img_box">');
                                    if(lr.imgGroup.length > 3){
                                         item.push('<span class="picNum">'+lr.imgGroup.length+'张</span>');
                                    }
                                    if(lr.imgGroup.length == 1){
                                      item.push('<div class="picbox" style="height:2.5rem;">');
                                      for(var g = 0; g < lr.imgGroup.length; g++){
                                         if(g < lr.imgGroup.length){
                                             item.push(`<img src="${lr.imgGroup[g]}" style="width:60%;height:2.5rem;" onerror="this.src='/static/images/404.jpg'">`);
                                          }
                                      }
                                      item.push('</div>');
                                    }else if(lr.imgGroup.length == 2){
                                      item.push('<div class="picbox" style="height:2rem;">');
                                      for(var g = 0; g < lr.imgGroup.length; g++){
                                         if(g < lr.imgGroup.length){
                                             item.push(`<img src="${lr.imgGroup[g]}" style="width:49%;height:2rem;" onerror="this.src='/static/images/404.jpg'">`);
                                          }
                                      }
                                      item.push('</div>');
                                    }else{
                                      item.push('<div class="picbox" style="height:1.54rem;">');
                                      for(var g = 0; g < lr.imgGroup.length; g++){
                                         if(g < lr.imgGroup.length){
                                             item.push(`<img src="${lr.imgGroup[g]}" style="width:2.1rem;height:1.54rem;" onerror="this.src='/static/images/404.jpg'">`);
                                          }
                                      }
                                      item.push('</div>');
                                    }
                                   item.push('    </div>');
                                }

                                item.push('    <div class="tieInfo">');
                                item.push('      <span class="tie_comment"><i></i>'+lr.reply+'</span>');
                                item.push('      <span class="tie_zhuan"><i></i>464</span>');
                                item.push('      <span class="fn-right">'+transTimes(lr.pubdate, 4)+'</span>');
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
