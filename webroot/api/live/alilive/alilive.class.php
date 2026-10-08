<?php   if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/12/8 0008
 * Time: 11:05
 */

class Alilive{
    private $accessKeyId;               //密钥ID
    private $accessKeySecret;           //密钥
    public  $version = "2016-11-01";   //API版本号
    public  $format = "JSON";           //返回值类型
    private $domainParameters = "";
    public  $video_host;                //推流域名
    public  $appName;                   //应用名
    public  $privateKey;                //鉴权,加密key
    public  $vhost;                     //加速域名
    public  $play_host;                 //播流域名
    public  $playprivatekey;            //播流鉴权，加密key
    public  $duration;                  //周期录制时长
    public  $msg;
    public function __construct(){
        $dsql = new dsql($dbo);
        $archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        $this->accessKeyId=$results[0]['username'];
        $this->accessKeySecret=$results[0]['password'];
        $this->vhost=$results[0]['vhost'];
        $this->appName=$results[0]['appname'];
        $this->privateKey=$results[0]['privatekey'];
        $this->video_host=$results[0]['pushdomain'];
        $this->play_host=$results[0]['playdomain'];
        $this->playprivatekey=$results[0]['playprivatekey'];
        $this->duration=$results[0]['duration'] ? $results[0]['duration'] : 1800;
    }
    /**
     * 访问阿ali接口进行请求并返回ali返回值
     * @param array $apiParams 接口自定义参数
     * @param string $credential 传值方式默认get
     * @param string $domain 请求地址
     */
    public function aliApi($apiParams,$credential="GET", $domain="live.aliyuncs.com")
    {
        //date_default_timezone_set("GMT");
        $apiParams['Format'] = $this->format;
        $apiParams['SignatureMethod'] = "HMAC-SHA1";//签名算法
        $apiParams['SignatureNonce'] = rand(100000,999999);//随机数
        $apiParams['SignatureVersion'] = '1.0';//签名算法版本
        $apiParams['Timestamp'] =gmdate("Y-m-d\TH:i:s\Z");//请求时间
        $apiParams['Version'] = $this->version;
        $apiParams["AccessKeyId"]=$this->accessKeyId;
        $accessSecret = $this->accessKeySecret;
        $apiParams["Signature"] = $this->computeSignature($credential,$apiParams,$accessSecret);
        if($credential == "POST") {
            $requestUrl = "https://". $domain . "/";
            foreach ($apiParams as $apiParamKey => $apiParamValue)
            {
                $this->putDomainParameters($apiParamKey,$apiParamValue);
            }
            $url= $requestUrl;
        }
        else {
            $requestUrl = "http://". $domain . "/?";

            foreach ($apiParams as $apiParamKey => $apiParamValue)
            {
                if($apiParamKey=='RecordFormat.1.OssObjectPrefix' || $apiParamKey=='RecordFormat.1.SliceOssObjectPrefix'){
                	$requestUrl .= "$apiParamKey=" . $apiParamValue . "&";
                }else{
                	$requestUrl .= "$apiParamKey=" . urlencode($apiParamValue) . "&";
                }
                
            }
            $url= substr($requestUrl, 0, -1);
        }
        //echo $url;die;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $ret = curl_exec($ch);
        if (false === $ret) {
            $ret =  curl_errno($ch);
            $this->message = 'curl方法出错，错误号：'.$ret;
            return false;
        }
        curl_close($ch);
        if( $this->format == "JSON")
            return json_decode($ret,true);
        elseif($this->format =="XML"){
            return $this->xmlToArray($ret);
        }else
            return $ret;
    }

    /**
     * 计算签名
     * @param $credential
     * @param $parameters
     * @param $accessKeySecret
     * @return string
     */
    private function computeSignature($credential,$parameters, $accessKeySecret)
    {
        ksort($parameters);
        $canonicalizedQueryString = '';
        foreach($parameters as $key => $value)
        {
            $canonicalizedQueryString .= '&' . $this->percentEncode($key). '=' . $this->percentEncode($value);
        }
        $stringToSign = $credential.'&%2F&' . $this->percentencode(substr($canonicalizedQueryString, 1));
        //echo $stringToSign;die;
        $signature = $this->signString($stringToSign, $accessKeySecret."&");

        return $signature;
    }

    /**
     * url编码
     * @param $str
     * @return mixed|string
     */
    protected function percentEncode($str)
    {
        $res = urlencode($str);
        $res = preg_replace('/\+/', '%20', $res);
        $res = preg_replace('/\*/', '%2A', $res);
        $res = preg_replace('/%7E/', '~', $res);
        return $res;
    }

    /**
     * get请求时无用没看
     * @param $name
     * @param $value
     */
    public function putDomainParameters($name, $value)
    {
        $this->domainParameters[$name] = $value;
    }

    /**
     * 对待加密字符串加密
     * @param $source
     * @param $accessSecret
     * @return string
     */
    public function signString($source, $accessSecret)
    {
        return  base64_encode(hash_hmac('sha1', $source, $accessSecret, true));
    }

    /**
     * xml转成数组
     * @param $xml
     * @return mixed
     */
    function xmlToArray($xml){
        //禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        $xmlstring = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
        $val = json_decode(json_encode($xmlstring),true);
        return $val;
    }
    /**
     * 对象存储OSS的URL签名
     * @param $Url 存储对象访问的URL
     * @param $file存储对象
     * @return $url
     */
     public function ossSignatureurl($Url,$file){
       $ak=$this->accessKeyId;
       $sk=$this->accessKeySecret;
       require_once(HUONIAOINC . "/config/live.inc.php");
       $domain=$custom_server.$file;
       $expire=strtotime("+1 hours");
       $bucketname="$custom_OSSBucket";
       $StringToSign="GET\n\n\n".$expire."\n/".$bucketname."/".$file;
       $Sign=base64_encode(hash_hmac("sha1",$StringToSign,$sk,true));
       $url=$domain."?OSSAccessKeyId=".$ak."&Expires=".$expire."&Signature=".urlencode($Sign);
	   return $url;
     }
}