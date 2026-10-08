<?php   if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * 友盟智能认证
 *
 * @version        $Id: umengAi.class.php 2020-12-9 下午15:36:47 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class umengAi{

	private $serverApiHost = 'https://verify5.market.alicloudapi.com';  //请求地址
	private $serverPath = '/api/v1/mobile/info';  //请求PATH
	private $aliyunAppKey;    //阿里云市场 【友盟+】智能认证 U-Verify（一键登录）商品AppKey https://market.console.aliyun.com/
	private $aliyunAppSecret;    //阿里云市场 【友盟+】智能认证 U-Verify（一键登录）商品AppSecret https://market.console.aliyun.com/
    private $androidAppKey;  //友盟智能认证API配置中安卓应用的AppKey
    private $iosAppKey;      //友盟智能认证API配置中iOS应用的AppKey

	function __construct($config = array()){
		global $dsql;
		$sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
		$appRet = $dsql->dsqlOper($sql, "results");
		if($appRet && is_array($appRet)){
			$this->aliyunAppKey = $appRet[0]['umeng_aliyunAppKey'];
			$this->aliyunAppSecret = $appRet[0]['umeng_aliyunAppSecret'];
	        $this->androidAppKey = $appRet[0]['umeng_androidAppKey'];
	        $this->iosAppKey = $appRet[0]['umeng_iosAppKey'];
		}
    }

	function getPhone($token) {

		$appkey = isAndroidApp() ? $this->androidAppKey : $this->iosAppKey;
		if(empty($this->aliyunAppKey) || empty($this->aliyunAppSecret) || empty($appkey)){
			return array(
				'state' => 200,
				'info' => '请到系统后台APP配置中完善本机号码一键登录信息！'
			);
		}

		//请求路径
		$this->serverPath .= '?appkey=' . $appkey;

		//客户端传递的token
		$params = array('token' => $token);

		//header参数
		$httpHeader = $this->createHttpHeader();

		//header转string
		$headerArray = array();
		if (is_array($httpHeader)) {
			if (0 < count($httpHeader)) {
				foreach ($httpHeader as $itemKey => $itemValue) {
					if (0 < strlen($itemKey)) {
						array_push($headerArray, $itemKey.":".$itemValue);
					}
				}
			}
		}

		$ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->serverApiHost . $this->serverPath);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headerArray);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $ret = curl_exec($ch);
		$error = '';
        if (false === $ret) {
            $error = curl_errno($ch);
        }
        curl_close($ch);

		if($ret){
			$ret = json_decode($ret, true);
			if($ret['success']){
				//成功
				return array(
					'state' => 100,
					'info' => $ret['data']['mobile']
				);
			}else{
				//失败
				return array(
					'state' => 200,
					'info' => $ret['message']
				);
			}
		}else{
			//接口错误
			return array(
				'state' => 200,
				'info' => $error
			);
		}

	}

	/**
     * 创建http header参数
     * @param array $data
     * @return bool
     */
    private function createHttpHeader() {

        $timeStamp = getMillisecond();  //当前毫秒时间戳
		$uuid = create_uuid();  //UUID

		//头信息
        $header = array(
            'Content-Type' => 'application/json; charset=UTF-8',  //请求体类型
            'Accept' => 'application/json',  //请求响应体类型
            'X-Ca-Version' => '1',  // API 版本号，目前所有 API 仅支持版本号『1』，可以不设置此请求头，默认版本号为『1』。
            'X-Ca-Signature-Headers' => 'X-Ca-Nonce,X-Ca-Version,X-Ca-Stage,X-Ca-Key,X-Ca-Timestamp',  //参与签名的自定义请求头，服务端将根据此配置读取请求头进行签名，此处设置不包含 Content-Type、Accept、Content-MD5、Date 请求头，这些请求头已经包含在了基础的签名结构中，详情参照请求签名说明文档。
            'X-Ca-Stage' => 'RELEASE',  //默认RELEASE
            'X-Ca-Key' => $this->aliyunAppKey,  //请求的 阿里云AppKey，通过云市场等渠道购买的 API 默认已经给 APP 授过权，阿里云所有云产品共用一套 AppKey 体系，删除 ApppKey 请谨慎，避免影响到其他已经开通服务的云产品。
            'X-Ca-Timestamp' => $timeStamp,  //请求的时间戳，值为当前时间的毫秒数
			'X-Ca-Nonce' => $uuid,  //请求唯一标识，15分钟内 AppKey+API+Nonce 不能重复，与时间戳结合使用才能起到防重放作用。
        );

		//按序组合签名内容
		$sb = "POST";
		$sb .= "\n";
		$sb.= $header['Accept'];
		$sb .= "\n";
		$sb .= "\n";
		$sb.= $header['Content-Type'];
		$sb .= "\n";
		$sb .= "\n";

		$sb .= "X-Ca-Key:" . $this->aliyunAppKey;
		$sb .= "\n";
		$sb .= "X-Ca-Nonce:" . $uuid;
		$sb .= "\n";
		$sb .= "X-Ca-Stage:RELEASE";
		$sb .= "\n";
		$sb .= "X-Ca-Timestamp:" . $timeStamp;
		$sb .= "\n";
		$sb .= "X-Ca-Version:1";
		$sb .= "\n";
		$sb .= $this->serverPath;

		//生成签名
		$sign = base64_encode(hash_hmac('sha256', $sb, $this->aliyunAppSecret, true));
		$header['X-Ca-Signature'] = $sign;  //签名

		return $header;
    }


}
