$(function(){
	//销量，人气，价格
	$(".pp-right .select span.left").hover(function(){
		var $this=$(this);
		$this.find("ul").show();
	},function(){
		var $this=$(this);
		$this.find("ul").hide();
	})

	$(".pp-right .select ul li").on("click",function(){
		var $this=$(this),con,preCon;
		con=$this.text();
		$this.parent("ul").siblings("em").text(con);
		$this.parent("ul").siblings("em").addClass("on");
		$this.parents("span").siblings("span").children().removeClass("on");
		$this.parents("span").siblings("span").removeClass("on");
		$this.parent("ul").hide();
	})

	$(".pp-right .select span.zh").on("click",function(){
		var $this=$(this);
		$this.addClass("on");
		$this.siblings("span").children().removeClass("on");
	})

	//上分页
	$(".pp-right .right a.next").on("click",function(){
		$(".pp-right .right a.pre").removeClass("on");
		var $this=$(this);
		var t=parseInt($(".pp-right .right label").text());
		var k=parseInt($(".pp-right .right em").text());
		if(k<t){
			k=k+1;
			$(".pp-right .right em").text(k)
		    if(k==t){
			$this.addClass("on");}
		}

	})

	$(".pp-right .right a.pre").on("click",function(){
		$(".pp-right .right a.next").removeClass("on");
		var $this=$(this);
		var k=parseInt($(".pp-right .right em").text());
		if(k>1){
			k=k-1;
			$(".pp-right .right em").text(k)
			if(k==1){
			$this.addClass("on");}
		}
	})
	


	//品牌列表页--条件选择
	$(".select p a").on("click",function(){
		$this=$(this);
		$this.addClass("on").siblings("a").removeClass("on");
	})
});