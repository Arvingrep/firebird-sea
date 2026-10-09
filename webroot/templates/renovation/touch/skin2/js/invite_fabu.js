$(function(){

    // input 键盘焦点问题修复 
    window.addEventListener('resize', () => {
        const activeElement = document.activeElement
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            setTimeout(() => {
              activeElement.scrollIntoView()
            }, 100)
          }
    })
    //搜索公司
    $('.renoform_go').click(function(){
        var keyWords = $('.reno_form #keywords').val();        
        getCompany(1)       
        return false;

    }) 
    var page = 1;
    //换一批
    $('.com-wrap .change').click(function(){
        page++;
        getCompany()
    }) 
    getCompany()
    function getCompany(tr){
        $('.comList').html('');
        $(".comList").before('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var keyWords = $('.reno_form #keywords').val();
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=store&title="+keyWords+"&page="+page+"&pageSize=9",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    $('.com-wrap .loading').remove();
                    var cList = [], list = data.info.list;
                    var totalPage = data.info.pageInfo.totalPage;
                    if(totalPage >1){
                        $('.com-wrap .change').show();
                        $('.com-wrap').addClass('noPage');
                    }else{
                        $('.com-wrap .change').hide();
                        $('.com-wrap').removeClass('noPage');
                    }
                    if(list.length>0){
                        for (var i = 0; i < list.length; i++){
                            var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                            cList.push('<li data-id="'+list[i].id+'">');
                            cList.push('<div class="top_img">');
                            cList.push('<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
                            cList.push('</div>');
                            cList.push('<p class="inv_info">'+list[i].company+'</p>');
                            cList.push('</li>');
                        }
                        $('.comList').html(cList.join('')); 
                        if(totalPage == page){
                            page=0;
                        }
                    }else{
                        if(tr){
                            $('.com-wrap .change').hide();
                            $('.com-wrap').removeClass('noPage');
                            $('.comList').before('<div class="loading">'+langData['renovation'][14][4]+'</div>')//暂无搜到任何数据
                        }else{
                            $(".comList").before('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
                        }
                    }
                    
                }else{
                    $('.com-wrap .change').hide();
                    $('.com-wrap').removeClass('noPage');
                    $('.com-wrap .loading').html(data.info)
                }
            },
            error: function(){
                $('.com-wrap .change').hide();
                $('.com-wrap').removeClass('noPage');
                $('.com-wrap .loading').html(data.info)
            }
        });
    }

    // 选择装修
    $('.comList').delegate('li','click',function(){
        if($(this).hasClass('active')){
            $(this).toggleClass('active');
            
        }else{
            if($('.inv_con li.active').size() < 3){
                $(this).toggleClass('active');

            }else{
                showMsg(langData['renovation'][4][31]);//最多只能选择三个

            }
        }
    });

    // 选择切换
    $('.inv_tab li').click(function(){
        $(this).toggleClass('active').siblings().removeClass('active');
        //内容切换
        if($('#expert').hasClass('active')){
            $('.reno_form,.inv_con ul,.change').hide();        	
            $('.inv_submit').removeClass('comApply');
          
        }else{
            $('.reno_form,.inv_con ul,.change').show();
            $('.inv_submit').addClass('comApply');
        }
    });

    //房屋类型
    getHuxing()
    function getHuxing(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=8",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var huxinSelect = new MobileSelect({
                          trigger: '.room_type',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){
                                $('#room_type').val(data[0].typename);
                                $('.type_room .choose span').hide();
                                $('#units').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }
    //装修预算
    getPrice()
    function getPrice(){
        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=renovation&action=type&type=6",
          dataType: "json",
          success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;                   
                    var priceSelect = new MobileSelect({
                          trigger: '.inv_price',
                          title: '',
                          wheels: [
                              {data:list}
                          ],
                          keyMap: {
                            id: 'id',
                            value: 'typename'
                          },
                          position:[0, 0],
                          callback:function(indexArr, data){
                                $('#budgetName').val(data[0].typename);
                                $('.budget .choose span').hide();
                                $('#budget').val(data[0].id)
                          }
                          ,triggerDisplayData:false,
                    });
                }
          }
      });
    }
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
                        $('.areacode_span').closest('li').hide();
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
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    function isPhoneNo(p) {
        var pattern = /^1[34578]\d{9}$/;
        return pattern.test(p);
    }
     $('.inv_submit').click(function(){
        var f =$(this);
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        //var city = $('.city').text();//所在的城市
        var add_detail  = $('#add_detail').val();//详细地址
        var units       = $('#units').val();//户型结构
        var budget      = $('#budget').val();//装修预算
        var inv_name    = $('#inv_name').val();//小区名称
        var room_area   = $('#room_area').val();//住房面积
        var name        = $('#name').val();//您的称呼
        var phone       = $('#phone').val();//手机号码
        var par         = f.closest('.formCommon');
        var areaCodev   = $.trim(par.find('.areaCodeinp').val());//区号
        var addrid      = par.find('.gz-addr-seladdr').attr('data-id');
        
        if((f.hasClass("comApply")) && ($('.inv_con li.active').size() < 3)){

            showMsg(langData['renovation'][1][40]);//请选择3家装修公司
            
        }else if($('.free_list .city').text() == langData['renovation'][0][13]) {//请选择您所在的城市
            showMsg(langData['renovation'][1][0]);//请选择所在城市

        }else if(!phone){
             showMsg(langData['renovation'][1][29]);//请输入联系方式
           
        }else{
            f.addClass("disabled").text(langData['renovation'][14][98]);//发布中...
            var data = [];
            data.push("addrid="+addrid);
            data.push("address="+add_detail);
            data.push("unittype="+units);
            data.push("budget="+budget);
            data.push("community="+inv_name);
            data.push("area="+room_area);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+phone);
            if(f.hasClass("comApply")){//装修公司申请
                var comp = [];
                $('.inv_con li.active').each(function(){
                    var cid = $(this).attr('data-id')
                    comp.push(cid);
                })
                data.push("company="+comp.join(','));
            }
            // console.log(data);return false;
            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendZhaobiao",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').show()
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][87]);//申请失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }

     })
// 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })



})