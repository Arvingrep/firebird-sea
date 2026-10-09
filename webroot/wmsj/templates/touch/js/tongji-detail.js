var p = [], path1 = [], path2 = [], p_mouseOver = [], p_mouseOut = [],
		banner = $(".banner"), atpage = 1, totalCount = 0, pageSize = 9, loadType = 1, covertypeid = "rec";
		// defaultImg = banner.css("background-image").replace("url(", "").replace(")", "");

$(function(){

	// 日历
	$('.calendar').click(function(){
		var wrap = $('.out-wrap');
		if (wrap.hasClass('show')) {
			wrap.removeClass('show');
		}else {
			wrap.addClass('show');
		}
	})




  //环状图  参数：画图区域id
	function DdmChart(canvasId){
		var _R = Raphael;
		var _canvas = document.getElementById(canvasId);
		this._paper = _R(_canvas);
	}

	DdmChart.prototype.Doughnut = function(data, setting){
		var _this = this;
		var rad = Math.PI / 180; //角度、弧度换算
		var dataLength = data.length;
		var total = 0;
		for(i = 0; i < dataLength; i++) total+=Number(data[i].value); //求data.value和
		var s = 0, e = 0; //起始，结束角百分度
		this._paper.setStart();
		for(var i = 0; i < dataLength; i++){
			(function(i){
				//当前部分的结束角
				e = data[i].value / total;
				//基础路径与hover路径
				path1.push(doughnut_path(setting.cx, setting.cy, setting.r1, setting.r2, s*359.99999, (s+e)*359.99999)),
				path2.push(doughnut_path_hover(setting.cx, setting.cy, setting.r1, setting.r2, s*359.99999, (s+e)*359.99999));
				p.push(_this._paper.path(path1[i]).attr({"fill":data[i].color,"stroke":"#ffffff"}).attr('stroke-width', '1.5'));
				p_mouseOver.push(function(){p[i].animate({"path":path2[i]},200); $("#chart-detail").find("li:eq("+i+")").addClass("curr");}),
				p_mouseOut.push(function(){p[i].animate({"path":path1[i]},200); $("#chart-detail").find("li").removeClass("curr");});
				s += e;
			})(i);
		}
		var st = this._paper.setFinish();
		return st;

		//绘制环状图(返回path)
		function doughnut_path(cx,cy,r1,r2,startAngle,endAngle){
			var x1 = cx + r1 * Math.cos(-startAngle * rad), y1 = cy + r1 * Math.sin(-startAngle * rad),
			x2 =  cx + r2 * Math.cos(-startAngle * rad), y2 = cy + r2 * Math.sin(-startAngle * rad),
			x3 =  cx + r2 * Math.cos(-endAngle * rad), y3 = cy + r2 * Math.sin(-endAngle * rad),
			x4 =  cx + r1 * Math.cos(-endAngle * rad), y4 = cy + r1 * Math.sin(-endAngle * rad);	  //四点坐标
			return ["M",x2,y2,"A",r2,r2, 0, +(endAngle - startAngle > 180),0,x3,y3,"L",x4,y4,"A",r1,r1,0,+( endAngle - startAngle > 180),1,x1,y1,"z"];
		}
		function doughnut_path_hover(cx,cy,r1,r2,startAngle,endAngle){
			// r1 = r1;
			r2 = r2 + 8;
			var x1 = cx + r1 * Math.cos(-startAngle * rad), y1 = cy + r1 * Math.sin(-startAngle * rad),
			x2 =  cx + r2 * Math.cos(-startAngle * rad), y2 = cy + r2 * Math.sin(-startAngle * rad),
			x3 =  cx + r2 * Math.cos(-endAngle * rad), y3 = cy + r2 * Math.sin(-endAngle * rad),
			x4 =  cx + r1 * Math.cos(-endAngle * rad), y4 = cy + r1 * Math.sin(-endAngle * rad);	  //四点坐标
			return ["M",x2,y2,"A",r2,r2, 0, +(endAngle - startAngle > 180),0,x3,y3,"L",x4,y4,"A",r1,r1,0,+( endAngle - startAngle > 180),1,x1,y1,"z"];
		}
		//绘制环状图 end
	}

	var doughnutSetting = {"cx": 110,	"cy": 110, "r1": 77, "r2": 99};
	var data = [];
	data.push({
		"value": money,
		"color": "#64b2e9"
	});
	data.push({
		"value": freeze,
		"color": "#ffb324"
	});
	data.push({
		"value": point,
		"color": "#81cb50"
	});

	if(money == 0.00 && freeze == 0.00 && point == 0){
		data.push({
			"value": 1,
			"color": "#ccc"
		});
	}


	var chart = new DdmChart("chart");
	chart.Doughnut(data, doughnutSetting);
})
