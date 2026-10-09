$(function() {


    //填充城市列表
    buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
    function buildAdminList(obj, list, title, currid) {
        var html = [];
        html.push('<option value="">' + (title ? title : '请选择') + '</option>');
        if (obj && list) {
            for (var i = 0; i < list.length; i++) {
                var id = list[i].id, name = list[i].name, l = list[i].list;
                if (l) {
                    html.push('<optgroup label="' + name + '">');
                    for (var b = 0; b < l.length; b++) {
                        html.push('<option value="' + l[b].id + '"' + (currid == l[b].id ? ' selected' : '') + '>' + l[b].username + '&nbsp;&nbsp;[' + l[b].nickname + ']' + '</option>');
                    }
                    html.push('</optgroup>');
                } else {
                    html.push('<option value="' + id + '"' + (currid == id ? ' selected' : '') + '>' + name + '</option>');
                }
            }
        }
        obj.html(html.join(''));
    }

    //下拉选择控件
    $(".chosen-select").chosen();

    $('#billingtype').change(function () {
        var bill =  $(this).val();
        if (bill == 3){
            $('.specif').show();
        }else{
            $('.specif').hide();
        }
    })
    // 设置tab切换

    $('.tt li').click(function(){

        var  u = $(this);

        var index = u.index();

        $('.tab-content .tt_1').eq(index).addClass('active');

        $('.tab-content .tt_1').eq(index).siblings().removeClass('active');

        u.addClass('active');

        u.siblings('li').removeClass('active');

    })



    $('.yy li').click(function(){

      var  u = $(this);

      var index = u.index();

      $('.tab-content .yy_1').eq(index).addClass('active');

      $('.tab-content .yy_1').eq(index).siblings().removeClass('active');

      u.addClass('active');

      u.siblings('li').removeClass('active');

    })



    $('[data-rel="tooltip"]').tooltip();

    $('[data-rel="popover"]').popover();

    $('#businessinfo .chooseTime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm:ss','hour':'09','minute':'40',showSecond:true}));
    $('#addservice .chooseTime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'09','minute':'40',showSecond:false}));




  	$('.deletefield').click(function(){

    	$(this).closest('.fieldblock').hide();

  	})

  	var experienceHtml = '<div class="xxfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][153]+'</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][155]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="1"><div class="deletefield"title='+langData['waimai'][6][154]+'>'+langData['siteConfig'][6][8]+'</div></div>';

    $("#options").delegate(".addxxfield", "click", function(){



      var t = $(this).closest("#options").find('#fieldcontent');

      var date1 = new Date().getTime();

      var date2 = new Date().getTime() + 1;

      var html = experienceHtml.replace("date11", date1).replace("date22", date2);
      var newexperience = $(html);

      newexperience.insertAfter(t);

      newexperience.slideDown(300);

    });

  	$("#options").delegate(".deletefield", "click", function(){

		var t = $(this).closest(".fieldblock");

				t.remove();

		});

 	var txfieldHtml = '<div class="txfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][157]+'</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][158]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="2"><div class="deletefield"title='+langData['waimai'][6][154]+'>'+langData['siteConfig'][6][8]+'</div></div>';

    $("#options").delegate(".addtxfield", "click", function(){



      var t = $(this).closest("#options").find('#fieldcontent');

      var date1 = new Date().getTime();

      var date2 = new Date().getTime() + 1;

      var html = txfieldHtml.replace("date11", date1).replace("date22", date2);

      var newexperience = $(html);

      newexperience.insertAfter(t);

      newexperience.slideDown(300);

    });




    var experienceHtmll = '<div class="xxfield fieldblock">'+langData['waimai'][0][30]+':<input type="text"style="width:300px;"class="content"name="zhuohao[content][]">&nbsp;&nbsp;&nbsp;&nbsp;<div class="deletefield"title='+langData['waimai'][6][154]+'>'+langData['siteConfig'][6][8]+'</div></div>';
    $("#zhuohao").delegate(".addxxfieldd", "click", function(){



      var t = $(this).closest("#zhuohao").find('#fieldcontent');

      var date1 = new Date().getTime();

      var date2 = new Date().getTime() + 1;

      var html = experienceHtmll.replace("date11", date1).replace("date22", date2);

      var newexperience = $(html);

      newexperience.insertAfter(t);

      newexperience.slideDown(300);

    });
    $("#zhuohao").delegate(".deletefield", "click", function(){

        var t = $(this).closest(".fieldblock");

                t.remove();

        });









    // var addse = '<div class="selfdefine selfdefineblock">'+langData['waimai'][1][191]+':<select class="selfdefine-type"name="selfdefine[type][]"><option value="content">'+langData['siteConfig'][19][1]+'</option><option value="link">'+langData['waimai'][6][70]+'</option></select>&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_name">'+langData['waimai'][1][192]+':</span><input type="text"style="width:80px;"class="name"name="selfdefine[name][]">&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_value">'+langData['waimai'][1][155]+':</span><input type="text"style="width:300px;"class="content"name="selfdefine[content][]"><div class="deleteselfdefine"title="'+langData['waimai'][6][61]+'">'+langData['siteConfig'][6][8]+'</div></div>';

    // $("#selfdefine").delegate(".addselfdefine", "click", function(){



    //   var t = $(this).closest(".addse");

    //   var date1 = new Date().getTime();

    //   var date2 = new Date().getTime() + 1;

    //   var html = addse.replace("date11", date1).replace("date22", date2);

    //   var newexperience = $(html);

    //   newexperience.insertAfter(t);

    //   newexperience.slideDown(300);

    // });

    $("#selfdefine").delegate(".deleteselfdefine", "click", function(){

       $(this).closest(".selfdefineblock").remove();

    });





    $('.selfdefine-type').live('change',function(){

		if(this.value == 'content'){

			$(this).parent().find('.selfdefine_name').text(langData['waimai'][1][192]+':');

			$(this).parent().find('.selfdefine_value').text(langData['waimai'][1][155]+':');

		}else if(this.value == 'link'){

			$(this).parent().find('.selfdefine_name').text(langData['waimai'][6][71]+':');

			$(this).parent().find('.selfdefine_value').text(langData['waimai'][6][72]+':');

		}

	})







  var lievf = '<div class="rangedeliveryfee rangedeliveryfeeblock ">'+langData['waimai'][6][60]+'&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[start][]"value="0">&nbsp;'+langData['waimai'][6][155]+'&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[stop][]"value="0">&nbsp;'+langData['waimai'][2][27]+'，'+langData['waimai'][2][24]+'&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[value][]"value="0">&nbsp;'+echoCurrency('short')+'，'+langData['waimai'][2][23]+'&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[minvalue][]"value="0">&nbsp;'+echoCurrency('short')+'<div class="deleterangedeliveryfee"title="'+langData['waimai'][6][61]+'">'+langData['siteConfig'][6][8]+'</div></div>';

    $("#deliveryfee").delegate(".addrangedeliveryfee", "click", function(){



      var t = $(this).closest(".lievf");

      var date1 = new Date().getTime();

      var date2 = new Date().getTime() + 1;

      var html = lievf.replace("date11", date1).replace("date22", date2);

      var newexperience = $(html);

      newexperience.insertAfter(t);

      newexperience.slideDown(300);

    });

    $("#deliveryfee").delegate(".deleterangedeliveryfee", "click", function(){

       $(this).closest(".rangedeliveryfeeblock").remove();

    });











    //标注地图

	$("#markMap").bind("click", function(){

		$.dialog({

			id: "markDitu",

			title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",

			content: 'url:/api/map/mark.php?mod=waimai&lnglat='+$("#coordinate_y_").val()+","+$("#coordinate_x_").val()+"&city=",

			width: 800,

			height: 500,

			max: true,

			ok: function(){

				var doc = $(window.parent.frames["markDitu"].document),

					lng = doc.find("#lng").val(),

					lat = doc.find("#lat").val(),

					addr = doc.find("#addr").val();

				$("#coordinate_x_").val(lat);

				$("#coordinate_y_").val(lng);

			},

			cancel: true

		});

	});







    //覆盖物样式

    var styleOptions = {

        strokeColor:"#2691ea", //边线颜色。

        fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。

        strokeWeight: 3,       //边线的宽度，以像素为单位。

        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。

        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。

        strokeStyle: 'solid' //边线的样式，solid或dashed。

    };





    //获取指定index的颜色值

    function getColor(index){

        var color = "2691ea";

        if(index == 0){

            color = "0f5bb0";

        }else if(index == 1){

            color = "90c738";

        }else if(index == 2){

            color = "05944b";

        }else if(index == 3){

            color = "9a6b38";

        }else if(index == 4){

            color = "6c553c";

        }else if(index == 5){

            color = "4788ee";

        }else if(index == 6){

            color = "b56fe7";

        }else if(index == 7){

            color = "fa96cc";

        }else if(index == 8){

            color = "ee4565";

        }else if(index == 9){

            color = "e90000";

        }

        return "#" + color;

    }





    //点击外送费，触发起送价、配送费模式

    $("#myTab li").bind("click", function(){

        if($(this).index() == 2){

            $("#delivery_fee_mode").change();

        }

    });





    //选择起送价、配送费模式

    var mapview, drawType = "poly", defaultPolygon = [], editArea = 0;

    $("#delivery_fee_mode").change(function(){

        var t = $(this), val = t.val();

        $(".delivery_fee_mode").hide();

        $("#delivery_fee_mode" + val).show();



        if(val == 2 && !mapview){

            var overlays = [], drawingManager;

            mapview = new BMap.Map("mapview", {enableMapClick: false});

            var mPoint = new BMap.Point($("#coordinate_y_").val(), $("#coordinate_x_").val());

            var marker = new BMap.Marker(mPoint);

            mapview.centerAndZoom(mPoint, 14);

            mapview.addOverlay(marker);



            var bottom_right_control = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});

            mapview.addControl(bottom_right_control);

            mapview.enableScrollWheelZoom(true);





            //初始加载已有区域

            $(".mapview").find(".area").each(function(index){

                var t = $(this), points = t.attr("data-points"), qisong = t.attr("data-qisong"), peisong = t.attr("data-peisong");



                if(points != "" && points != undefined){

                    var pointsArr = [];

                    var paths = points.split("|");

                    for(var p = 0; p < paths.length; p++){

                        var path = paths[p].split(",");

                        pointsArr.push(new BMap.Point(path[0], path[1]));

                    }



                    var options = {

                        strokeColor:getColor(index), //边线颜色。

                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。

                        strokeWeight: 3,       //边线的宽度，以像素为单位。

                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。

                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。

                        strokeStyle: 'dashed' //边线的样式，solid或dashed。

                    };



                    var polygon = new BMap.Polygon(pointsArr, options);

                    mapview.addOverlay(polygon);



                    defaultPolygon[index] = [];

                    defaultPolygon[index]['qisong'] = qisong;

                    defaultPolygon[index]['peisong'] = peisong;

                    defaultPolygon[index]['polygon'] = polygon;

                }

            });





            //回调获得覆盖物信息

            var overlaycomplete = function(e){

                if(e){

                    var path = e.getPath();

                    var pathArr = [];

                    for(var p = 0; p < path.length; p++){

                        pathArr.push(new BMap.Point(path[p].lng, path[p].lat));

                    }

                    overlays.push(e);

                    e.enableEditing();



                    e.addEventListener("lineupdate",function(ea){

                        var target = ea.currentTarget;

                        for(var o = 0; o < overlays.length; o++){

                            if(target.K == overlays[o].K){

                                overlays[o] = target;

                            }

                        }

                        overlaycomplete();

                    });

                }



            };



            //停止拖拽地图时重新绘制

            var drawEnd = function(){

                if(overlays.length > 0){

                    mapview.removeOverlay(overlays[0]);

                    var points = [];

                    var path = overlays[0].getPath();

                    for(var p = 0; p < path.length; p++){

                        points.push(new BMap.Point(path[p].lng, path[p].lat));

                    }



                    var polygon = new BMap.Polygon(points, styleOptions);

                    mapview.addOverlay(polygon);

                    polygon.enableEditing();

                    overlays[0] = polygon;



                    polygon.addEventListener("lineupdate",function(ea){

                        var target = ea.currentTarget;

                        for(var o = 0; o < overlays.length; o++){

                            if(target.K == overlays[o].K){

                                overlays[o] = target;

                            }

                        }

                        overlaycomplete();

                    });

                }

            };



            //监听地图拖拽事件

            mapview.addEventListener('dragend', drawEnd);



            //实例化鼠标绘制工具

            drawingManager = new BMapLib.DrawingManager(mapview, {

                isOpen: false,

                drawingType: BMAP_DRAWING_POLYGON,

                enableDrawingTool: false,

                drawingToolOptions: {

                    anchor: BMAP_ANCHOR_TOP_RIGHT,

                    offset: new BMap.Size(-14, 5),

                    scale: 0.8,

                    drawingTypes: [

                        BMAP_DRAWING_POLYGON

                    ]

                },

                polygonOptions: styleOptions

            });



            //设置多边形为默认

            drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);



            //添加鼠标绘制工具监听事件，用于获取绘制结果

            drawingManager.addEventListener('polygoncomplete', overlaycomplete);



            //图形类型

            var drawCircle;

            $(".mapview").delegate(".J-change-type", "click", function(){

                var t = $(this), val = t.val(), index = t.parent().index();

                if(drawType != val){

                    mapview.removeOverlay(overlays[0]);

                    overlays = [];



                    //多边形

                    if(val == "poly"){

                        drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);

                        drawingManager.open();



                    //圆形

                    }else if(val == "circle"){

                        drawCircleOpr();

                    }



                    drawType = val;



                    $(".edit-type .J-type-area").hide();

                    $(".edit-type .J-type-area:eq("+index+")").show();

                }else{

                    mapview.centerAndZoom(mPoint, 14);

                }

            });



            //增加半径

            $(".mapview").delegate(".set-radius .add", "click", function() {

                var t = $(".set-radius input");

                t.val((10 * parseFloat(t.val()) + 1) / 10);

                drawCircleOpr();

            });



            //减小半径

            $(".mapview").delegate(".set-radius .minus", "click", function() {

                var t = $(".set-radius input");

                "0.1" != t.val() && (t.val((10 * parseFloat(t.val()) - 1) / 10), drawCircleOpr());

            });



            //手动输入半径

            $(".mapview").delegate(".set-radius input", "blur", function() {

                var t = $(".set-radius input");

                if (/^\d+(\.\d)?$/.test(t.val())) {

                    drawCircleOpr();

                } else {

                    alert(langData['waimai'][6][156])

                }

            });



            //创建圆形

            function drawCircleOpr(){

                mapview.removeOverlay(overlays[0]);

                overlays = [];



                //创建圆对象

                var radius = $(".set-radius .form-control").val() * 1000;

                drawCircle = new BMap.Circle(mPoint, radius, styleOptions);

                overlays.push(drawCircle);



                //画到地图上面

                mapview.addOverlay(drawCircle);

                drawingManager.close();



                //更新坐标集为可编辑状态

                drawEnd();

                overlaycomplete();



            }





            //新增配送区域

            $(".add-area").bind("click", function(){

                var t = $(this);

                var template = $("#addNewArea").html();

                var count = $(".mapview").find(".area").length;



                editArea = 0;



                var color = getColor(count);

                styleOptions['strokeColor'] = color;

                styleOptions['fillColor'] = color;



                if(!t.hasClass("add-area-disabled")){

                    t.addClass("add-area-disabled");

                    $(".mapview").find(".edit-opr").addClass("hide");



                    template = template.replace("areaCount", "area"+(count+1));



                    t.before(template);

                    drawingManager.open();





                }

            });





            //删除新增未保存的区域

            $(".mapview").delegate(".J-remove", "click", function(){

                var t = $(this);



                if(confirm(langData['waimai'][6][157])){

                    $(".mapview").find(".edit-opr").removeClass("hide");

                    $(".add-area").removeClass("add-area-disabled");

                    mapview.removeOverlay(overlays[0]);

                    overlays = [];

                    drawingManager.close();

                    drawType = "poly";



                    if(editArea){



                        var data = defaultPolygon[editArea-1];

                        var points = data['polygon'].getPath();

                        var pointsArr = [], pointsList = [];

                        if(points){

                            for (var i = 0; i < points.length; i++) {

                                pointsArr.push(points[i].lng+","+points[i].lat);

                                pointsList.push(new BMap.Point(points[i].lng, points[i].lat));

                            }

                        }



                        var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-qisong="'+data['qisong']+'" data-peisong="'+data['peisong']+'">';

                            newArea += '<div class="area-boder">';

                            newArea += '        <div class="clearfix">';

                            newArea += '            <span class="item-title pull-left">'+langData['waimai'][1][107]+'</span>';

                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';

                            newArea += '                <a class="save J-del ubl" href="javascript:;">'+langData['siteConfig'][6][8]+'</a>';

                            newArea += '                <i class="c-gray"> / </i>';

                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">'+langData['siteConfig'][6][6]+'</a>';

                            newArea += '            </span>';

                            newArea += '        </div>';

                            newArea += '        <span class="J-min-price min-price">';

                            newArea += '            <span>'+langData['waimai'][2][23]+' </span>';

                            newArea += '            <span class="fr J-value"><i>'+data['qisong']+'</i> '+echoCurrency('short')+'</span>';

                            newArea += '        </span>';

                            newArea += '        <span class="J-shipping-fee shipping-fee">';

                            newArea += '            <span class="shipping-fee-text">'+langData['waimai'][2][7]+' </span>';

                            newArea += '            <span class="fr J-value"><i>'+data['peisong']+'</i> '+echoCurrency('short')+'</span>';

                            newArea += '        </span>';

                            newArea += '    </div>';

                            newArea += '</div>';





                        var options = {

                            strokeColor:getColor((editArea-1)), //边线颜色。

                            fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。

                            strokeWeight: 3,       //边线的宽度，以像素为单位。

                            strokeOpacity: 1,      //边线透明度，取值范围0 - 1。

                            fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。

                            strokeStyle: 'dashed' //边线的样式，solid或dashed。

                        };



                        var polygon = new BMap.Polygon(pointsList, options);

                        mapview.addOverlay(polygon);

                        defaultPolygon[editArea-1]['polygon'] = polygon;

                        t.closest(".area").before(newArea);

                    }



                    t.closest(".area").remove();



                }

            });







            //保存新增的区域

            $(".mapview").delegate(".J-save", "click", function(){

                var t = $(this);



                if(overlays[0]){



                    var path = overlays[0].getPath();

                    var pathArr = [];

                    var pointsArr = [];

                    for(var p = 0; p < path.length; p++){

                        pathArr.push(path[p].lng+","+path[p].lat);

                        pointsArr.push(new BMap.Point(path[p].lng, path[p].lat));

                    }



                    var count = editArea ? editArea : $(".mapview").find(".area").length;

                    var qsprice = t.closest(".area").find(".min-price input").val();

                    var psprice = t.closest(".area").find(".shipping-fee input").val();



                    if(!/^(\d+)(\.\d+)?$/.test(qsprice) || !/^(\d+)(\.\d+)?$/.test(psprice)){

                        alert(langData['waimai'][6][158]);

                        return false;

                    }



                    if(count > 10){

                        alert(langData['waimai'][6][159]);

                        return false;

                    }



                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-qisong="'+qsprice+'" data-peisong="'+psprice+'">';

                        newArea += '<div class="area-boder">';

                        newArea += '        <div class="clearfix">';

                        newArea += '            <span class="item-title pull-left">'+langData['waimai'][1][107]+'</span>';

                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';

                        newArea += '                <a class="save J-del ubl" href="javascript:;">'+langData['siteConfig'][6][8]+'</a>';

                        newArea += '                <i class="c-gray"> / </i>';

                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">'+langData['siteConfig'][6][6]+'</a>';

                        newArea += '            </span>';

                        newArea += '        </div>';

                        newArea += '        <span class="J-min-price min-price">';

                        newArea += '            <span>'+langData['waimai'][2][23]+' </span>';

                        newArea += '            <span class="fr J-value"><i>'+qsprice+'</i> '+echoCurrency('short')+'</span>';

                        newArea += '        </span>';

                        newArea += '        <span class="J-shipping-fee shipping-fee">';

                        newArea += '            <span class="shipping-fee-text">'+langData['waimai'][2][7]+' </span>';

                        newArea += '            <span class="fr J-value"><i>'+psprice+'</i> '+echoCurrency('short')+'</span>';

                        newArea += '        </span>';

                        newArea += '    </div>';

                        newArea += '</div>';





                    var options = {

                        strokeColor:getColor((count-1)), //边线颜色。

                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。

                        strokeWeight: 3,       //边线的宽度，以像素为单位。

                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。

                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。

                        strokeStyle: 'dashed' //边线的样式，solid或dashed。

                    };



                    var polygon = new BMap.Polygon(pointsArr, options);

                    mapview.addOverlay(polygon);



                    if(editArea){

                        t.closest(".area").before(newArea);

                        t.closest(".area").remove();

                    }else{

                        $(".mapview .area:last").remove();

                        $(".add-area").before(newArea);

                    }



                    $(".mapview").find(".edit-opr").removeClass("hide");

                    $(".add-area").removeClass("add-area-disabled");

                    mapview.removeOverlay(overlays[0]);

                    overlays = [];

                    drawingManager.close();

                    drawType = "poly";



                    defaultPolygon[count-1] = [];

                    defaultPolygon[count-1]['qisong'] = qsprice;

                    defaultPolygon[count-1]['peisong'] = psprice;

                    defaultPolygon[count-1]['polygon'] = polygon;



                    if(count >= 10){

                        $(".add-area").addClass("add-area-disabled");

                    }



                    editArea = 0;



                }else{

                    alert(langData['waimai'][6][160]);

                }

            });





            //编辑区域

            $(".mapview").delegate(".J-edit", "click", function(){

                var t = $(this), index = t.closest(".area").index(), qs = t.closest(".area").attr("data-qisong"), ps = t.closest(".area").attr("data-peisong"), points = t.closest(".area").attr("data-points");

                editArea = index + 1;

                mapview.removeOverlay(defaultPolygon[index]['polygon']);



                var pointsList = [];

                var pointsArr = points.split("|");

                for(var p = 0; p < pointsArr.length; p++){

                    var point = pointsArr[p].split(",");

                    pointsList.push(new BMap.Point(point[0], point[1]));

                }



                var color = getColor(index);

                styleOptions['strokeColor'] = color;

                styleOptions['fillColor'] = color;



                var polygon = new BMap.Polygon(pointsList, styleOptions);

                mapview.addOverlay(polygon);

                polygon.enableEditing();



                overlays[0] = polygon;





                var btn = $(".add-area");

                var template = $("#addNewArea").html();

                btn.addClass("add-area-disabled");

                $(".mapview").find(".edit-opr").addClass("hide");

                template = template.replace("areaCount", "area"+(index+1));

                template = template.replace(langData['siteConfig'][6][8], langData['siteConfig'][6][12]);



                t.closest(".area").before(template);

                $(".min-price input").val(qs);

                $(".shipping-fee input").val(ps);

                t.closest(".area").remove();



            });





            //删除区域

            $(".mapview").delegate(".J-del", "click", function(){



                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));



                if(confirm(langData['siteConfig'][20][211])){



                    //先删除地图上已有的多边形

                    for (var i = 0; i < defaultPolygon.length; i++) {

                        var polygon = defaultPolygon[i]['polygon'];

                        mapview.removeOverlay(polygon);

                    }



                    defaultPolygon.splice((index-1), 1);

                    $(".mapview .area").remove();



                    var newDefaultPolygon = [];

                    for (var i = 0; i < defaultPolygon.length; i++) {

                        var polygon = defaultPolygon[i]['polygon'], qisong = defaultPolygon[i]['qisong'], peisong = defaultPolygon[i]['peisong'];



                        if(polygon){

                            var pointsArr = [], pointsList = [];

                            var paths = polygon.getPath();

                            for(var p = 0; p < paths.length; p++){

                                pointsArr.push(new BMap.Point(paths[p].lng, paths[p].lat));

                                pointsList.push(paths[p].lng + "," + paths[p].lat);

                            }



                            var options = {

                                strokeColor:getColor(i), //边线颜色。

                                fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。

                                strokeWeight: 3,       //边线的宽度，以像素为单位。

                                strokeOpacity: 1,      //边线透明度，取值范围0 - 1。

                                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。

                                strokeStyle: 'dashed' //边线的样式，solid或dashed。

                            };



                            var polygon = new BMap.Polygon(pointsArr, options);

                            mapview.addOverlay(polygon);



                            newDefaultPolygon[i] = [];

                            newDefaultPolygon[i]['qisong'] = qisong;

                            newDefaultPolygon[i]['peisong'] = peisong;

                            newDefaultPolygon[i]['polygon'] = polygon;





                            var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-qisong="'+qisong+'" data-peisong="'+peisong+'">';

                                newArea += '<div class="area-boder">';

                                newArea += '        <div class="clearfix">';

                                newArea += '            <span class="item-title pull-left">'+langData['waimai'][1][107]+'</span>';

                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';

                                newArea += '                <a class="save J-del ubl" href="javascript:;">'+langData['siteConfig'][6][8]+'</a>';

                                newArea += '                <i class="c-gray"> / </i>';

                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">'+langData['siteConfig'][6][6]+'</a>';

                                newArea += '            </span>';

                                newArea += '        </div>';

                                newArea += '        <span class="J-min-price min-price">';

                                newArea += '            <span>'+langData['waimai'][2][23]+' </span>';

                                newArea += '            <span class="fr J-value"><i>'+qisong+'</i> '+echoCurrency('short')+'</span>';

                                newArea += '        </span>';

                                newArea += '        <span class="J-shipping-fee shipping-fee">';

                                newArea += '            <span class="shipping-fee-text">'+langData['waimai'][2][7]+' </span>';

                                newArea += '            <span class="fr J-value"><i>'+peisong+'</i> '+echoCurrency('short')+'</span>';

                                newArea += '        </span>';

                                newArea += '    </div>';

                                newArea += '</div>';



                            $(".add-area").before(newArea);

                        }

                    }



                    defaultPolygon = newDefaultPolygon;



                };



            });





        }

    });



});



$("#shop-form").submit(function(e){
    e.eventPreventDefault();
});


//表单提交

function checkFrom(form){



    //获取服务区域

    var service_area_data = [];

    $(".mapview").find(".area").each(function(){

        var t = $(this), peisong = t.attr("data-peisong"), qisong = t.attr("data-qisong"), points = t.attr('data-points');

        if(peisong && qisong && points){

            service_area_data.push('{"qisong": "'+qisong+'", "peisong": "'+peisong+'", "points": "'+points+'"}');

        }

    });

    if(service_area_data){

        $("#service_area_data").val('['+service_area_data.join(",")+']');

    }



    var form = $("#shop-form"), action = form.attr("action"), data = form.serialize();

    var btn = $("#submitBtn");





    btn.attr("disabled", true);



    $.ajax({

        url: action,

        type: "post",

        data: data,

        dataType: "json",

        success: function(res){

            if(res.state == 100){

                $.dialog({

					title: langData['waimai'][6][123],

					icon: 'success.png',

					content: langData['siteConfig'][6][39],

					ok: function(){

                        window.scroll(0, 0);

                        location.reload();

					}

				});

            }else{

                $.dialog.alert(res.info);

                btn.attr("disabled", false);

            }

        },

        error: function(){

            $.dialog.alert(langData['siteConfig'][20][253]);

            btn.attr("disabled", false);

        }

    })

    return false;


}









// 定位

if($("#coordinate_x_").val() == "" && $("#coordinate_y_").val() == ""){

    var geolocation = new BMap.Geolocation();

    geolocation.getCurrentPosition(function(r){

    	if(this.getStatus() == BMAP_STATUS_SUCCESS){

    		$("#coordinate_x_").val(r.point.lat);

    		$("#coordinate_y_").val(r.point.lng);

    	}

    	else {

    		alert('failed'+this.getStatus());

    	}

    },{enableHighAccuracy: true})

}
