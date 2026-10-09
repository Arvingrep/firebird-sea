<?php

    /*  1. 通用初始化  */
    if($userLogin->getUserID()==-1){
        header("location:" . $cfg_secureAccess.$cfg_basehost);
        exit();
    }

    /**
     * （一）、基本变量定义 ， （二）、函数定义 ，  （三）、业务变量定义 （四）、业务函数定义
     */

    /* 一、变量定义 */

    // $tpl 模板目录
    $tpl = dirname(__FILE__) . "/tpl";

    // $tpl目录的URL
    $staticFile = $cfg_secureAccess . $cfg_basehost . '/include/plugins/18/tpl/';

    // 设置插件根目录
    $base_url = dirname(__FILE__);

    // 页面url
    $page_url = get_page_url();

    // $tpl目录的URL
    $huoniaoTag->assign('staticFile', $staticFile);


    /* --------- 函数定义 -------------- */
    // 变量调试1
    function easy_dump($name){
        echo "<pre>";
        print_r($name);
        echo "</pre>";
    }
    // 变量调试2
    function easy_echo($str){
        echo "<p>";
        echo $str;
        echo "</p>";
    }
    // 获取页面url
    function get_page_url(){
        return (isset($_SERVER['HTTPS'])?"https":"http").'://'.$_SERVER['HTTP_HOST']. $_SERVER['PHP_SELF'];
    }
    // 基本curl
    function easy_curl($url){
        $ch = curl_init();
        // 设置URL
        curl_setopt($ch, CURLOPT_URL, $url);
        // 输出结果不需要头信息
        curl_setopt($ch, CURLOPT_HEADER, 0);
        // 字符串形式
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // 允许301,302
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        // 取消https验证
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        // 尝试连接时等待的秒数,输入0不需要等待
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,0);
        // 允许curl函数执行的最大秒数
        curl_setopt($ch, CURLOPT_TIMEOUT, 1);
        // 抓取URL并把它传递给浏览器
        $con = curl_exec($ch);
        // 关闭cURL资源，并且释放系统资源
        curl_close($ch);
        return $con;
    }
    // 构造错误消息
    function build_err($msg=null,bool $die=true){
        // 数组处理
        if(is_array($msg)){
            if(!isset($msg['errno'])){
                $msg['errno'] = -1;
            }
            if(!isset($msg['errmsg'])){
                $msg['errmsg'] = "fail";
            }
            echo json_encode($msg,JSON_UNESCAPED_UNICODE);
        }
        // 字符串处理
        elseif(is_string($msg)){
            echo json_encode(array("errno"=>-1,"errmsg"=>$msg),JSON_UNESCAPED_UNICODE);
        }
        // 默认值
        elseif(empty($msg)){
            echo json_encode(array("errno"=>-1,"errmsg"=>"fail"),JSON_UNESCAPED_UNICODE);
        }
        if($die){
            die;
        }
    }
    // 构造成功消息
    function build_success($msg=null){
        $msg_arr = array();
        if(empty($msg)){
            $msg_arr = ["errno"=>0,"errmsg"=>"success"];
        }
        elseif(is_string($msg)){
            $msg_arr = ["errno"=>0,"errmsg"=>$msg];
        }
        elseif(is_array($msg)){
            if(!isset($msg['errno'])){
                $msg['errno'] = 0;
            }
            if(!isset($msg['errmsg'])){
                $msg['errmsg'] = "success";
            }
            $msg_arr = $msg;
        }
        echo json_encode($msg_arr,JSON_UNESCAPED_UNICODE);
    }

    // 二维数据根据其中一个键值去重
    function assoc_unique($arr, $key) {

        $tmp_arr = array();

        foreach ($arr as $k => $v) {

            if (in_array($v[$key], $tmp_arr)) {//搜索$v[$key]是否在$tmp_arr数组中存在，若存在返回true

                unset($arr[$k]);

            } else {

                $tmp_arr[] = $v[$key];

            }

        }

        sort($arr); //sort函数对数组进行排序

        return $arr;

    }

    /*  ------------- 三、业务变量定义------ */

    // 用户数据
    $data_file = "./data/data.php";

    // 用户数据json备份文件
    $json_file = "./data/data.json";

    // 用户配置文件
    $config_file = "./data/config.php";

    // 用户统计文件
    $tongji_file = "./data/c.php";

    // 用户数据缓存 session
    $plugin_18_data = "plugin_18_data";
