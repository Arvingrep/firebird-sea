// 配置参数修改（手动修改）
let path_origin = `D:/wwwroot/huoniao-uniapp/unpackage/dist/build/web`; //起始地址 `D:/wwwroot/huoniao_uniapp_test/unpackage/dist/build/h5`  `${__dirname}/origin`
// 1.修改目标地中的文件，清空css和js文件夹
let fs = require('fs');
let path_target = `${__dirname}`;  // 迁移目标地
// (1).删除css和js文件夹
let arr = ['css', 'js'];
for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    // 检查css和js文件是否存在;
    fs.access(`${path_target}/${item}`, res => {
        if (!res) {
            // 文件存在，删除css和js
            let fileList = fs.readdirSync(`${path_target}/${item}`);
            // 删除该文件夹里面的所有文件
            for (let j = 0; j < fileList.length; j++) {
                fs.rmSync(`${path_target}/${item}/${fileList[j]}`);
            }
            fs.rmdirSync(`${path_target}/${item}`); //删除文件夹
        }
    })
}
// 2.修改起始地中index.html和index.js中的内容
let template = `${__dirname.match(/templates\\(\S*)\\touch/)[1]}`; // 模块名称
template = 'diy'
//(1).修改index.html 
let indexHtml = fs.readFileSync(`${path_origin}/index.html`, 'utf-8'); //读取
let htmlArr = [
    {
        rule: new RegExp(`/${template}/assets/(\\S*).js`),
        pre: '{#$templets_skin#}js/',
        nav: '.js?v={#$cfg_staticVersion#}'
    },
    {
        rule: new RegExp(`/${template}/assets/(\\S*).css`),
        pre: '{#$templets_skin#}css/',
        nav: '.css?v={#$cfg_staticVersion#}'
    },
    {
        origin: 'huoniao_uniapp',
        target: `{#$${template}_title#}`
    }
]
for (let i = 0; i < htmlArr.length; i++) {
    let item = htmlArr[i];
    if (item.rule) { //规则替换
        while (indexHtml.match(item.rule)) {//如果还有就继续查找
            indexHtml = indexHtml.replace(item.rule, item.pre + indexHtml.match(item.rule)[1] + item.nav);
        }
    } else { //直接替换
        indexHtml = indexHtml.replaceAll(item.origin, item.target);
    }
}
fs.writeFileSync(`${path_origin}/index.html`, indexHtml, 'utf8'); //重写
//(2).修改index.js
let beforeEachXml = fs.readFileSync(`${__dirname}/config.xml`, 'utf-8'); //路由守卫读取
let beforeEach = base64('decode', beforeEachXml.match(/<beforeEach>([\s\S]*)<[/]beforeEach>/)[1]); //路由守卫内容
let jsName; //index.js
let assetsList = fs.readdirSync(`${path_origin}/assets`); //assets文件列表
for (let i = 0; i < assetsList.length; i++) {
    let rule = /index-(\S*).js/;
    if (assetsList[i].match(rule)) {
        jsName = assetsList[i].match(rule)[1]; //找到index-xxx.js
        break;
    }
}
let indexJs = fs.readFileSync(`${path_origin}/assets/index-${jsName}.js`, 'utf-8'); //读取
let replaceArr = [ //替换规则/目标
    {
        origin: `"/${template}/"`,
        target:`"/templates/member/company/touch/${template}/"`
    },
    {
        origin: `"/${template}"`,
        target: 'pathname'
    },
    {
        origin: 'return $}',
        target: `$.${beforeEach};return $}`
    },
    {
        origin: 'return I}',
        target: `I.${beforeEach};return I}`
    },
    {
        origin: 'return O}',
        target: `O.${beforeEach};return O}`
    },
    {
        rule: new RegExp(`pages/packages/${template}/(\\S*)/([\^,]*)"`),
        pre: '',
        nav: '"'
    },
    {
        rule: /assets[/]([^,]*).js/,
        pre: 'js/',
        nav: '.js'
    },
    {
        rule: /assets[/]([^,]*).css/,
        pre: 'css/',
        nav: '.css'
    },
    {
        rule: /path:"[/]pages[/](\S*)[/]index/,
        pre: 'path:"/',
        nav: ''
    }
];
for (let i = 0; i < replaceArr.length; i++) { //替换
    let item = replaceArr[i];
    if (item.rule) { //规则替换
        while (indexJs.match(item.rule)) { //如果还有就继续查找
            indexJs = indexJs.replace(item.rule, item.pre + indexJs.match(item.rule)[1] + item.nav);
        }
    } else { //直接替换
        indexJs = indexJs.replaceAll(item.origin, item.target);
    }
}
fs.writeFileSync(`${path_origin}/assets/index-${jsName}.js`, indexJs, 'utf8'); //重写
//(3).创建css和js文件夹
for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    fs.mkdirSync(`${path_origin}/${item}`);
}
//(4).分离css和js,并删除assets
let ruleJs = /(\S*).js/;
let ruleCss = /(\S*).css/;
for (let i = 0; i < assetsList.length; i++) {
    if (assetsList[i].match(ruleJs)) {
        fs.cpSync(`${path_origin}/assets/${assetsList[i]}`, `${path_origin}/js/${assetsList[i]}`);
    } else if (assetsList[i].match(ruleCss)) {
        fs.cpSync(`${path_origin}/assets/${assetsList[i]}`, `${path_origin}/css/${assetsList[i]}`);
    }
    fs.rmSync(`${path_origin}/assets/${assetsList[i]}`);//删除
    if (assetsList.length - 1 == i) { //删除文件夹
        fs.rmdirSync(`${path_origin}/assets`); //删除文件夹
    }
}
//(5).修改css内静态地址
let cssList = fs.readdirSync(`${path_origin}/css`); //assets文件列表
for (let i = 0; i < cssList.length; i++) {
    let cssText = fs.readFileSync(`${path_origin}/css/${cssList[i]}`, 'utf-8'); //读取
    let rule = new RegExp(`/${template}/assets/(\[^-\]*)`); //获取静态文件名字
    while (cssText.match(rule)) { //如果还有就继续查找
        let statciName = cssText.match(rule)[1];
        let replaceRule1 = new RegExp(`/${template}/assets/`);
        let replaceRule2 = new RegExp(`/${template}/assets/(\[^.\]*).`);
        if (cssText.match(replaceRule2)) { //重写文件名
            cssText = cssText.replaceAll(cssText.match(replaceRule2)[1], '');
        }
        cssText = cssText.replace(replaceRule1, `/static/fonts/${statciName}`);
    }
    fs.writeFileSync(`${path_origin}/css/${cssList[i]}`, cssText, 'utf8'); //重写
}
// (6).删除多余文件
emptyDir(`${path_origin}/uni_modules`); //删除uni_modules
emptyDir(`${path_origin}/static/svg`); //删除svg
//3.文件迁移,直接覆盖目标文件
fs.cp(`${path_origin}`, `${path_target}`, { recursive: true, force: true }, res => { });
/*删除指定目录下所有子文件和路径文件夹 */
function emptyDir(path) {
    const files = fs.readdirSync(path);
    files.forEach(file => {
        const filePath = `${path}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            emptyDir(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    });
    fs.rmdirSync(path);
}
// base64
function base64(name, string) {
    let Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            }
            return t
        },
        decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = Base64._utf8_decode(t);
            return t
        },
        _utf8_encode: function (e) {
            e = e.replace(/rn/g, "n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128)
                } else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        },
        _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    }
    return Base64[name](string);
}