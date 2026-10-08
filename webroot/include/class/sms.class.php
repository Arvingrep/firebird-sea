<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 短信操作类
 *
 * @version        $Id: sms.class.php 2015-08-06 下午12:51:11 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class sms extends db_connect{
    // 公有变量
    var $title;
    var $username;
    var $password;
    var $charset;
    var $sendUrl;
    var $sendCode;
    var $accountUrl;
    var $accountCode;

    function __construct($db = NULL, $config = array()){
        parent::__construct($db);
        if(!empty($config)){
            $this->title         = $config['title'];
            $this->username      = $config['username'];
            $this->password      = $config['password'];
            $this->charset       = $config['charset'];
            $this->sendUrl       = $config['sendUrl'];
            $this->sendCode      = $config['sendCode'];
            $this->accountUrl    = $config['accountUrl'];
            $this->accountCode   = $config['accountCode'];

            $this->signCode      = $config['signCode'];
            $this->international = $config['international'];
            $this->china         = $config['china'];
        }else{
            $archives = $this->SetQuery("SELECT * FROM `#@__sitesms` WHERE `state` = 1");
            $results = $this->db->prepare($archives);
            $results->execute();
            $results = $results->fetchAll(PDO::FETCH_ASSOC);
            if($results){
                $data = $results[0];
                $this->title       = $data['title'];
                $this->username    = $data['username'];
                $this->password    = $data['password'];
                $this->charset     = $data['charset'];
                $this->sendUrl     = $data['sendUrl'];
                $this->sendCode    = $data['sendCode'];
                $this->signCode    = $data['signCode'];
                $this->accountUrl  = $data['accountUrl'];
                $this->accountCode = $data['accountCode'];

                // 国际短信
                $title = $data['title'];
                $international = 0;
                if(strpos($title, "创蓝") || strpos($title, "253") || strpos($title, "cl2009")){
                    if($data['international']){
                        $international = 1;
                    }
                }
                $this->international = $data['international'];
                $this->china = $data['china'];


            }else{
                return "error";
            }
        }
    }


    /**
     *  发送短信
     *  @return  string
     */
    function send($mobile = "", $content = ""){

        global $cfg_soft_lang;
        $charset = 'utf-8';
        if($this->charset == 1){
            $charset = 'gb2312';
        }elseif($this->charset == 2){
            $charset = 'big5';
        }

        $mobile = $this->international ? $mobile : substr($mobile, -11);


		//如果开启了支持国际短信，并且开启了国内号码补86，这里验证后给号码前补86
		//国内手机号码验证：11位，并且第一个数字为1
		if($this->international && $this->china && strlen($mobile) == 11 && (int)substr($mobile, 0, 1) == 1){
			$mobile = '86'.$mobile;
		}


        $sendUrl = str_replace('{$username$}', $this->username, $this->sendUrl);
        $sendUrl = str_replace('{$password$}', $this->password, $sendUrl);
        $sendUrl = str_replace('{$mobile$}', $mobile, $sendUrl);

        // 国际短信发国内号码需要签名
        $content = $this->international ? "【".$this->signCode."】".$content : $content;
        $sendUrl = str_replace('{$content$}', mb_convert_encoding($content, $charset, $cfg_soft_lang), $sendUrl);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        //253国际短信兼容
        if($this->international && strstr($sendUrl, '253.com')){
            $urlData = explode('?', $sendUrl);
            $sendUrl = $urlData[0];

            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $urlData[1]);
        }

        curl_setopt($ch, CURLOPT_URL, $sendUrl);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $result = curl_exec($ch);
        curl_close($ch);

        $ischeck = explode($this->sendCode, $result);
        if(count($ischeck) > 1){
            return "ok";
        }else{

			if(HUONIAOBUG){
	            require_once HUONIAOROOT."/api/payment/log.php";
	            $_smsLog= new CLogFileHandler(HUONIAOROOT.'/log/sms/'.date('Y-m-d').'.log');
	            $_smsLog->DEBUG("短信发送错误日志");
	            $_smsLog->DEBUG("发送内容：" . json_encode(array("平台：" => $this->title, "发送号码：" => $mobile, "发送内容：" => $content), JSON_UNESCAPED_UNICODE));
	            $_smsLog->DEBUG("错误返回：" . json_encode($result, JSON_UNESCAPED_UNICODE));
			}

            return $result;
        }
    }


    /**
     *  检查剩余量
     *  @return  string
     */
    function check(){

        $accountUrl = str_replace('{$username$}', $this->username, $this->accountUrl);
        $accountUrl = str_replace('{$password$}', $this->password, $accountUrl);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL,$accountUrl);
		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $result = curl_exec($ch);
        curl_close($ch);

        if(!empty($result)){

            if($this->accountCode != '{$num$}') {
                $arr = explode('{$num$}', $this->accountCode);

                $reArr = explode($arr[0], $result);
                $result = str_replace($reArr[0], "", $result);

                foreach ($arr as $key => $value) {
                    $result = str_replace($value, "", $result);
                }
            }
            return $result;
        }else{
            return 0;
        }
    }

}//End Class
