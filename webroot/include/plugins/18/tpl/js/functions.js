/**
 * 消息提醒函数
 * type限定为：default/info/success/warning/error中的任一种
 */
function message(text,type){
    let text_class = "";
    switch(type){

        case "default":
            text_class = "fa fa-comments";
            break;
        case "info":
            text_class = "fa fa-info-circle text-info";
            break;
        case "success":
            text_class = "fa fa-check-square-o text-success";
            break;
        case "warning":
            text_class = "fa fa-warning text-warning";
            break;
        case "error":
            text_class = "fa fa-close text-danger";
            break;
        default:
            throw "消息type错误，请传递default/info/success/warning/error中的任一种";
            break;
    }
    let msgs = $(".message");
    let len = msgs.length;
    let end = 0;
    let baseHeight = 0;
    if(len>0){
        baseHeight =msgs.first().innerHeight()+20;
        let start = msgs.first().attr('no');
        end = +start+len;
    }
    let height = 100+end*baseHeight+"px";
    $(`<div no='${end}' id='msg-${end}' class='message ${text_class}' style='top: ${height};position: fixed;left: 50%;border: 1px solid #ddd;
        background-color:#bbb;transform: translate(-50%, -50%);font-size: 1.2em;padding: 1rem;z-index: 999;border-radius: 0.5rem;'>${text}</div>`).appendTo("body");
    let rmScript = `$("#msg-${end}").remove();`;
    setTimeout(rmScript,1500);
}

/**
 * 获取url查询参数
 * base 是否使用原始格式，如果true则保留原格式，否则默认自动解码
 */
function getQuery(base){
    let query = location.search.substring(1)
    let key_values = query.split("&")
    let obj = {}
    key_values.forEach(key_val => {
        let key_val_split = key_val.split("=")
        let obj_value;
        if(!base){
            obj_value = decodeURIComponent(key_val_split[1])
        }else{
            obj_value = key_val_split[1]
        }
        if(obj_value){  // 不为空时，尝试自动转number
            let number_value = Number(obj_value)
            if(!isNaN(number_value)){
                obj_value = number_value
            }
        }
        obj[key_val_split[0]] = obj_value
    });
    return obj
}
/**
 * 自动打印消息
 */
function auto_message(json_obj){
    if(json_obj.errno==0){
        message(json_obj.errmsg,"success");
    }else{
        message(json_obj.errmsg,"error");
    }
}
