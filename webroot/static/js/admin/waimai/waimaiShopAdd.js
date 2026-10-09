$(function() {

   //填充分站列表
   huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化

    //下拉选择控件
    $(".chosen-select").chosen();

    // 设置tab切换
    $('.tt li').click(function(){
        var  u = $(this);
        var index = u.index();
        $('.tab-content .tt_1').eq(index).addClass('active');
        $('.tab-content .tt_1').eq(index).siblings().removeClass('active');
        u.addClass('active');
        u.siblings('li').removeClass('active');
    })
    $('#billingtype').change(function () {
       var bill =  $(this).val();
         if (bill == 3){
               $('.specif').show();
         }else{
             $('.specif').hide();
         }
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
  	var experienceHtml = '<div class="xxfield fieldblock">(<span style="font-weight:bold;">选项字段</span>)&nbsp;&nbsp;字段名:<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;选项值:<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;显示顺序:<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="1"><div class="deletefield"title="删除选项字段">删除</div></div>';
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
 	var txfieldHtml = '<div class="txfield fieldblock">(<span style="font-weight:bold;">填写字段</span>)&nbsp;&nbsp;字段名:<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;提示语:<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;显示顺序:<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="2"><div class="deletefield"title="删除选项字段">删除</div></div>';
    $("#options").delegate(".addtxfield", "click", function(){

      var t = $(this).closest("#options").find('#fieldcontent');
      var date1 = new Date().getTime();
      var date2 = new Date().getTime() + 1;
      var html = txfieldHtml.replace("date11", date1).replace("date22", date2);
      var newexperience = $(html);
      newexperience.insertAfter(t);
      newexperience.slideDown(300);
    });


    //解除绑定麦芽田顺丰账号
    $('.maiyatianUnbind').click(function(){
        var t = $(this);
        var id = t.attr('data-id');
        if(id){
            $.ajax({
                url: "?dopost=maiyatianUnbind",
                data: {id:id},
                type: "POST",
                dataType: "json",
                success: function (data) {
                    alert(data.info);
                },
                error: function(){
                    alert('网络错误，请重试！');
                }
            });
        }
    });


    var experienceHtmll = '<div class="xxfield fieldblock">'+langData['waimai'][0][30]+':<input type="text"style="width:300px;"class="content"name="zhuohao[content][]">&nbsp;&nbsp;&nbsp;&nbsp<input type="hidden"class="type"name="zhuohao[type][]"value="1"><div class="deletefield"title='+langData['waimai'][6][154]+'>'+langData['siteConfig'][6][8]+'</div></div>';
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




    var addse = '<div class="selfdefine selfdefineblock">项目类型:<select class="selfdefine-type"name="selfdefine[type][]"><option value="content">内容</option><option value="link">外链</option></select>&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_name">自定义显示项:</span><input type="text"style="width:80px;"class="name"name="selfdefine[name][]">&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_value">选项值:</span><input type="text"style="width:300px;"class="content"name="selfdefine[content][]"><div class="deleteselfdefine"title="删除自定义显示项">删除</div></div>';
    $("#selfdefine").delegate(".addselfdefine", "click", function(){

      var t = $(this).closest(".addse");
      var date1 = new Date().getTime();
      var date2 = new Date().getTime() + 1;
      var html = addse.replace("date11", date1).replace("date22", date2);
      var newexperience = $(html);
      newexperience.insertAfter(t);
      newexperience.slideDown(300);
    });
    $("#selfdefine").delegate(".deleteselfdefine", "click", function(){
       $(this).closest(".selfdefineblock").remove();
    });


    $('.selfdefine-type').live('change',function(){
		if(this.value == 'content'){
			$(this).parent().find('.selfdefine_name').text('自定义显示项:');
			$(this).parent().find('.selfdefine_value').text('选项值:');
		}else if(this.value == 'link'){
			$(this).parent().find('.selfdefine_name').text('链接名:');
			$(this).parent().find('.selfdefine_value').text('链接:');
		}
	})



  var lievf = '<div class="rangedeliveryfee rangedeliveryfeeblock ">配送距离&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[start][]"value="0">&nbsp;公里至&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[stop][]"value="0">&nbsp;公里，外送费&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[value][]"value="0">&nbsp;元，起送价&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[minvalue][]"value="0">&nbsp;元<div class="deleterangedeliveryfee"title="删除自定义显示项">删除</div></div>';
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


    var additionalHtml = '<div class="rangedeliveryfee rangedeliveryfeeblock ">商品金额&nbsp;<input type="text"style="width:80px;"class="name"name="additional[start][]"value="">&nbsp;元至&nbsp;<input type="text"style="width:80px;"class="name"name="additional[stop][]"value="">&nbsp;元，额外费用&nbsp;<input type="text"style="width:80px;"class="content"name="additional[value][]"value="">&nbsp;元<div class="deletefield deleteadditional"title="删除自定义显示项">删除</div></div>';
    $("#additionalConfig").delegate(".additionalBtn", "click", function(){

      var t = $(this).closest(".lievf");
      var newexperience = $(additionalHtml);
      newexperience.insertAfter(t);
      newexperience.slideDown(300);
    });
    $("#additionalConfig").delegate(".deleteadditional", "click", function(){
       $(this).closest(".rangedeliveryfeeblock").remove();
    });


    //标注地图
	$("#markMap").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
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

  var i = print_config;
  $("#copy").bind("click",function(){
    var html = [];
    html.push('<div class ="printercopy" style="position: relative;">');
    html.push('<div class="form-group"><label class="col-sm-1" for="Config_open_addservice">是否开启打印机</label><select name="print_config['+i+'][bind_print]" id="Config_bind_print"><option value="0">关闭</option><option value="1">开启</option></select></div>');

    html.push('<div class="btn btn-sm btn-danger del" data-id="" style="position: absolute;right: 0;top: 10px;" > 删除</div>');

    html.push('<div class="widget-box">');
    html.push('<div class="widget-header"><h5>绑定打印机</h5></div>');
    html.push('<div class="widget-body">');
    html.push('<div class="widget-main">');
    html.push('<div class="form-group hide">');
    html.push('<label class="col-sm-1">用户ID：</label>');
    html.push('<input class="col-sm-2" name="print_config['+i+'][partner]" type="text" value="">');
    html.push('</div>');
    html.push('<input class="col-sm-2" type="hidden" name="print_config['+i+'][id]" type="text" value="">');
    html.push('<div class="form-group hide">');
    html.push('<label class="col-sm-1">API 密钥：</label>');
    html.push('<input class="col-sm-4" name="print_config['+i+'][apikey]" type="text" value="">');
    html.push('</div>');
    html.push('<div class="form-group">');
    html.push('<label class="col-sm-1">备注：</label>');
    html.push('<input class="col-sm-2" name="print_config['+i+'][remarks]" type="text" value="">');
    html.push(' </div>');
    html.push('<div class="form-group">');
    html.push('<label class="col-sm-1">打印机终端号：</label>');
    html.push('<input class="col-sm-2" name="print_config['+i+'][mcode]" type="text" value="">');
    html.push(' </div>');
    html.push('<div class="form-group">');
    html.push(' <label class="col-sm-1">打印机密钥：</label>');
    html.push('  <input class="col-sm-2" name="print_config['+i+'][msign]" type="text" value="">');
    html.push(' </div>');
    html.push('<div class="form-group">');
    html.push(' <label class="col-sm-1">小票样式：</label>');
    html.push('  <a href="javascript:;" class="btn btn-small printTemplateObj">DIY自定义</a><textarea name="print_config['+i+'][template]" style="display: none;"></textarea>');
    html.push(' </div>');

    html.push(' </div>');
    html.push(' </div>');
    html.push(' </div>');

    // var clone = $('#printercopy').clone(true);
    $(this).before(html.join(''));
    i++;
    // var str ="<div class='btn btn-sm btn-danger' style='position: absolute;right: 0;top: 10px;'> 删除</div>"
    // $(this).find(".form-group").append(str);
  })

  //小票自定义
  $('body').delegate('.printTemplateObj', 'click', function(){
	 var t = $(this), textarea = t.siblings('textarea');
	 $.dialog({
		 id: "printTemplatePopup",
		 title: "打印机小票DIY自定义",
		 content: 'url:'+adminPath+'../include/printTemplate.php?module=waimai&template=' + encodeURIComponent(textarea.val()),
		 width: 890,
		 height: 700,
		 button: [
			 {
				 name: '确认',
				 callback: function(){
					 var doc = $(window.parent.frames["printTemplatePopup"].document),
						 templateVal = doc.find("#templateVal").val();
					 textarea.val(templateVal);
				 },
				 focus: true
			 },
			 {
				 name: '恢复默认',
				 callback: function(){
					 textarea.val('');
				 }
			 },
			 {
				 name: '取消'
			 }
		 ]
	 });
  });

  $("body").delegate(".del","click",function(){
    var printid = $(this).data("id");
    console.log(printid);
    if(printid!="" ){
      var dopost = "del";
       $.ajax({
          url: action,
          type: "post",
          data: {sid:sid,printid:printid,dopost:dopost},
          dataType: "json",
          success: function(res){
             if(res.state == 100){
                  $(this).closest(".printercopy").remove();
                  $.dialog({
                  title: '提醒',
                  icon: 'success.png',
                  content: '删除成功！',
                  ok: function(){
                                window.scroll(0, 0);
                                location.reload();
                  }
              });
              }else{
                  $.dialog.alert(res.info);
                  $(".del").attr("disabled", false);
              }
          },
          error: function(){
              $.dialog.alert("网络错误，保存失败！");
              $(".del").attr("disabled", false);
          }
      })
    }else{
      $(this).closest(".printercopy").remove();
    }
  })

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

      //覆盖物样式
      var styleOptions = {
          strokeColor:"#2691ea", //边线颜色。
          fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3,       //边线的宽度，以像素为单位。
          strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
          fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
          strokeStyle: 'solid' //边线的样式，solid或dashed。
      };


        var t = $(this), val = t.val();
        $(".delivery_fee_mode").hide();
        $("#delivery_fee_mode" + val).show();

        if(val == 2 && !mapview){

          // 百度地图
          if (site_map == "baidu") {

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
                    alert("请输入只有1位小数的数字！")
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

                if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
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
                            newArea += '            <span class="item-title pull-left">配送范围</span>';
                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                            newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                            newArea += '                <i class="c-gray"> / </i>';
                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                            newArea += '            </span>';
                            newArea += '        </div>';
                            newArea += '        <span class="J-min-price min-price">';
                            newArea += '            <span>起送价 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['qisong']+'</i> 元</span>';
                            newArea += '        </span>';
                            newArea += '        <span class="J-shipping-fee shipping-fee">';
                            newArea += '            <span class="shipping-fee-text">配送费 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['peisong']+'</i> 元</span>';
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
                        alert("起送价格和配送费必须设置为数字，请修改后保存！");
                        return false;
                    }

                    if(count > 10){
                        alert("最多设置10个配送区域！");
                        return false;
                    }

                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-qisong="'+qsprice+'" data-peisong="'+psprice+'">';
                        newArea += '<div class="area-boder">';
                        newArea += '        <div class="clearfix">';
                        newArea += '            <span class="item-title pull-left">配送范围</span>';
                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                        newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                        newArea += '                <i class="c-gray"> / </i>';
                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                        newArea += '            </span>';
                        newArea += '        </div>';
                        newArea += '        <span class="J-min-price min-price">';
                        newArea += '            <span>起送价 </span>';
                        newArea += '            <span class="fr J-value"><i>'+qsprice+'</i> 元</span>';
                        newArea += '        </span>';
                        newArea += '        <span class="J-shipping-fee shipping-fee">';
                        newArea += '            <span class="shipping-fee-text">配送费 </span>';
                        newArea += '            <span class="fr J-value"><i>'+psprice+'</i> 元</span>';
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
                    alert("请先绘制配送范围！");
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
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price input").val(qs);
                $(".shipping-fee input").val(ps);
                t.closest(".area").remove();

            });


            //删除区域
            $(".mapview").delegate(".J-del", "click", function(){

                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

                if(confirm("确认要删除吗？")){

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
                                newArea += '            <span class="item-title pull-left">配送范围</span>';
                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                                newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                                newArea += '                <i class="c-gray"> / </i>';
                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                                newArea += '            </span>';
                                newArea += '        </div>';
                                newArea += '        <span class="J-min-price min-price">';
                                newArea += '            <span>起送价 </span>';
                                newArea += '            <span class="fr J-value"><i>'+qisong+'</i> 元</span>';
                                newArea += '        </span>';
                                newArea += '        <span class="J-shipping-fee shipping-fee">';
                                newArea += '            <span class="shipping-fee-text">配送费 </span>';
                                newArea += '            <span class="fr J-value"><i>'+peisong+'</i> 元</span>';
                                newArea += '        </span>';
                                newArea += '    </div>';
                                newArea += '</div>';

                            $(".add-area").before(newArea);
                        }
                    }

                    defaultPolygon = newDefaultPolygon;

                };

            });

          // 谷歌地图
          }else if (site_map == "google") {

            var overlays = [];
            var map_default_lng = $("#coordinate_y_").val();
            var map_default_lat = $("#coordinate_x_").val();

            //地图默认配置
            var mapOptions = {
                zoom: 14,
                center: new google.maps.LatLng(map_default_lat, map_default_lng),
                mapTypeControl:false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL//LARGE
                }
            };

            //覆盖物样式
            var styleOptions = {
                strokeColor:"#2691ea", //边线颜色。
                fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
                strokeWeight: 3,       //边线的宽度，以像素为单位。
                strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                fillOpacity: 0.4       //填充的透明度，取值范围0 - 1。
            }

            var map = new google.maps.Map(document.getElementById('mapview'), mapOptions);

            var marker = new google.maps.Marker({
                    position: mapOptions.center,
                    map: map
                });

            var MapToolbar = {

                //当前选中
                currentFeature: null,

                shapeCounter: 0,

                addPoint: function(e, poly, index) {
                    var e = (typeof e.latLng != "undefined") ? e.latLng: e,
                    path = poly.getPath(),
                    index = (typeof index != "undefined") ? index: path.length;
                    path.insertAt(index, e);
                },

                buttons: {
                    $hand: null,
                    $shape: null
                },

                polyClickEvent: null,

                Feature: function(type) {
                    if (type == "shape") {
                        this['poly'](type);
                    } else {
                        this[type]();
                    }
                },

                features: {
                    shapeTab: {},
                    overlayTab: {}
                },

                initFeature: function(type) {
                    new MapToolbar.Feature(type);
                },

                isSelected: function(el) {
                    return (el.className == "selected");
                },

                select: function(buttonId) {
                    if($("#type").val() == ""){
                        MapToolbar.buttons.$hand.className = "";
                        MapToolbar.buttons.$shape.className = "";
                        $('#'+buttonId).addClass("selected");
                    }
                },

                removeFeature : function(type, id){
                    if (id == "" || id == undefined) {
                      for(var i = 1; i <= defaultPolygon.length; i++){
                          var id = defaultPolygon[i-1].polygon.id;
                          var feature = MapToolbar.features[type+'Tab'][id];
                          feature.setMap(null);
                          overlays = [];
                      }
                    }else {
                      var feature = MapToolbar.features[type+'Tab']['shape_'+id];
                      feature.setMap(null);
                    }
                    // MapToolbar.features[type+'Tab'] = {};
                    // MapToolbar.select('hand_b');
                    // MapToolbar.shapeCounter = defaultPolygon.length - 1;
                    // updateLatlng();
                },

                stopEditing: function(status) {
                    !status ? this.select("hand_b") : null;

                    if(MapToolbar.currentFeature){
                        var id = MapToolbar.currentFeature.id, isHas = false;
                        for(var o = 0; o < overlays.length; o++){
                            if(overlays[o].id == id){
                                overlays[o] = MapToolbar.currentFeature;
                                isHas = true;
                            }
                        }

                        if(!isHas){
                            var path = MapToolbar.currentFeature.getPath();
                            var pathArray = path.getArray();
                            var pathArr = [];
                            for(var p = 0; p < pathArray.length; p++){
                                pathArr.push(new google.maps.LatLng(pathArray[p].lat(), pathArray[p].lng()));
                            }
                            overlays.push(MapToolbar.currentFeature);
                        }

                        updateLatlng();

                        //监听覆盖拖动，更新坐标
                        google.maps.event.addListener(MapToolbar.currentFeature, "dragend", function(event) {
                            var id = this.id;
                            for(var o = 0; o < overlays.length; o++){
                                if(overlays[o].id == id){
                                    overlays[o] = this;
                                }
                            }
                            updateLatlng();
                        });
                    }

                }
            }

            MapToolbar.Feature.prototype.poly = function(type) {
                var path = new google.maps.MVCArray,
                    poly,
                    self = this,
                    el = type + "_b";

                if (type == "shape") {
                    poly = self.createShape(styleOptions, path);

                    google.maps.event.addListener(path, 'insert_at', function(){
                      MapToolbar.stopEditing(1);
                    });

                    google.maps.event.addListener(path, 'remove_at', function(){
                      MapToolbar.stopEditing(1);
                    });

                    google.maps.event.addListener(path, 'set_at', function(){
                      MapToolbar.stopEditing(1);
                    });
                }

                if($("#type").val() == ""){
                    poly.markers = new google.maps.MVCArray;

                    if (MapToolbar.isSelected(document.getElementById(el))) return;
                    MapToolbar.select(el);
                    MapToolbar.currentFeature = poly;
                    poly.setMap(map);
                    if (!poly.$el) {++MapToolbar[type + "Counter"];
                        poly.id = type + '_' + MapToolbar[type + "Counter"];
                        MapToolbar.features[type + "Tab"][poly.id] = poly;
                    }
                }
            }

            MapToolbar.Feature.prototype.createShape = function(opts, path) {
                var poly;
                poly = new google.maps.Polygon(opts);
                poly.setPaths(new google.maps.MVCArray([path]));
                poly.setEditable(true);
                // poly.setDraggable(true);

                return poly;
            }

            function updateLatlng(){
                var overlayArr = [];
                for(var i = 0; i < overlays.length; i++){
                    var path = overlays[i].getPath();
                    var pathArray = path.getArray();
                    var pathArr = [];
                    for(var p = 0; p < pathArray.length; p++){
                        pathArr.push(pathArray[p].lat()+","+pathArray[p].lng());
                    }
                    overlayArr.push(pathArr.join("|"));
                };
                // $("#overlays").val(overlayArr.join("$$"));
            }

            function initialize(container) {
                if($("#type").val() == ""){
                    with(MapToolbar) {
                        with(buttons) {
                            $hand = document.getElementById("hand_b");
                            $shape = document.getElementById("shape_b");
                        }
                        $featureTable = document.getElementById("featuretbody");
                        select("hand_b");
                    }

                    MapToolbar.polyClickEvent = google.maps.event.addListener(map, 'click', function(event) {
                        if (!MapToolbar.isSelected(MapToolbar.buttons.$shape)) return;
                        if (MapToolbar.currentFeature) {
                            MapToolbar.addPoint(event, MapToolbar.currentFeature);
                        }
                    });
                }

                //初始增加覆盖物
                $(".mapview").find(".area").each(function(index){
                  var t = $(this), overlayVal = t.attr("data-points"), qisong = t.attr("data-qisong"), peisong = t.attr("data-peisong"), index = t.index();
                  if(overlayVal != ""){
                      var bounds = new google.maps.LatLngBounds();
                      var points = [];
                      var overlayArr = overlayVal.split("|");
                      for(var o = 0; o < overlayArr.length; o++){
                          var overlayItem = overlayArr[o].split(",");
                          points.push(new google.maps.LatLng(overlayItem[1], overlayItem[0]));
                          bounds.extend(new google.maps.LatLng(overlayItem[1], overlayItem[0]));
                      }

                      var color = getColor(index);
                      styleOptions['strokeColor'] = color;
                      styleOptions['fillColor'] = color;
                      var polygon = new google.maps.Polygon(styleOptions);
                      polygon.setPaths(points);

                      polygon.setMap(map);
                      ++MapToolbar["shapeCounter"];
                      polygon.id = 'shape_' + MapToolbar["shapeCounter"];
                      overlays.push(polygon);

                      polygon.markers = new google.maps.MVCArray;

                      MapToolbar.features.shapeTab[polygon.id] = polygon;

                      //监听覆盖拖动，更新坐标
                      google.maps.event.addListener(polygon, "dragend", function(event) {
                          var id = this.id;
                          for(var o = 0; o < overlays.length; o++){
                              if(overlays[o].id == id){
                                  overlays[o] = this;
                              }
                          }
                          updateLatlng();
                      });

                      defaultPolygon[index] = [];
                      defaultPolygon[index]['qisong'] = qisong;
                      defaultPolygon[index]['peisong'] = peisong;
                      defaultPolygon[index]['polygon'] = polygon;

                      //map.fitBounds(bounds);

                  }else{
                      MapToolbar.initFeature('shape');
                  }
                })
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
                    MapToolbar.shapeCounter = count;
                    MapToolbar.initFeature('shape');
                    MapToolbar.select('shape_b');


                }

                $(".new-area").hide();

            });


            //删除新增未保存的区域
            $(".mapview").delegate(".J-remove", "click", function(){
                var t = $(this), index = Number(t.closest(".area").attr("data-index")), eqIndex = t.closest(".area").index();

                if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    // overlays = [];
                    drawType = "poly";

                    if(editArea){

                        var data = defaultPolygon[editArea-1];
                        var path = data['polygon'].getPath();
                        var points = path.getArray();
                        var pointsArr = [], pointsList = [];
                        if(points){
                            for (var i = 0; i < points.length; i++) {
                                pointsArr.push(points[i].lat()+","+points[i].lng());
                                pointsList.push(new google.maps.LatLng(points[i].lat(), points[i].lng()));
                            }
                        }

                        var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-qisong="'+data['qisong']+'" data-peisong="'+data['peisong']+'">';
                            newArea += '<div class="area-boder">';
                            newArea += '        <div class="clearfix">';
                            newArea += '            <span class="item-title pull-left">配送范围</span>';
                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                            newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                            newArea += '                <i class="c-gray"> / </i>';
                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                            newArea += '            </span>';
                            newArea += '        </div>';
                            newArea += '        <span class="J-min-price min-price">';
                            newArea += '            <span>起送价 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['qisong']+'</i> 元</span>';
                            newArea += '        </span>';
                            newArea += '        <span class="J-shipping-fee shipping-fee">';
                            newArea += '            <span class="shipping-fee-text">配送费 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['peisong']+'</i> 元</span>';
                            newArea += '        </span>';
                            newArea += '    </div>';
                            newArea += '</div>';

                        var options = {
                            strokeColor:getColor((editArea-1)), //边线颜色。
                            fillColor:getColor((editArea-1)),          //填充颜色。当参数为空时，圆形将没有填充效果。
                            strokeWeight: 3,       //边线的宽度，以像素为单位。
                            strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                            fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                            strokeStyle: 'dashed' //边线的样式，solid或dashed。
                        };

                        var polygon = new google.maps.Polygon(options);
                        polygon.setPaths(pointsList);
                        MapToolbar.removeFeature('shape', editArea);

                        polygon.id = 'shape_' + editArea;
                        // overlays.splice((editArea-1), 1);
                        // overlays.push(polygon);

                        polygon.markers = new google.maps.MVCArray;

                        MapToolbar.features.shapeTab[polygon.id] = polygon;

                        polygon.setMap(map);
                        defaultPolygon[editArea-1]['polygon'] = polygon;
                        t.closest(".area").before(newArea);

                    }else {
                      MapToolbar.removeFeature('shape', MapToolbar.currentFeature.id.substring(6));
                      overlays.splice((MapToolbar.currentFeature.id.substring(6)-1), 1);
                    }

                    t.closest(".area").remove();
                    MapToolbar.select('hand_b');


                }
            });


            //保存新增的区域
            $(".mapview").delegate(".J-save", "click", function(){
                var t = $(this), area = t.closest(".area"), index = area.index();

                if(MapToolbar.currentFeature.id.substring(6) <= overlays.length){
                    var path = overlays[index].getPath();
                    var pathArray = path.getArray();
                    var pathArr = [], pointsArr = [];
                    for(var p = 0; p < pathArray.length; p++){
                        pathArr.push(pathArray[p].lng()+","+pathArray[p].lat());
                        pointsArr.push(new google.maps.LatLng(pathArray[p].lat(), pathArray[p].lng()));
                    }
                    var count = editArea ? editArea : $(".mapview").find(".area").length;
                    var qsprice = t.closest(".area").find(".min-price input").val();
                    var psprice = t.closest(".area").find(".shipping-fee input").val();

                    if(!/^(\d+)(\.\d+)?$/.test(qsprice) || !/^(\d+)(\.\d+)?$/.test(psprice)){
                        alert("起送价格和配送费必须设置为数字，请修改后保存！");
                        return false;
                    }

                    if(count > 10){
                        alert("最多设置10个配送区域！");
                        return false;
                    }

                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-qisong="'+qsprice+'" data-peisong="'+psprice+'">';
                        newArea += '<div class="area-boder">';
                        newArea += '        <div class="clearfix">';
                        newArea += '            <span class="item-title pull-left">配送范围</span>';
                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                        newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                        newArea += '                <i class="c-gray"> / </i>';
                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                        newArea += '            </span>';
                        newArea += '        </div>';
                        newArea += '        <span class="J-min-price min-price">';
                        newArea += '            <span>起送价 </span>';
                        newArea += '            <span class="fr J-value"><i>'+qsprice+'</i> 元</span>';
                        newArea += '        </span>';
                        newArea += '        <span class="J-shipping-fee shipping-fee">';
                        newArea += '            <span class="shipping-fee-text">配送费 </span>';
                        newArea += '            <span class="fr J-value"><i>'+psprice+'</i> 元</span>';
                        newArea += '        </span>';
                        newArea += '    </div>';
                        newArea += '</div>';

                    var options = {
                        strokeColor:getColor((count-1)), //边线颜色。
                        fillColor:getColor((count-1)),          //填充颜色。当参数为空时，圆形将没有填充效果。
                        strokeWeight: 3,       //边线的宽度，以像素为单位。
                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        strokeStyle: 'dashed' //边线的样式，solid或dashed。
                    };

                    var polygon = new google.maps.Polygon(options);
                    polygon.setPaths(pointsArr);

                    MapToolbar.removeFeature('shape', MapToolbar.currentFeature.id.substring(6));

                    polygon.id = MapToolbar.currentFeature.id;
                    overlays[index] = polygon;

                    polygon.markers = new google.maps.MVCArray;

                    MapToolbar.features.shapeTab[polygon.id] = polygon;

                    polygon.setMap(map);

                    if(editArea){
                        t.closest(".area").before(newArea);
                        t.closest(".area").remove();
                    }else{
                        $(".mapview .area:last").remove();
                        $(".add-area").before(newArea);
                    }

                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    // overlays = [];
                    MapToolbar.stopEditing();

                    defaultPolygon[count-1] = [];
                    defaultPolygon[count-1]['qisong'] = qsprice;
                    defaultPolygon[count-1]['peisong'] = psprice;
                    defaultPolygon[count-1]['polygon'] = polygon;

                    MapToolbar.select('hand_b');

                    if(count >= 10){
                        $(".add-area").addClass("add-area-disabled");
                    }

                    editArea = 0;

                }else{
                    alert("请先绘制配送范围！");
                }
            });


            //编辑区域
            $(".mapview").delegate(".J-edit", "click", function(){

                var t = $(this).closest(".area"), overlayVal = t.attr("data-points"), qs = t.attr("data-qisong"), ps = t.attr("data-peisong"), dindex = t.attr("data-index"), index = t.index();
                editArea = dindex;
                if(overlayVal != ""){
                    var bounds = new google.maps.LatLngBounds();
                        var points = [];
                        var overlayArr = overlayVal.split("|");
                        for(var o = 0; o < overlayArr.length; o++){
                            var overlayItem = overlayArr[o].split(",");
                            points.push(new google.maps.LatLng(overlayItem[1], overlayItem[0]));
                            bounds.extend(new google.maps.LatLng(overlayItem[1], overlayItem[0]));
                        }

                        var color = getColor(index);
                        styleOptions['strokeColor'] = color;
                        styleOptions['fillColor'] = color;
                        var polygon = new google.maps.Polygon(styleOptions);
                        polygon.setPaths(points);
                        MapToolbar.removeFeature('shape', dindex);

                        polygon.id = 'shape_' + dindex;
                        overlays[dindex-1] = polygon;

                        polygon.markers = new google.maps.MVCArray;

                        MapToolbar.features.shapeTab[polygon.id] = polygon;
                        MapToolbar.currentFeature = MapToolbar.features.shapeTab[polygon.id];
                        polygon.setMap(map);

                        polygon.setEditable(true);

                        polygon.markers = new google.maps.MVCArray;

                        MapToolbar.features.shapeTab[polygon.id] = polygon;

                        //监听覆盖拖动，更新坐标
                        google.maps.event.addListener(polygon, "dragend", function(event) {
                            var id = this.id;
                            for(var o = 0; o < overlays.length; o++){
                                if(overlays[o].id == id){
                                    overlays[o] = this;
                                }
                            }
                            updateLatlng();
                        });

                    //map.fitBounds(bounds);

                }else{
                    MapToolbar.initFeature('shape');
                }


                var btn = $(".add-area");
                var template = $("#addNewArea").html();
                btn.addClass("add-area-disabled");
                $(".mapview").find(".edit-opr").addClass("hide");
                template = template.replace("areaCount", "area"+(index+1));
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price input").val(qs);
                $(".shipping-fee input").val(ps);
                t.closest(".area").remove();

                $(".new-area").hide();


            });


            //删除区域
            $(".mapview").delegate(".J-del", "click", function(){

                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

                if(confirm("确认要删除吗？")){

                    MapToolbar.removeFeature('shape');

                    defaultPolygon.splice((index-1), 1);
                    $(".mapview .area").remove();

                    var newDefaultPolygon = [];
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'], qisong = defaultPolygon[i]['qisong'], peisong = defaultPolygon[i]['peisong'];

                        if(polygon){
                            var pointsArr = [], pointsList = [];
                            var paths = polygon.getPath();
                            var pathArray = paths.getArray();
                            for(var p = 0; p < pathArray.length; p++){
                                pointsArr.push(new google.maps.LatLng(pathArray[p].lat(), pathArray[p].lng()));
                                pointsList.push(pathArray[p].lng()+","+pathArray[p].lat());
                            }

                            var options = {
                                strokeColor:getColor(i), //边线颜色。
                                fillColor:getColor(i),          //填充颜色。当参数为空时，圆形将没有填充效果。
                                strokeWeight: 3,       //边线的宽度，以像素为单位。
                                strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                                strokeStyle: 'dashed' //边线的样式，solid或dashed。
                            };

                            var polygon = new google.maps.Polygon(options);
                            polygon.setPaths(pointsArr);
                            polygon.id = 'shape_'+(i+1);
                            MapToolbar.features.shapeTab[polygon.id] = polygon;
                            polygon.setMap(map);
                            overlays.push(polygon);

                            newDefaultPolygon[i] = [];
                            newDefaultPolygon[i]['qisong'] = qisong;
                            newDefaultPolygon[i]['peisong'] = peisong;
                            newDefaultPolygon[i]['polygon'] = polygon;

                            var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-qisong="'+qisong+'" data-peisong="'+peisong+'">';
                                newArea += '<div class="area-boder">';
                                newArea += '        <div class="clearfix">';
                                newArea += '            <span class="item-title pull-left">配送范围</span>';
                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                                newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                                newArea += '                <i class="c-gray"> / </i>';
                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                                newArea += '            </span>';
                                newArea += '        </div>';
                                newArea += '        <span class="J-min-price min-price">';
                                newArea += '            <span>起送价 </span>';
                                newArea += '            <span class="fr J-value"><i>'+qisong+'</i> 元</span>';
                                newArea += '        </span>';
                                newArea += '        <span class="J-shipping-fee shipping-fee">';
                                newArea += '            <span class="shipping-fee-text">配送费 </span>';
                                newArea += '            <span class="fr J-value"><i>'+peisong+'</i> 元</span>';
                                newArea += '        </span>';
                                newArea += '    </div>';
                                newArea += '</div>';

                            $(".add-area").before(newArea);
                        }
                    }

                    defaultPolygon = newDefaultPolygon;

                };

            });

            initialize();

            //拖动地图
            $("#hand_b").bind("click", function(){
                MapToolbar.stopEditing();
            });

            //画多边形
            $("#shape_b").bind("click", function(){
                MapToolbar.initFeature('shape');
            });

            //删除
            $(".del").bind("click", function(){
                MapToolbar.removeFeature('shape');
            });
          }else if(site_map == "amap"){
              var overlays = [];
          mapview =  new AMap.Map("mapview", {enableMapClick: false});
         var lng = $("#coordinate_y_").val();
         var lat = $("#coordinate_x_").val();
         if(lng!='' &&lat!='' ){

           mapview.setZoomAndCenter(14, [lng, lat]); //同时设置地图层级与中心点
           var marker = new AMap.Marker({
              position: [lng, lat],
          });
           mapview.add(marker);
         }else{
            mapview.setZoom(14)
         }


         //初始加载已有区域

        $(".mapview").find(".area").each(function(index){
            var t = $(this), points = t.attr("data-points"), qisong = t.attr("data-qisong"), peisong = t.attr("data-peisong");

            if(points != "" && points != undefined){
                var pointsArr = [];
                var paths = points.split("|");
                for(var p = 0; p < paths.length; p++){
                    var path = paths[p].split(",");
                    pointsArr.push(new AMap.LngLat(path[0], path[1]));
                }

                var options = {
                    strokeColor:getColor(index), //边线颜色。
                    fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 3,       //边线的宽度，以像素为单位。
                    strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                    fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                    strokeStyle: 'dashed' //边线的样式，solid或dashed。
                };

                var polygon = new AMap.Polygon({
                  path: pointsArr,
                  strokeColor:getColor(index),
                  fillColor:'',
                  strokeWeight: 3,       //边线的宽度，以像素为单位。
                  strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                  fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                  strokeStyle: 'dashed' //边线的样式，solid或dashed。
                });
                mapview.add(polygon);

                defaultPolygon[index] = [];
                defaultPolygon[index]['qisong'] = qisong;
                defaultPolygon[index]['peisong'] = peisong;
                defaultPolygon[index]['polygon'] = polygon;
            }
        });

        var polyEditor,mouseTool;

        function drawingManager(tr){//鼠标绘制多边形

          AMap.plugin(["AMap.MouseTool"],function () {
              mouseTool = new AMap.MouseTool(mapview);
          });
          mouseTool.on('draw',function(e){//绘制结束
              overlays.push(e.obj);
              mouseTool.close()//关闭 一次只绘制一个
              if(drawType == 'poly'){
                AMap.plugin(["AMap.PolyEditor"],function () {
                  polyEditor = new AMap.PolyEditor(mapview,e.obj);
                });
              }else{
                AMap.plugin(["AMap.CircleEditor"],function () {
                  polyEditor = new AMap.CircleEditor(mapview,e.obj);
                });
              }
              polyEditor.open();//打开编辑


          });
          if(drawType == 'poly'){
            mouseTool.polygon({
              fillColor:styleOptions['fillColor'],
              strokeColor: styleOptions['strokeColor']
            });
          }else{
            mouseTool.circle({
              fillColor:styleOptions['fillColor'],
              strokeColor: styleOptions['strokeColor']
              //同Circle的Option设置
            });
          }
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
               drawingManager();
             }
           });

           //删除新增未保存的区域
           $(".mapview").off('click').delegate(".J-remove", "click", function(){
               var t = $(this);

               if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
                   $(".mapview").find(".edit-opr").removeClass("hide");
                   $(".add-area").removeClass("add-area-disabled");

                   if(overlays !=''){
                       mapview.remove(overlays[0]);
                       polyEditor.close();
                   }

                   mouseTool.close();
                   overlays = [];


                   if(editArea){

                       var data = defaultPolygon[editArea-1];
                       var points = data['polygon'].getPath();
                       var pointsArr = [], pointsList = [];
                       if(points){
                           for (var i = 0; i < points.length; i++) {
                               pointsArr.push(points[i].lng+","+points[i].lat);
                               var ePath = [];
                               ePath.push(points[p].lng, points[p].lat);
                               pointsList.push(ePath);
                           }
                       }

                       var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-qisong="'+data['qisong']+'" data-peisong="'+data['peisong']+'">';
                           newArea += '<div class="area-boder">';
                           newArea += '        <div class="clearfix">';
                           newArea += '            <span class="item-title pull-left">配送范围</span>';
                           newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                           newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                           newArea += '                <i class="c-gray"> / </i>';
                           newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                           newArea += '            </span>';
                           newArea += '        </div>';
                           newArea += '        <span class="J-min-price min-price">';
                           newArea += '            <span>起送价 </span>';
                           newArea += '            <span class="fr J-value"><i>'+data['qisong']+'</i> 元</span>';
                           newArea += '        </span>';
                           newArea += '        <span class="J-shipping-fee shipping-fee">';
                           newArea += '            <span class="shipping-fee-text">配送费 </span>';
                           newArea += '            <span class="fr J-value"><i>'+data['peisong']+'</i> 元</span>';
                           newArea += '        </span>';
                           newArea += '    </div>';
                           newArea += '</div>';


                       var polygon = new AMap.Polygon({
                           path:pointsList,
                           strokeColor:getColor((editArea-1)), //边线颜色。
                           fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                           strokeWeight: 3,       //边线的宽度，以像素为单位。
                           strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                           fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                           strokeStyle: 'dashed' //边线的样式，solid或dashed。
                       });

                       mapview.add(polygon);

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
                       pointsArr.push([path[p].lng, path[p].lat]);
                   }
                   var count = editArea ? editArea : $(".mapview").find(".area").length;
                   var qsprice = t.closest(".area").find(".min-price input").val();
                   var psprice = t.closest(".area").find(".shipping-fee input").val();

                   if(!/^(\d+)(\.\d+)?$/.test(qsprice) || !/^(\d+)(\.\d+)?$/.test(psprice)){
                       alert("起送价格和配送费必须设置为数字，请修改后保存！");
                       return false;
                   }

                   if(count > 10){
                       alert("最多设置10个配送区域！");
                       return false;
                   }

                     var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-qisong="'+qsprice+'" data-peisong="'+psprice+'">';
                         newArea += '<div class="area-boder">';
                         newArea += '        <div class="clearfix">';
                         newArea += '            <span class="item-title pull-left">配送范围</span>';
                         newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                         newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                         newArea += '                <i class="c-gray"> / </i>';
                         newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                         newArea += '            </span>';
                         newArea += '        </div>';
                         newArea += '        <span class="J-min-price min-price">';
                         newArea += '            <span>起送价 </span>';
                         newArea += '            <span class="fr J-value"><i>'+qsprice+'</i> 元</span>';
                         newArea += '        </span>';
                         newArea += '        <span class="J-shipping-fee shipping-fee">';
                         newArea += '            <span class="shipping-fee-text">配送费 </span>';
                         newArea += '            <span class="fr J-value"><i>'+psprice+'</i> 元</span>';
                         newArea += '        </span>';
                         newArea += '    </div>';
                         newArea += '</div>';



                     var polygon = new AMap.Polygon({
                         path:pointsArr,
                         strokeColor:getColor((count-1)), //边线颜色。
                         fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                         strokeWeight: 3,       //边线的宽度，以像素为单位。
                         strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                         fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                         strokeStyle: 'dashed' //边线的样式，solid或dashed。
                     });
                     mapview.add(polygon); //保存绘制自定的多边形

                     if(editArea){
                         t.closest(".area").before(newArea);
                         t.closest(".area").remove();
                     }else{
                         $(".mapview .area:last").remove();
                         $(".add-area").before(newArea);
                     }

                     $(".mapview").find(".edit-opr").removeClass("hide");
                     $(".add-area").removeClass("add-area-disabled");
                     mapview.remove(overlays[0]);
                     overlays = [];
                     polyEditor.close();//关闭编辑状态
                     drawType = "poly";

                     defaultPolygon[count-1] = [];
                     defaultPolygon[count-1]['qisong'] = qsprice;
                     defaultPolygon[count-1]['peisong'] = psprice;
                     defaultPolygon[count-1]['polygon'] = polygon;

                     if(count >= 10){
                         $(".add-area").addClass("add-area-disabled");
                     }

                     editArea = 0;

                     if($(".J-save").attr('data-edit') == '1'){
                         polyEditor.close();
                         console.log(polyEditor)
                         $(".J-save").removeAttr('data-edit');
                     }
                 }else{
                     alert("请先绘制配送范围！");
                 }
             });


           $(".mapview").delegate(".J-change-type", "click", function(){
               var t = $(this), val = t.val(), index = t.parent().index();
               if(drawType != val){
                   //多边形
                   drawType = val;
                   drawingManager();


                   $(".edit-type .J-type-area").hide();
                   $(".edit-type .J-type-area:eq("+index+")").show();
               }
           });

           //编辑区域
            $(".mapview").delegate(".J-edit", "click", function(){
              var t = $(this), index = t.closest(".area").index(), qs = t.closest(".area").attr("data-qisong"), ps = t.closest(".area").attr("data-peisong"), points = t.closest(".area").attr("data-points");
              editArea = index + 1;
              mapview.remove(defaultPolygon[index]['polygon']);

                var pointsList = [];
                var pointsArr = points.split("|");
                for(var p = 0; p < pointsArr.length; p++){
                    var point = pointsArr[p].split(",");
                    pointsList.push(point);
                }

                var color = getColor(index);
                styleOptions['strokeColor'] = color;
                styleOptions['fillColor'] = color;

                if(drawType == 'poly'){
                  var polygonE = new AMap.Polygon({
                    path:pointsList,
                    fillColor:styleOptions['fillColor'],
                    fillOpacity:.4,
                    strokeColor: styleOptions['strokeColor']
                  });
                  mapview.add(polygonE); //保存绘制自定的多边形

                  AMap.plugin(["AMap.PolyEditor"],function () {
                    polyEditor = new AMap.PolyEditor(mapview,polygonE);
                  });
                }else{
                  var polygonE = new AMap.Circle({
                    path:pointsList,
                    fillColor:styleOptions['fillColor'],
                    strokeColor: styleOptions['strokeColor']
                  });
                  mapview.add(polygonE); //保存绘制自定的多边形
                  AMap.plugin(["AMap.CircleEditor"],function () {
                    polyEditor = new AMap.CircleEditor(mapview,polygonE);
                  });

                }
                polyEditor.open();

                overlays[0] = polygonE;

                var btn = $(".add-area");
                var template = $("#addNewArea").html();
                btn.addClass("add-area-disabled");
                $(".mapview").find(".edit-opr").addClass("hide");
                template = template.replace("areaCount", "area"+(index+1));
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price input").val(qs);
                $(".shipping-fee input").val(ps);
                t.closest(".area").remove();

            });

            //删除区域 已经画完的
           $(".mapview").delegate(".J-del", "click", function(){

               var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

               if(confirm("确认要删除吗？")){

                   //先删除地图上已有的多边形
                   for (var i = 0; i < defaultPolygon.length; i++) {
                       var polygon = defaultPolygon[i]['polygon'];
                       mapview.remove(polygon);
                   }

                   defaultPolygon.splice((index-1), 1);//删除 index-1 开始的一个 就是删除本身
                   $(".mapview .area").remove();

                   var newDefaultPolygon = [];
                   //循环画出剩下的图形 和 内容
                   for (var i = 0; i < defaultPolygon.length; i++) {
                       var polygon = defaultPolygon[i]['polygon'], qisong = defaultPolygon[i]['qisong'], peisong = defaultPolygon[i]['peisong'];
                       if(polygon){
                           var pointsArr = [], pointsList = [];
                           var paths = polygon.getPath();
                           for(var p = 0; p < paths.length; p++){
                               pointsList.push(paths[p].lng + "," + paths[p].lat);
                               var ePath = [];
                               ePath.push(paths[p].lng, paths[p].lat);
                               pointsArr.push(ePath);
                            }

                           var polygon = new AMap.Polygon({
                             path:pointsArr,
                               strokeColor:getColor(i), //边线颜色。
                               fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                               strokeWeight: 3,       //边线的宽度，以像素为单位。
                               strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                               fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                               strokeStyle: 'dashed' //边线的样式，solid或dashed。
                           });

                           mapview.add(polygon);

                           newDefaultPolygon[i] = [];
                           newDefaultPolygon[i]['qisong'] = qisong;
                           newDefaultPolygon[i]['peisong'] = peisong;
                           newDefaultPolygon[i]['polygon'] = polygon;


                           var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-qisong="'+qisong+'" data-peisong="'+peisong+'">';
                               newArea += '<div class="area-boder">';
                               newArea += '        <div class="clearfix">';
                               newArea += '            <span class="item-title pull-left">配送范围</span>';
                               newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                               newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                               newArea += '                <i class="c-gray"> / </i>';
                               newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                               newArea += '            </span>';
                               newArea += '        </div>';
                               newArea += '        <span class="J-min-price min-price">';
                               newArea += '            <span>起送价 </span>';
                               newArea += '            <span class="fr J-value"><i>'+qisong+'</i> 元</span>';
                               newArea += '        </span>';
                               newArea += '        <span class="J-shipping-fee shipping-fee">';
                               newArea += '            <span class="shipping-fee-text">配送费 </span>';
                               newArea += '            <span class="fr J-value"><i>'+peisong+'</i> 元</span>';
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

        }
    });

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
    if($("#cityid").val() == ''){
        $.dialog.alert("请选择城市");return false;

    }

    btn.attr("disabled", true);

    $.ajax({
        url: action,
        type: "post",
        data: data,
        dataType: "json",
        success: function(res){
            if(res.state == 100){
                $.dialog({
					title: '提醒',
					icon: 'success.png',
					content: '保存成功！',
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
            $.dialog.alert("网络错误，保存失败！");
            btn.attr("disabled", false);
        }
    })

    return false;

}




// 定位
// 百度地图
if($("#coordinate_x_").val() == "" && $("#coordinate_y_").val() == ""){
  if (site_map == "baidu") {
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

  // 谷歌地图
  }else if (site_map == "google") {
    if (navigator.geolocation) {
      //获取当前地理位置
      navigator.geolocation.getCurrentPosition(function(position) {

          var coords = position.coords;
          lat = coords.latitude;
          lng = coords.longitude;

          $("#coordinate_x_").val(lat);
          $("#coordinate_y_").val(lng);

      }, function getError(error){
          switch(error.code){
               case error.TIMEOUT:
                    // alert('超时');
                    break;
               case error.PERMISSION_DENIED:
                    // alert('用户拒绝提供地理位置');
                    break;
               case error.POSITION_UNAVAILABLE:
                    // alert('地理位置不可用');
                    break;
               default:
                    break;
          }
     })
    }else {
      alert('不支持')
    }
  }
}
