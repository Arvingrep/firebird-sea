$(function(){

	$("#totalCount").html(totalCount);

	// 窄屏下鼠标移入公司列表
	var showlongt;
	// $('.list li').hover(function(){
	// 	if($('html').hasClass('w1200')) return;
	// 	$(this).addClass('hover');
	// },function(){
	// 	if($('html').hasClass('w1200')) return;
	// 	$(this).removeClass('hover');
	// });


	$('.sort li a').click(function(){
		var p = $(this).parents('li');
		$(this).toggleClass('curr');
		p.siblings().find('a').removeClass('curr');
		
	})


    //我是自由工长
    $('.alone').click(function(){
    	console.log(1)
      $('.com_choose').hide();
       //$('.info li.comp_cho').addClass('active')
    })

    //我有所属公司
     $('.com_have').click(function(){
      $('.com_choose').show();
     // $('.info li.comp_cho').removeClass('active')
    })
    $(".com_list ul li:nth-child(7n)").css("margin-right","0");

    $('.apply_con').delegate('.close','click',function(){
    	$('.apply_mask,.apply_con').hide();

    })

     $('.apply_mask').click(function(){
    	$('.apply_mask,.apply_con').hide();

    })
    $('.com_choose').click(function(){
    	$('.apply_mask,.apply_con').show();

    })
    // // 点击上传照片(一张)
    var upqjShow = new Upload({
      btn: '#up_qj',
      title: 'Images',
      mod: 'renovation',
      params: 'type=atlas',
      atlasMax: 1,
      deltype: 'delAtlas',
      replace: false,
      fileQueued: function(file, activeBtn){
        var btn = activeBtn ? activeBtn : $("#up_qj");
        var p = btn.parent(), index = p.index();
        $("#qjshow_box li").each(function(i){
          if(i >= index){
            var li = $(this), t = li.children('.img_show'), img = li.children('.img');
            if(img.length == 0){
              t.after('<div class="img" id="'+file.id+'"></div><i class="del_btn">+</i>');
              return false;
            }

          }
        })
      },
      uploadSuccess: function(file, response, btn){
        if(response.state == "SUCCESS"){
          $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" data-val="'+response.url+'"/>');

        }
      },
      uploadProgress:function(file,percentage){
        var $li = $('#'+file.id),
			$percent = $li.find('.progress span');
			// 避免重复创建
			if (!$percent.length) {
				
				$percent = $('<p class="progress"><span></span></p>')
					.appendTo($li)
					.find('span');
					
			}
			$percent.css('width', percentage * 100 + '%');
      },
      uploadFinished: function(){
        if(this.sucCount == this.totalCount){
          // alert('所有图片上传成功');
        }else{
          alert((this.totalCount - this.sucCount) + '张图片上传失败');
        }
        
        updateQj();
      },
      uploadError: function(){

      },
      showErr: function(info){
        alert(info);
      }
    });
    $('#qjshow_box').delegate('.del_btn', 'click', function(){
      var t = $(this),li = t.closest('li');
      	upqjShow.del(li.find(".img img").attr("data-val"));
        t.remove();
      	li.find(".img").remove();
    })
    function updateQj(){

      var qj_file = [];
      
        $("#qjshow_box li").each(function(i){
          var img = $(this).find('img');
          if(img.length){
            var src = img.attr('data-url');
            qj_file.push(src);
          }
        })
        $('#photo').val(qj_file.join(','));
      
    }

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
                        $('.content2 input#phone').css({'padding-left':'20px'});
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
    $('.areaCode').bind('click', function(e){
        e.stopPropagation();
        var areaWrap =$(this).closest(".inpBox").find('.areaCode_wrap');
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
        var par = t.closest(".inpBox");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });
 	getList();
    function getList() {

    	$(".com_list ul").html('<li class="empty">'+langData['renovation'][14][49]+'</li>'); //正在获取，请稍后
    	$(".pagination").html('').hide();

    	var data = [];
    	data.push('page='+atpage);
    	data.push('pageSize='+pageSize);
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=store",
            type: "get",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if (data.state == 100) {
                    var list = data.info.list,
                        html = [],
                        pageInfo = data.info.pageInfo;
                    	totalCount = pageInfo.totalCount;
                    var atpage = Math.ceil(totalCount / pageSize);

                    for (var i = 0; i < list.length; i++) {
                        var d = list[i];

                        html.push('<li class="fn-clear" data-id="'+d.id+'">');
                        html.push('<div class="pic">');
                         var litpic = d.logo != "" && d.logo != undefined ? huoniao.changeFileSize(d.logo, "small") :
                                "/static/images/404.jpg";
                        html.push('<img src="' + litpic + '" alt="">');
                        html.push('<span class="apply_join">申请加入</span>');
                        html.push('</div>');
                        html.push('<p class="com_title">'+d.company+'</p>');
                        html.push('</li>');
                    }
                    $(".com_list ul").html(html.join(""));
                    showPageInfo();
                } else {
                	
                    $(".com_list ul").html('<li class="empty">'+langData['renovation'][2][25]+'</li>');//已显示全部
                }
            },
            error: function(){
        
              $(".com_list ul").html('<div class="empty">'+langData['renovation'][2][26]+'</div>');//网络错误，请刷新重试
            }
        })
    }

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
    //申请加入
    $('.apply_con').delegate('.apply_join','click',function(){
    	var com_title=$(this).parents('li').find('.com_title').text();
    	$('.apply_mask,.apply_con').hide();
    	$('.com_choose .com_name').text(com_title);
    	$(".com_choose .com_name").css("color","#333");

         var companyId = $(this).closest('li').attr('data-id');
        $("#company").val(companyId);
    })

    	//提交立即申请
	$(".apply").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		if(f.hasClass("disabled")) return false;

		//上传照片
		var qjimg_box=$('.qjimg_box')
		if($('.qjimg_box .img').length == 0){
			if (r) {
				errmsg(qjimg_box, '请上传照片');
			}
			r = false;
		}

		// 称呼
		var name = $('#name');
		var namev = $.trim(name.val());
		if(namev == '') {
			if (r) {
				name.focus();
				errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var phone = $('#phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		} else {
			var telReg = !!phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
			if(!telReg){
		    if (r) {
		    	phone.focus();
		    	errmsg(phone,langData['renovation'][14][46]);//请输入正确手机号码
		    }
		    r = false;
			}
		}
		// 工种类别
        var forman_type = $('#forman_type');
		if(forman_type == 0 || forman_type == "") {
			if (r) {
				errmsg(forman_type, langData['renovation'][14][53]);//请选择工种类别
			}
			r = false;
		}

		// 工龄
		var work_year = $('#work_year');
		var work_yearv = $.trim(work_year.val());
		if(work_yearv == '') {
			if (r) {
				work_year.focus();
				errmsg(work_year, langData['renovation'][14][54]);//请填写工龄
			}
			r = false;
		}

        //身份类别
        var command_type = $('input[name="forman_type"]:checked').val();
        var com_name=$('.com_name');//选择所属公司
        if(command_type == 1){
          if(com_name.text() == "选择所属公司"){
            if (r) {                
                errmsg(com_name, langData['renovation'][8][10]);//请选择所属公司
            }
            r = false;
          }                    
        }

        var company = $("#company").val();
        var photo   = $("#photo").val();		
        if(!r) {
            return false;
        }
        var data = [];

        data.push("name="+namev);
        data.push("photo="+photo);
        data.push("areaCode="+$('#areaCode').val());
        data.push("tel="+phonev);
        data.push("works="+work_yearv);
        data.push("type="+command_type);
        data.push("company="+company);

        $.ajax({
            url: "/include/ajax.php?service=renovation&action=joinForeman",
            type: "get",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if(data.state ==100){

                    $('.order_mask').show();
                    f.addClass("disabled");
                }else{
                    alert(data.info)
                }
            },
            error:function(){

            }

        })

	});

    $('.order_mask .close_alert').click(function(){
        location.href = channelDomain+"/index.html";
    })
     $('.order_mask .see').click(function(){
        location.href = channelDomain+"/index.html";
    })
    //数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};


})
