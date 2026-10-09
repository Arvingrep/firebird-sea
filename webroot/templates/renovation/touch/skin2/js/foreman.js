$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 

    var mask = $('.mask');

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".reno_company";
    console.log(detailList)
    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var isload = false, isClick = true;

    var dataInfo = {
        id: '',
        url: '',
        keywords: '',
        typeid: '',
        typename: '',
        age: '',
        ageName: '',
        orderby: '',
        orderbyName: '',
        isBack: true
    };


    $('.reno_company').delegate('.com_li', 'click', function(e){
        var t = $(this), a = t.find('.hra'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby = $('.choose-tab .com_type').attr('data-id'),
            orderbyName = $('.choose-tab .com_type span').text(),
            typeid = $('.choose-tab .reno_class').attr('data-id'),
            typename = $('.choose-tab .reno_class span').text(),
            age = $('.choose-tab .age').attr('data-id'),
            ageName = $('.choose-tab .age span').text(),
            keywords = $('.reno_form #keywords').val();

        dataInfo.url = url;
        dataInfo.keywords = keywords;
        dataInfo.typeid = typeid;
        dataInfo.typename = typename;
        dataInfo.age = age;
        dataInfo.ageName = ageName;
        dataInfo.orderby = orderby;
        dataInfo.orderbyName = orderbyName;

        detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: page});

        if(e.target == t.find('.order')[0]){
 
        }else{
           setTimeout(function(){location.href = url;}, 500); 
        }

    })

    // 筛选框
    var chooseArea = chooseInfo = chooseSort = null;
    $('.choose-tab li').click(function(){
        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            if (index == 0 && chooseArea == null) {
                chooseArea = new iScroll("age", {vScrollbar: false,mouseWheel: true,click: true});
            }
            if (index == 1 && chooseInfo == null) {
                chooseInfo = new iScroll("orderby_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
           if (index == 2 && chooseSort == null) {
                chooseSort = new iScroll("reno_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });


    //工龄
    $('#age').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();

        getList(1);

    })

    //类别工种
    $('#reno_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();

        getList(1);

    })

     //排列顺序
    $('#orderby_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        getList(1);

    })


    // //点击小箭头 收起
    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });


    // 遮罩层
    $('.mask').on('click',function(){
        mask.hide();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');

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
        var par = $('.formCommon.show')
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
    //预约弹窗弹出
    $('.reno_company').delegate(".order", "click", function(){
        var com_type=$(this).parents('.bottom').siblings().find('.com_type');
        var id = $(this).attr('data-id')
        var peo_name=com_type.html();
        $('.order_mask').show();
        $('.peo_name').text(peo_name);
        $('.free').attr('data-id',id)

    })

    // 立即预约 表单验证
    $('.free').click(function(){
        var f = $(this);        
        var name = $('#order_name').val(), //您的称呼
            tel = $('#order_phone').val(),//您的手机号码
            place_name = $('#place_name').val();//小区名字
        var txt = f.text(),foremanId = f.attr('data-id');
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else if (!addrid) {

            $('.area-1').show();
            setTimeout(function(){$('.area-1').hide()},1000);

        }else if (!place_name) {

            $('.village-1').show();
            setTimeout(function(){$('.village-1').hide()},1000);

        }else {

            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("bid="+foremanId);//设计师id
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("addrid="+addrid);
            data.push("type=1");
            data.push("community="+place_name);
          
            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
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
     //搜索设计师
    $('.renoform_go').click(function(){
        var keyWords = $('.reno_form #keywords').val();
        if(keyWords!=''){
            getList(1);
        }
        return false;

    }) 

        // 下拉加载
    var isload = false;
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
    //初始加载
    if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }

    //获取信息列表
    function getList(tr){
       
        if(tr){
            isload = false;
            page=1;
            $('.com_ul').html('')
        }
        if(isload) return false;
        $(".loading").remove();
        $('.com_ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...

        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        var keywords = $('.reno_form #keywords').val();
        if(keywords !=''){
            data.push("keywords="+keywords);
        }
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        isload = true;
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=foreman&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {                       
                            html.push('<li class="com_li" data-id="'+list[i].id+'">');
                            html.push('<a href="javascript:;" data-url="'+list[i].url+'" class="hra">');
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
                            html.push('<li>'+list[i].address+'</li>'); //
                            if(list[i].works > 0){
                                html.push('<li>'+langData['renovation'][14][94].replace('1',list[i].works)+'</li>'); //1年工龄     
                            }else{
                                html.push('<li>'+langData['renovation'][14][72]+'</li>');//暂无工作经验
                            }  

                            if(list[i].caseall > 0){
                                html.push('<li>'+langData['renovation'][14][71].replace('1',list[i].caseall)+'</li>'); //1套案例
                            }else{
                                html.push('<li>'+langData['renovation'][14][73]+'</li>');//暂无案例
                            }                                    
                            html.push('</ul>');                                  
                            html.push('</div>');                                     
                            html.push('</div>'); 
                            html.push('</a>');               
                            html.push('<div class="bottom">');                 
                            html.push('<ul class="art_contact fn-clear">');                 
                            html.push('<li class="phone">'); 
                          	var userid = $.cookie(cookiePre+"login_user");
                          	if(userid == null || userid == ""){
                              html.push('<a href="'+masterDomain+'/login.html"><img src="'+templatePath+'images/call.png" alt=""><em>登录后查看</em></a>');
                            }else{
                               	html.push('<a href="tel:'+list[i].tel+'">');                 
                            	html.push('<img src="'+templatePath+'images/call.png" alt="">'+list[i].tel+'</a>');
                            	html.push('</a>');
                            }
                                            
                            html.push('</li>');                 
                            html.push('<li class="order" data-id="'+list[i].id+'">'+langData['renovation'][0][20]+'</li>');  // 立即预约              
                            html.push('</ul>');                                 
                            html.push('</div> ');                 
                            html.push('</div> ');                 
                            
                            html.push('</li>');                                               
                        }                   
                         
                        $(".reno_company .com_ul").append(html.join(""));
                            
                        
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                          
                            $(".reno_company .com_ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            
                        }
                    }else{
                        $(".com_ul .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    

                }else{
                    $(".reno_company .com_ul .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".reno_company .com_ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }




    // 本地存储的筛选条件
    function getData() {

        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

        page = detailList.getLocalStorage()['extraData'].lastIndex;

        if (filter.typename != '') {$('.choose-tab .reno_class span').text(filter.typename);}
        if (filter.typeid != '') {
            $('.choose-tab .reno_class').attr('data-id', filter.typeid);
            $('#reno_class li[data-id="'+filter.typeid+'"]').addClass('on').siblings('li').removeClass('on');
        }
        if (filter.ageName != '') {$('.choose-tab .age span').text(filter.ageName);}
        if (filter.age != '') {
            $('.choose-tab .age').attr('data-id', filter.age);
            $('#age li[data-id="'+filter.age+'"]').addClass('on').siblings('li').removeClass('on');
        }


        // 排序选中状态
        if (filter.orderby != "") {
            $('.choose-tab .com_type').attr('data-id', filter.orderby);
            $('#orderby_class li[data-id="'+filter.orderby+'"]').addClass('on').siblings('li').removeClass('on');
        }
        if (filter.orderbyName != '') {$('.choose-tab .com_type span').text(filter.orderbyName)}
        if (filter.keywords != '' && filter.keywords != null) {
            $('.reno_form #keywords').val(keywords);
        }

    }


})
