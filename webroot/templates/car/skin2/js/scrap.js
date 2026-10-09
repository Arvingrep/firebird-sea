new Vue({
    el: '#page',
    data: {
        formData: {
            picsTurl: [],//展示照片（提交需删除）
            pics: [], //照片(提交的时候需转成以逗号链接的字符串)
            title: '',//品牌型号
            name: '',//联系人
            phone: '',//手机号码
        },
        errorItem: '',//表单验证空值
        ajaxb: false,
    },
    mounted() { },
    methods: {
        // 工具函数（单纯调用）
        ajax(data, param = {}) { //发起网络请求
            return new Promise((resolve, reject) => {
                if (param.operate) {
                    $.ajax({
                        url: param.url || '/include/ajax.php',
                        data: data,
                        type: param.type || 'POST',
                        dataType: param.dataType || 'jsonp',
                        processData: false,
                        contentType: false,
                        timeout: 5000, //超时时间
                        error: error => {
                            if (error.responseText) { //上传成功
                                resolve(JSON.parse(error.responseText)); //媒体文件上传返回的结果
                            } else { //上传失败
                                resolve(error.statusText);
                            }
                        }
                    })
                } else {
                    $.ajax({
                        url: param.url || '/include/ajax.php',
                        data: data,
                        type: param.type || 'POST',
                        dataType: param.dataType || 'jsonp',
                        timeout: 5000, //超时时间
                        success: (res) => {
                            resolve(res);
                        },
                        error: error => {
                            reject(error);
                        }
                    })
                }
            })
        },
        async submitIn() { //提交
            if (this.ajaxb) {
                return false
            }
            this.ajaxb = true;
            let formData = JSON.parse(JSON.stringify(this.formData)); //防止提交失败页面视图受到影响
            delete formData.picsTurl;// 多余项删除
            formData.pics = formData.pics.join(','); //图片数组变字符串
            let data = {
                service: 'car',
                action: 'scrap',
            }
            data = { ...data, ...formData };
            let result = await this.ajax(data);
            alert(result.info);
            if (result.state == 100) { //提交成功状态，状态不更新
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                this.ajaxb = false; //提交失败，恢复提交之前的状态
            }
        },
        // 功能函数
        uploadImgFn() { //图片上传
            let arr = event.target.files;
            if (!arr[0]) { //取消上传
                return false;
            }
            let length = arr.length;
            let initLength = this.formData.picsTurl.length; //上传之前展示图片的长度
            for (let i = 0; i < length; i++) {
                let imgData = new FormData()// new 文件对象
                imgData.append('Filedata', arr[i]);
                this.formData.picsTurl.push('loading'); //loading加载条
                this.ajax(imgData, { url: '/include/upload.inc.php?type=atlas&mod=car', operate: 'upload' }).then(result => {
                    if (typeof result == 'object') {
                        if (result.state == 'SUCCESS') {
                            this.formData.pics.push(result.url);
                            this.$set(this.formData.picsTurl, i + initLength, result.turl);
                        } else { //接口返回出错
                            this.$set(this.formData.picsTurl, i + initLength, '');//置空，不能删除
                            alert(`图片${arr[i].name}上传失败，原因：${result.state}`);
                        }
                    } else { //服务器错误
                        this.$set(this.formData.picsTurl, i + initLength, ''); //置空，不能删除
                        alert(`图片${arr[i].name}上传失败，原因：${result}`);
                    }
                })
            }
        },
        deletImgFn(index) { //删除上传图片
            this.formData.picsTurl.splice(index, 1);
            this.formData.pics.splice(index, 1);
        },
        checkFormFn() { //提交前的验证
            let formData = this.formData;
            if (!formData.phone) {
                this.errorItem = 'phone';
                return false
            }
            // 验证通过提交
            this.submitIn();
        },
    },
});