
var logininfo = utils.getStorage("lwm_courier_login");
var user = pass = '';
   if(logininfo){
     user = logininfo.user;
     pass = logininfo.pass;
   }
var dataGeetest = "";
var fileCount = 0,
	ratio = window.devicePixelRatio || 1,
	thumbnailWidth = 100 * ratio,   // 缩略图大小
	thumbnailHeight = 100 * ratio;  // 缩略图大小;
// input输入框 组件
var InputText = {
 props: ['type','placeholder','name','areacode','readonly','value','label'],
 data:function(){
   return {
     eyeshow:true,
     input_ :'',
     password_:'',
   }
 },

 methods:{
   input(){
     var el = event.target;
     input_ = event.target.value;
     var name = $(el).attr('name');
     if(name=='username'){
        this.$parent.userinfo.username = input_
     }else if(name=='password'){
       this.input_ = input_
       this.$parent.userinfo.password = input_;
     }else if(name=='telphone'){
       this.$parent.userphone.userphone = input_
     }else if(name=='captcha'){
       if(isNaN(input_)){
         showErr("请输入正确的验证码！");return false;
       }
       this.$parent.userphone.validcode = input_;
     }else if(name=='areaCode'){
       this.$parent.userphone.areaCode = input_
     }else if(name=='nickname'){
       this.$parent.reg_info.nickname = input_
     }else if(name=='sex'){
       this.$parent.reg_info.sex = input_;
     }else if(name=='age'){
       this.$parent.reg_info.age = input_
     }else if(name=='academic'){
       this.$parent.reg_info.academic = input_
     }else if(name=='city'){
       this.$parent.reg_info.city = input_
     }else if(name=='IDnumber'){
       this.$parent.reg_info.IDnumber = input_;
       this.$parent.reg_info.age = this.IdCard(input_);
       $("#age").val(this.$parent.reg_info.age)
     }else if(name=='sure_password'){
       this.input_ = input_
       this.$parent.userinfo.password = input_;
     }

     if(name=='password' || name=='sure_password'){
       this.password_ = input_
     }else{
       this.password_ = ''
     }
   },
   IdCard(UUserCard) {
      //获取年龄
      var myDate = new Date();
      var month = myDate.getMonth() + 1;
      var day = myDate.getDate();
      var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
      if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
          age++;
      }
      console.log(age)
      return age;
      // $("#age").val(age);
  },
   // 显示弹窗
   pop_show:function(){
     $(".popl_mask").show();
     $(".popl_box").css('bottom','0')
   },
  
   openeye:function(){
     this.eyeshow = !this.eyeshow;
     this.$root.psd_show = this.eyeshow ;
     if(!this.eyeshow){
       $("input[name='sure_password']").attr('type','text')
     }else{
       $("input[name='sure_password']").attr('type','password')
     }

   },

    //发送验证码
   sendVerCode:function(){
           var btn = $(".get_code");
           var phone = $("input[name='telphone']").val()
       var areacode = $("input[name='areaCode']").val()
           if(btn.hasClass("disabled")) return;
           btn.addClass("disabled").text(langData['siteConfig'][23][99]);
       data = {'rsaEncrypt':1,'phone':rsaEncrypt(phone),"areaCode":areacode}
       var tt = this;
           $.ajax({
               url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=auth",
               data: data+dataGeetest,
               type: "GET",
               dataType: "jsonp",
               success: function (data) {
                   //获取成功
                   if(data && data.state == 100){
                       tt.$options.methods.coutDown();
                       btn.removeClass("disabled")
                       //获取失败
                   }else{
                       btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
                       showErr(data.info);
                   }
               },
               error: function(){
                   btn.removeClass("disabled").text(langData['siteConfig'][19][736]);
                   showErr(langData['siteConfig'][20][173]);
               }
           });
       }
 },
 template: `
 <div v-bind:class="['inpbox',{tel_inpbox:name =='telphone'},{'hasLabel':label},{'gz-addr-seladdr':name == 'city'}]" data-ids="" :data-id="$root.cityid">
   <label v-if="label" :for="name">{{label}}</label>
   <span v-if='name =="telphone"' class="areacode" v-on:click="pop_show">{{areacode}}</span>
   <input v-if='name =="telphone"' type="hidden" name="areaCode" v-model="areacode" >
   <button v-if='name =="captcha"' class="get_code">`+langData['siteConfig'][19][736]+`</button>
   <input v-bind:type="name==('password'||'sure_password')?(eyeshow === true?'password':'text'):type" v-bind:placeholder="placeholder"  v-bind:name="name" v-bind:readonly="readonly" :id="name=='city'?'cityName':name"  v-on:input="input" :maxlength='(name =="captcha"||name =="age")?"6":""'   :value="value?value:input_" :pattern='(name =="captcha"||name =="telphone")?"[0-9]*":""'>
   <input type="hidden" v-if="name=='city'" id="cityid" name='cityid' :value="$root.reg_info.cityid" />
   <em></em>
   <i v-if='name=="password"' v-on:click="openeye" v-bind:class="[{ eye_open: !eyeshow === true }]"></i>
  </div>
 `,
};

// loading组件
var loading = {
 template:`
 <div class="loadIcon"></div>
 `,
}
var reginfo ={
 template:`
 <div class="reginfo_show" >
   <h4>`+langData['waimai'][10][118]+`</h4>
   <div class="regbox ">
     <div class="left_img"><div class="img"></div><h5>{{this.$parent.reg_info.nickname}}</h5></div>
     <ul class="right_info fn-clear">
       <li>
         <div class="infobox">
           <p>`+langData['siteConfig'][19][12]+`</p>
           <h5>{{this.$parent.reg_info.age}}`+langData['siteConfig'][13][29]+`</h5>
         </div>
         <div class="infobox">
           <p>`+langData['siteConfig'][19][7]+`</p>
           <h5>{{this.$parent.reg_info.sex?"男":"女"}}</h5>
         </div>
         <div class="infobox">
           <p>学历</p>
           <h5>{{this.$parent.reg_info.academic}}</h5>
         </div>
         <div class="infobox">
           <p>工作地</p>
           <h5>{{this.$parent.reg_info.city}}</h5>
         </div>
       </li>
       <li style="width:51%;" class="phoneShow">
         <p>`+langData['siteConfig'][22][40]+`</p>
         <h5>{{this.$parent.userphone.userphone}}</h5>
       </li>
     </ul>
   </div>
 </div>
 `,
}
// 按钮组件
var btnLogin = {
 data:function(){
   return {
     info:'',
     params:'',
     load:false,

   }
 },
 components:{
   'loading-div':loading,

 },
 methods:{
   // 登录
   login:function(){
     var logintype = this.$parent.currentTab;
     if(logintype=='accountLogin'){
       var ainfo = this.$parent.userinfo;
       if(ainfo.username==''){
         showErr(langData['waimai'][10][120]);  //请输入账号
         return false;
       }else if(ainfo.password==''){
         showErr(langData['waimai'][10][119]);  //'请输入密码'
         return false;
       }else if(this.$root.noagree){  //是否同意协议
         $(".pop_mask,.pop_agree").show();
         return false;
       }else{
         params = {
           'username' :ainfo.username,
           'password' :ainfo.password,
           'logintype':this.$parent.currentTab,
         }
         this.login_access(params)
       }
       this.$parent.codetype  = 2;
     }else{
       var ainfo = this.$parent.userphone;
       if(ainfo.userphone==''){
         showErr(langData['siteConfig'][20][239]); //'请输入手机号'
         return false;
       }else if(ainfo.validcode==''){
         showErr(langData['siteConfig'][20][176]);  //'请输入验证码'
         return false;
       }else if(this.$root.noagree){  //是否同意协议
         $(".pop_mask,.pop_agree").show();
         return false;
       }else{
         params = {
           'userphone':ainfo.userphone,
           'validcode':ainfo.validcode,
           'areaCode':ainfo.areaCode,
           'logintype':this.$parent.currentTab,
         }
         this.login_access(params)
       }
     }
   },
   login_access:function(params){
     var logintype = this.$parent.currentTab;
     this.load = true;
     let param = new URLSearchParams();
     param.append('rsaEncrypt', 1);
     if(logintype == 'accountLogin'){
       param.append('username', rsaEncrypt(params.username))
       param.append('password', rsaEncrypt(params.password))
       param.append('logintype', params.logintype)
     }else{
       param.append('username', rsaEncrypt(params.userphone))
       param.append('validcode', params.validcode)
       param.append('areaCode', params.areaCode)
       param.append('logintype', params.logintype)
     }

     axios({
       method: 'post',
       url: '/include/ajax.php?service=waimai&action=courierLogin',
       data: param,
     })
     .then((response)=>{
       tt = 1;
       var data = response.data;
       this.load = false;
       if(data.state!=100){
         showErr(data.info)
       }else{
         
         if(data.info == 'setpws'){
           // showErr(data.info.info);
           this.$root.login = false;
           this.$root.reg_success = true;
         }else{
             var dataparam = {"user":params.username, "pass":params.password}
             var userid = data.did;
           utils.setStorage("lwm_courier_login", JSON.stringify(dataparam));
           location.href = "/?service=waimai&do=courier&template=index&currentPageOpen=1";
           setupWebViewJavascriptBridge(function(bridge) {
             bridge.callHandler('appLoginFinish', {'passport':userid}, function(){});
             setTimeout(function(){
                bridge.callHandler('pageClose', function(){});
             }, 1000);
           });
         }
       }
     });

   },
   register_go:function(){
      this.$parent.login 	= false;
      this.$parent.codetype  = 1;
   },

   register:function(){
     var ainfo = this.$parent.reg_info;
     var ainfo1 = this.$parent.userphone;
     if(ainfo.nickname==''){
       showErr(langData['siteConfig'][20][330]); //'请输入姓名'
       return false;
     }else if(ainfo.age==''){
       showErr(langData['waimai'][10][121]);  //请输入年龄
       return false;
     }else if(ainfo1.userphone==''){
       showErr(langData['waimai'][10][122]);  //请验证手机号码
       return false;
     }else if(ainfo1.validcode==''){
       showErr(langData['waimai'][10][123]);  //请输入手机验证码
       return false;
     }else if(ainfo.IDnumber==''){
       showErr('请输入身份证号');  //请输入手机验证码
       return false;
     }else if(ainfo.idCardback=='' || ainfo.idCardfront==''){
       showErr('请上传身份证');  //请输入手机验证码
       return false;
     }else if(this.$root.noagree){  //是否同意协议
       $(".pop_mask,.pop_agree").show();
       return false;
     }else{
       params = {
         'nickname':ainfo.nickname,
         'age':ainfo.age,
         'sex':ainfo.sex,
         'telephone':ainfo1.userphone,
         'areaCode':ainfo1.areaCode,
         'validcode':ainfo1.validcode,
       }
       this.$parent.reg_info = {
         'nickname':ainfo.nickname,
         'age':ainfo.age,
         'sex':ainfo.sex,
         'academic':ainfo.academic,
         'city':ainfo.city,
         'cityid':ainfo.cityid,
         'phone':ainfo1.userphone,
         'IDnumber':ainfo.IDnumber,
         'idCardback':ainfo.idCardback,
         'idCardfront':ainfo.idCardfront,
       };
       this.$parent.userphone = {
         'userphone':ainfo1.userphone,
         'validcode':ainfo1.validcode,
         'areaCode':ainfo1.areaCode,
       }
       this.register_access(params)

     }
   },
   register_access:function(data){
     // this.load = true;
     console.log(9)
     let param   = new URLSearchParams();
     var regiarr = this.$parent.reg_info;
     param.append('rsaEncrypt', 1);
     param.append('username', rsaEncrypt(regiarr.nickname))
     param.append('age', rsaEncrypt(regiarr.age))
     param.append('sex', rsaEncrypt(regiarr.sex))
     param.append('academic', rsaEncrypt(regiarr.academic))
     param.append('city', rsaEncrypt(regiarr.city))
     param.append('cityid', rsaEncrypt(regiarr.cityid))
     param.append('phone', rsaEncrypt(regiarr.phone))
     param.append('IDnumber', rsaEncrypt(regiarr.IDnumber));
     param.append('idCardback', regiarr.idCardback);
     param.append('idCardfront', regiarr.idCardfront);
     axios({
       method: 'post',
       url: '/include/ajax.php?service=waimai&action=courierReg',
       data: param,
     })
     .then((response)=>{
       tt = 1;
       var data = response.data;
       this.load = false;
       if(data.state == 100){
         // showErr(data.info)
         this.$parent.regcheck  = true;
       }else{
         showErr(data.info);
       }
     });
   },
   register_phone:function(){
     // this.load = true;


     var ainfo1 = this.$parent.userphone;
     if(!ainfo1.userphone){
       showErr(langData['waimai'][10][122]);  //请验证手机号码
       return false;
     }else if(ainfo1.validcode==''){
       showErr(langData['waimai'][10][123]);  //请输入手机验证码
       return false;
     }else if(this.$root.noagree){  //是否同意协议
       $(".pop_mask,.pop_agree").show();
       return false;
     }
     let param = new URLSearchParams();
     param.append('rsaEncrypt', 1);
     param.append('phone', rsaEncrypt(ainfo1.userphone))
     param.append('areaCode', ainfo1.validcode)
     param.append('code', ainfo1.areaCode)
     param.append('vertcode', '1')
     axios({
       method: 'post',
       url: '/include/ajax.php?service=waimai&action=courierReg',
       data: param,
     })
         .then((response)=>{
           tt = 1;
           var data = response.data;
           this.load = false;
           if(data.state == 100){
             // showErr(data.info)
             this.$parent.phone_reg   = true;
           }else{
             showErr(data.info)
             return false ;
             location.reload();
           }
         });

   },
   // 同意协议
   toagree:function(){
     $(".pop_mask,.pop_agree").show()
   },



 },
 // 原版
 // template: `
 // <div class="btn_box">
 //   <button v-if="this.$parent.login && !this.$root.noagree" type="button" class="login_btn" @click="login"><slot></slot></button>
 //   <button v-if="this.$parent.login && this.$root.noagree" type="button" class="login_btn login_opciaty" @click="toagree"><slot></slot></button>
 //   <a v-if="this.$parent.login" href="javascript:;" class="reg_url" @click="register_go">`+langData['waimai'][10][126]+`</a>
 //   <button v-if="!this.$parent.login && !this.$root.noagree" type="button" class="login_btn" @click="register"><slot></slot></button>
 //   <button v-if="!this.$parent.login && this.$root.noagree" type="button" class="login_btn login_opciaty" @click="toagree"><slot></slot></button>
 //   <loading-div v-if="load"></loading-div>
 // </div>
 //
 // `,

 // 改版

 // <button v-if="this.$parent.login && this.$root.noagree" type="button" class="login_btn login_opciaty" @click="toagree"><slot></slot></button>
 // <button v-if="!this.$parent.login && this.$root.noagree" type="button" class="login_btn login_opciaty" @click="toagree"><slot></slot></button>
 template: `
 <div class="btn_box">
   <button v-if="this.$parent.login" type="button" :class="['login_btn',{'login_opciaty':this.$root.noagree}]" @click="login"><slot></slot></button>
   <a v-if="this.$parent.login" href="javascript:;" class="reg_url" @click="register_go">注册成为骑手</a>
   <button v-if="!this.$parent.login && this.$root.phone_reg" type="button" :class="['login_btn',{'login_opciaty':this.$root.noagree}]" @click="register"><slot></slot></button>
   <loading-div v-if="load"></loading-div>
   <button v-if="!this.$parent.login && !this.$root.phone_reg" type="button" :class="['login_btn',{'login_opciaty':this.$root.noagree}]" @click="register_phone"><slot></slot></button>
   <loading-div v-if="load"></loading-div>
 </div>

 `,
}


var sexSelect;  //单选
// 登录
var pageVue = new Vue({
 el: "#page",
 data: {
   currentTab: "accountLogin",  //默认账号登录
   tabs: [{'id':"accountLogin",'name':langData['waimai'][10][124]}, {'id':"noPsdLogin",'name':langData['waimai'][10][125]}],  //账号登录  免密登录
   userinfo:{'username':user,'password':pass,'areaCode':''},
   userphone:{'userphone':'','validcode':'','areaCode':86},
   areaCode:86,
   login:true,   //登录页
   regcheck:false,   //注册审核
   reg_success:false, //还没注册
   codetype:'',
   noagree:consult=='0'?true:false, //不同意勾选协议
   reg_info:{
     'nickname':'',  //姓名
     'age':'',       //年龄
     'sex':'',       //性别
     'academic':'',  //学历
     'city':cityname,      //城市
     'cityid':cityid,      //城市id
     'IDnumber':'',  //身份证号
     'idCardfront':'', //身份证国徽
     'idCardback':'', //身份证人像
   },
   psd_show:true,
   regsiter_success: 0,

   phone_reg:false,  //注册 - 手机号验证了, 下一步是提交信息  此变量在手机号注册过程中使用
   toReg:false, //直接来的注册页面


 },

 components:{
   'input-txt':InputText,
   'btn-login':btnLogin,
   'loading-div':loading,
   'reg-info':reginfo
 },
 methods:{
   pop_hide:function(){
     $(".popl_mask").hide();
     $(".popl_box").css('bottom','-9rem')
   },
   Changecode:function(){
     var el = event.currentTarget;
     areaCode = $(el).attr('data-code');
     $(el).addClass('achose').siblings('li').removeClass('achose');
     this.$options.methods.pop_hide();
     $("input[name='areaCode']").val(areaCode);
     $(".areacode").text(areaCode)
     this.userphone.areaCode = areaCode
   },
   save_psd:function(){
     var password 	= this.$refs.psd.password_;
     var repassword 	= this.$refs.rpsd.password_;
     if(password == undefined || repassword == undefined){
       //请填写完整
       showErr(langData['waimai'][10][127]);
     }
     var reg = new RegExp("^(?![a-zA-z]+$)(?!\\d+$)(?![!@#$%^&*]+$)[a-zA-Z\\d!@#$%^&*]+$");
     if(!reg.test(password)|| !reg.test(repassword)){
       //"温馨提示：请输入大、小写字母、数字或特殊字符！
       showErr(langData['waimai'][10][48]); return false;
     }

     var data = '&rsaEncrypt=1&password='+rsaEncrypt(this.$refs.psd.password_);

     axios({
       method: 'post',
       url: '/include/ajax.php?service=waimai&action=courierEditpwsphone&from=loginafter&edittype=edpws'+data,
     })
     .then((response)=>{
       var data = response.data;
       if(data.state==100){

         showErr(data.info);

         setupWebViewJavascriptBridge(function(bridge) {
             // bridge.callHandler('appLoginFinish', {'passport':userid}, function(){});
             bridge.callHandler('pageClose', function(){});
          });
         window.location = '/?service=waimai&do=courier&template=index';

       }else{
         showErr(data.info);
       }

       $(".reload").removeClass("rotate")
     });
   },

   hidePop:function(){
     $(".pop_mask,.pop_agree").hide()
   },

   sureClick:function(){
     var t = this;
     t.noagree = !t.noagree;
     t.hidePop()
     setTimeout(function(){
       $(".login_btn").click();
     },300)
   },

   toPay:function(){
     // 跳转支付页面
     var tt = this
     setupWebViewJavascriptBridge(function(bridge) {
       bridge.callHandler("openBrowser", {'url':masterDomain+'/shop/detail-1026.html'}, function(responseData){
       });
     })
     tt.getPayState()
   },
   getPayState:function(){
     var payState = false;
     var tt = this;
     var Interview = setInterval(function(){
       if(payState) {
         clearInterval(Interview);
         $('.successTip,.tipMask').show();
         setTimeout(function(){
           $('.successTip,.tipMask').hide();
           tt.regsiter_success = 0;
         },5000)
       }

       setTimeout(function(){
         payState = true;
       },3000)
     },2000)
   },

   // 上传身份证
   checkCard(){
     var tt = this;
     // 上传
     $(".upBtn").each(function(){
      fileCount = 0;
      var t = $(this);
      let pick = t.attr('id');
      uploader = WebUploader.create({
        auto: true,
        swf: '/static/js/webuploader/Uploader.swf',
        server: '/include/upload.inc.php?mod=siteConfig&type=card',
        pick: {
          id:'#'+pick,
          multiple:false,
        },
        fileVal: 'Filedata',
        accept: {
          title: 'Images',
          extensions: 'jpg,jpeg,gif,png',
          mimeTypes: 'image/*'
        },
        compress: {
          width: 750,
          height: 750,
          // 图片质量，只有type为`image/jpeg`的时候才有效。
          quality: 90,
          // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
          allowMagnify: false,
          // 是否允许裁剪。
          crop: false,
          // 是否保留头部meta信息。
          preserveHeaders: true,
          // 如果发现压缩后文件大小比原来还大，则使用原来图片
          // 此属性可能会影响图片自动纠正功能
          noCompressIfLarger: false,
          // 单位字节，如果图片大小小于此值，不会采用压缩。
          compressSize: 1024*200
        },
        // fileNumLimit: 2,
        fileSingleSizeLimit: atlasSize,
        
      });
      // 当有文件添加进来的时候
      uploader.on('fileQueued', function(file) {
        //先判断是否超出限制
        if(fileCount == (atlasMax-1)){
          $("#"+pick).hide()
        }
        if(fileCount == atlasMax){
          showErr(langData['siteConfig'][20][305]);//图片数量已达上限
          return false;
        }
        fileCount++;
        tt.addFile(file,pick)
      });
      // 文件上传成功，给item添加成功class, 用样式标记上传成功。
      uploader.on('uploadSuccess', function(file, response){
        var $li = $('#'+pick).siblings('.litpic');
        if(response.state == "SUCCESS"){
          $li.find("img").attr("data-val", response.url).attr("data-url", response.turl);
          if(t.closest('.idCardfront').length > 0){
            tt.reg_info.idCardfront = response.turl
          }else if(t.closest('.idCardback').length > 0){
            tt.reg_info.idCardback = response.turl

          }
        }else{
          this.removeFile(file);
          showErr(langData['siteConfig'][20][306]+'！');//上传失败！
        }
      });

    });
   },

   addFile:function(file,pick){
			var tt = this;
			var $div = $('<div id="' + file.id + '" class="thumbnail litpic"><img></div>');
			var $btns = $('<div class="del_btn"></div>').appendTo($div);
			$img = $div.find('img');
			uploader.makeThumb(file, function(error, src) {
				if(error){
					$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');//不能预览
					return;
				}
				$img.attr('src', src);
			}, thumbnailWidth, thumbnailHeight);
			// 删除图片
			$btns.on('click', function(){
				tt.delimg();
			});
			$("#"+pick).before($div)
			$("#"+pick).hide();

		},

    delimg:function(){
			var el = event.currentTarget,li=$(el).closest(".uploadImg").find(".upBtn");
			var file = [];
			file['id'] = li.attr("id");
			this.removeFile(file);
		},
		// 负责view的销毁
		removeFile:function(file) {
			var $li = $('#'+file.id);
			fileCount--;
			$li.show();
			var $div = $li.siblings('.litpic');
			this.delAtlasPic($div.find("img").attr("data-val"));
			$div.remove();
		},
		// 删除图片
		delAtlasPic:function(b){
			var g = {
				mod: 'waimai',
				type: "delAtlas",
				picpath: b,
				randoms: Math.random()
			};
			$.ajax({
				type: "POST",
				url: "/include/upload.inc.php",
				data: $.param(g)
			})
		},

    // 城市选择
		selectCity: function() {
      var tt = this;
			var sortBy = function(prop) {
				return function(obj1, obj2) {
					var val1 = obj1[prop];
					var val2 = obj2[prop];
					if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
						val1 = Number(val1);
						val2 = Number(val2);
					}
					if (val1 < val2) {
						return -1;
					} else if (val1 > val2) {
						return 1;
					} else {
						return 0;
					}
				}
			}

			var gzAddress = $(".gz-address"), //选择地址页
				gzAddrListObj = $(".gz-addr-list"), //地址列表
				gzAddNewObj = $("#gzAddNewObj"), //新增地址页
				gzSelAddr = $("#gzSelAddr"), //选择地区页
				gzSelMask = $(".gz-sel-addr-mask"), //选择地区遮罩层
				gzAddrSeladdr = $(".gz-addr-seladdr"), //选择所在地区按钮
				gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"), //关闭选择所在地区按钮
				gzSelAddrList = $(".gz-sel-addr-list"), //区域列表
				gzSelAddrNav = $(".gz-sel-addr-nav"), //区域TAB
				gzSelAddrSzm = "gz-sel-addr-szm", //城市首字母筛选
				gzSelAddrActive = "gz-sel-addr-active", //选择所在地区后页面下沉样式名
				gzSelAddrHide = "gz-sel-addr-hide", //选择所在地区浮动层隐藏样式名
				showErrTimer = null,
				gzAddrEditId = 0, //修改地址ID
				gzAddrOffsetTop = 0,
				gzAction = gzAddrSeladdr.attr("data-action") ? gzAddrSeladdr.attr("data-action") : "addr",
				gzAddrInit = {

					showChooseAddr: function() {
						$("html").addClass("fixed");
						gzAddress.show();
					}



					//获取区域
					,
					getAddrArea: function(id) {

						//如果是一级区域
						if (!id) {
							gzSelAddrNav.html('<li class="gz-curr"><span>' + langData['siteConfig'][7][2] + '</span></li>');
							gzSelAddrList.html('');
						}

						var areaobj = "gzAddrArea" + id;
						if ($("#" + areaobj).length == 0) {
							gzSelAddrList.append('<ul id="' + areaobj + '"><li class="loading">' + langData['siteConfig'][20][184] +
								'...</li></ul>');
						}

						gzSelAddrList.find("ul").hide();
						$("#" + areaobj).show();

						var param = gzAddrSeladdr.data('param') ? gzAddrSeladdr.data('param') : '';

						$.ajax({
							url: "/include/ajax.php?service=" + (window.modelType ? window.modelType : 'siteConfig') + "&action=" +
								gzAction,
							data: "type=" + id + param,
							type: "GET",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var list = data.info,
										hotList = [],
										cityArr = [],
										areaList = [],
										html1 = [];
									for (var i = 0, area, lower; i < list.length; i++) {
										area = list[i];
										lower = area.lower == undefined ? 0 : area.lower;
										areaList.push('<li data-id="' + area.id + '" data-lower="' + lower + '"' + (!lower ? 'class="n"' : '') +
											'>' + area.typename + '</li>');
										var pinyin = list[i].pinyin.substr(0, 1);
										if (cityArr[pinyin] == undefined) {
											cityArr[pinyin] = [];
										}
										cityArr[pinyin].push(list[i]);
									}
									//如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
									if (list.length > 20 && id == 0) {
										var szmArr = [],
											areaList = [];
										for (var key in cityArr) {
											var szm = key;
											// 右侧字母数组
											szmArr.push(key);
										}
										szmArr.sort();

										for (var i = 0; i < szmArr.length; i++) {
											html1.push('<li><a href="javascript:;" data-id="' + szmArr[i] + '">' + szmArr[i] + '</a></li>');

											cityArr[szmArr[i]].sort(sortBy('id'));

											// 左侧城市填充
											areaList.push('<li class="table-tit table-tit-' + szmArr[i] + '" id="' + szmArr[i] + '">' + szmArr[i] +
												'</li>');
											for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

												cla = "";
												if (!lower) {
													cla += " n";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}

												lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
												areaList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '"' + (cla !=
												"" ? 'class="' + cla + '"' : '') + '>' + cityArr[szmArr[i]][j].typename + '</li>');

												if (cityArr[szmArr[i]][j].hot == 1) {
													hotList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '">' + cityArr[
														szmArr[i]][j].typename + '</li>');
												}
											}
										}

										if (hotList.length > 0) {
											hotList.unshift('<li class="table-tit table-tit-hot" id="hot">' + langData['siteConfig'][37][79] +
												'</li>'); //热门
											html1.unshift('<li><a href="javascript:;" data-id="hot">' + langData['siteConfig'][37][79] +
												'</a></li>'); //热门

											areaList.unshift(hotList.join(''));
										}

										//拼音导航
										$('.' + gzSelAddrSzm + ', .letter').remove();
										gzSelAddr.append('<div class="' + gzSelAddrSzm + '"><ul>' + html1.join('') + '</ul></div>');

										$('body').append('<div class="letter"></div>');

										var szmHeight = $('.' + gzSelAddrSzm).height();
										szmHeight = szmHeight > 380 ? 380 : szmHeight;

										$('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight / 2 + 'px');

										$("#" + areaobj).addClass('gzaddr-szm-ul');

									} else {
										$('.' + gzSelAddrSzm).hide();
									}
									$("#" + areaobj).html(areaList.join(""));
								} else {
									$("#" + areaobj).html('<li class="loading">' + data.info + '</li>');
								}
							},
							error: function() {
								$("#" + areaobj).html('<li class="loading">' + langData['siteConfig'][20][183] + '</li>');
							}
						});


					}

					//初始区域
					,
					gzAddrReset: function(i, ids, addrArr, index) {

						var gid = i == 0 ? 0 : ids[i - 1];
						var id = ids[i];
						var addrname = addrArr[i];
						//全国区域
						if (i == 0) {
							gzSelAddrNav.html('');
							gzSelAddrList.html('');
						}

						var cla = i == addrArr.length - 1 ? ' class="gz-curr"' : '';
						gzSelAddrNav.append('<li data-id="' + id + '"' + cla + '><span>' + addrname + '</span></li>');

						var areaobj = "gzAddrArea" + (i == 0 ? 0 : ids[i - 1]);
						if ($("#" + areaobj).length == 0) {
							gzSelAddrList.append('<ul class="fn-hide" id="' + areaobj + '"><li class="loading">' + langData['siteConfig']
								[20][184] + '...</li></ul>');
						}
						$.ajax({
							url: "/include/ajax.php?service=" + (window.modelType ? window.modelType : 'siteConfig') + "&action=" +
								gzAction,
							data: "type=" + gid,
							type: "GET",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var list = data.info,
										areaList = [],
										hotList = [],
										cityArr = [],
										hotCityHtml = [],
										html1 = [];
									for (var i = 0, area, cla, lower; i < list.length; i++) {
										area = list[i];
										lower = area.lower == undefined ? 0 : area.lower;

										var pinyin = list[i].pinyin.substr(0, 1);
										if (cityArr[pinyin] == undefined) {
											cityArr[pinyin] = [];
										}
										cityArr[pinyin].push(list[i]);

										cla = "";
										if (!lower) {
											cla += " n";
										}
										if (id == area.id) {
											cla += " gz-curr";
										}
										areaList.push('<li data-id="' + area.id + '" data-lower="' + lower + '"' + (cla != "" ? 'class="' +
											cla + '"' : '') + '>' + area.typename + '</li>');
									}

									//如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
									if (list.length > 20 && index == 0) {
										var szmArr = [],
											areaList = [];
										for (var key in cityArr) {
											var szm = key;
											// 右侧字母数组
											szmArr.push(key);
										}
										szmArr.sort();

										for (var i = 0; i < szmArr.length; i++) {
											html1.push('<li><a href="javascript:;" data-id="' + szmArr[i] + '">' + szmArr[i] + '</a></li>');

											cityArr[szmArr[i]].sort(sortBy('id'));

											// 左侧城市填充
											areaList.push('<li class="table-tit table-tit-' + szmArr[i] + '" id="' + szmArr[i] + '">' + szmArr[i] +
												'</li>');
											for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

												cla = "";
												if (!lower) {
													cla += " n";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}
												if (id == cityArr[szmArr[i]][j].id) {
													cla += " gz-curr";
												}


												lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
												areaList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '"' + (cla !=
												"" ? 'class="' + cla + '"' : '') + '>' + cityArr[szmArr[i]][j].typename + '</li>');

												if (cityArr[szmArr[i]][j].hot == 1) {
													hotList.push('<li data-id="' + cityArr[szmArr[i]][j].id + '" data-lower="' + lower + '">' + cityArr[
														szmArr[i]][j].typename + '</li>');
												}
											}
										}

										if (hotList.length > 0) {
											hotList.unshift('<li class="table-tit table-tit-hot" id="hot">' + langData['siteConfig'][37][79] +
												'</li>'); //热门
											html1.unshift('<li><a href="javascript:;" data-id="hot">' + langData['siteConfig'][37][79] +
												'</a></li>'); //热门

											areaList.unshift(hotList.join(''));
										}

										//拼音导航
										$('.' + gzSelAddrSzm + ', .letter').remove();
										gzSelAddr.append('<div class="' + gzSelAddrSzm + '"><ul>' + html1.join('') + '</ul></div>');

										$('body').append('<div class="letter"></div>');

										var szmHeight = $('.' + gzSelAddrSzm).height();
										szmHeight = szmHeight > 380 ? 380 : szmHeight;

										$('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight / 2 + 'px');

										$("#" + areaobj).addClass('gzaddr-szm-ul');

									} else {
										$('.' + gzSelAddrSzm).hide();
									}

									$("#" + areaobj).html(areaList.join(""));
								} else {
									$("#" + areaobj).html('<li class="loading">' + data.info + '</li>');
								}
							},
							error: function() {
								$("#" + areaobj).html('<li class="loading">' + langData['siteConfig'][20][183] + '</li>');
							}
						});

					}

					//隐藏选择地区浮动层&遮罩层
					,
					hideNewAddrMask: function() {
						gzAddNewObj.removeClass(gzSelAddrActive);
						gzSelMask.fadeOut(500, function() {
							window.scrollTo(0, gzAddrOffsetTop);
						});
						gzSelAddr.addClass(gzSelAddrHide);
					}

				}


			//选择收货地址
			gzAddrInit.showChooseAddr();



			//选择所在地区
			gzAddrSeladdr.bind("click", function() {
				toggleDragRefresh('off');
				gzAddrOffsetTop = $(window).scrollTop();
				gzAddNewObj.addClass(gzSelAddrActive);
				gzSelMask.fadeIn();
				gzSelAddr.removeClass(gzSelAddrHide);

				var t = $(this),
					ids = t.attr("data-ids"),
					id = t.attr("data-id"),
					addrname = $("#cityName").text();
				gzAddrInit.getAddrArea(0);

			});

			//关闭选择所在地区浮动层
			gzSelAddrCloseBtn.bind("touchend", function() {
				gzAddrInit.hideNewAddrMask();
			})

			//点击遮罩背景层关闭层
			gzSelMask.bind("touchend", function() {
				gzAddrInit.hideNewAddrMask();
			});

			//选择区域
			gzSelAddrList.delegate("li", "click", function() {
				var t = $(this),
					id = t.attr("data-id"),
					addr = t.text(),
					lower = t.attr("data-lower"),
					par = t.closest("ul"),
					index = par.index();
				$('.' + gzSelAddrSzm).hide();
				if (id && addr) {

					t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
					gzSelAddrNav.find("li:eq(" + index + ")").attr("data-id", id).html("<span>" + addr + "</span>");


					//直接只选一级城市
					var addrname = [],
						ids = [];

					//把子级清掉
					gzSelAddrNav.find("li:eq(" + index + ")").nextAll("li").remove();
					gzSelAddrList.find("ul:eq(" + index + ")").nextAll("ul").remove();


					gzSelAddrNav.find("li").each(function() {
						addrname.push($(this).text());
						ids.push($(this).attr("data-id"));
					});

					gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd p").html(
						addrname.join(" "));
					gzAddrInit.hideNewAddrMask();
					$('#addr, #addrid,#cityid').val(id);
					$('#cityName').val(addrname.join(" "));
          tt.reg_info['city']  = addrname.join(" ")
          tt.reg_info['cityid']  = id;

					//}

				}
			});

			//区域切换
			gzSelAddrNav.delegate("li", "touchend", function() {
				var t = $(this),
					index = t.index();
				t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
				gzSelAddrList.find("ul").hide();
				gzSelAddrList.find("ul:eq(" + index + ")").show();
				if (index == 0) {
					$('.' + gzSelAddrSzm).show();
				} else {
					$('.' + gzSelAddrSzm).hide();
				}
				gzSelAddrList.scrollTop(gzSelAddrList.find('ul:eq(' + index + ')').find('.gz-curr').position().top);
			});


			gzSelAddr.delegate("." + gzSelAddrSzm, "touchstart", function(e) {
				var navBar = $("." + gzSelAddrSzm);
				$(this).addClass("active");
				$('.letter').html($(e.target).html()).show();
				var width = navBar.find("li").width();
				var height = navBar.find("li").height();
				var touch = e.originalEvent.changedTouches[0];
				var pos = {
					"x": touch.pageX,
					"y": touch.pageY
				};
				var x = pos.x,
					y = pos.y;
				$(this).find("li").each(function(i, item) {
					var offset = $(item).offset();
					var left = offset.left,
						top = offset.top;
					if (x > left && x < (left + width) && y > top && y < (top + height)) {
						var id = $(item).find('a').attr('data-id');
						var cityHeight = $('#' + id).position().top;
						gzSelAddrList.scrollTop(cityHeight);
						$('.letter').html($(item).html()).show();
					}
				});
			});

			gzSelAddr.delegate("." + gzSelAddrSzm, "touchmove", function(e) {
				var navBar = $("." + gzSelAddrSzm);
				e.preventDefault();
				var width = navBar.find("li").width();
				var height = navBar.find("li").height();
				var touch = e.originalEvent.changedTouches[0];
				var pos = {
					"x": touch.pageX,
					"y": touch.pageY
				};
				var x = pos.x,
					y = pos.y;
				$(this).find("li").each(function(i, item) {
					var offset = $(item).offset();
					var left = offset.left,
						top = offset.top;
					if (x > left && x < (left + width) && y > top && y < (top + height)) {
						var id = $(item).find('a').attr('data-id');
						var cityHeight = $('#' + id).position().top;
						gzSelAddrList.scrollTop(cityHeight);
						$('.letter').html($(item).html()).show();
					}
				});
			});


			gzSelAddr.delegate("." + gzSelAddrSzm, "touchend", function() {
				$(this).removeClass("active");
				$(".letter").hide();
			})



			//自动定位
			if (typeof HN_Location == 'object' && gzAddrSeladdr.attr('data-ids') == '' && gzAddrSeladdr.attr('data-action') !=
				'type') {

				HN_Location.init(function(data) {
					if (data != undefined && data.province != "" && data.city != "" && data.district != "") {
						var province = data.province,
							city = data.city,
							district = data.district;
						$.ajax({
							url: "/include/ajax.php?service=siteConfig&action=verifyCityInfo&region=" + province + "&city=" + city +
								"&district=" + district,
							type: "POST",
							dataType: "jsonp",
							success: function(data) {
								if (data && data.state == 100) {
									var info = data.info;
									var cid = info.ids[info.ids.length - 1];
									gzAddrSeladdr
										.attr('data-ids', info.ids.join(" "))
										.attr('data-id', cid)
										.find("dd p").html(info.names.join(" "));
									$('#addr, #addrid').val(cid);
								}
							}
						})
					}
				})
			}

			// 扩展zepto
			$.fn.prevAll = function(selector) {
				var prevEls = [];
				var el = this[0];
				if (!el) return $([]);
				while (el.previousElementSibling) {
					var prev = el.previousElementSibling;
					if (selector) {
						if ($(prev).is(selector)) prevEls.push(prev);
					} else prevEls.push(prev);
					el = prev;
				}
				return $(prevEls);
			};

			$.fn.nextAll = function(selector) {
				var nextEls = [];
				var el = this[0];
				if (!el) return $([]);
				while (el.nextElementSibling) {
					var next = el.nextElementSibling;
					if (selector) {
						if ($(next).is(selector)) nextEls.push(next);
					} else nextEls.push(next);
					el = next;
				}
				return $(nextEls);
			};
		}
 },
 mounted(){
   var tt = this;
   if(!geetest){
       $('body').delegate(".get_code",'click',function(){
       if($(this).hasClass("disabled")) return;
       var areaCode = $("input[name='areaCode']").val();
        var phone = $("input[name='telphone']").val();
        if(phone == ''){
          showErr(langData['siteConfig'][20][463]);//请输入手机号码
          return false;
        }

        if(areaCode == "86"){
         var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
         if(!phoneReg.test(phone)){
           showErr(langData['siteConfig'][20][465]);   //手机号码格式不正确
           return false;
         }
       }
           sendVerCode();

       });
     }else{
    

       //获取验证码
      tt.$nextTick(() => {
        captchaVerifyFun.initCaptcha('h5','#codeButton',sendVerCode)
      })
     $('body').delegate(".get_code",'click',function(){
         if($(this).hasClass("disabled")) return;
         var areaCode = $("input[name='areaCode']").val();
        var phone = $("input[name='telphone']").val();
        if(phone == ''){
          showErr(langData['siteConfig'][20][463]);//请输入手机号码
          return false;
        }

        if(areaCode == "86"){
         var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
         if(!phoneReg.test(phone)){
           showErr(langData['siteConfig'][20][465]);   //手机号码格式不正确
           return false;
         }
       }

      if(geetest == 1){
        captchaVerifyFun.config.captchaObjReg.verify();
      }else{
        $('#codeButton').click()
      }


     })


     }

    tt.selectCity();
    // tt.checkCard()

    // 判断是否是注册
		if(window.location.href.indexOf('type=reg') > -1){
			tt.login 	= false;
			tt.codetype 	= 1;
      tt.toReg = true;
		}
 },
 watch:{
   login:function(){
      var tt = this;
     // $(".mobileSelect").remove();
     if(!this.login){
       setTimeout(function(){
         tt.checkCard()
         sexSelect = new MobileSelect({
           trigger: '.reg_box .inpbox input[name="sex"] ',
           title: '',//房型选择
           wheels: [
                 {data: [langData['waimai'][10][128],langData['waimai'][10][129]]},

               ],
           position:[0],
           callback:function(indexArr, data){
             $('.reg_box .inpbox input[name="sex"]').val(data);
             changeval(data)
           }
         });


       academicSelect = new MobileSelect({
         trigger: '.reg_box .inpbox input[name="academic"] ',
         title: '',//房型选择
         wheels: [
               {data: ['小学','初中','高中','大学','硕士','博士']},

             ],
         position:[0],
         callback:function(indexArr, data){
           $('.reg_box .inpbox input[name="academic"] ').val(data);
           changeAcademic(data)
         }
       });
     },600)

     }

   },

   phone_reg:function(val){
     var tt = this;
     if(val){
         tt.selectCity();
       tt.checkCard()
     }
   }



 }


});



//注册

var showErrTimer;
function showErr(data) {
 showErrTimer && clearTimeout(showErrTimer);
 $(".popErr").remove();
 $("body").append('<div class="popErr"><p>' + data + '</p></div>');
 // $(".popErr p").css({
 //   "margin-left": -$(".popErr p").width() / 2,
 //   "left": "50%"
 // });
 $(".popErr").css({
   "visibility": "visible"
 });
 showErrTimer = setTimeout(function() {
   $(".popErr").fadeOut(300, function() {
     $(this).remove();
   });
 }, 1500);
}

function changeval(data){
  console.log(data);
  pageVue.reg_info.sex = (data[0] == langData['siteConfig'][13][4]?1:0);
}
function changeAcademic(data){
  console.log(data[0]);
  pageVue.reg_info.academic = data[0];
}


function coutDown(){
 // 倒计时
 var mydate= new Date();
 mydate.setMinutes(mydate.getMinutes()+1); //当前时间加1分钟
 var end_time = new Date(mydate).getTime();//月份是实际月份-1
 var sys_second = (end_time-new Date().getTime())/1000;
 var timer = setInterval(function(){
   if (sys_second > 1) {
     sys_second -= 1;
     var second = Math.floor(sys_second % 60);
     $(".get_code").attr("disabled","true");//添加disabled属性
     $(".get_code").css({"border":"none"});
     $(".get_code").html(second+"s");

   } else {
     $(".get_code").removeAttr("disabled");//移除disabled属性
     $(".get_code").removeClass('disabled')
     $(".get_code").css("border","solid 1px #FFAE01");
     $(".get_code").html(langData['siteConfig'][19][736]);  //"获取"
     clearInterval(timer);//清楚定时器
   }
 }, 1000);
}


  function sendVerCode(captchaVerifyParam,callback){
     var btn = $(".get_code");
     var phone = $("input[name='telphone']").val()
   var areacode = $("input[name='areaCode']").val()
     var codetype = pageVue.codetype;
     if(btn.hasClass("disabled")) return;
     btn.addClass("disabled").text(langData['siteConfig'][23][99]);
   data = 'rsaEncrypt=1&phone='+rsaEncrypt(phone)+'&areaCode='+areacode
   if(captchaVerifyParam && geetest == 2){
    data = data + '&geetest_challenge=' + captchaVerifyParam
  }else if(geetest == 1 && captchaVerifyParam){
    data = data +  captchaVerifyParam
  }
   var tt   = this;
   var type = '';

   if(codetype == 1){
     type = 'signup';
   }else{
     type = 'sms_login';
   }
    $.ajax({
      url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&vertype=1&type="+type,
      data: data,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(callback){
					callback(data)
				}
        //获取成功
        if(data && data.state == 100){
          coutDown();
          //获取失败
        }else{
          btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
          showErr(data.info);
        }
      },
      error: function(){
        btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
        showErr(langData['siteConfig'][20][173]);
      }
    });
  }
