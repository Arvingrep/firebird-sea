function stretchAd(id, small, large, height1, height2, adtime){
	var intervalid;
	var listtime = adtime ? adtime : 0;
	daojishi = function() {
		$(".adClose i").show();
		$(".adClose i").html(listtime);
		listtime--;
		if (listtime < 0) {
			adclose();
		}
	};
	adopen = function () {
		$("#stretch_body_"+id).html(large);
		$("#stretch_"+id).stop().animate({
			height: height2+"px"
		}, 500,	function() {
			$("#stretch_"+id).find("span").removeClass("kai")
			$(".adClose i").html("");
			listtime = adtime;
			intervalid = setInterval("daojishi()", 1000)
		});
	};
	adclose = function () {
		clearInterval(intervalid);
		$("#stretch_"+id).stop().animate({
			height: height1+"px"
		}, 500,	function() {
			$("#stretch_body_"+id).html(small);
			$("#stretch_"+id).find("span").addClass("kai")
			$(".adClose i").html("");
		});
	};
	$("#stretch_"+id).find("span").click(function() {
		if ($(this).attr("class") != "kai") {
			$(".adClose i").html("");
			adclose();
		} else if ($(this).attr("class") == "kai") {
			adopen();
		}
	});
	setTimeout(adopen, 500);
}
