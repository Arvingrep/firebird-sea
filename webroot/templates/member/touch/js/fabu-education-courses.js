$(function () {
    toggleDragRefresh('off');  //取消下拉刷新
    
    var atpage = 1, pageSize = 10, isload = false;

    //最高学历
    function getType(){
        $.ajax({
            type: "POST",
            url: masterDomain + "/include/ajax.php?service=education&action=educationtype&value=1",
            dataType: "jsonp",
            success: function(res){
                if(res.state==100 && res.info){
                    var eduSelect = new MobileSelect({
                        trigger: '.edu',
                        title: '',
                        wheels: [
                            {data:res.info}
                        ],
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#typename').val(data[0]['value']);
                            $('#typeid').val(data[0]['id']);
                            $('.edu .choose span').hide();
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
  
    }
  
      getType();
  

    //开始时间
    function getDateTime(d){
        var opt={};
        opt.date = {preset : 'date'};
        opt.datetime = {preset : 'datetime'};
        opt.time = {preset : 'time'};
        opt.default = {
            dateFormat:'yy-mm-dd',
            mode: 'scroller', //日期选择模式
            lang:'zh',
            minDate: new Date(),
            onCancel:function(){//点击取消按钮

            },
            onSelect:function(valueText,inst){//点击确定按钮
               $('.edu'+d).find('.choose .text').text(valueText);
               $('#education'+d).val(valueText);
            },
        };
        var time = $.extend(opt['date'], opt['default']);
        $('.edu'+d).find('.choose').scroller($.extend(opt['date'], opt['default']));
     }
  	//开始时间
    function getendTime(e){
        var opt={};
        opt.date = {preset : 'date'};
        opt.datetime = {preset : 'datetime'};
        opt.time = {preset : 'time'};
        opt.default = {
            dateFormat:'yy-mm-dd',
            mode: 'scroller', //日期选择模式
            lang:'zh',
            minDate: new Date(),
            onCancel:function(){//点击取消按钮

            },
            onSelect:function(valueText,inst){//点击确定按钮
               $('.edue'+e).find('.choose .text').text(valueText);
               $('#educationEnd'+e).val(valueText);
            },
        };
        var time = $.extend(opt['date'], opt['default']);
        $('.edue'+e).find('.choose').scroller($.extend(opt['date'], opt['default']));
     }
    


     //选择课程类型
     $('.wrap').delegate('.class_type li', 'click', function () {
        $(this).toggleClass('active').siblings().removeClass('active');
        if($(this).hasClass('active')){
            var pid = $(this).attr('data-pid'), id = $(this).attr('data-id');
            $('#typeid' + pid).val(id);
        }
      })
  
      var thisInputId, Tid;
      //打开选择教师页面
      $(".wrap").delegate(".teacher", "click", function () {
          thisInputId = $(this).find('input').attr('id');
          Tid = $(this).attr('data-id');
          $('.te_choose').animate({ 'right': '0' }, 150);
          $('body').css('overflow', 'hidden')
          getList(1);
  
      });
      //课程多选
      $(".te_content").delegate(".te_bottom p", "click", function () {
          $(this).toggleClass('active');
          $('.choose_confirm').show();
          if ($(this).parent('.te_bottom').find('p').hasClass('active')) {
              $(this).parents('li').addClass('on');
          } else {
              $(this).parents('li').removeClass('on');
          }
      });
  
      //教师页面确认选择
      $('.choose_confirm').click(function () {
          $('.te_choose').animate({ 'right': '-100%' }, 150);
          $('body').css('overflow', 'auto')
          $('.choose_confirm').hide();
          //输出被选中的教师名
          var tec = [];
          var ids = [];
          $(".te_content li").each(function () {
              if ($(this).hasClass('on')) {
                  var tec_name = $(this).find('.teac_name').text();
                  var id = $(this).attr('data-id');
                  tec.push(tec_name)
                  ids.push(id)
                  $('.teacher .choose .text').hide()
              }
  
          });
          $('#' + thisInputId).val(tec.join(','))
          $('#teacherid' + Tid).val(ids.join(','))
      });
      
      //关闭选择教师页面
      $('.top_return a').click(function(){
        $('.te_choose').animate({'right':'-100%'},150);
        $('.choose_confirm').hide();
        $('body').css('overflow','auto')
      });

      //元
    function getColor(c){
        $('#class_price'+c).blur(function(){
           if($(this).val().length > 0 ){       
              $(this).siblings('label').css("color","#45464f");
           }
        }); 
    }

    // 下拉加载
    $(window).scroll(function() {
        var h = $('.te_content ul').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });

    function getList(tr){
        isload = true;
        if(tr){
            $(".te_content ul").html('<div class="empty">'+langData['siteConfig'][20][184]+'</div>');
        }

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=education&action=teacherList&orderby=2"+"&page="+atpage+"&pageSize="+pageSize+"&store="+storeid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li data-id="'+list[i].id+'">');
                        html.push('<div class="te_top">');
                        html.push('<div class="left_b"><img src="'+huoniao.changeFileSize(list[i].photo, "small")+'" alt=""></div>');
                        html.push('<div class="right_b fn-clear">');
                        html.push('<div class="tec_name"><h1 class="teac_name">'+list[i].name+'</h1><span></span></div>');
                        var sk1 = list[i].certifyState == 1 ? '<span class="sk1">'+langData['siteConfig'][44][67]+'</span>' : '';//身份认证
                        var sk2 = list[i].degreestate == 1 ? '<span class="sk2">'+langData['siteConfig'][44][68]+'</span>' : '';//学历认证
                        html.push('<div class="tec_skill">'+sk1+sk2+'</div>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('<div class="te_bottom">');
                        if(list[i].coursesArr!=''){
                            for(var m=0;m<list[i].coursesArr.length;m++){
                                if(m>6) break;
                                html.push('<p>'+list[i].coursesArr[m]+'</p>');
                            }
                        }
                        html.push('</div>');
                        html.push('</li>');
                    }

                    $(".te_content ul").append(html.join(""));
                    isload = false;

                    if(atpage >= pageinfo.totalPage){
                        isload = true;
                        $(".te_content ul").append('<div class="empty">'+langData['marry'][5][29]+'</div>');
                    }
                }else{
                    isload = false;
                    $(".te_content ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                //网络错误，加载失败
                $(".te_content ul .empty").html(''+langData['marry'][5][23]+'...').show();   
            }
        });
    }

    //添加表单
    var id = classnum ? classnum + 1 : 1;
    $('.more_btn .add').click(function () {
        var aa = true;
        var wrap=$('.wrap');
        if(wrap.find('.baomu_info').size() > 0){
            var t = wrap.find('.baomu_info:last');
            var class_name = t.find(".class_name"); //班级名
            var class_place = t.find(".class_place");   //时间
            var education = t.find(".education");   //地点
            var class_price = t.find(".class_price");   //价格
         
            if(!class_name.val()){
                 //class_name.focus()
                //showMsg(langData['education'][6][0]);   //请输入班级
                //return false;
            }else if(!education.val()){
                 education.focus()
                showMsg(langData['education'][6][1]);   //请选择时间
                return false;
            }else if(!class_place.val()){
                 class_place.focus()
                showMsg(langData['education'][6][2]);   //请输入地点
                return false;
            }else if(!class_price.val()){
                 class_price.focus()
                showMsg(langData['education'][6][3]);   //请输入价格
                return false;
            }

        }


        if(aa){

            list = `
                <div class="baomu_info baomu_info2">`;

            if(wrap.find('.baomu_info').size() == 0){
                list += `<p class="info_title">`+langData['education'][6][4]+`</p>`;//课程安排
            }

            list += `
    
                    <ul class="info">
                        <li class="fn-clear">`;
            list += `       <span class="name"><span class="star">*</span><label for="class_name">`+langData['education'][6][5]+`</label></span>`;//班级名
            list += `       <input type="text" id="class_name`+ id +`" placeholder="`+langData['education'][6][6]+`" name="courses[`+id+`][classname]" class="class_name">`;//不分班级则不填写
            list += `   </li>

                        <li class="fn-clear">
                            <div class="com-box">
                                <div class="edu`+ id +` fn-clear">`;
            list += `                 <span class="name"><span class="star">*</span>`+langData['education'][7][51]+`</span><span class="choose">`;//开始时间
            list += `                 <span class="text">`+langData['education'][3][27]+`</span><i></i></span>`;//请选择
            list += `                 <input id="education`+ id +`" name="courses[`+id+`][openStart]" type="hidden" class="education">
                                </div>
                            </div>
                        </li>
						<li class="fn-clear">
                            <div class="com-box">
                                <div class="edue`+ id +` fn-clear">`;
            list += `                 <span class="name"><span class="star">*</span>`+langData['education'][7][52]+`</span><span class="choose">`;//结束时间
            list += `                 <span class="text">`+langData['education'][3][27]+`</span><i></i></span>`;//请选择
            list += `                 <input id="educationEnd`+ id +`" name="courses[`+id+`][openEnd]" type="hidden" class="educationEnd">
                                </div>
                            </div>
                        </li>
                        <li class="fn-clear">`;
            //list += '<input type="hidden" name="courses['+id+'][openStart]" id="openStart'+id+'"><input type="hidden" name="courses['+id+'][openEnd]" id="openEnd'+id+'">';
            list += `       <span class="name"><span class="star">*</span><label for="class_place">`+langData['education'][6][7]+`</label></span>`;//地点
            list += `       <input type="text" id="class_place`+ id +`" placeholder="`+langData['education'][6][8]+`" name="courses[`+id+`][address]" class="class_place">`;//请输入地点
            list += `   </li>
                        <li class="fn-clear">`;
            list += `       <span class="name"><span class="star">*</span><label for="class_price">`+langData['education'][6][9]+`</label></span>`;//价格                          
            list += `       <p class="class-p">
                                <input type="text" id="class_price`+ id +`" placeholder="" name="courses[`+id+`][price]" class="class_price">`;
            list += `           <label for="class_price">`+langData['education'][6][10]+`</label>`;//元

            list += '<li class="fn-clear"><span class="name"><span class="star">*</span><label for="class_price">'+langData['education'][7][12]+'</label></span>       <p class="class-p"><input type="text" id="class_price'+id+'" placeholder="" name="courses['+id+'][classhour]" class="class_price"><label for="class_price">'+langData['education'][7][13]+'</label></p></li>';
            
            list += `       </p >
                        </li>`;
            if(isteacher==1){
                list +=`    <li class="fn-clear">
                                <div class="com-box">
                                    <div class="teacher fn-clear" data-id="`+id+`" >`;
                list += `               <span class="name">`+langData['education'][6][11]+`</span>`;//授课教师
                list += `               <span class="choose"><span class="text">`+langData['education'][3][27]+`</span><i></i></span>`;//请选择
                list += `               <input id="tec_num`+ id +`" type="text" disabled="disabled" class="tec_num">
                                    </div>
                                </div><input type="hidden" name="courses[`+id+`][teacherid]" id="teacherid`+id+`">
                            </li>`;
            }

            list += `</ul>
                    <div class="class_type">
                        <ul>`;
            if(itemall.length>0){
                for(var i=0; i<itemall.length;i++){
                    list += '<li data-pid="'+id+'" data-id="'+itemall[i].id+'">'+itemall[i].typename+'</li>';
                }
                list += '<input type="hidden" name="courses['+id+'][typeid]" id="typeid'+id+'">';
            }
            list += `   </ul>
                        <div class="class_spec">`;
            list += `        <textarea name="courses[`+id+`][desc]" id="desc[`+id+`]" placeholder="`+langData['education'][6][13]+`"></textarea>`;//请描写班级特色(选填)
            list += `   </div>
                    </div>

                </div>

            `;
            wrap.append(list);
   			//$('.education').scroller(
    		//	$.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
  			//);
        }

        getDateTime(id);
        getendTime(id);
        getColor(id);
        id++;

    });
    //初始化 添加事件  显示出第一个表单
    if(classnum == 0){
        $('.more_btn .add').click();
    }
    if(classnum>0){
        for(var i=1;i<=classnum;i++){
            getDateTime(i);
            getendTime(i);
        }
    }
    
    
    

     

    // 错误提示
    function showMsg(str){
        var o = $(".error");
        o.html('<p>'+str+'</p>').show();
        setTimeout(function(){o.hide()},1000);
    }
  
    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }

    $('#btn-keep').click(function (e) {
        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
        e.preventDefault();
        var that = $(this);

        var comname = $('.comname');//标题
        var wrap=$('.wrap');
        var t = wrap.find('.baomu_info:last');
        var class_name2 = t.find(".class_name");//班级名
        var class_place2 = t.find(".class_place");//时间
        var education2 = t.find(".education");//地点
        var class_price2 = t.find(".class_price");//价格

        if(!comname.val()){
            comname.focus()
            showMsg(langData['education'][6][14]);  //请输入课程名
            tj = false;
        }else if($('.store-imgs .imgshow_box').length == 0){
            showMsg(langData['education'][6][15]);    //请上传课程照片
            tj = false;
        }else if(!class_name2.val()){
            /* class_name2.focus()
            showMsg(langData['education'][6][0]);  //请输入班级
            tj = false; */
        }else if(!education2.val()){
            education2.focus()
            showMsg(langData['education'][6][1]);  //请选择时间
            tj = false;
        }else if(!class_place2.val()){
            class_place2.focus()
            showMsg(langData['education'][6][2]);  //请输入地点
            tj = false;
        }else if(!class_price2.val()){
            class_price2.focus()
            showMsg(langData['education'][6][3]);  //请输入价格
            tj = false;
        }

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        if(!tj) return;

        that.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

        $.ajax({
            url: action,
            data: form.serialize(),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    fabuPay.check(data, url, t);
                }else{
                    showMsg(data.info)
                    that.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][20][183]);
                that.removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        });
 
    });
});