//确认订单-地图 2021-9-24
$(function(){

	if($('.busmap').size() > 0){
        //商家坐标
        var sqLng = $('.cart-main .cart-list .shop-name').attr('data-lng'),sqLat = $('.cart-main .cart-list .shop-name').attr('data-lat');

        var qhLng= '',qhLat ='';
        var jFlag = false;
        //页面定位失败时 取默认坐标
        var ulocal = utils.getStorage('user_local');
        HN_Location.init(function(data){

            if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
                //showErrAlert('定位失败，请刷新页面');
                if(ulocal){
                    qhLng = ulocal.lng;
                    qhLat = ulocal.lat;
                    // calcTime(qhLng,qhLat,sqLng,sqLat)
                     GetDistance(qhLng,qhLat,sqLng,sqLat)
                }
            }else{
                //起点
                qhLng = data.lng;
                qhLat = data.lat;
                // calcTime(qhLng,qhLat,sqLng,sqLat)
                GetDistance(qhLng,qhLat,sqLng,sqLat)

            }
        })
        
        

        if(site_map == "baidu"){
            var map = new BMap.Map("busmap");
            var point = new BMap.Point(sqLng,sqLat);
            map.centerAndZoom(point, 15);
            function ComplexCustomOverlay(point,text){
                this._point = point;
                this._text = text;
            }
            ComplexCustomOverlay.prototype = new BMap.Overlay();
            ComplexCustomOverlay.prototype.initialize = function(map){
                this._map = map;
                var div = this._div = document.createElement("div");
                div.className = "newMarker";
                div.style.position = "absolute";
                div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
                div.style.MozUserSelect = "none";
                var span = this._span = document.createElement("span");
                div.appendChild(span);
                span.appendChild(document.createTextNode(this._text))
                map.getPanes().labelPane.appendChild(div);      
                return div;
            }
            ComplexCustomOverlay.prototype.draw = function(){
                var map = this._map;
                var pixel = map.pointToOverlayPixel(this._point);
                this._div.style.left = pixel.x + "px";
                this._div.style.top  = pixel.y + "px";
            }

            var myCompOverlay = new ComplexCustomOverlay(point,'距您0m');
            map.addOverlay(myCompOverlay);
     

        }else if(site_map == "amap"){//高德地图
            var mapObj = new AMap.Map('busmap', {
                center: [sqLng, sqLat],
                zoom: 15,
            });

            addCustomMarker();
            function addCustomMarker(){
                //自定义覆盖物dom 元素
                var m = document.createElement("div");
                m.className = "newMarker";
                var n = document.createElement("span");
                n.innerHTML = "距您0m";
                m.appendChild(n);
                
                var marker1 = new AMap.Marker({
                    map:mapObj,
                    position:new AMap.LngLat(sqLng,sqLat), //基点位置
                    offset:new AMap.Pixel(0,-20), //相对于基点的偏移位置
                    //draggable:true,  //是否可拖动
                    content:m   //自定义覆盖物内容
                });
            
                
            }


        }else if(site_map == 'google'){//谷歌地图
            var centerPoint = new google.maps.LatLng(parseFloat(sqLat), parseFloat(sqLng));

            var map = new google.maps.Map(document.getElementById('busmap'), {
                zoom: 14,
                center: centerPoint,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                }
            });
            marker = new MarkerWithLabel({
                position: centerPoint,
                draggable: true,
                map: map,
                labelAnchor: new google.maps.Point(16, 28),
                labelContent: '<div class="newMarker"><span>距您0m</span></div>',
                icon:'/static/images/blank.gif',
            });
        }

        function calcTime(qhLng,qhLat,sqLng,sqLat) {

            $.ajax({
                "url": "/include/ajax.php?service=waimai&action=getroutetime&originlng="+qhLng+"&originlat="+qhLat+"&destinationlng="+sqLng+"&destinationlat="+sqLat,
                "data": '',
                "dataType": "json",
                "success": function(data){
                    if(data && data.state == 100){
                        var info = data.info;
                        if(info.juli<1 && info.juli>=0){
                           $(".newMarker span").html('距您'+(info.juli*1000)+'m');
                        }else{
                           $(".newMarker span").html('距您'+info.juli.toFixed(2)+'km');
                        }
                        
                      if(!jFlag){
                        jFlag = true;
                      }
                        
                    }
                }
            });
        }


        function GetDistance( lat1,  lng1,  lat2,  lng2){
            var radLat1 = lat1*Math.PI / 180.0;
            var radLat2 = lat2*Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
            Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
            s = s *6378.137 ;// EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            console.log(s)
            if(s<1 && s>=0){
               $(".newMarker span").html('距您'+(s*1000)+'m');
            }else{
               $(".newMarker span").html('距您'+s.toFixed(2)+'km');
            }
           if(!jFlag){
             jFlag = true;
           }
        }
       


    }
   
})