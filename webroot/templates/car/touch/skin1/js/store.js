$(function () {

    var servepage = 1;
    var isload = false;
    // 获取汽车数据
    getStoreList();
    function  getStoreList(tr){
        if(tr){
			servepage = 1;
            $('.store-list').html('');
        }
        var url ="/include/ajax.php?service=car&action=storeList&page="+ servepage +"&pageSize=10";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var datalist = data.info.list, html = [];
                var txt01 = langData['car'][1][4];/*店铺在售*/
                if(data.state == 100){
                    totalpage = data.info.pageInfo.totalPage;
                    for(var i=0;i<datalist.length;i++){
                        var iconA = '';
                        if(datalist[i].authattrAll.length>0){
                            for(var j=0;j<datalist[i].authattrAll.py.length;j++){
                                iconA += ' <i class="icon_'+datalist[i].authattrAll['py'][j]+'"></i> ';
                            }
                        }
                        var salenums = datalist[i].salenums ? datalist[i].salenums : 0;
                        var soldnums = datalist[i].soldnums ? datalist[i].soldnums : 0;
                        html.push('<li><a href="'+datalist[i].url+'">');
                        html.push('<div class="store-info fn-clear">');
                        html.push('<div class="logo"><img src="'+datalist[i].logo+'" alt=""></div>');
                        html.push('<div class="info"><h3>'+datalist[i].title + iconA +'</h3><p class="nums"><span class="nn">'+txt01+'：'+salenums+langData['car'][6][82]+' </span><span>'+langData['car'][6][83]+'：'+soldnums+langData['car'][6][82]+'</span></p></div>');
                        html.push('</div>');
                        if(datalist[i].picsAll.length>0){
                            html.push('<div class="imgs fn-clear">');
                            for(var m=0;m<datalist[i].picsAll.length;m++){
                                if(m>2) break;
                                html.push('<div class="imgs-item"><img src="'+datalist[i].picsAll[m]+'" alt=""></div>');
                            }
                            html.push('</div>');
                        }
                        html.push('</a></li>');
                    }
                    $('.store-list').append(html.join(''))
                    isload = false;
                    if(servepage == totalpage){
                        isload = true;
                        $('.loading span').text(langData['car'][6][69]);
                    }

                }else {
                    isload = true;
                    $('.loading span').text(langData['siteConfig'][20][126]);
                }
            },
            error: function(){
                $('.loading span').text(langData['car'][6][65]);
            }
        })
    }

    $(window).scroll(function() {
        var sh = $('.list-box .loading').height();
        var allh = $('body').height();
        var w = $(window).height();

        var s_scroll = allh - sh - w;

        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            servepage++;
            isload = true;
            if(servepage <= totalpage){
                getStoreList();
            }

        };

    });

    // 回到顶部
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>200 ){
            $(".top").show();
        }else {
            $(".top").hide();
        }
    });


});