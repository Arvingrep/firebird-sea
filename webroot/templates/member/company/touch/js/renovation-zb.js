$(function () {

    var page = 1;
    var isload = false;
    var objId = $('.wrap .cont_ul');
      //加载
    $(window).scroll(function() {
        
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w -60;
        if ($(window).scrollTop() >= scroll && !isload) {
            page++;
            getList();           
        };
    });
    getList()
    function getList() {
        if(isload) return false;
        isload = true;
        $('.loading').remove();
        objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        if(typeof Identity=='string'){
            Identity=JSON.parse(Identity);
        }
        var url ="/include/ajax.php?service=renovation&action=zhaobiao&u=1&b=1&company="+Identity.store.id+"&page="+page +"&pageSize=5";
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
                        $('.loading').remove();                   
                        for(var i=0;i<list.length;i++){
                            html.push('<li class="tutor fn-clear">');
                            html.push('    <div class="top fn-clear">');
                            if(i==1){
                                html.push('  <div class="left_b_on">'+langData['siteConfig'][26][146]+'</div>');//已联系                               
                            }else{
                                html.push('  <div class="left_b"><span>'+list[i].md+'</span><span>'+list[i].his+'</span></div>');
                            }
                            
                            html.push('      <div class="middle_b">');
                            html.push('        <h2 class="person_name">'+list[i].people+'</h2>'); 
                            html.push('        <p>'+list[i].contact+'</p>');
                            html.push('      </div>');
                            html.push('      <div class="right_b">');
                            html.push('         <a href="tel:'+list[i].contact+'"><img src="'+templateSkin+'images/renovation/call.png" alt=""></a>');
                            html.push('      </div>');
                            html.push('    </div>');
                            html.push('    <div class="bottom fn-clear">');
                            html.push('        <ul class="line_ul">');
                            html.push('            <li>');
                            html.push('                <p class="fir_p special"><span>'+list[i].area+'</span>'+echoCurrency('areasymbol')+'</p>');
                            html.push('                <p class="sec_p">'+langData['renovation'][0][14]+'</p>');//房屋面积
                            html.push('            </li>');
                            html.push('            <li>');
                            html.push('                <p class="fir_p special">'+list[i].budget+'</p>');//万
                            html.push('                <p class="sec_p">'+langData['renovation'][1][34]+'</p>');//装修预算
                            html.push('            </li>');
                            html.push('            <li>');
                            html.push('                <p class="fir_p">'+list[i].community+'</p>');
                            html.push('                <p class="sec_p">'+langData['renovation'][2][17]+'</p>');//小区名字
                            html.push('             </li>');
                            html.push('        </ul>');

                            html.push('    </div>');
                            html.push('    <div class="info_bottom">');
                            html.push('        <img src="'+templateSkin+'images/renovation/place.png" alt=""><span class="info">'+list[i].address+'</span>');
                            html.push('    </div>');
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