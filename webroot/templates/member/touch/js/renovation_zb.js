$(function(){
    var page = 1;
    var isload = false;
    var objId = $('.wrap ul');

    //加载
    $(window).scroll(function() {       
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 60;
        if ($(window).scrollTop() >= scroll && !isload) {
            page++;
            getList();
        };
    });
    getList();
    function getList() {
        if(isload) return false;
        isload = true;
        objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        var url ="/include/ajax.php?service=renovation&u=1&action=zhaobiao&page="+page +"&pageSize=5";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;          
                if(data && data.state == 100){
                    var list = data.info.list,html=[];
                    var totalpage = data.info.pageInfo.totalPage;
                    if(list.length > 0){
                        var aUrl = detailUrl + "?id=";
                        
                        $('.loading').remove();
                        for(var i=0;i<list.length;i++){
                            var id = list[i].id;

                            var stateclass = "state";
                            var statename  = "";

                            switch (list[i].state ) {
                                case '0':
                                    statename = "招标审核中";
                                    break;
                                case '1':
                                    statename = "招标中";
                                    stateclass = "state in";
                                    break;
                                case '2':
                                    statename = "招标成功";
                                    break;
                                case '3':
                                    statename = "招标结束";
                                    break;
                                case '4':
                                    statename = "停止结束";
                                    break;
                            }


                            html.push('<li>');
                            html.push('  <a href="'+aUrl+id+'">');

                            html.push('    <div class="info_top">');
                            var pub = list[i].pubdate;
                            var time = huoniao.transTimes(pub,1)
                            html.push('      <span class="time">'+langData['renovation'][14][69]+'：'+time+'</span>');//发布时间
                            html.push('       <span class="'+stateclass+'">'+statename+'</span>');//招标中加类名 in
                            html.push('     </div>');
                            html.push('     <div class="info_middle">');
                            html.push('        <p class="info_tit">'+list[i].title+'</p>');
                            html.push('        <p class="inv_price">'+list[i].budget+'</p>');//万
                            html.push('        <p class="see_more">'+langData['renovation'][8][31]+'</p>');//查看详情
                            html.push('     </div>');
                            html.push('     <div class="info_bottom"><img src="'+templatePath+'images/renovation/place.png" alt="">'+list[i].address+'</div>');
                            html.push('    </a>');                                
                            html.push('</li>');                           
                        }
                        objId.append(html.join(""));
                        isload = false;
                        if(page >= totalpage){ 
                          isload = true;                 
                          objId.append('<div class="loading">'+langData['renovation'][2][25]+'</div>');   //已显示全部
                        }
                    }else{
                        objId.find(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                }else {
                    objId.find(".loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                objId.find(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        })
    }






});
