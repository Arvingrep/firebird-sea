<?php
class WechatJSSDK {
  public $appId;
  public $appSecret;

  public function __construct($appId, $appSecret) {

    //系统默认公众号APPID
    global $cfg_wechatAppid;

    //系统默认小程序APPID
    global $cfg_miniProgramAppid;

    //如果是获取公众号的token，需要根据情况获取分站绑定的独立公众号
    // 如果url中有cityid参数，强制以该城市为准
    // 否则，以cookie中的siteCitInfo为准
    // 都没有时，以系统默认配置为准
    if(!$appId || $appId == $cfg_wechatAppid || $appId == $cfg_miniProgramAppid){
        
        $_check_cityid = (int)$_GET['cityid'] ?? '';
        if(!$_check_cityid){
            global $siteCityInfo;
            $_check_cityid = (int)$siteCityInfo['cityid'] ?? '';
        }

        if($_check_cityid){
            $_wechatConfig = $appId == $cfg_wechatAppid ? getWechatCityAdvancedConfig('', $_check_cityid) : getMiniProgramCityAdvancedConfig('', $_check_cityid);
            if($_wechatConfig){
                $appId = $_wechatConfig['appid'];
                $appSecret = $_wechatConfig['appsecret'];
            }
        }

    }

    $this->appId = $appId;
    $this->appSecret = $appSecret;
  }

  public function getSignPackage($url = '') {
    $jsapiTicket = $this->getJsApiTicket();

    global $cfg_secureAccess;

    // 注意 URL 一定要动态获取，不能 hardcode.
    $protocol = $cfg_secureAccess;

    $REQUEST_URI = $url ? $url : $_SERVER['REQUEST_URI'];
    $url = "$protocol$_SERVER[HTTP_HOST]$REQUEST_URI";

    $timestamp = time();
    $nonceStr = $this->createNonceStr();

    // 这里参数的顺序要按照 key 值 ASCII 码升序排序
    $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";

    $signature = sha1($string);

    $signPackage = array(
      "appId"     => $this->appId,
      "nonceStr"  => $nonceStr,
      "timestamp" => $timestamp,
      "url"       => $url,
      "signature" => $signature,
      "rawString" => $string
    );
    return $signPackage;
  }

  public function createNonceStr($length = 16) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $str = "";
    for ($i = 0; $i < $length; $i++) {
      $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
    }
    return $str;
  }

  public function getJsApiTicket() {
    // jsapi_ticket 应该全局存储与更新，以下代码以写入到文件中做示例
    $data = json_decode(@file_get_contents(HUONIAOROOT."/data/cache/wechat_jsapi_ticket_".$this->appId.".json"));
    if (!$data || $data->expire_time < time()) {
      $accessToken = $this->getAccessToken();
      $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=$accessToken";
      $res = json_decode($this->httpGet($url));
      $ticket = $res->ticket;
      if ($ticket) {
        $data = new stdClass();
        $data->expire_time = time() + 7000;
        $data->jsapi_ticket = $ticket;
        $fp = @fopen(HUONIAOROOT."/data/cache/wechat_jsapi_ticket_".$this->appId.".json", "w");
        @fwrite($fp, json_encode($data));
        @fclose($fp);
      }
    } else {
      $ticket = $data->jsapi_ticket;
    }

    return $ticket;
  }

  public function getAccessToken($force = false) {
    // access_token 应该全局存储与更新，以下代码以写入到文件中做示例
    $data = json_decode(@file_get_contents(HUONIAOROOT."/data/cache/wechat_access_token_".$this->appId.".json"));
    if (!$data || $data->expire_time < time() || $force) {
      $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
      $res = json_decode($this->httpGet($url));
      $access_token = $res->access_token;
      if ($access_token) {
        $data = new stdClass();
        $data->expire_time = time() + 7000;
        $data->access_token = $access_token;
        $fp = @fopen(HUONIAOROOT."/data/cache/wechat_access_token_".$this->appId.".json", "w");
        @fwrite($fp, json_encode($data));
        @fclose($fp);
      }
    } else {
      $access_token = $data->access_token;
    }
    return $access_token;
  }

  public function getWxminiAccessToken($force = false) {
    // access_token 应该全局存储与更新，以下代码以写入到文件中做示例
    $data = json_decode(@file_get_contents(HUONIAOROOT."/data/cache/wxmini_access_token_".$this->appId.".json"));
    if (!$data || $data->expire_time < time() || $force) {

    //   $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$this->appId&secret=$this->appSecret";
    //   $res = json_decode($this->httpGet($url));

      $result = hn_curl('https://api.weixin.qq.com/cgi-bin/stable_token', array('grant_type' => 'client_credential', 'appid' => $this->appId, 'secret' => $this->appSecret), 'json');
      $res = json_decode($result, true);
      $access_token = $res['access_token'];
      if ($access_token) {
        $data = new stdClass();
        $data->expire_time = time() + 7000;
        $data->access_token = $access_token;
        $fp = @fopen(HUONIAOROOT."/data/cache/wxmini_access_token_".$this->appId.".json", "w");
        @fwrite($fp, json_encode($data));
        @fclose($fp);
      }
    } else {
      $access_token = $data->access_token;
    }
    return $access_token;
  }

  //强制更新access_token
  public function updateAccessToken(){
    $this->getAccessToken(true);
  }

  public function httpGet($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_URL, $url);

    $res = curl_exec($curl);
    curl_close($curl);

    return $res;
  }
}
