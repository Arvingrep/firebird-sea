$(function(){
 // 下拉加载
    var isload = false;
    var page=1;
    var pageSize=10;
    $(window).scroll(function() {
    
        var h = 80;  
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
        isload = true; 
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        if(page != 1){
            $(".inv_content ul").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        }       
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=zhaobiao&orderby=3&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".loading").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear">');                                                                                       
                        html.push('<div class="inv_left">');                        
                        html.push('<h3 class="inv_titile">'+list[i].title+'</h3>');
                      	var unittype = list[i].unittype !='' && list[i].unittype !=null ? list[i].unittype : langData['renovation'][3][33];//其他
                        html.push('<p class="hou_style">'+langData['renovation'][4][6]+'：<span>'+unittype+' </span></p>');//户型结构
                        html.push('<p class="price">'+list[i].budget+'</p>');
                        html.push('</div>');
                        html.push('<div class="inv_right">');  
                        var start = list[i].pubdate;  
                        var pub = huoniao.transTimes(start,2)            
                        html.push('<p class="time">'+pub+'</p>'); //   
                        if(list[i].state == 1){
                            html.push('<p class="state">'+langData['renovation'][14][67]+'</p>'); // 招标中 
                        }else if(list[i].state == 0){
                            html.push('<p class="state over">'+langData['renovation'][14][104]+'</p>');//招标审核
                        }else if(list[i].state == 2){
                            html.push('<p class="state ">'+langData['renovation'][14][101]+'</p>');//招标成功
                        }else if(list[i].state == 3){
                            html.push('<p class="state over">'+langData['renovation'][14][102]+'</p>');//招标结束
                        }else if(list[i].state == 4){
                            html.push('<p class="state over">'+langData['renovation'][14][103]+'</p>');//招标结束
                        }                        
                                             
                        html.push('</div>');                                              
                        html.push('</li>');                                               
                    }
                                      
                    $(".inv_content ul").append(html.join(""));                        
                    
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;                        
                        $(".inv_content ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...                        
                    }

                }else{
                    $(".inv_content ul .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".inv_content ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }




})