<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 华为云隐私保护通话
 *
 * @version        $Id: huaweiPrivatenumber.class.php 2022-5-12 上午10:33:36 $
 * @package        HuoNiao.Class
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */

class huaweiPrivatenumber {
    private $APP_KEY;   //APP_KEY
    private $APP_SECRET;  //APP_SECRET
    private $HEADERS;  //请求头

    public function __construct() {

        include HUONIAOINC . "/config/privatenumberConfig.inc.php";
        
        $this->APP_KEY = $huawei_privatenumber_app_key;
        $this->APP_SECRET = $huawei_privatenumber_app_secret;

        // 请求Headers
        $this->HEADERS = [
            'Accept: application/json',
            'Content-Type: application/json;charset=UTF-8',
            'Authorization: WSSE realm="SDP",profile="UsernameToken",type="Appkey"',
            'X-WSSE: ' . $this->buildWsseHeader($this->APP_KEY, $this->APP_SECRET)
        ];
    }

    public function execute($url, $data, $method = 'POST') {

        //请求参数
        $context_options = [
            'http' => [
                'method' => $method,
                'header' => $this->HEADERS,
                'content' => $data,
                'ignore_errors' => true // 获取错误码,方便调测
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ] // 为防止因HTTPS证书认证失败造成API调用失败,需要先忽略证书信任问题
        ];

        //发送请求
        //获取录音
        if(strstr($url, 'provision/voice/record')){

            $http_response_header = get_headers($url, 1, stream_context_create($context_options)); //获取响应消息头域信息
            if(strpos($http_response_header[0], '301') !== false){
                return $http_response_header['Location'];
            }

        }else{
            $response = file_get_contents($url, false, stream_context_create($context_options));
        }

        //返回结果
        return json_decode($response, true);
    }

    /**
     * 构建X-WSSE值
     *
     * @param string $appKey
     * @param string $appSecret
     * @return string
     */
    private function buildWsseHeader($appKey, $appSecret) {
        date_default_timezone_set("UTC");
        $Created = date('Y-m-d\TH:i:s\Z'); //Created
        $nonce = uniqid(); //Nonce
        $base64 = base64_encode(hash('sha256', ($nonce . $Created . $appSecret), TRUE)); //PasswordDigest

        return sprintf("UsernameToken Username=\"%s\",PasswordDigest=\"%s\",Nonce=\"%s\",Created=\"%s\"", $appKey, $base64, $nonce, $Created);
    }
}