$(function(){

    // 下拉加载

    var isload = false;
    var page=1;
    var pageSize=10;
    
    
    $(window).scroll(function() { 
        var h = 60;
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w; 
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });

    getList()
    //获取信息列表
    function getList(){
        if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("fid="+id);
        data.push("type=0");

        isload = true;
        $('.wiki_container ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=article&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    
                    var html = [], html2=[], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li class="fn-clear">');
                            html.push('<a href="'+list[i].url+'">');
                            var pic = list[i].litpic
                            if(pic !=""){
                                html.push('<div class="right_b">');
                                html.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';">');
                                html.push('</div>');
                            }
                             

                            html.push('<div class="left_b">');                        
                            html.push('<p class="wiki_title">'+list[i].title+'</p>');                        
                            html.push('<div class="wiki_info">');
                            var pub = list[i].pubdate;                    
                            // var pubT = huoniao.transTimes(pub,2);                    
                            html.push('<p class="wiki_time"><span>'+pub+'</span></p>');                        
                            html.push('<p class="wiki_read">'+langData['renovation'][14][96].replace('1',list[i].click)+'</p>');//1次浏览                     
                            html.push('</div>');                        
                            html.push('</div>');
                                           
                            html.push('</a>');
                            html.push('</li>');                                           
                        }
                                            
                        $(".wiki_container ul").append(html.join(""));                   
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                       
                            $(".wiki_container ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            
                        }
                    }else{
                        isload = true;
                        $(".wiki_container .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    

                }else{
                    isload = true; 
                    $(".wiki_container  .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".wiki_container .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });


    }




})