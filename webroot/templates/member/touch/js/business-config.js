$(function(){
   
    //原生APP后退回来刷新页面
    pageBack = function(data) {
        setupWebViewJavascriptBridge(function(bridge) {
        	bridge.callHandler("pageRefresh", {}, function(responseData){});
        });
    }


    //获取商家详情地址，APP和小程序中需要使用
    setTimeout(function(){
        timer_trade = setInterval(function(){
            $.ajax({
                type: 'POST',
                async: false,
                url: '/include/ajax.php?service=business&action=storeDetail',
                dataType: 'json',
                success: function(str){
                    if(str.state == 100 && str.info){
                        $('#address_').val(str.info.address);
                    }
                }
            });
        }, 2000);
    }, 3000)



  // 展开下拉式选项
  $(".dropdown").click(function(){
    var t = $(this), box = $("#"+t.attr("data-drop"));
    if(t.hasClass("arrow-down")){
      t.removeClass("arrow-down");
      box.removeClass("fade-in");
    }else{
      t.addClass("arrow-down");
      box.addClass("fade-in");
      box.trigger('dropdown');
    }
  })

  //经营类目

  var defaultValue = [0,0]
   mobiscroll.settings = {
		theme: 'ios',
		themeVariant: 'light',
		height:40,
		lang:'zh',
		headerText:true,
		calendarText:langData['waimai'][10][71],  //时间区间选择
	};
   getTypeList();
  function getTypeList(){
	  $.ajax({
		url: '/include/ajax.php?service=business&action=type',
		type: "POST",
		dataType: "json",
		async:false,
		success: function (data) {
			if(data.state = 100){
				var plist = data.info;
				var typeList = [],html = [];

				html.push('<ul id="typeList"  data-type="treeList" style="display: none;">')
				for(var i = 0; i < plist.length; i++){
					if(plist[i].lower){
						var id = plist[i].id;
						var typename = plist[i].typename;
						html.push('<li data-val="'+id+'"><span>'+typename+'</span><ul>');
						getLowerList(id,html);
						html.push('</ul></li>');
					}
				}
				html.push('</ul>');
				$(".page_shopdetail #typename").after(html.join(''));

				var treelist = $('#typeList').mobiscroll().treelist({
					display: 'bottom',
					circular:false,
					defaultValue:defaultValue,
					onInit:function(){
						$("#typename").val($("#typeList li[data-val="+defaultValue[1]+"]").text())
					},
					onSet:function(valueText, inst){
						var typename = $("#typeList li[data-val="+inst._wheelArray[1]+"]").text()
						var typeid = inst._wheelArray[1];
						$("#typename").val(typename);
						$("#typeid").val(typeid);
             toggleDragRefresh('on');
						$.post('/include/ajax.php?service=business&action=updateStoreConfig&typeid='+typeid);
					},
          onShow:function(){
             toggleDragRefresh('off');
          },
          onHide:function(){
             toggleDragRefresh('on');
          }

				})

			}
		},
		error: function(){}
	});
  }

  function getLowerList(id,html){
	  $.ajax({
	  	url: '/include/ajax.php?service=business&action=type&type='+id,
	  	type: "POST",
	  	dataType: "json",
	  	success: function (data) {
	  		if(data.state = 100){
	  			var clist = data.info;
	  			for(var m = 0; m < clist.length; m++){
					html.push('<li data-val="'+clist[m].id+'">'+clist[m].typename+'</li>');
					if(typeid == clist[m].id){
						defaultValue = [id,typeid]
					}
				}

	  		}
	  	},
	  	error: function(){}
	  });
  }

// 店铺标签
$(".add_label").click(function(){
	var t = $(this);
	var addlabel = false;
	$(".shopTag .label").each(function(){
		var tt = $(this);
		if(tt.find('input').length > 0 && tt.find('input').val() == '') {
			addlabel = true;
			return false;
		}
	});
	if(addlabel){
		showErrAlert(langData['business'][9][19]);  //请在空白标签输入内容
	}else{
		t.before('<div class="label"><input type="" name="label" value="" placeholder="'+langData['business'][9][14]+'"><div class="del_label"></div></div>')//请在输入标签
	}
});


//删除店铺标签
$(".labels").delegate(".del_label,.del_time",'click',function(){
	var t = $(this);
	t.closest('.label').remove();
	showErrAlert(langData['business'][9][20])  //成功删除
	if(t.hasClass('del_label')){  //删除店铺标签
		updateStoreTag();
	}else{ //删除事件端
		updateOpentime()
	}
})

// 店铺标签
$(".shopTag").on('blur',' input',function(){
	updateStoreTag();
})

// 保存店铺标签
  function updateStoreTag(){
    var shopTag = []
    $(".shopTag div.label").each(function(){
    	var t = $(this); val = t.find('input').val();
    	if(val != ''){
    		shopTag.push(val)
    	}
    });
    var tagStr = shopTag.join("|");

    $.post('/include/ajax.php?service=business&action=updateStoreConfig', 'tag_shop='+tagStr);

  }



// 营业时间
$("#yingyeTxt").click(function(){
	$(".pop_mask").show();
	$(".week_pop").css({'transform': 'translateY(-5.4rem)'});
});
$(".pop_mask,.week_pop .cancel").click(function(){
	$(".pop_mask").hide();
	$(".week_pop").css({'transform': 'translateY(5.4rem)'});
});

$(".week_pop li").click(function(){
	var t = $(this),id = t.attr('data-id');
	t.toggleClass('active')
	if(id =='0'){
		if(t.hasClass('active')){
			$(".week_pop li").addClass('active')
		}
	}else{
		$(".week_pop li[data-id=0]").removeClass('active')
	}

});

$(".week_pop .sure").click(function(){
	var week = [], ids = [];
	$(".week_pop li.active").each(function(){
		if($(this).attr('data-id')!='0'){
			week.push($(this).text());
            ids.push($(this).attr('data-id'));
		}
	})
	$("#yingyeTxt").val(week.join(' '))
	$("#openweek").val(ids.join(','))
	$(".pop_mask").click();
	$.post('/include/ajax.php?service=business&action=updateStoreConfig','openweek='+ids.join(','));
});


//更新时间段
function updateOpentime(){
	var opentime = []
	$('.time_list .chose_inp').each(function(){
		var t = $(this);
		time = t.text();
		opentime.push(time)
	});
	console.log(opentime)
	$.post('/include/ajax.php?service=business&action=updateStoreConfig','opentimes='+opentime.join(','));
}

// 时间段
mobiscroll.range('#stime', {
	controls: ['time'],
	endInput: '#etime',
	autoCorrect:false,
	hourText:langData['waimai'][11][218],  //'点'
	minuteText:langData['waimai'][6][125],  //分
	onSet: function (event, inst) {
		var enddate = inst._endDate;
		enddateFormat = formatTime(enddate);
		var tlen = $(".chose_inp").size();
		$(".time_list .add_btn").before('<span class="chose_inp label">'+event.valueText+'-'+enddateFormat+'<em class="del_time"></em><input type="hidden" name="limit_time['+tlen+'][start]"  value="'+event.valueText+'" /><input type="hidden" name="limit_time['+tlen+'][stop]"  value="'+enddateFormat+'" /></span>')
		if($(".time_list .chose_inp").size()==6){
			$(".time_list .add_btn").hide()
		}else{
			$(".time_list .add_btn").show()
		}
		updateOpentime()
	}
});

$(".add_btn").click(function(){
	$("#stime").click();
})

function formatTime(date,type){
	var yy = date.getFullYear();
	var mm = date.getMonth()+1;
	var dd = date.getDate();
	var hh = date.getHours();
	var min = date.getMinutes();
	yy = yy>9?yy:('0'+ yy);
	mm = mm>9?mm:('0'+ mm);
	dd = dd>9?dd:('0'+ dd);
	hh = hh>9?hh:('0'+ hh);
	min = min>9?min:('0'+ min);
	var data ;
	if(type==1){
		data = yy+'-'+mm+'-'+dd
	}else{
		data = hh+':'+min
	}
	return data;
}


  //联系电话
  $('#tel').blur(function(){
      var tel = $('#tel').val();
      $.post('/include/ajax.php?service=business&action=updateStoreConfig&tel='+tel);
  });

  //保存
  $('.fabuBtn').bind('click', function(){
	  var t = $(this);
	  t.addClass('disabled');
	  var data = $("#submitForm").serialize();

     $.ajax({
	  url: '/include/ajax.php?service=business&action=updateStoreConfig',
	  type: 'get',
	  dataType: 'json',
	  data:data,
	  success: function(data){
		if(data && data.state == 100){
			showErrAlert(data.info)
			 t.addClass('disabled');
		}else{
		  t.removeClass('disabled');
		  alert(data.info);
		}
	  },
	  error: function(){
		t.removeClass('disabled');
		alert(langData['siteConfig'][44][23]);//网络错误，请重试
	  }
	})

    // alert('保存成功！');
  });

  // $('#circle_choose').on('dropdown', function(){
  //   $.ajax({
  //     url: masterDomain + '/include/ajax.php?service=siteConfig&action=getCircle&cid='+detail.cityid+'&qid='+detail.addrid,
  //     type: 'get',
  //     dataType: 'jsonp',
  //     success: function(data){

  //     }
  //   })
  // })


  // 选择标签
  $(".p-tags span").click(function(){
    var t = $(this), p = t.parent();
    if(p.attr("data-once") == "1"){
      t.addClass("active").siblings().removeClass("active");
    }else if(!p.hasClass('shopTags')){
      t.toggleClass("active");
    }

    // 商圈
    if(p.hasClass('circleTags')){
      var data = [];
      p.children('span').each(function(){
        var d = $(this), id = d.attr('data-id');
        if(d.hasClass('active')){
          data.push(id);
        }
      })
      $.post('/include/ajax.php?service=business&action=updateStoreConfig&circle='+data.join(','));
    // 特色标签
    }else if(p.hasClass('serverTags')){
      var data = [];
      p.children('span').each(function(){
        var d = $(this), txt = d.children('em').text();
        if(d.hasClass('active')){
          data.push(txt);
        }
      })
      $.post('/include/ajax.php?service=business&action=updateStoreConfig&tag='+data.join('|'));
    }
  })

  // 新增店铺标签
  // $('#addTag').click(function(){
  //   if($('.addinp').val() != ''){
  //     saveTag(1);
  //   }else{
  //     $('.addinp').show().focus();
  //   }
  // })

  // $(".addinp").on("input keyup",function(e){
  //   if(e.keyCode == 13){
  //     saveTag(1);
  //   }
  // })
  // $(".addinp").blur(function(e){
  //    saveTag(1);
  // })
  // $(".addinp").on("input propertychange",function(){
  //   saveTag();
  // })
  // $('.shopTags').delegate('.rm', 'click', function(){
  //   $(this).parent().remove();
  //   updateStoreTag();
  // })
  // function saveTag(enter){
  //   var t = $('.addinp'), val = t.val(), res = '';
  //   if(val != ''){
  //     val = val.replace(/^\s*/,"");
  //     val = val.replace(/,/g,"");
  //     t.val(val);
  //     if(val.indexOf(' ') > 0){
  //       res = val.split(' ')[0];
  //     }else if(enter){
  //       res = val;
  //     }
  //     if(res != ''){
  //       $('.addinp').hide().val('').before('<span class="tag active"><em>'+res+'</em><i class="rm">×</i></span>');
  //       if(enter){
  //         $('#addTag').click();
  //       }
  //       updateStoreTag();
  //     }
  //   }
  // }


  // 上传LOGO
  var upPhoto = new Upload({
    btn: '#up_logo',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 1,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){

    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        var dt = $('#up_logo').closest("dl").children("dt");
        var img = dt.children('img');
        if(img.length){
          var old = img.attr('data-url');
          upPhoto.del(old);
        }
        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><i class="del_btn"></i>').removeClass('fn-hide');
		dt.siblings('dd').addClass('fn-hide')
        $("#logo").val(response.url)

        $.post('/include/ajax.php?service=business&action=updateStoreConfig&logo='+response.url);
      }
    },
    showErr: function(info){
      showErr(info);
    }
  });
  // 上传微信二维码
  var upWeixin = new Upload({
    btn: '#up_wechatqr',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 1,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){

    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        var dt = $('#up_wechatqr').closest("dl").children("dt");
        var img = dt.children('img');
        if(img.length){
          var old = img.attr('data-url');
          upPhoto.del(old);
        }
        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><i class="del_btn"></i>').removeClass('fn-hide');
		dt.siblings('dd').addClass('fn-hide')
        $("#wechatqr").val(response.url);

        $.post('/include/ajax.php?service=business&action=updateStoreConfig&wechatqr='+response.url);
      }
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  })

  // 删除二维码或logo
  $(".logoshow").delegate('.del_btn','click',function(){
	  var t = $(this);
	  var val = t.siblings('img').attr('data-url');
	  t.closest('.logoshow').addClass('fn-hide').find('img').remove();
	  t.closest('dl').find('dd').removeClass('fn-hide')
	  if(t.closest('.logoshow').hasClass('qrbox')){
		  upWeixin.del(val);
	  }else{
		  upPhoto.del(val);
	  }
  })



  // 上传店铺幻灯
  var upslideShow = new Upload({
    btn: '#up_slideShow',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 5,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){
      $("#up_slideShow").parent().append('<li id="'+file.id+'"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

      updateBanner();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#slideShow_choose .slideshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upslideShow.del(val);
	$("#up_videoShow").removeClass('fn-hide');

    t.parent().remove();
    updateBanner();
  })
  function updateBanner(){
    var banner = [];
    $("#slideShow_choose li").each(function(i){
      if(i > 0){
        var src = $(this).children('img').attr('data-url');
        banner.push(src);
      }
    })
    $.post('/include/ajax.php?service=business&action=updateStoreConfig&banner='+banner.join(','));
  }

  // 上传店铺幻灯
  var upqualityShow = new Upload({
    btn: '#up_qualityShow',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=certificate',
    atlasMax: 10,
    deltype: 'delcertificate',
    replace: true,
    fileQueued: function(file){
      $("#up_qualityShow").parent().append('<li id="'+file.id+'"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

      updateQuality();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#qualityShow_choose .slideshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqualityShow.del(val);
    t.parent().remove();
    updateQuality();
  })
  function updateQuality(){
    var qualityArr = [];
    $("#qualityShow_choose li").each(function(i){
      if(i > 0){
        var src = $(this).children('img').attr('data-url');
        qualityArr.push(src);
      }
    })
    $.post('/include/ajax.php?service=business&action=updateStoreConfig&quality='+qualityArr.join(','));
  }


  // 上传店铺视频
  var upvideoShow = new Upload({
    btn: '#up_videoShow',
    bindBtn: '',
    title: 'Video',
    mod: 'business',
    params: 'type=thumb&filetype=video',
    atlasMax: 1,
    deltype: 'delVideo',
    replace: true,
    fileQueued: function(file){
      var has = $("#up_videoShow").next();
      // if(has.length){
      //   has.find('.close').click();
      //   has.remove();
      // }
      $("#up_videoShow").addClass('fn-hide').after('<li id="'+file.id+'"  class="vid"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<video src="'+response.turl+'" data-url="'+response.url+'" /><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + langData['siteConfig'][44][20].replace('1',''));//1个视频上传失败
      }

      updateVideo();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('.videoshow.video').delegate('.close', 'click', function(){
	  if($(this).closest('li').hasClass('vid')){
		  console.log(2)
		var t = $(this), val = t.siblings('video').attr('data-url');
		upvideoShow.del(val);
		t.parent().remove();
		$("#up_videoShow").removeClass('fn-hide')
		updateVideo();
	  }else if($(this).closest('li').hasClass('vpic')){
		  console.log(3)
		  var t = $(this), val = t.siblings('img').attr('data-url');
		  $("#up_videoPicShow").removeClass('fn-hide');
		  upvideopicShow.del(val);
		  t.parent().remove();
	  }
  })
  function updateVideo(){
    var video = [];
    $("#videoShow_choose .video li.vid").each(function(i){
      // if(i == 1){
        var src = $(this).children('video').attr('data-url');
        video.push(src);
      // }
    })
    $.post('/include/ajax.php?service=business&action=updateStoreConfig&video='+video.join(','));
  }
  // 视频封面
  var upvideopicShow = new Upload({
    btn: '#up_videoPicShow',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 1,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file, activeBtn){
      var has = $("#up_videoPicShow").next();
      if(has.length){
        has.find('.close').click();
        has.remove();
      }
      $("#up_videoPicShow").addClass('fn-hide').after('<li id="'+file.id+'" class="vpic"><a href="javascript:;" class="close"></a></li>');
    },
    uploadSuccess: function(file, response, btn){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" /><a href="javascript:;" class="close"></a>');
        $.post('/include/ajax.php?service=business&action=updateStoreConfig&video_pic='+response.url);
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        // showErr((this.totalCount - this.sucCount) + '张图片上传失败');
      }

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
 //  $('.videoshow').delegate('.vpic .close', 'click', function(){
	//   console.log('111')
 //    var t = $(this), val = t.siblings('img').attr('data-url');
	// $("#up_videoPicShow").removeClass('fn-hide');
 //    upvideopicShow.del(val);
 //    t.parent().remove();
 //  })

  // 上传全景图片
  var upqjShow = new Upload({
    btn: '#up_qj',
    bindBtn: '#qjshow_box .addbtn_more',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 6,
    deltype: 'delAtlas',
    replace: false,
    fileQueued: function(file, activeBtn){
      var btn = activeBtn ? activeBtn : $("#up_qj");
      var p = btn.parent(), index = p.index();
      console.log(file)
      $("#qjshow_box li").each(function(i){
        if(i >= index){
          var li = $(this), t = li.children('.addbtn'), img = li.children('.img');
          if(img.length == 0){
            t.after('<div class="img" id="'+file.id+'"><a href="javascript:;" class="close">×</a></div>');
            return false;
          }
        }
      })
    },
    uploadSuccess: function(file, response, btn){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" /><a href="javascript:;" class="close">×</a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

      updateQj();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('.qjshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqjShow.del(val);
    t.parent().remove();
    updateQj('del');
  })

  $('#qj_file').blur(function(){
    updateQj();
  })

  function updateQj(){
    var qj_type = $('[name=qj_type]:checked').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#qjShow_choose li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }else{
          qj_file.push('');
        }
      })
    }else{
      qj_file.push($('#qj_file').val());
    }
    $.post('/include/ajax.php?service=business&action=updateStoreConfig&qj_type='+qj_type+'&qj_file='+qj_file.join(','));
  }

  // 切换全景类型
  $(".tab-nav label").click(function(){
    var t = $(this), index = t.index(), box = t.parent().next('.tab-body');
    box.children('div').eq(index).fadeIn(100).siblings().hide();
  })
  //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('dl').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">'+langData['business'][5][125]+'</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'！</div>');
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



	// 进入配置也
	$(".changeInfo").click(function(){
		$('.page_config').addClass('fn-hide');
		$('.page_shopdetail').removeClass('fn-hide')
	});
})

// 错误提示
function showErr(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
