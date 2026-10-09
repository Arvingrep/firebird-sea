$(function(){
    

    var  transTimes = function(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return (hour+':'+minute);
        }else{
            return 0;
        }
    }

    //车主和乘客切换
    $('.tab li').click(function(){
        var t = $(this);
        $(this).addClass('active').siblings().removeClass('active');
        if($(this).hasClass('owner')){
            $('.ownerCon').addClass('show').show();
            $('.userCon').removeClass('show').hide();

            $('.findCar').attr('data-id',3).text(langData['sfcar'][1][1]);//找乘客
            $('.findTruck').attr('data-id',4).text(langData['sfcar'][1][2]);//找货物
            $('.dayday').hide();//我是车主没有天天发车
        }else{

            $('.ownerCon').removeClass('show').hide();
            $('.userCon').addClass('show').show();
            $('.findCar').attr('data-id',1).text(langData['sfcar'][1][3]);//找乘用车
            $('.findTruck').attr('data-id',2).text(langData['sfcar'][1][4]);//找载货车
            $('.dayday').show();
        }
    })

    //货车类型 出发时间
    $('.c_top span').click(function(){
        $(this).addClass('checked').siblings().removeClass('checked');  
        checkChoose();  
    })
    //出发地 目的地切换 值调换
    $('.changecity').click(function(){
        var departure = $('.c_bot .startPlace').val();
        var destination = $('.c_bot .endPlace').val();
        $('.c_bot .startPlace').toggleClass('choose').addClass('left_move');
        $('.c_bot .endPlace').toggleClass('choose').addClass('right_move');
        $('.changecity s').addClass('transform');
        setTimeout(function () {
            $('.c_bot .endPlace').val(departure).removeClass('right_move');
            $('.c_bot .startPlace').val(destination).removeClass('left_move');;
            $('.changecity s').removeClass('transform');
        }, 300)

    })
    // 获取筛选条件
    function checkChoose(){
        var filterData = [];
        //用车 or 车主
        var usetype = $(".tab .active").attr("data-type");       
        filterData.push("type="+usetype);
      

        //用车类型 找客or 载客
        var cartype = $(".c_top.show .carType .checked").attr("data-id");
        if(cartype!=undefined && cartype!=''){
            filterData.push("cartype="+cartype);
        }
        //出发时间
        var timetype = $(".c_top.show .carPub .checked").attr("data-id");
        if(timetype!=undefined && timetype!=''){
            filterData.push("orderby="+timetype);
        }
        //出发地和目的地
        var startPlace = $(".c_bot .startPlace").val();
        var endPlace = $(".c_bot .endPlace").val();      
        if(startPlace!='' || endPlace!=''){
            filterData.push("startaddr="+startPlace);
            filterData.push("endaddr="+endPlace);
        }
        location.href = channelDomain+'/list.html?'+filterData.join("&")

    }
    //点击搜索
    $('.serButton').click(function(){
        checkChoose();
    })

    //查看电话
    $('.seePhone').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }
        var t =$(this);
        $(this).fadeOut(200);
        setTimeout(function(){
            t.siblings('.phoneNum').show()
        },100)
        return false;
    })

})
