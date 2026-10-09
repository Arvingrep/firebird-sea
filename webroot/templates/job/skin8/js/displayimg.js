$(function () {

    var imgs = new Image();
    imgs.src = $('#dragbox .scaleimg').attr('src');
    imgs.onload = function(){
        let imgw=this.width;//原始尺寸
        let imgh=this.height;
        if(imgw<imgh){
            $('#dragbox .scaleimg').css({'height':'100%'});
        }else{
            $('#dragbox .scaleimg').css({'width':'100%'});
        };
        imgw=$('#dragbox .scaleimg').width();//渲染尺寸
        imgh=$('#dragbox .scaleimg').height();
        $('#dragbox .scaleshield').width(imgw);
        $('#dragbox .scaleshield').height(imgh);
        $('#dragbox').height(imgh);

        dragFn('#dragbox .scaleshield','#dragbox .scaleimg','#dragbox .scaleshield') //拖拽
    };

    

    let timer;
    let arr=[1,1];
    //鼠标滚轮
    $('#dragbox').on('mousewheel', function (e) {
        var delta = -e.originalEvent.wheelDelta || e.originalEvent.detail;//firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120//下滚
        if (delta > 0) {
            arr=changeRation('dec','#dragbox .scaleimg','#dragbox .scaleshield',arr[0],arr[1]);
        };
        //上滚
        if (delta < 0) {
            arr=changeRation('add','#dragbox .scaleimg','#dragbox .scaleshield',arr[0],arr[1]);
        };
    });
    $('#dragbox').hover(function () { //移入禁止滚动条消失
        $('html').css({
            'overflow':'hidden',
        });
    }, function () { //移除允许滚动
        $('html').css({
            'overflow':'overlay',
        });
    });
    // 输入框点击放大（缩小）
    $('.scaleInput .add').click(function(){
        arr=changeRation('cadd','#dragbox .scaleimg','#dragbox .scaleshield',arr[0],arr[1]);
    });
    $('.scaleInput .dec').click(function(){
        arr=changeRation('cdec','#dragbox .scaleimg','#dragbox .scaleshield',arr[0],arr[1]);
    });
    // 监听输入框
    $(".scaleInput input").live('input propertychange',function(){
        let value=$(this).val();
        if(value.indexOf('%')!=-1&&value.indexOf('%')!=value.length-1){
            value=value.slice(0,value.indexOf('%'))
            $('.scaleInput input').val(`${value}%`)
            return
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            scaleFn(value,arr);       
        }, 500);
    });
    // 回车直接提交
    $('.scaleInput input').keyup(function(){
        if(event.keyCode==13){
            let value=$(this).val();
            scaleFn(value,arr);
        }
    });
});
// 改变缩放比例
// type:放大还是缩小;ele1是图片；ele2是遮罩;ratio在外面设置一个全局变量ratio=1即可;max是最大倍率;min是最小倍率
// 注：缩放的图片(遮罩不用)一定要加transform:scal(1)和transition:transform .5s;
function changeRation(type,ele1,ele2,ratio,n,max=3,min=0.6) {
    if (type == 'add'&&ratio<max) {
        if(n<0){
            n=0;
        }
        n++;
        ratio += 0.01*n+0.1; //不能写外面，因为有缩小限制
    };
    if (type == 'dec'&&ratio>min) {
        if(n>0){
            n=-1;
        }
        n--;
        ratio += 0.01*n-0.1;// 每次缩小0.01*n+0.01%,可调整(如果要用匀速放大常数0.01设置成0即可；非线性放大可以把n变成平方；线性放大就用目前的这个公式)
    };
    if(type == 'cadd'&&ratio<max){
        ratio+=0.5;
    };
    if(type == 'cdec'&&ratio>min){
        ratio-=0.5;
    };
    if(ratio<=min){
        ratio=min;
        $('.scaleInput .dec').css({
            'background-color':'transparent',
            'opacity':'0.3',
        });
        $('.warn').text('已达到最小');
        $('.warn').show();
        setTimeout(() => {
            $('.warn').hide();
        }, 2000);
    }else if(ratio<max){
        $('.scaleInput .dec').css({
            'background-color':'',
            'opacity':'1',
            'cursor':'pointer'
        });
        $('.scaleInput .add').css({
            'background-color':'',
            'opacity':'1',
            'cursor':'pointer'
        });
    }else{
        ratio=max;
        $('.scaleInput .add').css({
            'background-color':'transparent',
            'opacity':'0.3',
        });
        $('.warn').text('已达到最大');
        $('.warn').show();
        setTimeout(() => {
            $('.warn').hide();
        }, 2000);
    };
    $(ele1).css({'transform':'scale('+ratio+')'});
    $(ele2).css({'transform':'scale('+ratio+')'});
    // 以下除了return之外，都在其他地方使用都可以去掉
    $('.scaleInput input').val(`${Math.round(ratio*100)}%`);
    return [ratio,n] //ratio需要重新赋值，所以return出去
};
function dragFn(target, ele1,ele2) { //target表示点击哪个元素触发拖拽(一般是ele的父级),ele1表示哪个窗口移动(如果是图片的话ele2一般是图片的遮罩，ele1是图片)
    let _move = false;//移动标记
    let _x, _y;//鼠标离控件左上角的相对位置
    $(target).mousedown(function (e) {
        _move = true;
        _x = e.pageX - parseInt($(ele1).css("left"));
        _y = e.pageY - parseInt($(ele1).css("top"));
        $('body').css({'user-select':'none'});
    });
    $(document).mousemove(function (e) {
        if (_move) {
            let x = e.pageX - _x;//移动时鼠标位置计算控件左上角的绝对位置
            let y = e.pageY - _y;
            $(ele1).css({ top: y, left: x });//控件新位置
            if(ele2){
                $(ele2).css({ top: y, left: x });
            }
        };
    }).mouseup(function () {
        _move = false;
        $('body').css('user-select','');
    });
};
function scaleFn(value,arr){
    if (value.indexOf('%') != -1) {
        value = value.slice(0, -1) / 100; //去掉井号
    } else{ //禁止去掉‘%’符号
        $('.scaleInput input').val(`${value}%`);
        value=value/100;
    };
    if (value < 0.6) { //最小60%
        value = 0.6;
    } else if (value > 3) { //最大300%
        value = 3;
    };
    arr[0] = value;
    arr = changeRation('', '#dragbox .scaleimg', '#dragbox .scaleshield', arr[0], arr[1]);
};
