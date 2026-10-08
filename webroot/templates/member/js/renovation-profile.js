$(function(){
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
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
        var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
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
        var par = t.closest("dd");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code)
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });

    function showErr(obj, type){
        if(type == 'suc'){
          obj.siblings('.tip-inline').removeClass().addClass("tip-inline success").show();
        }else{
          obj.siblings('.tip-inline').addClass("tip-inline error").html('<s></s>'+obj.data('title')).css('display','inline-block');
        }
    }
    //公司层弹出
    $('.apply_con').delegate('.close','click',function(){
        $('.apply_mask,.apply_con').hide();

    })

     $('.apply_mask').click(function(){
        $('.apply_mask,.apply_con').hide();

    })
     //选择公司弹出
    // $('.com_choose').click(function(){
    //     $('.apply_mask,.apply_con').show();

    // })
    //搜索公司
    $('.renoform_go').click(function(){
        getList(1);
        return false;
    })
    getList();
    function getList(tr) {       

      $(".com_list ul").html('<li class="empty">'+langData['renovation'][14][49]+'</li>'); //正在获取，请稍后
      $(".pagination").html('').hide();
      var key = $('#keywords').val();
      var data = [];
      data.push('page='+atpage);
      data.push('pageSize='+pageSize);
      data.push('title='+key);
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=store",
            type: "get",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if (data && data.state == 100) {
                    var list = data.info.list,
                        html = [],
                        pageInfo = data.info.pageInfo;
                      totalCount = pageInfo.totalCount;
                    var atpage = Math.ceil(totalCount / pageSize);
                    if(list.length > 0){
                        for (var i = 0; i < list.length; i++) {
                            var d = list[i];

                            html.push('<li class="fn-clear" data-id="'+d.id+'">');
                            html.push('<div class="pic">');
                            var logo = d.logo != "" && d.logo != undefined ? huoniao.changeFileSize(d.logo, "small") :
                                "/static/images/404.jpg";
                            html.push('<img src="' + logo + '" alt="">');
                            html.push('<span class="apply_join">'+langData['renovation'][7][27]+'</span>');//申请加入
                            html.push('</div>');
                            html.push('<p class="com_title">'+d.company+'</p>');
                            html.push('</li>');
                        }
                        $(".com_list ul").html(html.join(""));
                        showPageInfo();
                    }else{
                       $(".com_list ul").html('<li class="empty">'+langData['siteConfig'][20][126]+'</li>');//暂无相关信息 
                    }
                    
                } else {
                  
                    $(".com_list ul").html('<li class="empty">'+data.info+'</li>');         
                }
            },
            error: function(){
        
              $(".com_list ul").html('<div class="empty">'+langData['renovation'][2][26]+'</div>');//网络错误，请刷新重试
            }
        })
    }


    //申请加入
    $('.apply_con').delegate('.apply_join','click',function(){
      var com_title=$(this).parents('li').find('.com_title').text();
      var companyId = $(this).parents('li').attr('data-id');
      $('.apply_mask,.apply_con').hide();
      $('#company').val(com_title);
      $("#companyid").val(companyId)
    })
    //选择风格
    $(".art_ul li").bind("click", function(){
        $(this).toggleClass('curr');
    })
    $("#submit").bind("click", function(e){
        e.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));      
        $('#addrname').val($('.addrBtn').text());
        var t              = $(this),
            offsetTop      = 0,
            name        =  $("#name"),//姓名
            addrid      =  $("#addrid").val(),//现居地址
            photo         =  $("#photo"),//头像
            tel         =  $("#tel"),//联系方式
            companyid   =  $("#companyid"),//所属公司
            major       =  $("#major"),//所学专业
            works       =  $("#works"),//工作经验/工龄
            composition =  $("#composition"),//设计作品
            idea        =  $("#idea"),//设计理念
            foremanType =  $("#foremanType"),//工长类型
            age         =  $("#age"),//年龄
            profile     =  $("#profile");//个人简介

            address     =  $(".city-title").text();
        
        var style=[],styleCurr = $('.art_ul li.curr');
        styleCurr.each(function(){
            var sId = $(this).attr('data-id');
            style.push(sId);
        })
        $('#style').val(style.join(','));
        if(t.hasClass("disabled")) return;

        if(name.val() == ''){//姓名
          showErr(name);
          offsetTop = offsetTop == 0 ? name.closest('dl').offset().top : offsetTop;
        }
       
        if(photo.val() == ''){//头像
          $.dialog.alert(langData['siteConfig'][27][125]);//请上传头像
          offsetTop = offsetTop == 0 ? photo.closest('dl').offset().top : offsetTop;
        }


        if(tel.val() == ''){//联系方式
          showErr(tel);
          offsetTop = offsetTop == 0 ? tel.closest('dl').offset().top : offsetTop;
        }

        if(addrid == '' || addrid == 0){//现居地址
            var par = $("#selAddr");
            var hline = par.find(".tip-inline"), tips = par.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = offsetTop == 0 ? $('.addrBtn').closest('dl').offset().top : offsetTop;
        }else{
            var par = $("#selAddr");
            par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }

        // if(companyid.val() =='' && certify == 2 ){//所属公司
        //     var par = $("#companyid").closest('dd');
        //     var hline = par.find(".tip-inline"), tips = par.data("title");
        //     hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
        //     offsetTop = offsetTop == 0 ? $('#companyid').closest('dl').offset().top : offsetTop;
        // }else if(companyid.val() !='' && certify == 2){
        //     var par = $("#companyid").closest('dd');
        //     par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        // }

        if(major.val() == '' && typeId == 2){//所学专业
          showErr(major);
          offsetTop = offsetTop == 0 ? major.closest('dl').offset().top : offsetTop;
        }

        if(works.val() =='' ){//工作经验/工龄
            var par = $("#works").closest('dd');
            var hline = par.find(".tip-inline"), tips = $("#works").data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = offsetTop == 0 ? $('#works').closest('dl').offset().top : offsetTop;
        }else{
            var par = $("#works").closest('dd');
            par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }

        if(composition.val() == '' && typeId == 2){//设计作品
          showErr(composition);
          offsetTop = offsetTop == 0 ? composition.closest('dl').offset().top : offsetTop;
        }

        if(idea.val() == '' && typeId == 2){//设计理念
          showErr(idea);
          offsetTop = offsetTop == 0 ? idea.closest('dl').offset().top : offsetTop;
        }

        if(styleCurr.length == 0 && typeId == 2){//擅长风格
          $.dialog.alert(langData['renovation'][15][68]);//请选择擅长风格
          offsetTop = offsetTop == 0 ? $('#style').closest('dl').offset().top : offsetTop;
        }
        if(foremanType.val() =='' && typeId == 1 ){//工长类型

            var par = $("#foremanType").closest('dd');
            var hline = par.find(".tip-inline"), tips = par.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = offsetTop == 0 ? $('#foremanType').closest('dl').offset().top : offsetTop;

        }else if(foremanType.val() !='' && typeId == 1 ){
            var par = $("#foremanType").closest('dd');
            par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }

        if(works.val() =='' && typeId == 1 ){//年龄
            var par = $("#age").closest('dd');
            var hline = par.find(".tip-inline"), tips = $("#age").data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = offsetTop == 0 ? $('#age').closest('dl').offset().top : offsetTop;
        }else if(works.val() !='' && typeId == 1 ){
            var par = $("#age").closest('dd');
            par.find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
        }

        if(profile.val() == '' && typeId == 1){//个人简介
          showErr(profile);
          offsetTop = offsetTop == 0 ? profile.closest('dl').offset().top : offsetTop;
        }

        if(offsetTop){
          $('html,body').animate({'scrollTop':offsetTop}, 500);
          return false;
        }
        var form = $("#fabuForm"), action = form.attr("action");
        t.addClass("disabled").html(langData['siteConfig'][7][9]);//保存中
        data = form.serialize();
        data+= "&address="+address;
        $.ajax({
    			url: action,
    			data: data,
    			type: "POST",
    			dataType: "json",
    			success: function (data) {
    				if(data && data.state == 100){

    					$.dialog({
    						title: langData['siteConfig'][19][287],
    						icon: 'success.png',
    						content: data.info,
    						ok: function(){}
    					});
    					t.removeClass("disabled").html(langData['siteConfig'][6][27]);//保存

    				}else{
    					$.dialog.alert(data.info);
    					t.removeClass("disabled").html(langData['siteConfig'][6][27]);//保存
    				}
    			},
    			error: function(){
    				$.dialog.alert(langData['siteConfig'][20][183]);
    				t.removeClass("disabled").html(langData['siteConfig'][6][27]);//保存
    			}
    	});

    });

    //打印分页
    function showPageInfo() {
        var info = $(".pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount / pageSize);
        var pageArr = [];

        info.html("").hide();


        var pages = document.createElement("div");
        pages.className = "pagination-pages";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    atpage = nowPageNum - 1;
                    getList();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','#');
                                page.onclick = function () {
                                    atpage = Number($(this).text());
                                    getList();
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getList();
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','#');
                next.onclick = function () {
                    atpage = nowPageNum + 1;
                    getList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }
  
})