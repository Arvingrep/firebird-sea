// 上传店铺视频

//错误提示
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
var upvideoShow = new Upload({
	
    btn: '#up_videoShow',
    bindBtn: '',
    title: 'Video',
    mod: 'house',
    msg_maxImg: langData['siteConfig'][45][67],//视频数量已达上限
    params: 'type=thumb&filetype=video',
    atlasMax: 1,
    deltype: 'delVideo',
    replace: false,
    fileQueued: function(file){
      var has = $("#up_videoShow").siblings('li');
      
      $("#up_videoShow").before('<li class="video_li" id="'+file.id+'"></li>');
    	$("#up_videoShow").hide();
    },
    uploadSuccess: function(file, response){
    	
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<div class="img_show"><video controls="controls" src="'+response.turl+'" data-url="'+response.url+'" /></div><i class="del_btn">+</i>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
//         showErr('所有图片上传成功');
      }else{
        showErr(langData['siteConfig'][44][20].replace('1',(this.totalCount - this.sucCount)));//1个视频上传失败
      }
      
      updateVideo();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
});


$('.videoshow.video').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('video').attr('data-url');
    upvideoShow.del(val);
    t.parent().remove();
    updateVideo();
    if($('.videoshow li').length==1){
    	$("#up_videoShow").show();
    }
})
function updateVideo(){
    var video = [];
    $("#videoShow_choose .video li").each(function(i){
      if(i == 1){
        var src = $(this).children('video').attr('data-url');
        video.push(src);
      }
    })
    $('#video').val(video.join(","));
}

 // 上传全景图片
  var upqjShow = new Upload({
    btn: '#up_qj',
    bindBtn: '#qjshow_box .addbtn_more',
    title: 'Images',
    mod: 'house',
    params: 'type=atlas',
    atlasMax: 6,
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
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" />');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr(langData['siteConfig'][44][19].replace('1',(this.totalCount - this.sucCount)));//1张图片上传失败
      }
      
      updateQj();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErr(info);
    }
  });
  $('#qjshow_box').delegate('.del_btn', 'click', function(){
    var t = $(this), val = t.siblings('img').attr('data-url');
    upqjShow.del(val);
    t.siblings('.img').remove();
    t.remove();
    updateQj('del');
  })
  function updateQj(){
    var qj_type = $('#qj_type').val();
    var qj_file = [];
    if(qj_type == 0){
      $("#qjshow_box li").each(function(i){
        var img = $(this).find('img');
        if(img.length){
          var src = img.attr('data-url');
          qj_file.push(src);
        }
      })
      $('#qj_pics').val(qj_file.join(','));
      $('#qj_url').val('');
    }else{
      $('#qj_pics').val('');
    }
  }