;(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD模式
        define([ "zepto"], factory);
    } else {
        // 全局模式
        factory(Zepto);
    }
}(function ($) {

    toggleDragRefresh('off');  //取消下拉刷新

    var localUrl = location.href;
    var defaults ={
       insertType:1,//1=>直接存html字符串
       dataStr:'',
       scrollY:0,
       appendTo:'#'+detailListId,
       name:detailListId,
       extraData:{},
       filter:{},
       dataStrName:'dataStr',
       scrollYName:'scrollY',
       extraDataName:'extraData',
       filterName:'filter',
       currentTimeStampName:'currentTimeStamp',
       currentTimeStamp:(new Date()).getTime(),
       addBack:true,//为列表添加一个标志
       expire:30*60*1000//过期时间,单位毫秒，默认10分钟
    };
    function detailList(options){
        this.settings=$.extend({},defaults,options || {});
        this.init();
    }
    detailList.prototype={
        init:function(){
            if(!('sessionStorage' in window)&&!(window['sessionStorage'] !== null)){
                console.error(langData['siteConfig'][38][4]);//您的浏览器不支持h5的window.sessionStorage本地存储，请使用其他现代浏览器
                return;
            }
            this.isExpire();
            this.windowBind();
            this.setLocalStorage(0);
        },
        isBack:function(){
            //根据锚点，粗略判断是否点了返回，从detail返回了列表
            var storage=this.getLocalStorage();

            return (typeof storage.filter == 'undefined') ? false : (typeof storage.filter.isBack == 'undefined' ? false : true);
        },
        isExpire:function(){
            var current=(new Date).getTime();
            if(this.existLocalStorageName()){
                var storage=this.getLocalStorage();
                var localCurrent=storage[this.settings.currentTimeStampName]+this.settings.expire;
                if(current>localCurrent){
                    this.removeLocalStorage();
                    console.log("expire");
                }
            }
        },
        insertHtmlStr:function(filter, str, extraData){
            this.setLocalStorage(1, filter, str, extraData);
        },
        setLocalStorage:function(type, filter, str, extraData){
            //type=0=>refresh or back，type=1=>scrolling
            var storage;
            if(this.existLocalStorageName()){

                //exist
                storage=this.getLocalStorage();
                if(type==0){
                    if(this.isBack()&&this.settings.addBack){
                        $(this.settings.appendTo).html(storage[this.settings.dataStrName]);
                        this.scroll2Y(storage[this.settings.scrollYName]);

                        // this.removeLocalStorage();

                    }
                    storage[this.settings.extraDataName]=this.isBack()&&this.settings.addBack?storage[this.settings.extraDataName]:{};
                    storage[this.settings.filterName]=this.isBack()&&this.settings.addBack?storage[this.settings.filterName]:{};
                }
                else if(type == 1){

                  if (extraData!==undefined) {
                    storage[this.settings.extraDataName]=extraData;
                  }
                  if (filter!==undefined) {
                    storage[this.settings.filterName]=filter;
                  }
                }
                storage[this.settings.scrollYName]=this.isBack()&&this.settings.addBack?this.settings.scrollY:500;
                storage[this.settings.dataStrName]=str===undefined?storage[this.settings.dataStrName]:str;;
                window.sessionStorage.setItem(this.settings.name,this.string2json(storage));

            }else{
                //not exist
                storage={};
                storage[this.settings.currentTimeStampName]=this.settings.currentTimeStamp;
                storage[this.settings.extraDataName]=extraData;
                storage[this.settings.scrollYName]=this.settings.scrollY;
                storage[this.settings.filterName]=filter;
                storage[this.settings.dataStrName]=str;
                window.sessionStorage.setItem(this.settings.name,this.string2json(storage));
            }
        },
        getLocalStorage:function(){
            return this.json2string(window.sessionStorage.getItem(this.settings.name));
        },
        removeLocalStorage:function(){
            window.sessionStorage.removeItem(this.settings.name);
        },
        string2json:function(json){
            return JSON.stringify(json);
        },
        json2string:function(str){
            return JSON.parse(str);
        },
        existLocalStorageName:function(){
            return window.sessionStorage.getItem(this.settings.name) === null ? false : true;
        },
        windowBind:function(){
            this.settings.first=true;
            $(window).scroll($.proxy(function(){
                var scroll_top=$(window).scrollTop();
                this.settings.scrollY=scroll_top;
                this.replaceAnchor(scroll_top);
                // this.setLocalStorage(1);
            },this));
        },
        replaceAnchor:function(scroll_top){
            if(this.settings.addBack){
                //这样锚点滚动就会产生历史记录数
                //window.location.hash="#"+this.settings.scrollYName+"="+scroll_top;
                //这样锚点滚动不会产生历史记录数
                // window.location.replace(localUrl + "#"+this.settings.scrollYName+"="+scroll_top);
            }
        },
        scroll2Y:function(scrolly){
            $("html,body").scrollTop(scrolly);
        },

    }
    window.h5DetailList=detailList;
}));
