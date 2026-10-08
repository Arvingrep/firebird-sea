$(function () {

    // 滑动加载
    var servepage = 1;
    var totalpage = 0;
    var isload = false;
    var pageSize = 10;
    var sflag = 0;// 让 1 2 3名只加载一次
	var paiming = 0;
    getList();
    function  getList(){

        $('.loading').show().children('span').text(langData['siteConfig'][38][8]);//加载中...
        var url ="/include/ajax.php?service=member&action=fenxiaoRankList&page="+ servepage +"&pageSize="+pageSize;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var list=[];
                var datalist = data.info;
                if(data.state == 100){
                    $('.loading').hide();
                    // totalpage = data.info.pageInfo.totalPage;
                    var sum = (servepage-1)*pageSize;
                    for(var i=0;i<datalist.length;i++){

						if(uid == datalist[i].id){
							paiming = (sum+i+1);
						}

                        list.push('<dd class="table_tr">');
                        if(i<3 && sflag == 0){
                            list.push('<div class="t_num orIcon orIcon'+(sum+i+1)+'"></div>');
                        }else{
                            list.push('<div class="t_num">'+(sum+i+1)+'</div>');
                        }
                        list.push('<div class="t_name"><a href="'+masterDomain+'/user/'+datalist[i].id+'">')
                        var pic = datalist[i].photo ? datalist[i].photo : '/static/images/noPhoto_100.jpg';
                        list.push('<div class="tLogo"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';"></div>')
                        list.push('<p>'+datalist[i].nickname+'</p>')
                        list.push('</a></div>')
                        var price = datalist[i].amount;
                        if(price >= 10000){
                            price = (price/10000).toFixed(1);
                            list.push('<div class="t_count"><span>'+price+'</span>w</div>')
                        }else{
                            list.push('<div class="t_count"><span>'+price+'</span></div>')
                        }

                        list.push('</dd>')


                    }
                    sflag = 1;
                    isload = false;
                    $(".bd_list dl").append(list.join(''));
                    if(servepage >= totalpage){
                        $('.loading span').text(langData['siteConfig'][20][429]).parent().show();//已加载全部数据
                    }

					if(paiming){
						$('#paiming strong').html(paiming);
						$('#paiming').show();
					}else{
						$('#paiming').html(langData['siteConfig'][54][25]);  //未取得排名，继续加油哦！
						$('#paiming').show();
					}
                }else {
                    $('.loading span').text(data.info);//
                }
            },
            error: function(){
                $('.loading span').text(langData['siteConfig'][37][80]);//请求出错请刷新重试
            }
        })
    }

    //滚动底部加载
    // $(window).scroll(function() {
    //     var allh = $('body').height();
    //     var w = $(window).height();
	//
    //     var s_scroll = allh - 50 - w;
	//
    //     //服务列表
    //     if ($(window).scrollTop() > s_scroll && !isload) {
    //         servepage++;
    //         isload = true;
    //         if(servepage <= totalpage){
    //             getList();
    //         }
	//
    //     };
	//
    // });




});
