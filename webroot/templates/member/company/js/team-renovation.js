/**
 * 会员中心新闻投稿列表
 * by guozi at: 20150627
 */

var objId = $("#list");
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
                        $('.model.model_edit dd input#phone').css({'padding-left':'10px','width':'245px'});
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
      console.log('codeclick')
        e.stopPropagation();
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
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });
	getList(1);
	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});
	// 新增经纪人
	$('.add').click(function(){
		var type = $('.nav-tabs li.active').attr('data-type');
		var url = '';
		if(type ==1){
			url = '/include/ajax.php?service=renovation&action=addForeman';
		}else{
			url = '/include/ajax.php?service=renovation&action=addTeam';

		}
		$("#zjuserForm").attr('action',url);
		$('.model_edit .name').val('');
		$('.model_edit .phone').val('');

		$('.model_edit .up img').remove();
		$('.model_edit .up').removeClass('has');

		$('#photo').val('');
		$('#userid').val(0);
		$('.model_edit .submit').val(langData['siteConfig'][6][18]);//添加
		$('#password').val('').attr('placeholder', langData['siteConfig'][20][164]);//请输入密码
		$('.model_edit').show();
		$('.infoTip').show();
	})

	$('.model .close, .model .cancel').click(function(){
		$(this).closest('.model').hide();
	})


	$('#zjuserForm').submit(function(e){
		e.preventDefault();
		var f = $(this),
				t = f.find('.submit'),
				photo = $('#photo').val(),
				userid = $('#userid').val(),
				name = $('#name').val(),
				phone = $('#phone').val(),
				password = $('#password').val();
		
		var userType = $('.nav-tabs li.active').attr('data-type');
		$('#userType').val(userType);
		if(photo == ''){
			$.dialog.alert(langData['siteConfig'][44][16]);//请上传头像
			return;
		}
		console.log(name)
		if(name == ''){
			$.dialog.alert(langData['siteConfig'][20][268]);//请填写姓名
			return;
		}
		if(phone == ''){
			$.dialog.alert(langData['siteConfig'][21][185]);//请填写手机号
			return;
		}
		if(userid == 0){
			if(password == ''){
				$.dialog.alert(langData['siteConfig'][20][542]);//请填写登陆密码
				return;
			}
		}
		var action = f.attr('action'),data = f.serialize();
		t.attr('disabled', true);
		$.ajax({
			url:  action,
			type: 'GET',
			data: data,
			dataType: 'jsonp',
			success: function(data){
				$.dialog.alert(data.info);
				t.attr('disabled', false);
				if(data && data.state == 100){
					$('.model_edit .close').click();
					getList(1);	
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试！
				t.attr('disabled', false);
			}
		})
	})


	//编辑
	objId.delegate(".edit", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr('data-id');
		var type = $('.nav-tabs li.active').attr('data-type');
		if(t.hasClass("disabled")) return false;
		if(type ==1){
			gurl = "/include/ajax.php?service=renovation&action=foremanDetail&id="+id;
		}else{
			gurl = "/include/ajax.php?service=renovation&action=teamDetail&id="+id;
		}

		t.addClass("disabled");
		$.ajax({
			url: gurl,
			type: "GET",
			dataType: "json",
			success: function (data) {

				t.removeClass("disabled");

				if(data.state == 100){

					var info = data.info;

					$('#name').val(info.name);
					$('#phone').val(info.tel);
					if(info.areaCode !='0' ){
						$('#areaCode').val(info.areaCode);
						$('.areaCode i').text('+'+info.areaCode);
					}

					$('#age').val(info.age);
					$('#works').val(info.works);
					$('#foremanstyle').val(info.stylev);
					

					var type = $('.nav-tabs li.active').attr('data-type');
					var url = '';
					if(type ==1){
						url = '/include/ajax.php?service=renovation&action=editForeman';
					}else{

						url = '/include/ajax.php?service=renovation&action=editTeam';
					}
					$("#zjuserForm").attr('action',url);
					$('.model_edit .up img').remove();
					if(info.photo != ''){
						$('.model_edit .up').addClass('has').append('<img src="'+info.photo+'">');
					}else{
							$('.model_edit .up').removeClass('has');
					}
					$('#photo').val(info.photoSource);
					$('#userid').val(id);
					$('#password').val('').attr('placeholder', langData['siteConfig'][43][62]);//不修改请留空
					$('.infoTip').hide();
					$('.model_edit .submit').val(langData['siteConfig'][6][4]);//修改
					$('.model_edit').show();
					
				}else{
					$.dialog.alert(langData['siteConfig'][27][107]);
				}

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][27][108]);
			}
		});
	});

	//删除
	objId.delegate(".del", "click", function(){
		$('.model_del').show().data('t', $(this));
	});
	// 确定删除
	$('.model_del .ok').click(function(){
		var t = $('.model_del').data('t'), par = t.closest(".item"), id = par.attr('data-id');
		$.ajax({
			url: "/include/ajax.php?service=renovation&action=delTeam&id="+id,
			type: "GET",
			dataType: "json",
			success: function (data) {
				t.removeClass("disabled");
				if(data && data.state == 100){
					$('.model_del .close').click();
					getList(1);
					par.remove();
				}else{
					$.dialog.alert(langData['siteConfig'][27][107]);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][27][108]);
			}
		});
	})

	//上传单张图片
	function mysub(id){
    var t = $("#"+id), p = t.parent(), img = t.parent().children(".img");

    var data = [];
    data['mod'] = 'member';
    data['filetype'] = 'image';
    data['type'] = 'photo';

    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: id,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {
        	if(img.length > 0){
        		img.attr('src', m.turl);

        		delAtlasPic(p.find(".icon").val());
        	}else{
        		p.append('<img src="'+m.turl+'" alt="" class="img" style="height:40px;">');
        	}
        	$("#photo").val(m.url);
        	$(".up").addClass('has').children('.txt');

        } else {
          uploadError(m.state, id, uploadHolder);
        }
      },
      error: function() {
        uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
      }
  	});

	}

	function uploadError(info, id, uploadHolder){
		$.dialog.alert(info);
		uploadHolder.removeClass('disabled').text(langData['siteConfig'][6][50]);//上传图片
	}

	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "member",
			type: "delPhoto",
			picpath: picpath,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	$("#Filedata").change(function(){
		if ($(this).val() == '') return;
    mysub($(this).attr("id"));
	})

	// 删除头像
	$('.up').delegate('.remove', 'click', function(){
		var img = $('#photo').val();
		delAtlasPic(img);
		$('#photo').val('');
		$('.up').removeClass('has').children('img').remove();
	})


});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	var ac = $('.nav-tabs li.active').data('type');
	var url;
	if(ac==0){
		url="/include/ajax.php?service=renovation&action=team&u=1&page="+atpage+"&company="+Identity.store.id+"&pageSize="+pageSize;
	}else{
		url="/include/ajax.php?service=renovation&action=foreman&u=1&page="+atpage+"&company="+Identity.store.id+"&pageSize="+pageSize;
	}

	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									name        = list[i].name,
									works       = list[i].works,
									age         = list[i].age,
									photo       = list[i].photo,
									albumsCount = list[i].case,
									caseCount   = list[i].diary,
									click       = list[i].click,
									tel         = list[i].tel,
									url         = list[i].url;

							html.push('<div class="item fn-clear renoItem" data-id="'+id+'">');
							html.push('<div class="photo"><a href="'+url+'" target="_blank"><img src="'+photo+'" />');;
							html.push('</a></div>');
							html.push('<div class="info">');
							html.push('<div class="name">'+name+'</div>');
							html.push('<div class="tel">'+tel+'</div>');
							html.push('<div class="otherinfo">');
							var workTxt='',caseTxt='';
							if(ac == 0){//设计师
								//1年工作经验-- 暂无工作经验 
								workTxt = (works > 0)?langData['renovation'][14][70].replace('1',works):langData['renovation'][14][72];
								//1套作品 -- 暂无作品
								caseTxt = (caseCount > 0)?langData['renovation'][15][59].replace('1',caseCount):langData['renovation'][14][76];
							}else{//工长
								//1年工龄-- 暂无工作经验 
								workTxt = (works > 0)?langData['renovation'][14][94].replace('1',works):langData['renovation'][14][72];
								//1岁
								caseTxt = langData['renovation'][15][60].replace('1',age);
							}
							

							html.push(workTxt+'<em>|</em>'+caseTxt);
							html.push('</div>');
							html.push('</div>');
							//编辑--删除
							html.push('<a href="javascript:;" class="edit newEdit"></a>');
							html.push('<a href="javascript:;" class="del newDel"></a>');
							
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;
					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
