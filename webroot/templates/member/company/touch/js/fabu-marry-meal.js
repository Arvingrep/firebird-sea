$(function () {
    //app端取消下拉刷新
    toggleDragRefresh('off');
    var juFlag = 0;
    //input获得焦点时光标自动定位到文字后面
    $('input[type="text"]').click(function(){
        var tid = $(this).attr('id');
        if(tid && juFlag == 0){
            var sr=document.getElementById(tid);
            po_Last(sr)
        }               
    })
    $('input[type="text"]').blur(function(){
        juFlag = 0;
    })

    function po_Last(obj) {
        juFlag = 1;
        obj.focus();//解决ff不获取焦点无法定位问题
        if (window.getSelection) {//ie11 10 9 ff safari
            var max_Len=obj.value.length;//text字符数
            obj.setSelectionRange(max_Len, max_Len);
        }
        else if (document.selection) {//ie10 9 8 7 6 5
            var range = obj.createTextRange();//创建range
            range.collapse(false);//光标移至最后
            range.select();//避免产生空格
        }
    }
    //填写全部资料
    $('.allInfo a').click(function(){
        var par = $(this).closest('.cominfo');
        if($(this).hasClass('curr')){
           $(this).removeClass('curr'); 
           par.find('.hideWrap').hide();
        }else{
            $(this).addClass('curr');
            par.find('.hideWrap').show();
        }
        
    })
    //
    $(".comInp").bind('input propertychange', function () {
        var tval = $(this).text();
        $(this).siblings('input').val(tval)
    })
    //套餐分类
    var dataArr = [
                    {id:'9',value:langData['marry'][2][14]},//婚礼策划
                    {id:'10',value:langData['marry'][2][15]},//租婚车
                    {id:'1',value:langData['marry'][2][6]},//婚纱摄影
                    {id:'2',value:langData['marry'][2][7]},//摄影跟拍
                    {id:'7',value:langData['marry'][2][16]},//婚礼主持
                    {id:'3',value:langData['marry'][2][8]},//珠宝首饰
                    {id:'4',value:langData['marry'][2][9]},//摄像跟拍
                    {id:'5',value:langData['marry'][2][10]},//新娘跟妆
                    {id:'6',value:langData['marry'][2][11]}//婚纱礼服
                    ];
    var typeSelect = new MobileSelect({
        trigger: '.star-box ',
        title: '',
        wheels: [
            {data:dataArr}
        ],
        position:[0, 0],
        checkM:1,
        callback:function(indexArr, data){
            $('#type_text').val(data[0]['value']);
            $('#typeid').val(data[0]['id']);
            var tId = data[0]['id'];
            //筛选
            $('.filterWrap .info').hide();
            $('.filterWrap .filter-'+tId).show();
            //基本参数
            $('.cominfo').hide();
            $('.parm-'+tId).show();
            typeFilter();
            $('.textarea').html('');//清空图文详情
            if(tId == 7){
                $('#speName').text(langData['marry'][7][53]);//主持人姓名
            }else{
                $('#speName').text(langData['marry'][7][50]);//套餐标题
            }

        }
        ,triggerDisplayData:false,
    });

    var dataMusic = [
                    {id:'0',value:langData['siteConfig'][31][26]},//无
                    {id:'1',value:langData['siteConfig'][31][25]}//有
                    ];
    var dataSame = [
                    {id:'0',value:langData['marry'][7][86]},//否
                    {id:'1',value:langData['marry'][7][85]}//是
                    ];   

   var dataSupport = [
                    {id:'0',value:langData['marry'][7][94]},//不支持
                    {id:'1',value:langData['marry'][7][95]}//支持
                    ]; 
    function hostMusic(){
        //主持人-音乐督导
        var musicSelect = new MobileSelect({
            trigger: '.music-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#music_text').val(data[0]['value']);
                $('#music').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });
        //主持人-现场督导
        var sceneSelect = new MobileSelect({
            trigger: '.scene-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#scenename').val(data[0]['value']);
                $('#scene').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

    }


    //珠宝首饰-商场同款
    function jewelrySame(){
        
        var musicSelect = new MobileSelect({
            trigger: '.same-box ',
            title: '',
            wheels: [
                {data:dataSame}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#samename').val(data[0]['value']);
                $('#same').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

    }

    //新娘跟妆-化妆助理
    function makeHelp(){
        
        var helpSelect = new MobileSelect({
            trigger: '.makehelp-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#makehelpname').val(data[0]['value']);
                $('#makehelp').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

        var mkserviceSelect = new MobileSelect({
            trigger: '.mkservice-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#mkservicename').val(data[0]['value']);
                $('#mkservice').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

    }

    function getGownAll(tt,td){ //td要传到接口中取数据
        
        var tCla = tt.find('.comBox')[0].className,
            tInp = tt.find('.comText')[0].id,
            tVal = tt.find('.comVal')[0].id;
        var claARR = (tCla.split(' '))[0];//triggler的类名要唯一 所以循环div的命名 第一个为专属类名
        // 婚纱摄影-风格
        $.ajax({
            type: "POST",
            url:  "/include/ajax.php?service=marry&action=hotelType&type="+td,
            dataType: "json",
            success: function(res){
                if(res.state==100 && res.info){
                    var styleSelect = new MobileSelect({
                        trigger: '.'+claARR,
                        title: '',
                        wheels: [
                            {data:res.info}
                        ],
                        keyMap: {
                            id: 'id',
                            value: 'typename'
                        },
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#'+tInp).val(data[0]['typename']);
                            $('#'+tVal).val(data[0]['id']);
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
       
    
    
    }
    // 婚纱摄影-灯光师  化妆助理
    function gownLight(){
        //婚纱摄影-灯光师
        var lightSelect = new MobileSelect({
            trigger: '.gownlight-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#gownlightname').val(data[0]['value']);
                $('#gownlight').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });
        //婚纱摄影-化妆助理
        var assistantSelect = new MobileSelect({
            trigger: '.assistant-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#assistantname').val(data[0]['value']);
                $('#assistant').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

    }

    // 婚纱礼服-主推款式  定制服务 免费试纱
    function dress(){
        //主推款式
        var mstySelect = new MobileSelect({
            trigger: '.mainsty-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#mainstyname').val(data[0]['value']);
                $('#mainsty').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });
        //定制服务 支持 不支持
        var madeSelect = new MobileSelect({
            trigger: '.custom-box ',
            title: '',
            wheels: [
                {data:dataSupport}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#customname').val(data[0]['value']);
                $('#custom').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

        //免费试纱
        var freeSelect = new MobileSelect({
            trigger: '.free-box ',
            title: '',
            wheels: [
                {data:dataMusic}
            ],
            position:[0, 0],
            callback:function(indexArr, data){
                $('#freename').val(data[0]['value']);
                $('#free').val(data[0]['id']);
            }
            ,triggerDisplayData:false,
        });

    }

    typeFilter();
    function typeFilter(){
        var mtypeid = $('#typeid').val();
        if(mtypeid == 7){//主持人
            //先循环所有需要取数据的select
            $('.info .hostLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })
            hostMusic();


        }else if(mtypeid == 10){//婚车

            $('.info .carLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })

        }else if(mtypeid == 9){//婚礼策划

            //先循环所有需要取数据的select
            $('.info .planLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })

        }else if(mtypeid == 1){//婚纱摄影

            //先循环所有需要取数据的select
            $('.info .gownLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })
            gownLight();

        }else if(mtypeid == 2){//摄影跟拍

            $('.info .photoLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })

        }else if(mtypeid == 3){//珠宝首饰

            $('.info .jewelryLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })
            jewelrySame();

        }else if(mtypeid == 4){//摄像跟拍

            $('.info .videoLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })

        }else if(mtypeid == 5){//新娘跟妆

            $('.info .makeupLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })
            makeHelp();

        }else if(mtypeid == 6){//婚纱礼服

            $('.info .dressLi').each(function(){
                var t = $(this),tid = t.attr('data-type');
                getGownAll(t,tid);
            })
            dress();

        }
    }
    

    $('.tab-box .tab span').click(function () {
        $(this).toggleClass('active');
        var ids = [];
        $('.tab-box .tab span').each(function(){
            if($(this).hasClass('active')){
                ids.push($(this).data('id'));
            }
        })
        $('#tabbox').val(ids.join("|"));
    });
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'json',
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
        $(".areacode_span em").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
    $('.fabu_btn .btn').click(function () {
        var t = $(this);
        var type = $('#typeid').val(),
            comname = $('#comname').val(),//标题
            price = $('#price').val(),//价格
            contact = $('#contact').val(),//联系方式
            note = $('#note').html(),//图文详情 文字
            storeImg = $('.store-imgs .imgshow_box').length;//套餐图集
        //其他验证项 filter
        var  hstyle =  $('#hstyle').val(),//主持人-风格
             cartype =  $('#cartype').val(),//婚车-类型
             planstyle =  $('#planstyle').val(),//婚礼策划-风格
             plantype =  $('#plantype').val(),//婚礼策划-类别
             plancolor =  $('#plancolor').val(),//婚礼策划-颜色
             gownstyle =  $('#gownstyle').val(),//婚纱摄影 - 风格
             gownscene =  $('#gownscene').val(),//婚纱摄影 - 场景
             phototype =  $('#phototype').val(),//摄影跟拍-类型
             photostyle =  $('#photostyle').val(),//摄影跟拍- 风格
             material =  $('#material').val(),//珠宝首饰-材质
             jewelrytype =  $('#jewelrytype').val(),//珠宝首饰-类型
             videotype =  $('#videotype').val(),//摄像跟拍-类型
             videostyle =  $('#videostyle').val(),//摄像跟拍-风格
             mkstyle =  $('#mkstyle').val(),//新娘跟妆-风格
             drstyle =  $('#drstyle').val();//婚纱礼服-款式
        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

        if(!comname){
            if(type == 7){
                showErr(langData['marry'][7][98]);//请输入主持人姓名！
            }else{
                showErr(langData['marry'][7][99]);//请输入套餐标题！
            }           
            tj = false;
        }else if(!price){
            showErr(langData['marry'][4][14]);//请输入价格！
            tj = false;
        }else if(storeImg == 0){
            showErr(langData['marry'][7][100]);//请上传套餐图集！
            tj = false;
        }else if(!contact){
            showErr(langData['marry'][8][1]);//请填写联系电话！
            tj = false;
        }else{//样式 风格 类型验证
            if(type == 7 && (!hstyle)){//婚礼主持
                showErr(langData['marry'][8][2]);//请选择主持人风格！
                tj = false;
            }else if(type == 10 && (!cartype)){//租婚车
                showErr(langData['marry'][8][3]);//请选择婚车类型！
                tj = false;
            }else if(type == 9){//婚礼策划
                if(!planstyle){
                    showErr(langData['marry'][8][4]);//请选择风格！
                    tj = false;
                }else if(!plantype){
                    showErr(langData['marry'][8][5]);//请选择婚礼类别！
                    tj = false;
                }else if(!plancolor){
                    showErr(langData['marry'][8][6]);//请选择颜色！
                    tj = false;
                }
            }else if(type == 1){//婚纱摄影
                if(!gownstyle){
                    showErr(langData['marry'][8][4]);//请选择风格！
                    tj = false;
                }else if(!gownscene){
                    showErr(langData['marry'][8][7]);//请选择场景！
                    tj = false;
                }
            }else if(type == 2){//摄影跟拍
                if(!phototype){
                    showErr(langData['marry'][8][8]);//请选择类型！
                    tj = false;
                }else if(!photostyle){
                    showErr(langData['marry'][8][4]);//请选择风格！
                    tj = false;
                }
            }else if(type == 3){//珠宝首饰
                if(!material){
                    showErr(langData['marry'][8][9]);//请选择材质！
                    tj = false;
                }else if(!jewelrytype){
                    showErr(langData['marry'][8][8]);//请选择类型！
                    tj = false;
                }
            }else if(type == 4){//摄像跟拍
                if(!videotype){
                    showErr(langData['marry'][8][8]);//请选择类型！
                    tj = false;
                }else if(!videostyle){
                    showErr(langData['marry'][8][4]);//请选择风格！
                    tj = false;
                }
            }else if(type == 5 && (!mkstyle)) {//新娘跟妆
                showErr(langData['marry'][8][4]);//请选择风格！
                tj = false;
            }

        }

        //套餐图集
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        //图文详情的图片
        

        //套餐视频
        var video = [];
        $("#fileList2").find('.thumbnail').each(function(){
            var src = $(this).find('video').attr('data-val');
            video.push(src);
        });
        $("#video").val(video.join(','));


        if(!tj) return;

        $('.fabu_btn .btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中
        var mydata = form.serialize();
        mydata = mydata
                +"&typeid="+typeid;
        if($('.textarea').html() !=''){
          mydata = mydata + "&note="+$('.textarea').html(); 
        }
        if (typeid == 7){
            action = '/include/ajax.php?service=marry&action=operHost&oper='+editFlag;
        }else if (typeid == 10){
            action = '/include/ajax.php?service=marry&action=operRental&oper='+editFlag;
        }else {
            action;

        }
        var ttUrl = mealUrl.replace('%typeid%',type);
        $.ajax({
	        url: action,
	        data: mydata,
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    location.href = ttUrl;
	            }else{
					showErr(data.info);
	            	t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	            }
	        },
	        error: function(){
				showErr(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	        }
        });

    });


    //错误提示框
    var showErrTimer;
    function showErr(txt){
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
        $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
        $(".popErr").css({"visibility": "visible"});
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
            });
        }, 1500);
    }
    
    
});