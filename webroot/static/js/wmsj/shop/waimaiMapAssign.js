$(function(){



    var map = new BMap.Map("map", {enableMapClick: false});

    // map.centerAndZoom(mapCity, 13);

    map.enableScrollWheelZoom(); //启用滚轮放大缩小

    map.disableInertialDragging(); //禁用惯性拖拽



    var points = [];

    $.each(courier, function(e, o) {

        var bubbleLabel, r = [];



        bubbleLabel = new BMap.Label('<p class="bubble-3 bubble courier" data-id="'+o.id+'"><i class="num">'+langData['waimai'][6][133]+'：'+o.name+'（'+o.count+langData['waimai'][6][134]+'）</i><i class="arrow-up"><i class="arrow"></i><i></p>', {

            position: new BMap.Point(o.lat, o.lng),

            offset: new BMap.Size(-46, -46)

        });



        bubbleLabel.setStyle({

			color: "#fff",

			borderWidth: "0",

			padding: "0",

			zIndex: "2",

			backgroundColor: "transparent",

			textAlign: "center",

			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'

		});

       



        points.push(new BMap.Point(o.lat, o.lng));

        map.addOverlay(bubbleLabel);

    });



    //最佳视野显示所有配送员

    map.setViewport(points);



    var page = 1, pageSize = 10;

    $("#total").html(order.length);



    //分页

    if(order.length > pageSize){

        var totalPage = Math.ceil(order.length / pageSize);

        var p = [];

        for (var i = 0; i < totalPage; i++) {

            p.push('<option value="'+(i+1)+'">'+langData['waimai'][6][135].replace('1', (i+1))+'</option>');

        }

        $("#page").html(p.join("")).removeClass("hide");

    }



    $("#page").change(function(){

        page = $(this).val();

        printOrderList();

    });



    printOrderList();



    //拼接订单列表

    function printOrderList(){

        var list = [];

        var offset = (page - 1) * pageSize;

        orderData = (offset + pageSize >= order.length) ? order.slice(offset, order.length) : order.slice(offset, offset + pageSize);



        if(orderData){

            for (var i = 0; i < orderData.length; i++) {

                var data = orderData[i];

                list.push('<div class="item" data-id="'+data.id+'" data-shopname="'+data.shopname+'" data-lng="'+data.lng+'" data-lat="'+data.lat+'" data-coordX="'+data.coordX+'" data-coordY="'+data.coordY+'">');

                list.push('<div class="tit">'+langData['siteConfig'][19][308]+'：'+data.ordernum+'</div>');

                list.push('<dl class="clearfix">');

                list.push('<dt><img src="/static/images/customer_default.png" /></dt>');

                list.push('<dd>'+data.person+'  '+data.tel+'<br />'+data.address+'</dd>');

                list.push('</dl>');

                list.push('<dl class="clearfix">');

                list.push('<dt><img src="/static/images/shop_default.png" /></dt>');

                list.push('<dd>'+data.shopname+'<br />'+data.address1+'</dd>');

                list.push('</dl>');

                list.push('<div class="fot clearfix">');

                list.push('<input type="checkbox" value="'+data.id+'" />');

                list.push('<span class="time">'+data.confirmdate+'</span>');

                list.push('<a href="javascript:;" class="btn no-border btn-success">'+langData['siteConfig'][19][313]+'</a>');

                list.push('</div>');

                list.push('</div>');

            }

        }



        $(".slide .list").html(list.join(""));

    }





    //点击订单

    $(".slide .list").delegate(".item", "click", function(){

        var t = $(this), shopname = t.attr("data-shopname"), lng = t.attr("data-lng"), lat = t.attr("data-lat"), coordX = t.attr("data-coordX"), coordY = t.attr("data-coordY");

        t.addClass("curr").siblings(".item").removeClass("curr");

        addShopMarket(shopname, lng, lat, coordX, coordY);

    });





    var shopMarket, personMarket;

    function addShopMarket(shopname, lng, lat, coordX, coordY){



        if(shopMarket){

            map.removeOverlay(shopMarket);

        }

        if(personMarket){

            map.removeOverlay(personMarket);

        }



        shopMarket = new BMap.Label('<p class="bubble-3 bubble shop"><i class="num">'+langData['siteConfig'][17][12]+'：'+shopname+'</i><i class="arrow-up"><i class="arrow"></i><i></p>', {

            position: new BMap.Point(coordY, coordX),

            offset: new BMap.Size(-46, -46)

        });



        shopMarket.setStyle({

			color: "#fff",

			borderWidth: "0",

			padding: "0",

			zIndex: "2",

			backgroundColor: "transparent",

			textAlign: "center",

			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'

		});

        map.addOverlay(shopMarket);





        personMarket = new BMap.Label('<p class="bubble-3 bubble person"><i class="num">'+langData['waimai'][6][136]+'</i><i class="arrow-up"><i class="arrow"></i><i></p>', {

            position: new BMap.Point(lng, lat),

            offset: new BMap.Size(-46, -46)

        });



        personMarket.setStyle({

			color: "#fff",

			borderWidth: "0",

			padding: "0",

			zIndex: "2",

			backgroundColor: "transparent",

			textAlign: "center",

			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'

		});

        map.addOverlay(personMarket);



        var points = [];

        points.push(new BMap.Point(coordY, coordX));

        points.push(new BMap.Point(lng, lat));

        map.setViewport(points);

    }





    //订单详情

    $(".slide .list").delegate(".btn", "click", function(){

        var t = $(this), id = t.closest(".item").attr("data-id");

        if(id){

            $.dialog({

    			id: "markDitu",

    			title: langData['siteConfig'][19][313],

    			content: 'url:waimai/waimaiOrderDetail.php?id='+id,

    			width: 1000,

    			height: 600,

    			max: true,

    			ok: function(){



    			},

    			cancel: true

    		});

        }

    });





    //点击配送员

    //气泡点击  区域

    $("#map").on("click", ".courier", function() {



        var courier_id = $(this).attr("data-id");



        var orderids = [];

        $(".slide .list").find("input").each(function(){

            var t = $(this), id = t.val();

            if(t.is(":checked")){

                orderids.push(id);

            }

        });



        if(orderids.length > 0){

            $.dialog.confirm(langData['waimai'][6][137], function(){



                $.ajax({

                    url: "waimaiOrder.php",

                    type: "post",

                    data: {action: "setCourier", id: orderids.join(","), courier: courier_id},

                    dataType: "json",

                    success: function(res){

                        if(res.state != 100){

                            $.dialog.alert(res.info);

                        }else{

                            location.reload();

                        }

                    },

                    error: function(){

                        $.dialog.alert(langData['waimai'][4][11]);

                    }

                })



            });

        }



    });



});

