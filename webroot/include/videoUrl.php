<?php
//根据第三方视频链接，获取真实文件播放地址
if (!function_exists('getRealVideoUrl')){
    function getRealVideoUrl($url){
      if(!empty($url)){

        //腾讯视频
        //获取教程 https://www.jiezhe.net/post/38.html
        if(strstr($url, 'v.qq.com')){
          $vid = getUrlQuery($url, 'vid');
          if($vid){
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, "http://vv.video.qq.com/getinfo?vids=$vid&platform=101001&charge=0&otype=json");
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            $con = curl_exec($curl);
            curl_close($curl);

            if($con){
              $con = str_replace('QZOutputJson=', '', $con);
              $con = substr($con, 0, -1);
              $con = json_decode($con, true);

              if(is_array($con)){
                $vl = $con['vl'];
                $vi = $vl['vi'][0];
                $ui = $vi['ul']['ui'][0];

                $fn = $vi['fn'];  //mp4地址
                $fvkey = $vi['fvkey'];  //fvkey
                $url = $ui['url'];

                return $url . $fn . '?vkey=' . $fvkey;
              }
            }
          }
        }
        return $url;
      }
    }
}

if (!function_exists('getUrlQuery')){
    /**
     * 获取URL指定参数值
     * @param string $url 要处理的字符串（默认为当前页面地址）
     * @param string $key 要获取的key值
     * @return string
     */
    function getUrlQuery($url, $key){
        $conf = explode("?", ($url ? $url : $_SERVER['REQUEST_URI']));
        $conf = $conf[1];
        $arr = $conf ? explode("&", $conf) : array();
        foreach ($arr as $k => $v) {
            $query = explode("=", $arr[$k]);
            if ($query[0] == $key) {
                return $query[1];
            }
        }
        return false;
    }
}
include_once(dirname(__FILE__) . '/class/videoInfo.class.php');
$videoInfo = new videoInfo;
$url = $videoInfo->parse($_GET['url']);
if($url){
    $realUrl = getRealVideoUrl($url);
    $realUrl = $realUrl != $url ? $realUrl : '';
  echo json_encode(array("state" => "success", "url" => $url, "realUrl" => $realUrl));
}else{
  echo json_encode(array("state" => "error", "info" => "获取失败，请检查视频URL地址是否正确！"));
}