/**
 * 阿里验证码
 * 20240430
 * v1.0
 * ***/ 
if(window.geetest == 2){
    document.write(unescape("%3Cscript src='https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
    let btn = document.getElementById('button');
    btn = btn || document.getElementById('codeButton');
    if(!btn ){
       let doc = document.createElement('div')
       btn = '<button id="codeButton" style="display:none;" type="button"></button>';
       doc.innerHTML = btn
       var bo = document.body; //获取body对象
       //动态插入到body中
       if(bo){
           bo.insertBefore(doc, bo.lastChild);
           bo.appendChild(doc)
       }
    }
}


let captcha;
var captchaVerifyFun = {
    // 配置
    config:{
        SceneId:'',
        prefix: '', 
        mode:'',
        element:'', //元素

        captchaVerify:function(){},
        onBizResult:function(){},

        // 极验相关
        dataGeetest:'', //传参
        captchaObjReg:'', //验证
    },
    callback_captchaVerify:function(){

    },
    callback_onBizResult:function(){

    },
    // 初始化
    /**
     * mode => 验证码模式 web => pc端 h5 => 移动端  app => app端    web和h5 => pop  app => embed        pop => button必填   embed => element必填
     * ele => mode是pop 则是触发弹窗元素 button的值 mode是embed 则是预留渲染验证码的元素 element的值
     * captchaVerify => 验证码校验
     * */ 

    initCaptcha:function(mode,ele,captchaVerify,onBizResult){
        const that = this;
        captchaVerifyFun.config.mode = mode; //值是运行的终端 指向滑动验证码的模式
        captchaVerifyFun.callback_captchaVerify = captchaVerify;
        if(onBizResult){
            captchaVerifyFun.callback_onBizResult = onBizResult;
        }
        if(window.geetest == 1){
            that.initGee(mode,ele,captchaVerify,onBizResult);
        }else{
            that.initAliyun(mode,ele,captchaVerify,onBizResult);
        }
    },

    // 初始化 阿里云验证码
    async initAliyun(mode,ele,captchaVerify,onBizResult){
        await captchaVerifyFun.getCaptchaConfig(mode);
        if(mode == 'app'){
            initAliyunCaptcha({
                SceneId: captchaVerifyFun.config.SceneId, // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
                prefix: captchaVerifyFun.config.prefix, // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
                mode: mode == 'app' ? 'embed':'popup', // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
                element:ele,
                // button: ele, // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
                captchaVerifyCallback: captchaVerifyFun.captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
                onBizResultCallback: captchaVerifyFun.onBizResultCallback, // 业务请求结果回调函数，无需修改
                getInstance: getInstance, // 绑定验证码实例函数，无需修改
                immediate:true , // 完成验证后，是否立即发送验证请求（调用captchaVerifyCallback函数）
                language: 'cn', // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
                region: 'cn' //验证码示例所属地区，支持中国内地（cn）、新加坡（sgp）
            });
        }else{
            initAliyunCaptcha({
                SceneId: captchaVerifyFun.config.SceneId, // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
                prefix: captchaVerifyFun.config.prefix, // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
                mode: mode == 'app' ? 'embed':'popup', // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
                // element:'',
                button: ele, // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
                captchaVerifyCallback: captchaVerifyFun.captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
                onBizResultCallback: captchaVerifyFun.onBizResultCallback, // 业务请求结果回调函数，无需修改
                getInstance: getInstance, // 绑定验证码实例函数，无需修改
                language: 'cn', // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
                region: 'cn' //验证码示例所属地区，支持中国内地（cn）、新加坡（sgp）
            });
        }
        // 绑定验证码实例函数。该函数为固定写法，无需修改
        function getInstance(instance) {
            captcha = instance;
        }
    },

    // 获取相关配置
    getCaptchaConfig(mode){
        if(mode == 'h5'){
            let device = navigator.userAgent;
            if(device.indexOf('huoniao_iOS') > -1 ){
                mode = 'app'
            }
        }
        return new Promise((resolve,reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        let data = xhr.response;
                        captchaVerifyFun.config.SceneId = data['cfg_aliyun_captcha_' + mode]
                        captchaVerifyFun.config.prefix = data.cfg_aliyun_captcha_prefix;
                        resolve()
                    } else {
                        console.log("Request was unsuccessful: " + xhr.status);
                        reject()
                    }
                }
            };
            xhr.open("get", "/api/appConfig.json", true);
            xhr.responseType = 'json';
            xhr.send(null);
        });
    },

     // 业务请求(带验证码校验)回调函数
    /**
     * @name captchaVerifyCallback
     * @function
     * 请求参数：由验证码脚本回调的验证参数，不需要做任何处理，直接传给服务端即可
     * @params {string} captchaVerifyParam
     * 返回参数：字段名固定，captchaResult为必选；如无业务验证场景时，bizResult为可选
     * @returns {{captchaResult: boolean, bizResult?: boolean|undefined}} 
     */
    async captchaVerifyCallback(captchaVerifyParam){
        // 1.向后端发起业务请求，获取验证码验证结果和业务结果
        
        const result = await captchaVerifyFun.captchaVerify(captchaVerifyParam);
            // yourBizParam... // 业务参数
        // 2.构造标准返回参数
        const verifyResult = {
            captchaResult: result.captchaResult, // 验证码验证是否通过，boolean类型，必选
            bizResult: result.bizResult, // 业务验证是否通过，boolean类型，可选；若为无业务验证结果的场景，bizResult可以为空
        };
        return verifyResult;
    },

    // 发起业务请求，获取验证码验证结果和业务结果
    captchaVerify:function(captchaVerifyParam){
        return new Promise((resolve,reject) => {
            captchaVerifyFun.callback_captchaVerify(captchaVerifyParam,function(data){
                resolve({
                    captchaResult: !data.info || data.info != '图形验证错误，请重试！',
                    bizResult: data.state &&  data.state == 100,
                });
            })
        })
    },
    onBizResultCallback(bizResult){
        captchaVerifyFun.callback_onBizResult(bizResult)
    },


    // 极验相关
    /**
     * 获取极验相关配置
     * */ 
    initGee(mode,ele,captchaVerify,onBizResult){
        const that = this
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    let data = xhr.response;
                    window.initGeetest({
                        gt: data.gt,
                        challenge: data.challenge,
                        offline: !data.success,
                        new_captcha: true,
                        product: "bind",
                        width: '312px'
                    }, that.handlerPopupReg);
                } else {
                    console.log("Request was unsuccessful: " + xhr.status);
                }
            }
        };
        xhr.open("get", "/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), true);
        xhr.responseType = 'json';
        xhr.send(null);
        // $.ajax({
		// 	url: masterDomain + "/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), // 加随机数防止缓存
		// 	type: "get",
		// 	dataType: "json",
		// 	success: function (data) {
		// 		window.initGeetest({
		// 			gt: data.gt,
		// 			challenge: data.challenge,
		// 			offline: !data.success,
		// 			new_captcha: true,
		// 			product: "bind",
		// 			width: '312px'
		// 		}, that.handlerPopupReg);
		// 	}
		// });
    },

    // 极验
    handlerPopupReg:function(captchaObjReg){
        // 成功的回调
        var that = this;
        captchaObjReg.onSuccess(function () {
            var validate = captchaObjReg.getValidate();
            captchaVerifyFun.config.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
            // 继续验证
            captchaVerifyFun.callback_captchaVerify(captchaVerifyFun.config.dataGeetest)
            
        });
        captchaObjReg.onClose(function () {
        })

        captchaObjReg.onError((res) => {
            console.log(res)
        })
        captchaVerifyFun.config.captchaObjReg = captchaObjReg
    },
}
