$(function(){

    // 下拉加载
    var isload  = false;
    var page=1;
    var pageSize=10;
    
    $(window).scroll(function() {
        var h = $('.art_wrap .com_li').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });

    getList();
    //获取信息列表
    function getList(){

        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("company="+detailId);

        isload = true;
        $('.art_wrap ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=foreman&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    
                    var html = [], html2=[], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){

                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {

                            html.push('<li class="com_li">');
                            html.push('<a href="'+list[i].url+'">');
                            var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                            html.push('<div class="com_bottom">');                        
                            html.push('<div class="middle">');                        
                            html.push('<div class="left_b">');                        
                            html.push('<img src="'+pic+'" alt="">');                        
                            html.push('</div>');                        
                            html.push('<div class="right_b">');
                            html.push('<div class="com1">');
                            html.push('<h4 class="com_type">'+list[i].name+'</h4>');                
                            html.push('<span class="certify"></span>');       
                            html.push('</div>');                
                            html.push('<ul class="right_ul">');
                            if(list[i].works>0){
                                html.push('<li>'+langData['renovation'][14][94].replace('1',list[i].works)+'</li>');//1年工龄
                            }else{
                                html.push('<li>'+langData['renovation'][14][72]+'</li>');//暂无工作经验
                            }  

                            if(list[i].click>0){
                                html.push('<li>'+langData['renovation'][15][9].replace('1',list[i].click)+'</li>');//访问1次
                            }else{
                                html.push('<li>'+langData['siteConfig'][20][592]+'</li>');//暂无
                            }                                                            
                            html.push('</ul>');                
                            html.push('<p class="artist_order">'+langData['renovation'][0][20]+'</p>');  //  立即预约            
                            html.push('</div>');                
                            html.push('</div>');                
                            html.push('<div class="bottom">');  
                                                
                            html.push(' <p><span>'+langData['renovation'][0][33]+'</span>'); //个人简介 
                            if(list[i].note){ 
                                html.push(' <span class="art_con">'+list[i].note+'</span>'); //  
                            }else{
                                html.push(' <span class="art_con">'+langData['siteConfig'][20][592]+'</span>'); //暂无  
                            }
                            html.push('</p>');                
                            html.push('</div>');                
                            html.push('</div>');             
                            html.push('</a>');
                            html.push('</li>');                     
                        }                                        
                        $(".art_wrap .com_ul").append(html.join(""));
                            
                        
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                       
                            $(".art_wrap .com_ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>'); //到底了...                       
                        }
                    }else{
                        isload = true;
                        $(".art_wrap .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }

                }else{
                    isload = true;
                    $(".art_wrap .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".art_wrap .loading").html(langData['renovation'][2][29]); //网络错误，加载失败...
            }
        });


    }




})