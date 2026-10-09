$(function(){


	$('.container').delegate('.item','click',function(){
        var thisId = $(this).attr('id');
        showBigImg(thisId);

    })

    $('body').on('click', '.close', function() {
        $('.slide-box').hide();
    })

    $('body').on('click', '.prevbox', function(){
        $('#' + $(this).attr('data-id')).click();
    })
        var page=1;
    var pageSize=10;
    function showBigImg(id) {
	    thisdiv = $('#' + id);
	    var prevId = thisdiv.prev().attr('id');
	    var nextId = thisdiv.next().attr('id');
	    $('.slide-box').remove();
	    var data = [],slide=[],html=[];
        data.push("id="+id);
        // data.push("page="+page);
        // data.push("pageSize="+pageSize);
	    $.ajax({
    		 url: "/include/ajax.php?service=renovation&action=caseDetail&"+data.join("&"),
    		type: "GET",
            dataType: "jsonp",
            success: function (data) {
            	if(data && data.state == 100){
            		var list = data.info.pics;

            		var info = data.info;
            		for (var i = 0; i < list.length; i++) {

            			var pic = list[i].path != "" && list[i].path != undefined ? huoniao.changeFileSize(list[i].path, "small") : "/static/images/404.jpg";
                       	var picBig = list[i].path != "" && list[i].path != undefined ? huoniao.changeFileSize(list[i].path, "large") : "/static/images/404.jpg";
            			// var title = list[i].title;
            			var title = '';
            			var m=i+1;
            			slide.push('<a href="javascript:;" data-bigpic="'+picBig+'" data-title="'+title+'">');                        
                        slide.push('<img src="'+pic+'" alt="'+title+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');                        
                        slide.push('<div>');                        
                        slide.push('<span class="atpage" id="atpage">'+m+'</span>/<span class="tpage" id="tpage">'+list.length+'</span>');                        
                        slide.push('</div>');                        
                        slide.push('</a>');  
                        var slide2 = slide.join("");
                                                               
            		}
            			    
				    html.push('<div class="slide-box">');
				    html.push('<div class="slide">');
				    html.push('<span class="close"><img src="'+templatePath+'images/design/close.png"></span>');
				    html.push('<div class="slide-span"><span>'+info.units+'</span><span>'+info.kongjianname+'</span><span>'+info.area+'㎡</span></div>');
				    html.push('<div id="slide_big">');
				    html.push('</div>');
				    html.push('<a href="javascript:;" class="prev" id="slidebtn_prev"><s></s></a>');
				    html.push('<a href="javascript:;" class="next" id="slidebtn_next"><s></s></a>');
				    html.push('<div id="slide_small">');
				    html.push('<div class="prevbox l">');
				    html.push('<img src="">');
				    html.push('<div class="span-bg">');
				    html.push('<b>'+langData['renovation'][14][51]+'</b><span></span>');//上一套
				    html.push('</div>');
				    html.push('</div>');
				    html.push('<div class="spbox">');
				    html.push('<div class="picsmall fn-clear">');
				    html.push(slide2);			          
				    html.push('</div>');
				    html.push('</div>');
				    html.push('<div class="prevbox r">');
				    html.push('<img src="">');
				    html.push('<div class="span-bg">');
				    html.push('<b>'+langData['renovation'][14][52]+'</b><span></span>');//下一套
				    html.push('</div>');
				    html.push('</div>');
				    html.push('<a href="javascript:;" class="prev disabled" id="slidebtn2_prev"><s></s></a>');
				    html.push('<a href="javascript:;" class="next" id="slidebtn2_next"><s></s></a>');
				    html.push('</div>');
				    html.push('</div>');
				    html.push('</div>');

			         $('body').append(html.join(""));  
			         $('.prevbox').hide();
				    if(prevId != undefined){
				        var prevImgSrc = $('#' + prevId).find('img').attr('src');
				        var prevText = $('#' + prevId).find('p.name').text();
				        $('.prevbox.l').css('display', 'inline-block');
				        $('.prevbox.l').find('img').attr('src', prevImgSrc);
				        $('.prevbox.l').find('span').text(prevText);
				        $('.prevbox.l').attr('data-id', prevId);
				    }
				    if(nextId != undefined){
				        var nextImgSrc = $('#' + nextId).find('img').attr('src');
				        var nextText = $('#' + nextId).find('p.name').text();
				        $('.prevbox.r').css('display', 'inline-block');
				        $('.prevbox.r').find('img').attr('src', nextImgSrc);
				        $('.prevbox.r').find('span').text(nextText);
				        $('.prevbox.r').attr('data-id', nextId);
				    }
				    $('.slide-box').show();
				    //幻灯
				    $('.slide').picScroll();


            	}
            },
            error: function(){

            }
        })


	   
	    	
	    
	}


})
