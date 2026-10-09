$(function(){

// //导航内容切换
    $('.order_header li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.wrap .order_content').eq(i).addClass('order_show').siblings().removeClass('order_show');
        getList();
    });

    var page = 1;
    var loadMoreLock = false;
    var objId = $('.order_free .com_ul');
    var objId2 = $('.order_price .com_ul');
    var objId3 = $('.vill_site ul');

      //加载
    $(window).scroll(function() {       
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() >= scroll && !loadMoreLock) {
            var page = parseInt($('.order_header .active').attr('data-page')),
                totalPage = parseInt($('.order_header .active').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                loadMoreLock = true;
                $('.order_header .active').attr('data-page', page);
                getList();
            }
        };
    });
    getList();
    function getList() {
        var active = $('.order_header .active'), action = active.attr('data-id'), url;
        var page = active.attr('data-page');
        $('.loading').remove();
        if (action == 1) {
            
            objId.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...           
            url =  "/include/ajax.php?service=renovation&action=rese&u=1&resetype=0&page="+page+"&pageSize=8";
          
        }else if(action == 2){
            
            objId2.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=rese&u=1&resetype=1&page="+page+"&pageSize=8";
        }else if(action == 3){
            
            objId3.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
            url = "/include/ajax.php?service=renovation&action=construction&u=1&page="+page+"&pageSize=8";
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
                    var pageinfo = data.info.pageInfo,totalpage = pageinfo.totalPage;
                    active.attr('data-totalPage', totalpage);
                    if(list.length >0){

                        for(var i=0;i<list.length;i++){
                            if(action==1){
                                html.push(' <li class="com_li">');

                                html.push('    <a href="'+list[i].author.domain+'">');
                                html.push('      <div class="com_bottom"> ');                     
                                html.push('        <div class="left_b">');
                                if(list[i].type ==0){
                                    listpic = list[i].author.logo;
                                }else{
                                    listpic = list[i].author.photo;
                                }
                                html.push('          <img src="'+listpic+'" alt="">');
                                html.push('         </div>');
                                html.push('       <div class="right_b">');
                                html.push('         <div class="com1">');
                                html.push('           <h4 class="com_type">'+list[i].designer+'</h4>');
                                console.log(list[i].type)
                                if(list[i].type ==0){

                                    if(list[i].author.certi){
                                        defend = '<span class="defend"></span>';
                                    }else{
                                        defend = '';
                                    }
                                    if(list[i].author.safeguard >0){
                                        certify = '<span class="certify"></span>'
                                    }else {
                                        defend = '';
                                    }
                                }else{
                                    if(list[i].author.certifyState == 1){
                                        certify = '<span class="certify"></span>'
                                    }else{
                                        certify
                                    }
                                    defend ='';
                                }
                                html.push(defend+certify);
                                html.push('         </div>');
                                html.push('         <ul class="right_ul">');
                                if(list[i].type==2){//设计师
                                    //1年工作经验 -- 暂无工作经验
                                    var works='',caseNum='';
                                    works = list[i].author.works>0?langData['renovation'][14][70].replace('1',list[i].author.works):langData['renovation'][14][72];
                                    //1套设计案例 --暂无案例
                                    caseNum = list[i].author.case>0?langData['renovation'][14][100].replace('1',list[i].author.case):langData['renovation'][14][73];

                                    html.push('<li>'+works+'</li>');
                                    html.push('<li>'+caseNum+'</li>');
                                    
                                }else if(list[i].type==1){//工长
                                    html.push('<li>'+list[i].author.address+'</li>');
                                    //1年工龄 -- 暂无工作经验
                                    var works = list[i].author.works > 0?langData['renovation'][14][94].replace('1',list[i].author.works):langData['renovation'][14][72];
                                    //1套案例 --暂无案例
                                    var caseNum = list[i].author.case > 0?langData['renovation'][14][71].replace('1',list[i].author.case):langData['renovation'][14][73];

                                    html.push('<li>'+works+'</li>');
                                    html.push('<li>'+caseNum+'</li>');

                                }else{//公司
                                    html.push('<li>'+langData['renovation'][0][24]+':'+list[i].author.caseCount+'</li>'); //  案例
                                    html.push('<li>'+langData['renovation'][0][25]+':'+list[i].author.diaryCount+'</li>'); //   工地
                                    html.push('<li>'+langData['renovation'][0][4]+':'+list[i].author.teamCount+'</li>');   //     设计师
                                }
                                                                
                                html.push('         </ul>');
                                html.push('       </div>');
                                html.push('       <p class="apply">'+langData['renovation'][8][34]+'</p>');//查看主页
                                html.push('        </div>'); 
                                html.push('    </a>');                       
                                html.push(' </li>');
                            }if(action==2){//在线报价为公司
                                html.push(' <li class="com_li">');
                                html.push('    <a href="'+list[i].author.domain+'">');
                                html.push('      <div class="com_bottom"> ');                     
                                html.push('        <div class="left_b">');
                                html.push('          <img src="'+ list[i].author.logo+'" alt="">');
                                html.push('         </div>');
                                html.push('       <div class="right_b">');
                                html.push('           <div class="com1">');
                                html.push('              <h4 class="com_type">'+list[i].designer+'</h4>');
                                if(list[i].author.certi){
                                    defend = '<span class="defend"></span>';
                                }else{
                                    defend = '';
                                }
                                if(list[i].author.safeguard >0){
                                    certify = '<span class="certify"></span>'
                                }else {
                                    defend = '';
                                }
                                html.push(defend+certify);
                                html.push('            </div>');
                                html.push('            <ul class="right_ul">');
                                html.push('<li>'+langData['renovation'][0][24]+':'+list[i].author.caseCount+'</li>'); //  案例
                                html.push('<li>'+langData['renovation'][0][25]+':'+list[i].author.diaryCount+'</li>'); //   工地
                                html.push('<li>'+langData['renovation'][0][4]+':'+list[i].author.teamCount+'</li>');   //     设计师
                                html.push('             </ul>');
                                html.push('          </div>');
                                html.push('          <p class="apply">'+langData['renovation'][8][34]+'</p>');//查看主页
                                html.push('        </div>'); 
                                html.push('    </a>');                       
                                html.push(' </li>');
                            }else if(action==3){

                                html.push('<li>');
                                html.push('    <a href="'+list[i].url+'">');
                                html.push('      <div class="left_img"><img src="'+list[i].constructionetail.communitylitpic+'" alt=""></div>');
                                html.push('      <div class="r_content">');             
                                html.push('          <h3 class="vill_title">'+list[i].constructionetail.title+'</h3>');
                                html.push('          <p class="vill_info2"><span class="area">'+list[i].constructionetail.area+'</span>'+echoCurrency('areasymbol')+'/'+list[i].constructionetail.budget+'/'+list[i].constructionetail.style+'</p>');
                                html.push('      <p class="visit">'+langData['renovation'][1][8]+'</p>');//查看工地
                                html.push('    </div>'); 
                                html.push('    </a>');                       
                                html.push(' </li>');
                            }                        
 
                        }
                        if (action == 1) {
                            objId.find('.loading').remove();
                            if(page == 1){
                                objId.html(html.join(""));
                            }else{
                                objId.append(html.join(""));
                            }
                        }else if(action == 2){
                            objId2.find('.loading').remove();
                            if(page == 1){
                                objId2.html(html.join(""));
                            }else{
                                objId2.append(html.join(""));
                            }
                        }else if(action == 3){
                            objId3.find('.loading').remove();
                            if(page == 1){
                                objId3.html(html.join(""));
                            }else{
                                objId3.append(html.join(""));
                            }
                        }
                        loadMoreLock = false;
                        if(page >= pageinfo.totalPage){
                            loadMoreLock = true;
                            if (action == 1) {
                                objId.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }else if(action == 2){
                                objId2.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }else if(action == 3){
                                objId3.append('<div class="loading">'+langData['renovation'][15][1]+'</div>');//没有更多啦~
                            }
                        }
                    }else{
                        loadMoreLock = false;
                        if(action == 1) {
                            objId.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }else if(action == 2){
                            objId2.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }else if(action == 3){
                            objId3.find('.loading').html(langData['siteConfig'][20][126]);//暂无相关信息！
                        }
                    }
                }else {
                    loadMoreLock = false;
                    if(action == 1) {
                        objId.find('.loading').html(data.info);
                    }else if(action == 2){
                        objId2.find('.loading').html(data.info);
                    }else if(action == 3){
                        objId3.find('.loading').html(data.info);
                    }
                }
            },
            error: function(){
                loadMoreLock = false;
                if (action == 1) {
                    objId.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 2){
                    objId2.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }else if(action == 3){
                    objId3.find('.loading').html(langData['renovation'][2][29]);//网络错误，加载失败...
                }
            }
        })
    }



});
