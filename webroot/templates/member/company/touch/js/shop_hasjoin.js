/**
 * 会员中心商城已报名列表
 */

var objId = $(".container ul"),pageSize = 10;
$(function(){


    //状态切换
    $(".comTab .stateUl li").bind("click", function(){
        var t = $(this);
        if(!t.hasClass("active")){
            t.addClass("active").siblings("li").removeClass("active");
            getList(1);
        }
    });

    $(".comTab .typeUl .item").bind("click", function(){
        var t = $(this);    
        t.toggleClass("active").siblings("li").removeClass("active");
        getList(1);
        
    });



    // 下拉加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 100;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });
    getList(1);
    //展开收起
    objId.delegate('.speIng','click',function(){
        var par =$(this).closest('li');
        var h1 = par.find('.showCon').height();
        var h2 = par.find('.hideCon').height();
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            par.find('.ingWrap').animate({'height':'.34rem'},200)
        }else{
            $(this).addClass('active');
            par.find('.ingWrap').animate({'height':h1+h2+'px'},200)
        }
        
        
    })
    // 2023.12.14-增加搜索功能
    $('.comTab ul.typeUl .search').submit(res=>{
        let keywords = $('.typeUl .search input').val();
        getList(1,keywords);
        return false
    })

});

function getList(is,keywords){

    isload = true;

    if(is){
        atpage =1;
        objId.html(''); 
    }

    $('.loading').remove();
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
    var state = $('.stateUl .active a').attr('data-id');
    var type = $('.typeUl .active a').attr('data-id');
    $.ajax({
        url: `/include/ajax.php?service=shop&action=proHuodongList&u=1&huodongstate=${state}&huodongtype=${type}&page=${atpage}&pageSize=${pageSize}&title=${keywords||''}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if(data && data.state == 100){
                var list = data.info.list, pageInfo = data.info.pageInfo, html = []; 
                if(list.length > 0){
                    $('.loading').remove();
                    for(var i = 0; i < list.length; i++){
                        var id         = list[i].id;
                        var hid        = list[i].hid;
                        var detailUrl2 = detailUrl.replace("%id%", id);

                        var cla = 'tuan',txt='拼团';

                        if(list[i].huodongstate == 1){
                            cla = 'qianggou';
                            txt='抢购';
                            editUrl = editUrl1+'?id='+hid;
                        }else if(list[i].huodongstate == 2){
                            cla = 'miaosha';
                            txt='秒杀';
                            editUrl = editUrl2+'?id='+hid;
                        }else if(list[i].huodongstate == 3){
                            cla = 'bargain';
                            txt='砍价';
                            editUrl = editUrl3+'?id='+hid;
                        }else if(list[i].huodongstate == 4){
                            cla = 'tuan';
                            txt='拼团';
                            editUrl = editUrl4+'?id='+hid;
                        }

                        html.push('<li>');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="leftImg">');
                        html.push('<a href="'+detailUrl2+'"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
                        if(list[i].state == 1){
                            if(list[i].huodongtimestate ==1){

                                html.push('<span>活动中</span>');

                            }else if(list[i].huodongtimestate == 2){

                                html.push('<span>已结束</span>');
                            }else{

                                html.push('<span>未开始</span>');
                            }
                        }else if(list[i].state ==3){
                            html.push('<span>已结束</span>');
                        }
                        html.push('</a></div>');
                        html.push('<div class="rightInfo">');
                        html.push(' <div class="titDiv">');
                        html.push('  <span class="'+cla+'">'+txt+'</span>');
                        html.push('  <a href="'+detailUrl2+'">'+list[i].title+'</a>');
                        html.push('  </div>');
                        html.push(' <div class="priceDiv"><span>'+echoCurrency('symbol')+'<span>'+list[i].huodongprice+'</span></span><s>'+echoCurrency('symbol')+list[i].price+'</s>');
                        if(list[i].state == 0){
                          html.push(' <em class="blueColor">等待审核</em>');  
                        }
                        
                        html.push(' </div>');

                        html.push(' <div class="timeDiv"><em>时间:</em> '+list[i].ktime+'~'+list[i].etime+'</div>');
                        //抢购 秒杀
                        if(list[i].huodongstate == 1 || list[i].huodongstate == 2){
                            html.push('<div class="qIng ingDiv">');
                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
                            html.push('<dl><dt>已售：</dt><dd>'+list[i].huodongsales+'</dd></dl>');
                            html.push('</div>');
                        //拼团、砍价    
                        }else if(list[i].huodongstate == 3 ){
                            html.push('<div class="speIng ingDiv">');
                            html.push('<div class="ingWrap">');
                            html.push('<div class="showCon">');
                            html.push('<dl><dt>砍价成功：</dt><dd>'+list[i].successres+'</dd></dl>');
                            html.push('<dl><dt>砍价中：</dt><dd>'+list[i].handres+'</dd></dl>');
                            html.push('</div>');
                            html.push('<div class="hideCon">');
                            html.push('<dl><dt>砍价失败：</dt><dd>'+list[i].failres+'</dd></dl>');
                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
                            html.push('</div>');
                            html.push('</div>');
                            html.push('</div>');
                        }else if(list[i].huodongstate ==4){
                            html.push('<div class="speIng ingDiv">');
                            html.push('<div class="ingWrap">');
                            html.push('<div class="showCon">');
                            html.push('<dl><dt>拼团成功：</dt><dd>'+list[i].successres+'</dd></dl>');
                            html.push('<dl><dt>拼团中：</dt><dd>'+list[i].handres+'</dd></dl>');
                            html.push('</div>');
                            html.push('<div class="hideCon">');
                            html.push('<dl><dt>拼团失败：</dt><dd>'+list[i].failres+'</dd></dl>');
                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
                            html.push('</div>');
                            html.push('</div>');
                            html.push('</div>');
                        }
                        html.push(' <div class="buttonDiv">');
                        html.push('  <a href="'+editUrl+'" class="edit"><i></i>编辑</a>');
                        html.push('  <a href="'+detailUrl2+'" class="yulan"><i></i>预览</a>');
                        html.push(' </div>');
                        html.push('</div>');
                        html.push('</li>');

                    }

                    objId.append(html.join(""));
                    
                    isload = false;
                    //最后一页
                    if(atpage >= pageInfo.totalPage){
                        isload = true;                      
                        objId.append('<p class="loading">已加载全部</p>');
                    }

                }else{
                    $('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                }
            }else{
                $('.loading').html(data.info);
            }
            
        },
        error: function(){
            isload = false;
            $('.loading').html(langData['siteConfig'][20][227]);
        }
    });
}
