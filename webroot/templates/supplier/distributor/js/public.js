/* get和post的datas说明:
    1.url：请求地址，必传
    2.params：请求参数，必传
*/
var staticPathImage = '/static/images'; //图片路径
var errorPhoto = `${staticPathImage}/noPhoto_100.jpg`; //头像error路径
var errorImage = `${staticPathImage}/404.png`; //非头像图片error路径
var request = {
    post: (data, url, headers = {}) => {
        return new Promise((resolve, reject) => {
            let dataStr = '';
            if (typeof data == "object") {
                for (key in data) {
                    if (key != 'action') {
                        dataStr += `${key}=${data[key]}&`
                    }
                }
            } else {
                dataStr = data;
            }
            axios({
                url: url ? `${url}?action=${data.action}` : `/include/ajax.php?action=${data.action}`,
                method: 'POST',
                data: dataStr,
                headers
            }).then(res => {
                resolve(res);
            }).catch(error => {
                reject(error);
            })
        })
    },
    get: (data, url) => {
        return new Promise((resolve, reject) => {
            let dataStr = '';
            if (typeof data == "object") {
                for (key in data) {
                    if (key != 'action') {
                        dataStr += `${key}=${data[key]}&`
                    }
                }
            } else {
                dataStr = data;
            }
            axios({
                url: url ? `${url}?action=${data.action}` : `/include/ajax.php?action=${data.action}`,
                method: 'GET',
                params: data,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            }).then(res => {
                resolve(res);
            }).catch(error => {
                reject(error);
            })
        })
    },
    uploadFileFn({ Filedata, mod, type, filetype }) { //文件上传
        // 上传数据准备
        let url = "/include/upload.inc.php";
        let data = {
            Filedata: Filedata,
            mod: mod || 'house',
            type: type || 'atlas',
            filetype: filetype || 'image'
        };
        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        let headers = { "Content-Type": "multipart/form-data" };
        return new Promise((resolve, reject) => {
            axios.post(url, formData, headers).then(res => {
                resolve(res);
            }).catch(res => {
                reject(res);
            });
        })
    },
}
//功能方法：直接调用，没有特殊要求
var utils = {
    //时间戳转换
    timeChange: (time, config = { Y: 1, M: 1, D: 1, h: 1, m: 1, s: 1, connect: '-' }) => {
        if (String(time).length < 13) {
            time *= 1000;
        }
        let targeTime = new Date(time);
        let year = '';
        if (config.Y) {
            year = `${targeTime.getFullYear()}${config.connect}`;
        }
        let month = '';
        if (config.M) {
            month = `${targeTime.getMonth() + 1 < 10 ? `0${targeTime.getMonth() + 1}` : targeTime.getMonth() + 1}${config.D ? config.connect : ''}`;
        }
        let day = '';
        if (config.D) {
            day = targeTime.getDate() < 10 ? `0${targeTime.getDate()}` : targeTime.getDate();
        }
        let hour = '';
        if (config.h) {
            hour = `${targeTime.getHours() < 10 ? `0${targeTime.getHours()}` : targeTime.getHours()}${config.m ? ':' : ''}`;
        }
        let minute = '';
        if (config.m) {
            minute = `${targeTime.getMinutes() < 10 ? `0${targeTime.getMinutes()}` : targeTime.getMinutes()}${config.s ? ':' : ''}`;
        }
        let second = '';
        if (config.s) {
            second = targeTime.getSeconds() < 10 ? `0${targeTime.getSeconds()}` : targeTime.getSeconds();
        }
        return `${year}${month}${day} ${hour}${minute}${second}`
    },
    //获取url参数
    getUrlParams: paramName => {
        let url = location.search;
        let params = new URLSearchParams(url.slice(1));
        return params.get(paramName);
    },
    //页面跳转
    linkTo(url, current = false, redirect = false, blank = false) {
        if (!url) {
            return false
        }
        let targetUrl = `${current ? '/include/plugins/25/homepage.php?tpl=' : ''}${url}`; //是否是改项目下的文件
        if (redirect) { //是否关闭当前页面打开新页面
            history.replaceState(null, null, targetUrl);
            location.reload();
        } else if (blank) {
            open(url);
        } else {
            location.href = targetUrl;
        }
    },
    async getCompanyInfo(companyInfo) {
        let data = {
            service: 'house',
            action: 'route',
            route: 'distributor/getCompanyInfo'
        }
        let result = await request.post(data);
        if (result.data.state == 100) {
            companyInfo.value = result.data.info;
        }
    },
    async getUserInfo(userInfo) {
        let data = {
            service: 'house',
            action: 'route',
            route: 'distributor/getNowCompanyUser'
        }
        let result = await request.post(data);
        if (result.data.state == 100) {
            userInfo.value = result.data.info;
        }
    },
}