<?php
class douyinSDK
{
    public $appid;
    public $secret;

    public function __construct()
    {
        loadPlug("payment");
        $payment  = get_payment("bytemini");
        $this->appid = $payment['appid'];
        $this->secret = $payment['appsecret'];
    }

    //获取服务端access_token
    public function getAccessToken()
    {
        $data = json_decode(@file_get_contents(HUONIAOROOT . "/data/cache/douyin_access_token.json"));
        if (!$data || $data->expire_time < time()) {
            $url = "https://developer.toutiao.com/api/apps/v2/token";
            $data = "appid=$this->appid&secret=$this->secret&grant_type=client_credential";
            $data = '{"appid": "'.$this->appid.'", "secret": "'.$this->secret.'", "grant_type": "client_credential"}';
            $res = json_decode($this->https_post($url, $data, "json"));
            $access_token = $res->data->access_token;
            if ($access_token) {
                $data = new stdClass();
                $data->expire_time = time() + 7000;
                $data->access_token = $access_token;
                $fp = @fopen(HUONIAOROOT . "/data/cache/douyin_access_token.json", "w");
                @fwrite($fp, json_encode($data));
                @fclose($fp);
            }
        } else {
            $access_token = $data->access_token;
        }
        return $access_token;
    }

    /**
     * 订单推送到抖音小程序
     * $order_detail 订单数据
     * $order_status 订单状态  0：待支付  1：已支付  2：已取消  4：已核销（核销状态是整单核销,即一笔订单买了 3 个券，核销是指 3 个券核销的整单）  5：退款中  6：已退款  8：退款失败
    */
    public function pushOrder($uid, $order_detail, $order_status){
        global $dsql;

        //初始化日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_pushOrderToDouyinLog = new CLogFileHandler(HUONIAOROOT . '/log/pushOrderToDouyin/' . date('Y-m-d').'_app.log', true);
        $_pushOrderToDouyinLog->DEBUG($_SERVER['HTTP_USER_AGENT']);

        $update_time = getMillisecond();  //订单信息变更时间，13 位毫秒级时间戳

        //查询用户的抖音openid
        $openid = '';
        $sql = $dsql->SetQuery("SELECT `douyin_openid` FROM `#@__member` WHERE `id` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $openid = $ret[0]['douyin_openid'];
        }
        if(!$openid) return;

        //服务端access_token
        $access_token = $this->getAccessToken();

        //请求参数
        $data = '{
            "access_token": "'.$access_token.'",
            "app_name": "douyin",
            "open_id": "'.$openid.'",
            "update_time": '.$update_time.',
            "order_detail": "'.addslashes(stripslashes($order_detail)).'",
            "order_type": 0,
            "order_status": '.$order_status.'
        }';

        $_pushOrderToDouyinLog->DEBUG($data);

        $res = $this->https_post('https://developer.toutiao.com/api/apps/order/v2/push', $data, "json");
        $_pushOrderToDouyinLog->DEBUG($res);

        $res = json_decode($res);
        if($res->err_code == 0){
            //同步成功
        }else{
            //同步失败
            $msg = $res->err_msg;
        }
    }

    /*
  * 发起POST网络提交
  * @params string $url : 网络地址
  * @params json $data ： 发送的json格式数据
  */
    private function https_post($url, $data, $contentType = 'urlencoded')
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_TIMEOUT, 5);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)) {
            if ($contentType == 'urlencoded') {
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            } else {
                $httpHeader = array();
                $httpHeader[] = 'Content-Type: Application/json';
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_HTTPHEADER, $httpHeader);
            }
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($curl);
        if (curl_errno($curl)) {
            return 'Errno' . curl_error($curl);
        }
        curl_close($curl);
        return $output;
    }

    /*
  * 发起GET网络提交
  * @params string $url : 网络地址
  */
    private function https_get($url)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($curl, CURLOPT_HEADER, FALSE);
        curl_setopt($curl, CURLOPT_TIMEOUT, 5);
        if (curl_errno($curl)) {
            return 'Errno' . curl_error($curl);
        } else {
            $result = curl_exec($curl);
        }
        curl_close($curl);
        return $result;
    }
}
