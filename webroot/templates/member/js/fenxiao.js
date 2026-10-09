var objId = $("#list");
var count_list = 0;
$(function(){

    //当前月份
    var currYear = (new Date()).getFullYear();
    var currMonth = (new Date()).getMonth() + 1;
    currMonth = currMonth < 10 ? '0'+currMonth : currMonth;
    var activeDate = currYear+'-'+currMonth;
    // $('.monthC').attr('data-date',activeDate);

    var joinYear = joinDate.split('-')[0];//成为合伙人的年份
    var joinMonth = joinDate.split('-')[1];//成为合伙人的月份

    // 显示日历
    $('.monthC').click(function(){
        $('.dateWrap').addClass('show');
        $('.fakeMask').show();
        nowM();
    })



    function nowM(){//已选择的年月
        var hasD = $('.monthC').attr('data-date');
        var hasY,hasM;
        if(hasD ==' '){
            hasY = currYear;
            hasM = currMonth;
        }else{
            hasY = hasD.split('-')[0];
            hasM = hasD.split('-')[1];
        }
        $('.dateTop h2').text(hasY ? hasY : (new Date()).getFullYear());
        //年份加减箭头
        $('.dateTop a.minusDate,.dateTop a.addDate').removeClass('disabled')
        if(hasY == joinYear){
            monthSt(2);
            $('.dateTop a.minusDate').addClass('disabled');
        }else if(hasY == currYear){
            monthSt(1);
            $('.dateTop a.addDate').addClass('disabled');
        }
        $('.dateCon li a').removeClass('curr');
        $('.dateCon li a[data-id="'+hasM+'"]').addClass('curr');

    }

    function monthSt(str){
        $('.dateCon li a').each(function(){
            var tid = $(this).attr('data-id');

            if(str == 1){//当年当月添加样式
                if(tid > currMonth){
                    $(this).addClass('disabled');
                }

            }else{//成为合伙人之前年月样式
                if(tid < joinMonth){
                    $(this).addClass('disabled');
                }
            }
        })
    }


    // 年份切换
    //年份减
    $('.dateTop .minusDate').click(function(){
        if(!$(this).hasClass('disabled')){
            var nowYear = $('.dateTop h2').text();
            var prevYear = nowYear - 1;
            $('.dateTop h2').text(prevYear);
            if(joinYear == prevYear){//加入之前不显示
                $(this).addClass('disabled');
                monthSt(2);
            }else{
                $('.dateCon li a').removeClass('disabled curr');
            }
            $('.dateTop a.addDate').removeClass('disabled');

        }

    })

    //年份加
    $('.dateTop .addDate').click(function(){
        if(!$(this).hasClass('disabled')){
            var nowYear = $('.dateTop h2').text();
            var nextYear = Number(nowYear*1 + 1);
            $('.dateTop h2').text(nextYear);
            if(nextYear == currYear){
                $(this).addClass('disabled');
                monthSt(1);
            }else{
                $('.dateCon li a').removeClass('disabled curr');
            }
            $('.dateTop a.minusDate').removeClass('disabled');

        }

    })

    //选择月份
    $('.dateCon li a').click(function(){
        if(!$(this).hasClass('disabled')){
            var chooseY = $('.dateTop h2').text();
            var chooseM = $(this).attr('data-id');
            var chDate = chooseY+'-'+chooseM;
            $('.monthC').attr('data-date',chDate);
            $('#dy').text(chooseY+'-'+chooseM);
            $('.monthC span').text(chDate);
            $('.dateWrap').removeClass('show');
            $('.fakeMask').hide();
            getList();
        }
    })

    //查看全部
    $('.dateCon h3.seeAll').click(function(){
        $('.monthC').attr('data-date',' ');
        $('#dy').text('当月');
        $('.monthC span').text('全部时间');
        $('.dateWrap').removeClass('show');
        $('.fakeMask').hide();
        getList();
    })
    var objId = $("#list");

    var atpage = 1;
    $(".nav_tab li").click(function(){
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('li').removeClass('active');
            var i =$(this).index();
            $('.mainCon .hideCon').eq(i).addClass('show').siblings('.hideCon').removeClass('show');
            atpage = 1;
            getList(1);
        }
    })
    //下线排序
    $('.mainCon .moreOr').click(function(){
        $('.orderChoose').addClass('show');
        $('.fakeMask').show();

    })
    $('.orderChoose p').click(function(){
        if(!$(this).hasClass('curr')){
            $(this).addClass('curr').siblings('p').removeClass('curr');
            var orId = $(this).attr('data-id'),txt = $(this).text();
            $('.mainCon .timeOrder').attr('data-order',orId);
            $('.moreOr span').text(txt);
            $('.orderChoose').removeClass('show');
            $('.fakeMask').hide();
            atpage = 1;
            getList(1);
        }else{
            $('.orderChoose').removeClass('show');
            $('.fakeMask').hide();
        }
    })
    //关闭弹出
    $('.fakeMask').click(function(){
        $('.dateWrap,.orderChoose').removeClass('show');
        $('.fakeMask').hide();
    })
    //用户名搜索
    $('#serKey').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            atpage = 1;
            getList(1);  
        }
    });
    $('.comTop .searchDiv s').click(function(){
        atpage = 1;
        getList(1);
    })

    //佣金列表
    getList(1);


    // 展开团队

    $('body').delegate('.con','click',function(){
        var t =$(this);info = t.closest('.info');
        info.children('.childBox').slideToggle()
    })



})
function  getList(is){
    if(is != 1){
        $('html, body').animate({scrollTop: $(".nav_tab").offset().top}, 300);
    }
    var keyword = $('#serKey').val();
    var action = $(".nav_tab li.active").attr('data-type'),orderby =$('.timeOrder').attr('data-order');
    var date = $('.monthC').attr('data-date');
    objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候
    $(".pagination").hide();
    var url;
    if(action == 1){//佣金
        url ="/include/ajax.php?service=member&action=fenxiaoLog&date="+date+"&page="+ atpage +"&pageSize=10";
    }else{//下线
        url ="/include/ajax.php?service=member&action=myRecUser&keywords="+keyword+"&orderby="+orderby+"&page="+ atpage +"&pageSize=10";
    }

    
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            var html=[];
            var list = data.info.list;
            if(data.state == 100){
                if(action == 1){
                    for(var i = 0; i < list.length; i++){
                        html.push('<div class="fxItem">');
                        html.push('<a class="fn-clear" href="'+detailurl+list[i].id+'">');
                        html.push('<div class="img-box fn-left"><img src="'+templetSkin+'images/fenxiao/fxLogo.png" alt=""></div>');
                        html.push('<div class="info"> ');
                        html.push('<p class="name">'+list[i].ordernum+' </p>');
                        var pub = huoniao.transTimes(list[i].pubdate,1) ;
                        html.push('<p class="time">'+pub+'</p>');
                        html.push('<span class="fxPrice">+'+list[i].amount+'</span> ');
                        html.push('</div>');
                        html.push('</a></div>');
                    }
                }else{
                    html = dataToHtml(list,1)
                }

                objId.html(html.join(""));
                if(keyword){
                    $('.lineItem .info .name').each(function(){
                        var txt = $(this).text();
                        var wordArr = txt.split(keyword);
                        var wordTxt = (wordArr[0]?wordArr[0]:'')+'<em class="blue">'+keyword+'</em>'+(wordArr[1]?wordArr[1]:'');
                        $(this).html(wordTxt);
                    })
                }
                isload = false;
                if(action == 1){
                    $('#dyMoney').text(echoCurrency('symbol')+data.info.pageInfo.totalAmount);
                }else{
                    $('#peoNum').text(data.info.pageInfo.totalCount);
                }

                totalCount = data.info.pageInfo.totalCount;
                showPageInfo();
            }else {
                if(action == 1){
                    $("#dyMoney").html(0);
                }else{
                    $('#peoNum').html(0);
                }
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //  //暂无相关信息！
            }
        },
        error: function(){
            if(action == 1){
                $("#dyMoney").html(0);
            }else{
                $('#peoNum').html(0);
            }
            objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
        }
    })
}


function dataToHtml(list,type){
    count_list++;
    var html = [];
    if(list && list.length > 0 ){
        for(var i = 0; i < list.length; i++){
            var photo = list[i].user.photo ? list[i].user.photo : '/static/images/noPhoto_100.jpg' //头像
            var phone = list[i].phone != undefined && list[i].phone ? ' <em class="phone">('+list[i].phone+')</em>' : '';  //手机
            var money =  list[i].money != undefined  ? '<span>余额 <em>'+ list[i].money + echoCurrency("short")+'</em></span>' : ''; //余额
            var point =  list[i].point != undefined ? '<span>'+pointname+' <em>'+ list[i].point +'</em></span>' : ''; //余额
            var usercount =  list[i].usercount != undefined ? '<span>Ta的团队 <em>'+ list[i].usercount +'人</em></span>' : ''; //团队
            var useramount =  list[i].useramount != undefined ? '<span>带来收益 <em>'+ list[i].useramount + echoCurrency("short")+'</em></span>' : ''; //收益
            if(!type){
                useramount = '';
            }
            html.push('<div class="lineItem fn-clear" data-id="'+list[i].id+'">');
            html.push('<div class="img-box fn-left"><img src="'+photo+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
            html.push('<div class="info">');
            html.push('<div class="pInfo">');
            html.push('<p class="name">' +list[i].user.username + phone + '</p>');
            html.push('<div class="con fn-clear">');
            if(money || point){
                html.push('<div class="con_item account">');
                html.push(money);
                if(money && point){
                    html.push('<i class="line">|</i>');
                }
                html.push(point);
                html.push('</div>');
            }
            
            if(usercount || useramount){
                html.push('<div class="con_item">');
                html.push(useramount);
                if(usercount && useramount){
                    html.push('<i class="line">|</i>');
                }
                html.push(usercount);
                html.push('</div>');
            }
            if(list[i].usercount > 0 && count_list <= 3){
                html.push('<s class="arr_r"></s>'); 
            }
                                              
            html.push('</div></div>');

            if(list[i].child && list[i].child.length){
                html.push('<div class="childBox">');
                html.push('<div class="childText">TA的团队/收益</div>');
                html.push('<div class="childScroll">');
                html = html.concat(dataToHtml(list[i].child))
                html.push('</div>');
                html.push('</div>');
            }

            html.push('</div>');

            html.push('</div>');
        }
    }
    return html;
}
