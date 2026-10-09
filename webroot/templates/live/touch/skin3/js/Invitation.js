$(function(){



    $('.module .module-list li').click(function(){

        var t = $(this),index = t.index();

        if(!t.hasClass('active')){

            t.addClass('active');

            t.find('.chooseed-box').css('display','flex');

            t.siblings().removeClass('active');

            t.siblings().find('.chooseed-box').css('display','none');

        }



        $(".main ul li:eq("+index+")").find('img').each(function(){

           $(this).attr('src', $(this).attr('data-src'));

        });



        $(".main ul li:eq("+index+")").addClass('show').show();

        $(".main ul li:eq("+index+")").removeClass('show').siblings().hide();



        html2canvas(document.querySelector("#main ul"), {

            'backgroundColor': null,

            'time':0,

            'useCORS':true

        }).then(canvas => {

            var a = canvasToImage(canvas);

       		 $('.drawImg').html(a);

       		

    	});

    });

    $('.module .module-list li:eq(0)').click();







    function canvasToImage(canvas) {

        var image = new Image();

        image.src = canvas.toDataURL("image/png");  //把canvas转换成base64图像保存

        return image;

    }



    // $('.drawImg').delegate('img', 'click', function(){

    //     window.open($(this).attr('src'));

    // });


//长按
var flag=1  //设置长按标识符
var timeOutEvent=0;

$(".drawImg").on({
        touchstart: function(e){
            if(flag){
                clearTimeout(timeOutEvent);
                timeOutEvent = setTimeout("longPress()",800);
                // alert("长按")
            }
            // e.preventDefault();
        },
        touchmove: function(){
                clearTimeout(timeOutEvent); 
                timeOutEvent = 0; 
        },
        touchend: function(){
            if(timeOutEvent){ 
                console.log("这是点击，不是长按"); 
            }else{
                flag=1;

            }
            clearTimeout(timeOutEvent);
            return false; 
        }
    });










})


//长按执行的方法 
function longPress(){ 
    var imgsrc = $(".drawImg").find('img').attr('src');
    if(imgsrc==''||imgsrc==undefined){
        alert('下载失败，请重试');
        return 0
    } 
    flag=0;
    if(device.indexOf('huoniao_Android') > -1){
            
            utils.setStorage("huoniao_poster", imgsrc);
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler(
                    'saveImage',
                    {'value': "huoniao_poster"},
                    function(responseData){
                        if(responseData == "success"){
                            setTimeout(function(){
                                flag=1;
                            }, 200)
                        }
                    }
                );
            });
        }else{
           setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler(
                    'saveImage',
                    {'value': imgsrc},
                    function(responseData){
                        if(responseData == "success"){
                            setTimeout(function(){
                                flag=1;
                            }, 200)
                        }
                        
                    },

                );
            });
    
    }
} 




























