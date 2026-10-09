$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');


    // 计算距离
   function  mapDistance(lat_a,lng_a,lat_b,lng_b){
     var pk = 180 / 3.14169;
     var a1 = lat_a / pk;
     var a2 = lng_a / pk;
     var b1 = lat_b / pk;
     var b2 = lng_b / pk;
     var t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
     var t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
     var t3 = Math.sin(a1) * Math.sin(b1);
     var tt = Math.acos(t1 + t2 + t3);


     var km = 6366000 * tt / 1000;
     if(km<1){
       km = (km*1000).toFixed(0)+'m'
     }else{
       km = km.toFixed(1)+'km';
     }
     return km;

  }


    //获取当前位置
    var oldlng,oldlat;
    HN_Location.init(function(data){
      if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
        showErrAlert(''+langData['siteConfig'][27][137]+'')   /* 定位失败，请重新刷新页面！ */
        init.createMap();
      }else{
        oldlng = data.lng;
        oldlat = data.lat;
         //开始执行绘制 此处设置time 是因为 要等位置定位好 再绘制
        
        init.createMap();
      }
    }, device.indexOf('huoniao') > -1 ? false : true);


  var mask = $('.mask'), moreFilter = [],adrlowerdata = [];
  var map, list = $(".list");
  var sp_ajax, pagetoken = '',ssflag = false;
  markersArr = [];
  // var windowHeight = $(window).height(), headHeight = $('.header').height(), mapHeight = windowHeight - headHeight;
  // $('#map').height(mapHeight);
  // var panHeight = mapHeight/2
  // var panWidth = $('#map').width()/2
  	var init = {

  		//替换模板关键字
  		replaceTpl: function(template, data, allowEmpty, chats){
  			var regExp;
  			chats = chats || ['\\$\\{', '\\}'];
  			regExp = [chats[0], '([_\\w]+[\\w\\d_]?)', chats[1]].join('');
  			regExp = new RegExp(regExp, 'g');
  			return template.replace(regExp,	function (s, s1) {
  				if (data[s1] != null && data[s1] != undefined) {
  					return data[s1];
  				} else {
  					return allowEmpty ? '' : s;
  				}
  			});
  		},

  		//创建地图
  		createMap: function(){
        if(site_map == 'amap'){

          var toolBar,MGeocoder,mar;
          //初始化地图对象，加载地图
          map = new AMap.Map("map",{    
            zoom:15,//级别
          });
          
          if(oldlng && oldlat){
            var position = new AMap.LngLat(oldlng, oldlat);  // 标准写法
            map.setZoomAndCenter(11, position);
          }else{
            var position = new AMap.LngLat(siteCity.lng, siteCity.lat);  // 标准写法
            map.setZoomAndCenter(11, position);
          }
          point = (oldlng && oldlat) ? [oldlng , oldlat] : [siteCity.lng, siteCity.lat]
          marker = new AMap.Marker({
              icon: new AMap.Icon({            
                image: templets+"/images/map/circle.png?v=1",
                size: new AMap.Size(50, 50),  //图标大小
                imageSize: new AMap.Size(25,25)
            }) ,
              position: point
          });
          marker.setMap(map);
          AMap.event.addListener(map, "tilesloaded", init.tilesloaded()); //地图加载完毕执行
        }
  		}

  		//地图加载完毕 /自定义缩放/收起/展开侧栏
  		,tilesloaded: function(){
        // map.removeListener( "tilesloaded", init.tilesloaded);

  			//初始加载
  			init.getStoreData("tilesloaded");


        AMap.event.addListener(map,"zoomend", function() {
  				init.updateOverlays("zoom");
  			});
  			// map.addEventListener("moveend", function(e) {
  			// 	init.updateOverlays("drag");
     //      console.log(333)
  			// });
        AMap.event.addListener(map,"dragend", function (e) {
            init.updateOverlays("drag");
            if($('.zoom-local').hasClass('active')){
              $('.zoom-local').removeClass('active')
            }



        });

        //获取区域数据
        var addrInfo=[];
        function getAddrList(param, callback){
            $.ajax({
              url: "/include/ajax.php?" + param,
              type: "GET",
              dataType: "jsonp",
              success: function (data) {
                if(data.state == 100){

                  var addrData = data.info;
                   addrData.unshift({
                    id:'0',
                    typename: '不限',
                    latitude:  oldlat,
                    longitude: oldlng,
                    lowerarr:''
                  })
                  for(var j = 0;j< addrData.length;j++){
                    var childArr = addrData[j].lowerarr;
                    var parID = addrData[j].id;
                    var parLng = addrData[j].longitude;
                    var parLat = addrData[j].latitude;
                    if(childArr){
                      childArr.unshift({
                        id:parID,
                        typename: '不限',
                        latitude:  parLat,
                        longitude: parLng
                      })
                    }
                   }

                  callback(addrData);
                  addrInfo=addrData;
                }
              },
              error: function(){
              }
            });
        }


        // 区域一级
        getAddrList('service=siteConfig&action=addr&type='+cityId+'&addtype=1', function(data){
          var adrhtml=[];
          for(var i = 0; i < data.length; i++){
            var adr = data[i];
            adrhtml.push('<li><a href="javascript:;" data-id="'+adr.id+'" data-lng="'+adr.longitude+'" data-lat="'+adr.latitude+'">'+adr.typename+'</a></li>')
          }
          $('.quyuAlert .chooseLeft ul').html(adrhtml.join(''));
        });

        //区域展开
        $('.comfilter .quyu').click(function(){
            $('.comfilter .shaixuan').removeClass('curr');
            if(!$(this).hasClass('curr')){
                $(this).addClass('curr').siblings('a').removeClass('curr');
                $('html').addClass('noscroll');
                $('.mask').show();
                $('.filterBot').addClass('show');
                $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
                $('.filterBot .quyuAlert').addClass('show');
            }else{
                $(this).removeClass('curr');
                $('html').removeClass('noscroll')
                $('.mask').hide();
                $('.filterBot').removeClass('show');
                $('.filterBot .quyuAlert').removeClass('show');
            }

        })
        // 二级地域切换
        $('.quyuAlert .chooseLeft').delegate('a','click',function(){
            var par = $(this).closest('li');
            par.addClass('curr').siblings('li').removeClass('curr');
            var i = $(this).index();
            var id = $(this).attr('data-id'), typename = $(this).text();

            if(id == 0){//不限 没有二级
              $('.comfilter.comshow .quyu span').text(typename);
              $('.comfilter.comshow .quyu').attr('data-id',id);
              $('.quyuAlert').removeClass('active');
              $(".quyuAlert .chooseRight ul").html('');

              init.hideFilter();
              init.getStoreData('change');
              $('.zoom-local').removeClass('active');
              var onelng = $(this).attr('data-lng'),onelat = $(this).attr('data-lat');
              if(onelng&&onelat){
                map.setZoomAndCenter(new AMap.LngLat(onelng, onelat), 13)
              }else{
                map.setZoomAndCenter(g_conf.cityName, 13);
              }

            }else{//有二级
              $('.quyuAlert').addClass('active');
              var subLower = []
              for(var i = 0;i< addrInfo.length;i++){
                if(id == addrInfo[i].id){
                  subLower = addrInfo[i];
                }
              }
              var subhtml = [];
              if(subLower.lowerarr != ''){
                for(var j = 0;j< subLower.lowerarr.length;j++){
                  var low = subLower.lowerarr[j];
                  var nametxt = j == 0?subLower.typename:low.typename;
                  subhtml.push('<li><a href="javascript:;" data-id="'+low.id+'"  data-lng="'+low.longitude+'" data-lat="'+low.latitude+'" data-name="'+nametxt+'">'+low.typename+'</a></li>');
                }
              }else{
                subhtml.push('<li class="all"><a href="javascript:;" data-id="'+id+'" data-lng="'+subLower.longitude+'" data-lat="'+subLower.latitude+'" data-name="'+subLower.typename+'">不限</a></li>');
              }
              $(".quyuAlert .chooseRight ul").html(subhtml.join(""));
            }

        });
        //选择二级
        $('.quyuAlert .chooseRight').delegate('a','click',function(){
            var par = $(this).closest('li');
            par.addClass('curr').siblings('li').removeClass('curr');
            var id = $(this).attr('data-id'), typename = $(this).attr('data-name');
            $('.comfilter.comshow .quyu span').text(typename);
            $('.comfilter.comshow .quyu').attr('data-id',id);

            var onelng = $(this).attr('data-lng'),onelat = $(this).attr('data-lat');
            
            if(onelng&&onelat){
              map.setZoomAndCenter(new AMap.LngLat(onelng, onelat), 13)
            }else{
              map.setZoomAndCenter(new AMap.LngLat(g_conf.lng,g_conf.lat), 13);
            }
            init.hideFilter();
            init.getStoreData('change');
            $('.zoom-local').removeClass('active');
            
        });

      //分类--展开
      $('.comfilter .fenlei').click(function(){
          $('.comfilter .shaixuan').removeClass('curr');
          var t= $(this);
          if(!$(this).hasClass('curr')){
              $(this).addClass('curr').siblings('a:not(.special)').removeClass('curr');
              $('html').addClass('noscroll')
              $('.mask').show();
              $('.filterBot').addClass('show');
              $('.filterBot .filerAlert,.filterBot .sxAlert').removeClass('show');
              $('.filterBot .fenleiAlert').addClass('show');

          }else{
              $(this).removeClass('curr');
              $('html').removeClass('noscroll')
              $('.mask').hide();
              $('.filterBot').removeClass('show');
              $('.filterBot .fenleiAlert').removeClass('show');
          }


      })

      // 二级分类切换
      $('.fenleiAlert .chooseLeft a').click(function(){
          var par = $(this).closest('li');
          par.addClass('curr').siblings('li').removeClass('curr');
          var i = $(this).index();
          var id = $(this).attr('data-id'), typename = $(this).text();
          var lower = $(this).attr('data-lower');
          if(lower == 0){
              $('.comfilter.comshow .fenlei span').text(typename);
              $('.comfilter.comshow .fenlei').attr('data-id',id);
              $('.fenleiAlert').removeClass('active');
              $(".fenleiAlert .chooseRight ul").html('');

              init.hideFilter();
              init.getStoreData('change');

          }else{
              $('.fenleiAlert').addClass('active');
              $.ajax({
                  url: "/include/ajax.php?service=shop&action=type&type="+id,
                  type: "GET",
                  dataType: "jsonp",
                  success: function (data) {
                      if(data && data.state == 100){
                          var html = [], list = data.info;
                          html.push('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                          for (var i = 0; i < list.length; i++) {
                              html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
                          }
                          $(".fenleiAlert .chooseRight ul").html(html.join(""));
                      }else if(data.state == 102){
                          $(".fenleiAlert .chooseRight ul").html('<li class="all"><a href="javascript:;" data-id="'+id+'">全部'+typename+'</a></li>');
                      }else{
                          $(".fenleiAlert .chooseRight ul").html('<li class="load">'+data.info+'</li>');
                      }
                  },
                  error: function(){
                      $(".fenleiAlert .chooseRight ul").html('<li class="load">'+langData['info'][1][29]+'</li>');
                  }
              });
          }


      });

      //选择分类
      $('.fenleiAlert .chooseRight').delegate('a','click',function(){
          var par = $(this).closest('li');
          par.addClass('curr').siblings('li').removeClass('curr');
          var id = $(this).attr('data-id'), typename = $(this).text();
          $('.comfilter.comshow .fenlei span').text(typename);
          $('.comfilter.comshow .fenlei').attr('data-id',id);

          init.hideFilter();
          init.getStoreData('change');
      });

      //筛选
      $('.comfilter .shaixuan').click(function(){
          var t= $(this);
          var par = t.closest('.comfilter');
          var parIndex = par.index();
          if(!$(this).hasClass('curr')){
              $('.comfilter a').removeClass('curr');
              $(this).addClass('curr');
              $('html').addClass('noscroll')
              $('.mask').show();
              $('.filterBot').addClass('show');
              $('.filterBot .filerAlert').removeClass('show');
              $('.filterBot .sxAlert').addClass('show');

          }else{
              $(this).removeClass('curr');
              $('html').removeClass('noscroll')
              $('.mask').hide();
              $('.filterBot').removeClass('show');
              $('.filterBot .sxAlert').removeClass('show');
          }
      })

      //筛选框
      $('.sxTop a').click(function(){
        var dl = $(this).closest('dl')
        if(dl.attr('data-chose') == 'opentime'){
          $(this).toggleClass('active').siblings().removeClass('active');
        }else{
          $(this).toggleClass('active');
        }
          
      })

      //筛选--确定
      $('.sxAlert .sure').click(function(){
          var par = $(this).closest('.sxAlert');
          var comdl = par.find('.sxTop .comdl');
          var paramStrArr = []
          var ttidArr = [];
          var openTime = []
          $(".sxTop dd a.active").each(function(){
            var dl = $(this).closest('dl');
            if(dl.attr('data-chose') == 'opentime'){
              paramStrArr.push('opentime='+$(this).attr('data-id'))
            }else{
              ttidArr.push($(this).attr('data-id'))
            }
          })
          if(ttidArr.length > 0){
            paramStrArr.push("discount="+ttidArr.join(','))
          }
          init.hideFilter();
          $('.shaixuan').attr('data-id',paramStrArr.join('&'))
           init.getStoreData('change');
      })
      //筛选--重置
      $('.sxAlert .reset').click(function(){
          var par = $(this).closest('.sxAlert');
          var comdl = par.find('.sxTop .comdl');
          comdl.find('a').removeClass('active');
      })

      var typing = false;
      $('#keywords').on('compositionstart',function(){
          typing = true;
      })
      $('#keywords').on('compositionend',function(){
          typing = false;
      })
      //打完字去搜索结果 列表show  如果是提交的话 列表hide
      $('#keywords').on('keyup',function(e){
        if(!typing && e.keyCode!=13){
          init.getStoreData('change');
        }
        if(e.keyCode==13){
          $('.searchResult').hide();
          return false;
        }
      })

      $('.form_search').submit(function(){
        return false;
      })


        // 点击遮罩层
        $('.mask').on('touchstart',function(){
      		init.hideFilter();
      	})

        //显示区域结果
        $('.showresult').click(function(){
          if($("#resQuyu").text() == 0) return false;
          $(this).removeClass('reshow');
          $('.storeList .showmore p').attr('data-total',adrlowerdata.length);
          $('.total').text(adrlowerdata.length);
          init.getList(adrlowerdata);
          data = init.getVisarea(g_conf.storeData);
          init.createBubble(data, bubbleTemplate[1], 1);

        })


  		}
      //关闭筛选
      ,hideFilter: function(sr){
        $('html').removeClass('noscroll')
        $('.mask').hide();
        if(!sr){
            $('.comfilter a:not(.special)').removeClass('curr');
        }
        $('.comfilter .shaixuan').removeClass('curr');
        $('.filerAlert').removeClass('show');
        $('.filterBot').removeClass('show');
      }
  		//获取区域及楼盘信息
  		,getStoreData: function(type){
  			var data = [];
        var keywords = $('#keywords').val();
        data.push('title='+keywords);

        var addrid = $('.comfilter .quyu').attr('data-id');
        data.push('addrid='+addrid);

        var industry = $('.comfilter .fenlei').attr('data-id');
        data.push('industry='+industry);

        var moreid = $('.comfilter .shaixuan').attr('data-id');
        data.push(moreid);

  			$.ajax({
  				url: "/include/ajax.php?service=siteConfig&action=store_map&moduletype=shop",
  				data: data.join('&'),
  				dataType: "jsonp",
  				async: false,
  				success: function(data){

  					var storeData = [];
  					if(data && data.state == 100){
              var html = [];
  						var list = data.info.list;
              adrlowerdata = list;
              var sfHtml = [];
  						for(var i = 0; i < list.length; i++){
  							storeData[i] = {};
  							storeData[i]['store_id'] = list[i].id;
  							storeData[i]['logo'] = list[i].logo;
  							storeData[i]['store_name'] = list[i].title;
                storeData[i]['store_url'] = list[i].url;
  							storeData[i]['longitude'] = list[i].lng;
  							storeData[i]['latitude'] = list[i].lat;
  							storeData[i]['lng'] = list[i].lng;
  							storeData[i]['lat'] = list[i].lat;
                storeData[i]['typeModule'] = list[i].moduletype;
                storeData[i]['address'] = list[i].address;
                storeData[i]['collectnum'] = list[i].collectnum;
                storeData[i]['disresult'] = list[i].disresult;
                storeData[i]['feiresult'] = list[i].feiresult;
                // storeData.push({
                //   store_id:list[i].id,
                //   store_name:list[i].title,
                //   store_url:list[i].url,
                //   longitude:list[i].lng,
                //   latitude:list[i].lat,
                //   typeModule:list[i].moduletype,
                //   store_address:list[i].address,
                // })
                  sfHtml.push('<div class="item"><a href="'+list[i].url+'">');
                  sfHtml.push('  <span class="adrIcon"></span>');
                  sfHtml.push('  <div class="adrInfo">');
                  sfHtml.push('    <div class="adrtitle">');
                  var stitle = list[i].title.split(keywords);
                  if(list[i].title.indexOf(keywords) > -1){
                    sfHtml.push('      <h2>'+stitle[0]+'<strong>'+keywords+'</strong>'+(stitle.length > 1 ? stitle[1] : "")+'</h2>');
                   
                  }else{
                    sfHtml.push('      <h2>'+list[i].title+'</h2>');
                  }
                  
                  sfHtml.push('      <span>'+mapDistance(oldlat,oldlng,list[i].lat,list[i].lng)+'</span>');
                  sfHtml.push('    </div>');
                  if(list[i].address.indexOf(keywords) > -1){
                    sfHtml.push('    <p class="adress">'+(list[i].address.split(keywords).join('<b style="color:#EC3628;">'+keywords+'</b>'))+'</p>');
                  }else{
                    sfHtml.push('    <p class="adress">'+list[i].address+'</p>');
                  }
                  

                  sfHtml.push('  </div>');
                  sfHtml.push('</a></div>');


  						}
              //搜索结果填充
              if(keywords !=""){
                if(list.length > 0){
                  $('.allresult strong').text(keywords);
                  $('.allresult em').text(list.length);
                  $('.searchResult .resultList').html(sfHtml.join(''));
                  $('.searchResult').show();
                  //按照第一条搜索到的结果定位
                  var selng = list[0].lng,selat = list[0].lat;
                  map.setZoomAndCenter(new AMap.LngLat(selng, selat), 13);
                }else{//若没有搜索到相关店铺 则按地点查询定位
                  $('.searchResult').hide();
                  init.getSearch_posi();
                }
              }else{
                $('.searchResult').hide();
              }



              //底部商家列表填充
              if(type == 'tilesloaded'){//刚进页面时  初始加载



              }else{//有筛选条件
                $('.showresult').addClass('reshow');
                $('#resQuyu').text(list.length);
                $('.showresult').attr('data-type','change')
              }
              $('.storeList .showmore p').attr('data-total',list.length);
              $('.total').text(list.length);
              init.getList(list);

  					}

  					g_conf.storeData = storeData;
  					init.doNext(type);

  				}
  			});

  		}
      //商家列表
      ,getList:function(stdata){
        console.log(stdata)
        var list = stdata,html=[];
        if(list.length > 0){
          $('.storeWrap').show();
          for(var i = 0; i < list.length; i++){
            var pic = list[i].logo == false || list[i].logo == '' ? '/static/images/404.jpg' : list[i].logo;
            var sstype = $('.showresult').attr('data-type');
            var url = sstype == 'drag'?list[i].store_url:list[i].url;
            var title = sstype == 'drag'?list[i].store_name:list[i].title;
            var cla = i>1?'fn-hide speli':'';
            html.push('<li class="'+cla+'">');
            html.push(' <a href="'+url+'">');
            html.push('<div class="storeImg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
            html.push(' <div class="busInfo">');

            var tuantxt = i==0?'<em>团</em>':'';

            html.push('   <h2><span>'+title+'</span>'+tuantxt+'</h2>');
            html.push('   <div class="starbox">');
            html.push('     <div>');
            html.push('       <span class="haoping"><i></i><span>'+(list[i].score1?(list[i].score1 * 1).toFixed(1):"5.0")+'</span></span>')

            if(list[i].feiresult > 30){//消费人多大于30时
              html.push('     <span class="infospan">最近'+list[i].feiresult+'人消费</span>  ');
            }else if(list[i].collectnum > 300){//关注人数大于300
              html.push('     <span class="infospan">'+list[i].collectnum+'人关注</span>  ');
            }else{
              if(list[i].disresult > 0){
                html.push('       <s></s><em>'+list[i].disresult+'条优惠</em>')
              }else if(list[i].feiresult > 0){
                html.push('     <span class="infospan">最近'+list[i].feiresult+'人消费</span>  ');
              }else if(list[i].collectnum > 0){
                html.push('     <span class="infospan">'+list[i].collectnum+'人关注</span>  ');
              }
              
            }

            html.push('     </div>')
            html.push('   </div>');
            html.push('   <div class="addressInfo">');
            html.push('       <i></i>');
            html.push('       <span>'+list[i].address+'</span>');
            html.push('       <em class="juli">'+mapDistance(oldlat,oldlng,list[i].lat,list[i].lng)+'</em>');
            html.push('   </div>');
            html.push(' </div>');
            html.push('</a></li>');

          }
          $('.storeList ul').html(html.join(""));
        }else{
          $('.storeWrap').hide();
        }



      }
      //114搜索查询
      ,getSearch_posi:function(){
        if(sp_ajax){
          sp_ajax.abort();
        };
        var directory = $('#keywords').val();
        sp_ajax = $.ajax({
          url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=2&page=1&lng='+oldlng+'&lat='+oldlat+'&directory='+directory+'&radius=9999',
          dataType: 'jsonp',
          success: function(data){

            if(data.state == 100){
              pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
              var list = data.info.list;
              if(list.length > 0){
                //按照第一条搜索到的结果定位
                var selng = list[0].lng,selat = list[0].lat;
                map.setZoomAndCenter(new AMap.LngLat(selng, selat), 13);

              }else{
                if(directory !="")
                showErrAlert('未找到相关位置');
                //没搜到结果 则回到定位的位置
                map.setZoomAndCenter(new AMap.LngLat(oldlng, oldlat), 13);
              }

            }else{
              if(directory !="")
              showErrAlert('未找到相关位置');
              //没搜到结果 则回到定位的位置
              map.setZoomAndCenter(new AMap.LngLat(oldlng, oldlat), 13);
            }
          },
          error: function(){
            if(directory !="")
            showErrAlert('未找到相关位置');
            //没搜到结果 则回到定位的位置
            map.setZoomAndCenter(new AMap.LngLat(oldlng, oldlat), 13);
          }
        });
      }


  		//加载完成执行下一步
  		,doNext: function(type){
  			if(g_conf.storeData){
  				init.updateOverlays(type);

  			}
  		}

  		//更新地图状态
  		,updateOverlays: function(type){

  			

  			var zoom = map.getZoom(), data = [];

  			//区域集合
        var zoomDiff = zoom - g_conf.minZoom;//当前zoom 和规定的zoom 来判断放大缩小
  			if(zoomDiff >= 2){
  				data = init.getVisarea(g_conf.storeData);
  				init.createBubble(data, bubbleTemplate[1], 1);

  			}else{//只显示商家图标
					data = init.getVisarea(g_conf.storeData);
					init.createBubble(data, bubbleTemplate[2], 2);
  			}
        if(type == "change" || type == "drag"){
          data = init.getVisarea(g_conf.storeData);
          init.createBubble(data, bubbleTemplate[2], 2);
          if(type == "drag"){
            $('.showresult').attr('data-type','drag');
            $('.showresult').addClass('reshow');
            $('#resQuyu').text(data.length);
            adrlowerdata = data;
          }
        }else{
          data = init.getVisarea(g_conf.storeData);
          init.createBubble(data, bubbleTemplate[1], 1);
        }
        if(type == "tilesloaded"){

          if(oldlng&&oldlat){//定位成功 绘制当前位置
            var position = new AMap.LngLat(oldlng, oldlat);  // 标准写法
            map.setZoomAndCenter(position, 11);
          }else{//定位失败时就画苏州市
            var position = new AMap.LngLat(siteCity.lng, siteCity.lat);  // 标准写法
            map.setZoomAndCenter(position, 11);
          }
  			}


  		}


  		//获取地图可视区域范围
  		,getBounds: function(){
  			var e = map.getBounds(),
  			t = e.getSouthWest(),
  			a = e.getNorthEast();
  			return {
  				min_longitude: t.lng,
  				max_longitude: a.lng,
  				min_latitude: t.lat,
  				max_latitude: a.lat
  			}
  		}


  		//提取可视区域内的数据
  		,getVisarea: function(data){
  			data = data || [];
  			var areaData = [],
  					visBounds = init.getBounds(),
  					n = {
  						min_longitude: parseFloat(visBounds.min_longitude),
  						max_longitude: parseFloat(visBounds.max_longitude),
  						min_latitude: parseFloat(visBounds.min_latitude),
  						max_latitude: parseFloat(visBounds.max_latitude)
  					};

  			$.each(data, function(e, a) {
  				var i = a.length ? a[0] : a,
  				l = parseFloat(i.longitude),
  				r = parseFloat(i.latitude);
  				l <= n.max_longitude && l >= n.min_longitude && r <= n.max_latitude && r >= n.min_latitude && areaData.push(a)
  			});

  			return areaData;
  		}


  		//创建地图气泡
  		,createBubble: function(data, temp, resize){

  			// init.cleanBubble();
  			// $.each(data,	function(e, o) {
  			// 	var bubbleLabel, r = [];

  			// 	bubbleLabel = new BMap.Label(init.replaceTpl(temp, o), {
  			// 		position: new AMap.LngLat(o.longitude, o.latitude),
  			// 		offset: bubbleMapSize[resize]()
  			// 	});

  			// 	bubbleLabel.addEventListener("mouseover", function() {
  			// 		this.setStyle({zIndex: "4"});
  			// 	});

  			// 	bubbleLabel.addEventListener("mouseout", function() {
  			// 		this.setStyle({zIndex: "2"});
  			// 	});

  			// 	bubbleLabel.setStyle(bubbleStyle);
  			// 	map.addOverlay(bubbleLabel);
        //   bubbleLabel.addEventListener("click",init.storeClick);
  			// });


  			// //区域集合时统计数据为楼盘的数量
  			// data = resize == 1 ? init.getVisarea(g_conf.storeData) : data;

        init.cleanBubble();

			$.each(data,	function(e, o) {
				var bubbleLabel, r = [];
        console.log(g_conf)
        $("#map").on("mouseover", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 104;
				})

				$("#map").on("mouseout", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 100;
				})

				bubbleLabel = init.replaceTpl(temp, o);
				marker = new AMap.Marker({
					content: bubbleLabel,
					position: [o.longitude, o.latitude]
				});
				marker.setMap(map);

				markersArr.push(marker);


			});

			//区域集合时统计数据为楼盘的数量
			data = resize == 1 ? init.getVisarea(g_conf.storeData) : data;


  		}
      //点击气泡
      ,storeClick: function(e){
        var tar = e.target.content;
        $('.fake').html(tar)
        var url =$('.fake').find('.bubble').attr('data-url');
        location.href=url;

      }
  		//删除地图气泡
  		,cleanBubble: function(){
  			map.remove(markersArr);
        //创建自定义中心点图标
        // var localPoint = new AMap.LngLat(oldlng, oldlat)
        // var myIcon = new BMap.Icon(templets+"/images/map/circle.png?v=1", new BMap.Size(50,50));
        // var marker2 = new BMap.Marker(localPoint,{icon:myIcon});  // 创建标注
        // map.addOverlay(marker2);              // 将标注添加到地图中
  		}

  	}


  	//气泡偏移
  	var bubbleMapSize = {
  			1 : function() {
  				return new BMap.Size(-20, -20)
  			},
  			2 : function() {
  				return new BMap.Size(-1, 10)
  			},
  			3 : function() {
  				return new BMap.Size(-1, 10)
  			},
  			4 : function() {
  				return new BMap.Size(-9, -9)
  			}
  		}
  		//气泡模板
  		,bubbleTemplate = {

  			//一级 全部只有商家 和标题
  			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${store_id}" data-url="${store_url}"><span class="${typeModule} store-click"></span><p class="name" title="${store_name}">${store_name}</p></div>',


  			//缩小时 只显示图标
  			2 : '<div class="bubble bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${store_id}" data-url="${store_url}"><span class="${typeModule}"><a href="${store_url}"></a></span></div>'

  		}



  		//气泡样式
  		,bubbleStyle = {
  			color: "#fff",
  			borderWidth: "0",
  			padding: "0",
  			zIndex: "2",
  			backgroundColor: "transparent",
  			textAlign: "center",
  			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
  		}
  	g_conf.storeData = [];

   

    // 地图被拖拽之后重新定位
    $('.zoom-local').click(function(){
      if(!$(this).hasClass('active')){
        $(this).addClass('active')
      }
      console.log(oldlng, oldlat);
        var mPoint = new AMap.LngLat(oldlng, oldlat)
        if(oldlng&&oldlat){//定位成功 绘制当前位置
          map.setZoomAndCenter(mPoint, 15);
        }else{//定位失败时就画苏州市
          map.setZoomAndCenter(g_conf.cityName, 15);
        }
        //回到当前位置时显示当前位置所有商家
        var filter = [];
        g_conf.filter = filter;
        init.getStoreData();


    })

    //展示多家店铺
    $('.showmore').click(function(){
      var count = $('.storeList .showmore p').attr('data-total');
      if(!$(this).hasClass('curr')){
        $('.storeList .showmore p').html('收起查看地图');
        $(this).addClass('curr');
        $('.storeList ul li').removeClass('fn-hide');
        $('.zoom-local').hide();
      }else{
        $('.storeList .showmore p').html('展示<span class="total">'+count+'</span>家店铺');
        $(this).removeClass('curr');
        $('.storeList ul li.speli').addClass('fn-hide');
        $('.zoom-local').show();
      }

    })



})
