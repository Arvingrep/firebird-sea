$(function(){

    var page = 1;
    var loadMoreLock = false;
    var objId = $('.orlist ul');

      //加载
    $(window).scroll(function() {       
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            page++;
            getList();
        };
    });
    getList(1);
    function getList(tr) {
        if(tr){
           objId.html('');
        }
        var url;
        $('.loading').remove();
        objId.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中... 
        if (state == 1) {
            url = "/include/ajax.php?service=marry&action=getrese&u=1&page="+atpage+"&pageSize="+pageSize;
        }else{
            url = "/include/ajax.php?service=marry&action=getContactlog&u=1&page="+atpage+"&pageSize="+pageSize;

        }
        loadMoreLock = true;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var list = data.info.list;
                if(data && data.state == 100){
                    var html   = [];
                    var defend =  certify = listpic =  domain = "";
                    var pageinfo = data.info.pageInfo;
                    if(list.length >0){

                        for(var i=0;i<list.length;i++){
                            companyid      = list[i].company

                            var stUrl = state==1?storeUrl.replace('%id%',companyid):list[i].link;
                            var litpic = state==1?list[i].litpic:list[i].img;
                            var pubdate  = state==1?huoniao.transTimes(list[i].pubdate, 1):huoniao.transTimes(list[i].date, 1);
                            html.push('<li>');
                            html.push('    <a href="'+stUrl+'">');
                            html.push('      <div class="left_img"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                            html.push('      <div class="r_content">');
                            html.push('          <h3 class="vtitle">'+list[i].title+'</h3>');
                            html.push('          <p class="vinfo">'+langData['marry'][8][55]+'：'+pubdate+'</p>');//提交时间
                            html.push('    </div>'); 
                            html.push('    </a>');                       
                            html.push(' </li>');
 
                        }
                        
                        objId.find('.loading').remove();

                        if(page == 1){
                            objId.html(html.join(""));
                        }else{
                            objId.append(html.join(""));
                        }
                        
                        loadMoreLock = false;
                        if(page >= pageinfo.totalPage){
                            loadMoreLock = true;                           
                            objId.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            
                        }
                    }else{
                        loadMoreLock = false;                       
                        objId.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        
                    }
                }else {
                    loadMoreLock = false;
                    
                    objId.find('.loading').html(data.info);
                    
                }
            },
            error: function(){
                loadMoreLock = false;              
                objId.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                
            }
        })
    }



});
