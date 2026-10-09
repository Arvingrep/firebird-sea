$(function(){

        //预约参观
    $('.reno_anli').delegate(".visit", "click", function(){
        var id = $(this).attr('data-id');
        $('.free').attr('data-id',id);
        //参观工地
        var par = $(this).parents('.bottom_b')
        var vill_title=par.find('.anli_title');
        var site_view=vill_title.text();

        //建筑面积
        var area=par.find('.area');
        var site_area=area.html();
        var roomType = par.find('.roomType').text();
        $('.site_view').text(site_view);//工地名称
        $('.site_area').text(site_area);//建筑面积
        $('.site_type').text(roomType);//房屋类型
        $('.order_mask').show();
        return false;

    })
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
    // 预约参观 表单验证

    $('.free').click(function(){

        var f = $(this);        
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val(),
            siteType = $('.site_type').text(),
            siteArea = $('.site_area').text(),
            siteId = f.attr('data-id');
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {           
            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("siteType="+siteType);
            data.push("siteArea="+siteArea);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("conid="+siteId);
            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendConstruction",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').hide();
                        $('.order_mask2').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })
    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })
     var isload = false;
     var page = 1, pageSize = 4;
    //搜索公司
    $('.renoform_go').click(function(){
        var keyWords = $('.reno_form #keywords').val();
        if(keyWords!=''){
            isload = false;
            getList(1);
        }
        return false;

    }) 

    // 下拉加载
    
    $(window).scroll(function() {
    
        var h = $('.reno_anli li').height();  
        var allh = $('.list.reno_anli').height();
        var w = $(window).height();
        var scroll = allh - h - w - 50;
        
        if ($(window).scrollTop() > scroll && !isload) {    
            page++;
            getList();
        };
    });
    getList();

    //获取信息列表
    function getList(tr){
        if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize=8");
        var keywords = $('.reno_form #keywords').val();
        if(keywords){
            data.push("keywords="+keywords);
        }
        if(tr){
            page=1;
            $('.reno_anli ul').html('');
            var addrid = $('.area_choose').attr('data-id');
            data.push("addrid="+addrid);
        }
        isload = true;
        $('.reno_anli ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=community&"+data.join("&"),
            type: "GET",
            dataType: "json",
            async:false,
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo,html3 = [];
                    if(list.length > 0){
                       $(".loading").remove();                   
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li>');
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            html.push('<div class="top_b fn-clear">');                                              
                            html.push('<a href="'+list[i].url+'" >');                                              
                            html.push('<div class="left_b">');                        
                            html.push('<img src="'+pic+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="right_b">');
                            html.push('<p class="vill_title">'+list[i].title+'</p>');
                            html.push('<p class="vill_addr">');
                            html.push('<img src="'+templatePath+'images/addr.png" alt="">');
                            html.push('<span>'+list[i].address+'</span>');
                            html.push('</p>');
                            html.push('<p class="vill_num">'+langData['renovation'][15][10].replace('1',list[i].click)+'</p>');//<span>1</span>人查看
                            html.push('</div>');
                            html.push('</a>');
                            html.push('</div>');
                            var constructionarr = list[i].constructionarr;
                            html3 = '';
                            if( constructionarr.length >0){
                                var html2 = [];

                                for (var j = 0; j < constructionarr.length; j++) {
                                    html2.push('<div class="bottom_b fn-clear" data-id="'+constructionarr[j].id+'">');
                                    html2.push('<p class="anli_title"><a href="javascript:;" >'+constructionarr[j].title+'</a></p>');
                                    html2.push('<p class="vill_info"><span class="area">'+constructionarr[j].area+'</span>M²/<span class="roomType">'+constructionarr[j].budget+'</span>/'+constructionarr[j].style+'</p>'); //
                                    html2.push('<p class="visit" data-id="'+constructionarr[j].id+'">'+langData['renovation'][0][29]+'</p>'); //预约参观
                                    html2.push('</div>'); //
                                    html3 = html2.join("");
                                }
                            }

                                                 
                            html.push(html3);
                            html.push('<p class="vill_more"><a href="'+list[i].url+'" >'+langData['renovation'][4][38]+'</a></p>');//查看更多                
                            html.push('</li>');                                               

                        }                                        
                        $(".reno_anli ul").append(html.join(""));                   
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                        
                            $(".reno_anli ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            
                        }
                    }else{
                        $(".reno_anli .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }

                }else{

                    $(".reno_anli ul .loading").html(data.info);;
                }
            },
            error: function(){
                isload = false;
                $(".reno_anli ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }




})