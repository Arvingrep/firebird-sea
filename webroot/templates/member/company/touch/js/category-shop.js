$(function(){
	var hasEdit = false;
	var delIds = [];
	//新增一级分类
  	$('.addNewType').click(function(){
  		var sbm = $('.list');
  		var mealHtml = [];
  		mealHtml.push('<div class="item" data-id="">');
  		mealHtml.push('    <div class="oprmeal">');
        mealHtml.push('    	<a href="javascript:;" class="opra"></a>');
		mealHtml.push('    	<div class="downItem">');
		mealHtml.push('	        <ul class="downList">');
		mealHtml.push('	          <li class="mealUp"><span>上移</span></li>');
		mealHtml.push('	          <li class="mealDown"><span>下移</span></li>');
		mealHtml.push('	          <li class="mealDel"><span>删除</span></li>');
		mealHtml.push('	        </ul>');
		mealHtml.push('    	</div>');
        mealHtml.push('    </div>');
        mealHtml.push('<div class="itemWrap">');
		mealHtml.push('	<div class="itemList">'); 
        mealHtml.push('  <div class="itemHead">');
        mealHtml.push('    <input type="text" class="itemname" placeholder="输入分类名称">');
        mealHtml.push('  </div>');

        mealHtml.push('  <div class="subWrap"></div>');
        mealHtml.push('  <div class="addbox"><a href="javascript:;" class="addbtn"><i></i>添加下级分类</a></div>');
        mealHtml.push('</div>');
		mealHtml.push('</div>');
        mealHtml.push('</div>');
	    sbm.prepend(mealHtml.join(''));
  	})
  	//增加子类
  	$('.list').delegate('.addbox','click',function(){
  		var sbm = $(this).siblings('.subWrap');
  		var mealHtml = [];
  		mealHtml.push('<div class="inptitbox fn-clear" data-id="">  ');
		mealHtml.push('    <div class="inptitle">');
		mealHtml.push('      <input type="text" placeholder="输入子分类名称" value="" class="subname">');
		mealHtml.push('    </div>');
		mealHtml.push('    <a href="javascript:;" class="remove"></a>');
	  	mealHtml.push('</div>');
  		sbm.append(mealHtml.join(''));
  		$(this).closest(".itemWrap").css('height','auto');
  	})	
    //上移下移-显示
  	$('.list').delegate('.opra','click',function(){
	  	if(!$(this).hasClass('opcick')){
	  		$(this).addClass('opcick');
	  		$('.downItem').removeClass('show');
	  		$(this).siblings('.downItem').addClass('show');
	  	}else{
	  		$(this).removeClass('opcick');
	  		$(this).siblings('.downItem').removeClass('show');
	  	}
	})


  

  	//分类上移
  	$('.list').delegate('.mealUp','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    $('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
	    var par = $(this).closest('.item');
	    $('.mealUp').addClass('disabled');
	    if(par.prev().size()>0){
	      var hh1 = par.outerHeight(true);
	      var hh2 = par.prev().outerHeight(true);
	      par.animate({'transform':'translateY(-'+hh2+'px)'},300);
	      par.prev().animate({'transform':'translateY('+hh1+'px)'},300);
	      setTimeout(function(){
	        $('.list .item').css('transform','translateY(0)');
	        par.prev().before(par);
	      },1000)
	    }
	    setTimeout(function(){
	      $('.mealUp').removeClass('disabled')
	    },500)
  	})

    //分类下移
  	$('.list').delegate('.mealDown','click',function(){
	    if($(this).hasClass('disabled')) return false;
	    $('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
	    var par = $(this).closest('.item');
	    $('.mealDown').addClass('disabled');
	    if(par.next().size()>0){
	      var hh1 = par.outerHeight(true);
	      var hh2 = par.next().outerHeight(true);
	      par.animate({'transform':'translateY('+hh2+'px)'},300);
	      par.next().animate({'transform':'translateY(-'+hh1+'px)'},300);
	      setTimeout(function(){
	        $('.list .item').css('transform','translateY(0)');
	        par.next().after(par);
	      },500)
	    }
	    setTimeout(function(){
	      $('.mealDown').removeClass('disabled')
	    },500)
  	})
  	//一级分类删除
  	$('.list').delegate('.mealDel','click',function(){
  		$('.downItem').removeClass('show');
	    $('.opra').removeClass('opcick');
  		var par = $(this).closest('.item'),id = par.attr('data-id');
  		var popOptions = {
	          title:'确定删除？',
	          confirmTip:'此分类下的所有二级分类也将同时删除',
	          btnColor:'#3377FF',
	          isShow:true
	    }
	    confirmPop(popOptions,function(){
	    	par.remove();
	    	hasEdit = true;
	    })
	    if(id) delIds.push(id);

  	})
  	//二级分类删除
  	$('.list').delegate('.remove','click',function(){
  		var t =$(this);
  		var par = t.closest(".inptitbox"),id = par.attr('data-id');
  		var popOptions = {
	          title:'确定删除此分类？',
	          btnColor:'#3377FF',
	          isShow:true
	    }
	    confirmPop(popOptions,function(){
			t.closest(".itemWrap").css('height','auto');
	    	par.remove();
	    	hasEdit = true;
	    })
	    if(id) delIds.push(id);
  	})	
  	//展开收起
	$('.list').delegate('.subMore','click',function(){
		var par = $(this).siblings('.itemWrap');
		var itemH = par.find('.itemList').height();
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr').html('<a href="javascript:;">收起<i></i></a>');
			par.addClass('show').css('height',itemH+'px');
		}else{
			$(this).removeClass('curr').html('<a href="javascript:;">展开<i></i></a>');
			par.removeClass('show').css('height','2.11rem');
		}
		
	})
	//已有分类 输入后无名称
	$(".list").delegate("input", "blur", function(){
		var par = $(this).closest('.item');
		if(par.hasClass('hasItem')){
			if($(this).val() == ''){
				showMsg('请输入分类名称');
			}
		}
	})


	$(".list").delegate("input", "change", function(){
		hasEdit = true;
	})
	//保存
  	$('#tj').click(function(){
    	var btn = $(this),btntxt = btn.text();
    	if(btn.hasClass("disabled")) return;
    	var first = $(".item"), json = [];
		first.each(function(){
			var oldname =  $(this).attr('data-name');
			var id = $(this).attr('data-id')?$(this).attr('data-id'):'';
			var tname = $(this).find('.itemname').val()?$(this).find('.itemname').val():'';
			var inpbox = $(this).find('.inptitbox');
			if($(this).hasClass('hasItem')){//已有分类
				tname == ''?oldname:tname;
			}
			if(tname !='' && tname !='undefined'){
				if(inpbox.length > 0 ){//有二级分类
					var subArr = [];
					inpbox.each(function(){
						var tt = $(this);
						var tid = tt.attr('data-id')?$(this).attr('data-id'):'';
						var ssval = tt.find('.subname').val(),told = tt.find('.subname').attr('data-name');
						if(tid!=''){//已有分类
							ssval == ''?told:ssval;
						}
						if(ssval != ""){
							subArr.push({'id':tid,'name':ssval});
						}
					})
					if(subArr.length>0){
						json.push({'id':id,'name':tname,'lower':subArr});
					}else{//二级都未填写
						json.push({'id':id,'name':tname,'lower':null});
					}
					
				}else{//没有二级分类
					json.push({'id':id,'name':tname,'lower':null});
				}
			}
			
		})


	    if(json.length == 0 && delIds.length == 0) return false;
	    btn.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
	    console.log(json);
	    $.ajax({
	      url: "/include/ajax.php?service=shop&action=operaCategory",
	      type: 'post',
	      data: {data: JSON.stringify(json)},
	      dataType: 'json',
	      success: function(data){
	        if(data.state == 100){
	          	if(delIds.length){
	            	$.post("/include/ajax.php?service=shop&action=delCategory&id="+delIds.join(","));
	            	delIds = [];
	          	}
	          	showMsg(data.info);
	          	setTimeout(function(){
					location.reload();
	          	},500)
	          
	        }else{
	          showMsg(data.info);
	        }
	        btn.removeClass("disabled").html(btntxt);
	      },
	      error: function(){
	        showMsg(langData['siteConfig'][6][203]);//网络错误，请重试！
	        btn.removeClass("disabled").html(btntxt);
	      }
	    })

	})



	$(".goBack").removeAttr('onclick')
	$(".goBack").click(function(){
		if(hasEdit){
			var popOptions = {
		        title:'是否保存本次修改的信息',
		        btnColor:'#3377FF',
		        isShow:true
		    }
		    confirmPop(popOptions,function(){
		    	$("#tj").click();
		    },function(){
		    	history.go(-1);
		    })
		}else{
			history.go(-1);
		}
	})


})

// 错误提示
function showMsg(str){
  var o = $(".fixerror");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
