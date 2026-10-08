$(function(){

  var CommunityObj = $('.intell_data');  //地址列表

	 //小区模糊搜索
  $('#house_name').bind("input", function(){
//  $('#house_name').val('0');
    var title = $(this).val();
    $.ajax({
          url: masterDomain + '/include/ajax.php?service=house&action=communityList&allcity=1',
          data: "keywords="+title,
          dataType: "jsonp",
          success: function (data) {
              if(data){
                  var list = data.info.list, addrList = [];
                  if(data.state == 100 && list.length > 0){

                      for (var i = 0, addr, contact; i < list.length; i++) {
                          addr = list[i];
                          addrList.push('<li class="intell_data_li" data-id="'+list[i].id+'" data-cityid="'+list[i].cityid+'"><p><span>'+list[i].title+'</span><a href="javascript:;">'+langData['siteConfig'][44][97]+'</a></p></li>');//附近
                      }
                      CommunityObj.html(addrList.join(""));

                      $('.intell_data').show();
                      $(".chose_house").hide();
                      $('.search_tips').text(langData['siteConfig'][6][209]);//您可以直接选择，智能识别区域与位置

                  }else{
                      if(list && list.length == 0){
                          CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][349]+'</empty>');
                      }else{
                          CommunityObj.html('<div class="empty">'+data.info+'</empty>');
                      }

                      $('.intell_data').hide();
                      $(".chose_house").show();
                      $('.search_tips').text(langData['siteConfig'][44][83])//暂未找到相关小区，如确认选择该小区，可手动录入区域和位置
                  }

              }else{
                  CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][228]+'</empty>');

                    $('.intell_data').hide();
                    $(".community-addr").show();
              }
          },
          error: function(){
              CommunityObj.html('<div class="empty">'+langData['siteConfig'][20][227]+'</empty>');

                $('.intell_data').hide();
                $(".chose_house").show();
          }
      });


  })

  //点击模糊匹配的信息时
  $('.intell_data').delegate('.intell_data_li', 'click', function(){
  	var name2 = $('#house_chosed').val(),str = $('#house_title').val();
    var t = $(this), val = t.find('span').text(), id = t.attr('data-id'), cityid = t.attr('data-cityid');
//  $('.detail_house .tip span').text(val);
    $('#house_name,#house_chosed').attr('data-cityid', cityid);
    $('#house_name,#house_chosed').val(val);
    $('#houseid').val(id);
    $('.page.gz-address').hide().siblings('.page.input_info').show();
    //选择的小区名整合到标题中

    var house_name = val;
		if($('#house_title').val()!=''){
			if(house_name != name2){
				$('#house_title').val(str.replace(name2,house_name)) ;
			}
		}else{
			$('#house_title').val(val);
		}

  });


   $(".search_btn").bind("click", function(){
    var communityTitle = $.trim($('#house_name').val());
		if(communityTitle != ''){
			$.ajax({
				url: "/include/ajax.php?service=house&action=communityList&allcity=1&keywords="+communityTitle,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data.state == 100 && data.info.list.length > 0){
						var list = data.info.list;
						for (var i = 0; i < list.length; i++) {
							if(list[i].title == communityTitle){
								$('#house_chosed').attr('data-cityid', list[i].cityid);
								$('#houseid').val(list[i].id);
							}
						}
					}
				}
			});
		}
  });



});
