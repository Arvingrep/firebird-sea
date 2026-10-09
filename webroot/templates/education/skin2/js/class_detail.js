$(function () {

    //显示二维码
    $('.list_ul li .t_bg').hover(function () {
        $(this).parents('li').find('.code_bg').show();
    }, function () {
        $(this).parents('li').find('.code_bg').hide();
    });
    //进店看看
    $('.list_ul').delegate('.new_info', 'click', function () {
        var url=$(this).attr('data-url');
        location.href = url;
        return false;
    })
    //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已收藏";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "收藏";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=education&temp=detail&type="+type+"&id="+eduData.id);

    });
    //点击班级
    $('.cla_manage').delegate('.claDetail', 'click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        var t = $(this),
            id = t.attr("data-id");
        $(".cla_manage .calaTT").removeClass("curr");

        t.parents('.cla_li').find(".claTeach" + id).addClass('curr');

        $('.calaTT:nth-child(2n)').addClass('arrow-r')
        $('.calaTT:nth-child(2n+1)').addClass('arrow-l')

    });
    $('.class_bot .claTeach .teach_ul li:nth-child(2n)').css('margin-right', '0');

    $('.cla_manage').delegate('.all_class', 'click', function () {

        $(this).text(langData['education'][9][11]); //收起所有班级
        $(this).removeClass('all_class').addClass('close_all');
        classList();
    });

    $('.cla_manage').delegate('.close_all', 'click', function () {

        $('.cla_manage  .close_detail').remove();
        $('.cla_manage  .close_cla').remove();
        $(this).text(langData['education'][8][21]); //展开所有班级
        $(this).removeClass('close_all').addClass('all_class');

    })

    function classList() {
        $(".cla_li").append('<div class="loading"><span>' + langData['education'][9][17] + '</span></div>'); //加载中
        $.ajax({
            url: "/include/ajax.php?service=education&action=detail&id=" + id + "",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (data && data.state == 100) {
                    $(".cla_li .loading").remove();
                    var classList = [],
                        classList3 = [],
                        infoList = [],
                        list = data.info.workArr,
                        f = 0;
                    var classtype = data.info.classtype,m=2;
                    if(classtype ==1){
                        var list2 = data.info.workArr[0].manyclass;

                        var list=[];
                        for (key in list2){
                            list.push(list2[key])
                        }
                        m=2;
                    }


                    for (var i = m; i <list.length; i++) {

                        var classList2 = [],
                            infoList2 = [];

                        //课程详情
                        classList2.push('<div class="claDetail close_detail" data-id="' + list[i].id + '">');
                        classList2.push('<h3 class="claDet_h3">' + list[i].classname + '</h3>');

                        classList2.push('    <p class="claDet_info">');
                        classList2.push('        <span class="pric"><em class="pric_em">' + list[i].price + '</em>' + langData['education'][6][10] + '</span>'); //元
                        classList2.push('        <span class="cla_attr">' + list[i].typename + '</span><span class="cla_sub"><em>' + list[i].classhour + '</em>' + langData['education'][7][12] + '</span></p>'); //课时
                        classList2.push('    <p class="claDet_time">');
                        classList2.push('        <span class="claDet_s">' + list[i].openStart + '</span>' + langData['education'][7][38] + '<span class="claDet_e">' + list[i].openEnd + '</span></p>');
                        classList2.push('    <p class="claDet_addr">' + list[i].address + '</p>'); //至
                        classList2.push('</div>');

                        //班级详情
                        infoList2.push('<div class="calaTT close_cla claTeach' + list[i].id + '">');
                        infoList2.push('<div class="claTeach">');
                        infoList2.push('    <div class="teac_div">');
                        infoList2.push('        <p class="claTeach_tit">' + langData['education'][6][11] + '</p>'); //授课教师
                        infoList2.push('        <ul class="teach_ul fn-clear">');
                        if( list[i].teacherArr&&  list[i].teacherArr.length > 0 ) {
                            for (var j = 0; j < list[i].teacherArr.length; j++) {
                                var list2 = list[i].teacherArr;
                                infoList2.push('             <li>');
                                infoList2.push('                 <div class="top_b fn-clear">');
                                infoList2.push('                     <div class="left_img">');
                                var photo = list2[j].photo != "" && list2[j].photo != undefined ? huoniao.changeFileSize(list2[j].photo, "small") : "/static/images/noPhoto_100.jpg";
                                infoList2.push('                         <a href="' + list2[j].url + '" target="_blank"><img src="' + photo + '" alt=""></a>');
                                infoList2.push('                     </div>');
                                infoList2.push('                     <div class="right_info fn-clear">');
                                var sex = list2[j].sex == 1 ? 'sex_nan' : 'sex_nv';
                                infoList2.push('                         <h2 class="tutor_name"><a href="' + list2[j].url + '" target="_blank">' + list2[j].name + '</a><i class="' + sex + '"></i></h2>');
                                infoList2.push('                         <p class="senior_det">' + langData['education'][7][39] + '：' + list2[j].courses + '</p>'); //主授课程
                                var sk1 = list2[j].certifyState ? '<span class="identity">' + langData['education'][7][29] + '</span>' : '';
                                var sk2 = list2[j].degreestate ? '<span class="edu">' + langData['education'][7][30] + '</span>' : '';
                                infoList2.push('                         <p class="prove">' + sk1 + sk2 + '</p>'); //身份认证  学历认证

                                infoList2.push('                     </div>');
                                infoList2.push('                 </div>');
                                infoList2.push('                </li>');
                            }
                        }

                        infoList2.push('         </ul>');
                        infoList2.push('      </div>');
                        infoList2.push('      <div class="class_div">');
                        infoList2.push('         <p class="claTeach_tit">' + langData['education'][1][2] + '</p>'); //班级特色
                        infoList2.push('          <div class="cla_chara">');
                        infoList2.push('               <p>' + list[i].desc + '</p>');
                        infoList2.push('          </div>');
                        infoList2.push('   </div>');
                        infoList2.push(' </div>');
                        infoList2.push(' </div>');


                        classList3.push(classList2.join(''));
                        infoList.push(infoList2.join(''));

                    }
                    for (var i = 0; i < classList3.length; i++) {
                        classList.push(classList3.slice(i, i + 2).join(''));
                        classList.push(infoList.slice(i, i + 2).join(''));
                        i += 1;
                    }
                    $('.cla_li').append(classList.join(''));
                    $('.class_bot .claTeach .teach_ul li:nth-child(2n)').css('margin-right', '0');
                    $('.main_wrap3 .claDetail:nth-child(2n)').css('margin-right', '0');
                } else {
                    $('.cla_li').append('<p class="loading_all">' + langData['education'][9][12] + '</p>'); //暂无数据！
                }
            },
            error: function () {
                $('.cla_li').append('<p class="loading_all">' + langData['education'][9][13] + '</p>'); //加载失败！
            }
        });
    }

    //打开报名弹窗
    $(".class_entroll .enroll").bind("click", function () {
        $('.entr_mask').show();
        //课程图片
        var img_src = $('.classLimg img').attr('src');
        $('.entr_l img').attr('src', img_src);
        //课程标题
        var entr_title = $('.classRcon .class_title').text();
        $('.entr_r .entr_title').text(entr_title);
        //课程班级
        var entr_class = $('.claDetail.active .claDet_h3').text();
        $('.entr_r .entr_class').text(entr_class);
        //课程价格
        var entr_price = $('.claDetail.active .pric_em').text();
        $('.entr_price .price_det').text(entr_price);
    })
    //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
  }
  //显示区号
  $('.areaCode').bind('click', function(){

    var areaWrap =$(this).closest(".entr_container").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest(".entr_container");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $("#areaCode").val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });




    //报名提交
    $(".entr_mask .entr_pay").bind("click", function () {
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            location.href = '/login.html';
            return false;
        }
        var f = $(this);
        var str = '',
            r = true;
        if (f.hasClass("disabled")) return false;

        // 称呼
        var entr_name = $('#entr_name');
        var entr_namev = $.trim(entr_name.val());
        if (entr_namev == '') {
            if (r) {
                entr_name.focus();
                errmsg(entr_name, langData['education'][9][14]); //请填写您的称呼
            }
            r = false;
        }
        // 手机号
        var entr_phone = $('#entr_phone')
        var entr_phonev = $.trim(entr_phone.val());
        if (entr_phonev == '') {
            if (r) {
                entr_phone.focus();
                errmsg(entr_phone, langData['education'][9][15]); //请填写您的联系方式
            }
            r = false;
        } else {
            // var telReg = !!entr_phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if (!telReg) {
            //     if (r) {
            //         entr_phone.focus();
            //         errmsg(entr_phone, langData['education'][9][16]); //请输入正确手机号码
            //     }
            //     r = false;
            // }
            //课程价格
            var entr_price = $('.claDetail.active .pric_em').text();
            $('.entr_price .price_det').text(entr_price);
        }

        if (!r) {
            return false;
        }

        var entr_id    = $('.claDetail.active').attr("data-id")
        $.ajax({
            url: "/include/ajax.php?service=education&action=deal&proid="+entr_id+"&procount=1&people="+entr_namev+"&contact="+entr_phonev+"&pc=1"+"&price="+entr_price,
            type:"POST",
            dataType:"json",
            success:function(data){
               if (data.state==100) {
                   if (typeof (data.info) == 'object') {

                       info = data.info;
                       cutDown = setInterval(function () {
                           $(".payCutDown").html(payCutDown(info.timeout));
                       }, 1000)

                       var datainfo = [];
                       for (var k in info) {
                           datainfo.push(k + '=' + info[k]);
                       }
                       $("#amout").text(info.order_amount);
                       $('.payMask').show();
                       $('.payPop').show();

                       if (usermoney * 1 < info.order_amount * 1) {

                           $("#moneyinfo").text('余额不足，');
                           $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
                       }else{
                           $("#moneyinfo").text('可用');
                           $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
                       }
                       if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                           $("#bonusinfo").text('额度不足，可用');
                           $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                       }else if( bonus * 1 < info.order_amount * 1){
                           $("#bonusinfo").text('余额不足，');
                           $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                       }else{
                           $("#bonusinfo").text('');
                           $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                       }
                       ordernum = info.ordernum;
                       order_amount = info.order_amount;

                       $("#ordertype").val('');
                       $("#service").val('education');
                       service = 'education';
                       var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                       $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
                   }else{
                       location.href = data.info;
                   }

               }else{
                alert(data.info)
               }
            },
            error:function(){
                alert("请求失败");return false;
            }
        });
    });
    //关闭报名弹窗
    $(".entr_mask .close_alert,.entr_mask .entr_back").bind("click", function () {
        $('.entr_mask').hide();
    })
    //数量错误提示
    var errmsgtime;

    function errmsg(div, str) {
        $('#errmsg').remove();
        clearTimeout(errmsgtime);
        var top = div.offset().top - 33;
        var left = div.offset().left;

        var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
        $('body').append(msgbox);
        $('#errmsg').fadeIn(300);
        errmsgtime = setTimeout(function () {
            $('#errmsg').fadeOut(300, function () {
                $('#errmsg').remove()
            });
        }, 2000);
    };




})