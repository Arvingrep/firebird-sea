$(function(){
  if (zjuserMealInfo != '') {
    if(confirm(zjuserMealInfo)) {
        location.href = buymealUrl;
    }else{
      history.go(-1);
    }
  }
  // 地图坐标 ------------------------- s
  $("#map .lead p").bind("click", function() {
    $(".pageitem").hide();
  });

  $(".LoTitle .choose").bind("click", function(){
    $(".pageitem").hide();
    $('#map').show();
    var lnglat = $('#lnglat').val();
    var lng = lat = "";
    //第一次进入自动获取当前位置
    if(lnglat == "" && lnglat != ","){

      HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
          alert(langData['siteConfig'][27][136]);//定位失败
        }else{
          lng = data.lng;
          lat = data.lat;
          //定位地图
          if(site_map == "baidu"){
            map = new BMap.Map("mapdiv");
            var mPoint = new BMap.Point(lng, lat);
            map.centerAndZoom(mPoint, 16);
            getLocation(mPoint);

            map.addEventListener("dragend", function(e){
              getLocation(e.point);
            });
          }
        }
      })
    }else{
        var lnglat_ = lnglat.split(',');
        var lng = lnglat_[0];
        var lat = lnglat_[1];
        //定位地图
        if(site_map == "baidu"){
          map = new BMap.Map("mapdiv");
            var mPoint = new BMap.Point(lng, lat);
            map.centerAndZoom(mPoint, 16);
            getLocation(mPoint);

            map.addEventListener("dragend", function(e){
              getLocation(e.point);
            });
        }
    }
  });
  // 地图
  //关键字搜索
  if(site_map == "baidu"){
    var myGeo = new BMap.Geocoder();
    var autocomplete = new BMap.Autocomplete({input: "searchAddr"});
    autocomplete.addEventListener("onconfirm", function(e) {
      var _value = e.item.value;
      myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;

      var options = {
        onSearchComplete: function(results){
          // 判断状态是否正确
          if (local.getStatus() == BMAP_STATUS_SUCCESS){
            var s = [];
            for (var i = 0; i < results.getCurrentNumPois(); i ++){
              if(i == 0){
                var lng = results.getPoi(i).point.lng;
                var lat = results.getPoi(i).point.lat;
                $("#address").val(_value.business);
                $("#lnglat").val(lng+','+lat);
                $(".pageitem").hide();
              }
            }
          }else{
            alert(langData['siteConfig'][20][431]);
          }
        }
      };
      var local = new BMap.LocalSearch(map, options);
      local.search(myValue);

    });

    //周边检索
    function getLocation(point){
      myGeo.getLocation(point, function mCallback(rs){
          var allPois = rs.surroundingPois;
          console.log(rs)
          if(allPois == null || allPois == ""){
              return;
          }
          var list = [];
          for(var i = 0; i < allPois.length; i++){
              list.push('<li data-lng="'+allPois[i].point.lng+'" data-lat="'+allPois[i].point.lat+'"><h5>'+allPois[i].title+'</h5><p>'+allPois[i].address+'</p></li>');
          }
          if(list.length > 0){
            $(".mapresults ul").html(list.join(""));
          }

      }, {
          poiRadius: 5000,  //半径一公里
          numPois: 50
      });
    }
  }

  //点击检索结果
  $(".mapresults").delegate("li", "click", function(){
    var t = $(this), title = t.find("h5").text() ,title1 = t.find("p").text();
    var lng = t.attr("data-lng");
    var lat = t.attr("data-lat");
    $("#address").val(""+title1+""+title+"" );
        $("#lnglat").val(""+lng+","+lat+"" )
        $('.pageitem').hide();
  });

  // 地图坐标 ------------------------- e

  // 视频全景 ------------------------- s
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
  // 切换全景类型
  $(".tab-nav label").click(function(){
    var t = $(this), index = t.index(), box = t.parent().next('.tab-body');
    box.children('div').eq(index).fadeIn(100).siblings().hide();
  })

  // 上传店铺视频
  var upvideoShow = new Upload({
    btn: '#up_videoShow',
    bindBtn: '',
    title: 'Video',
    mod: 'house',
    params: 'type=thumb&filetype=video',
    atlasMax: 1,
    deltype: 'delVideo',
    replace: true,
    fileQueued: function(file){
      var has = $("#up_videoShow").next();
      if(has.length){
        has.find('.close').click();
        has.remove();
      }
      $("#up_videoShow").after('<li id="'+file.id+'"><a href="javascript:;" class="close">×</a></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<video src="'+response.turl+'" data-url="'+response.url+'" /><a href="javascript:;" class="close">×</a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + (langData['siteConfig'][44][20].replace('1','')));//1个视频上传失败
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
    var t = $(this), val = t.siblings('video').attr('data-url');
    upvideoShow.del(val);
    t.parent().remove();
    updateVideo();
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
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 6,
    deltype: 'delAtlas',
    replace: false,
    fileQueued: function(file, activeBtn){
      var btn = activeBtn ? activeBtn : $("#up_qj");
      var p = btn.parent(), index = p.index();
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
        showErr((this.totalCount - this.sucCount) + (langData['siteConfig'][44][19].replace('1','')));//1张图片上传失败
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
  function updateQj(){
    var qj_type = $('[name=qj_type]:checked').val();
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
})