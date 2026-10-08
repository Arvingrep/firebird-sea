<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 时间戳插件
 *
 * @version        $Id: time.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

/**
 *  返回格林威治标准时间
 *
 * @param     string  $format  字符串格式
 * @param     string  $timest  时间基准
 * @return    string
 */
if (!function_exists('MyDate')){
    function MyDate($format='Y-m-d H:i:s', $timest=0){
        global $cfg_cli_time;
        $addtime = $cfg_cli_time * 3600;
        if(empty($format)){
            $format = 'Y-m-d H:i:s';
        }
        return gmdate($format, $timest+$addtime);
    }
}


/**
 * 从普通时间转换为Linux时间截
 *
 * @param     string   $dtime  普通时间
 * @return    string
 */
if (!function_exists('GetMkTime')){
    function GetMkTime($dtime){
        global $cfg_timeZone;
        global $_G;
        $md5GetMkTimeKey = base64_encode("GetMkTime_" . $dtime);

        if(isset($_G[$md5GetMkTimeKey])){
            return $_G[$md5GetMkTimeKey];
        }

      	$time51 = $cfg_timeZone * -1;
        @date_default_timezone_set('Etc/GMT'.$time51);

        if(!preg_match("/[^0-9]/", $dtime)){
            return $dtime;
        }
        $dtime = trim($dtime);
        $dt = Array(1970, 1, 1, 0, 0, 0);
        $dtime = preg_replace("/[\r\n\t]|日|秒/", " ", $dtime);
        $dtime = str_replace("年", "-", $dtime);
        $dtime = str_replace("月", "-", $dtime);
        $dtime = str_replace("时", ":", $dtime);
        $dtime = str_replace("分", ":", $dtime);
        $dtime = trim(preg_replace("/[ ]{1,}/", " ", $dtime));
        $ds = explode(" ", $dtime);
        $ymd = explode("-", $ds[0]);
        if(!isset($ymd[1])){
            $ymd = explode(".", $ds[0]);
        }
        if(isset($ymd[0])){
            $dt[0] = $ymd[0];
        }
        if(isset($ymd[1])) $dt[1] = $ymd[1];
        if(isset($ymd[2])) $dt[2] = $ymd[2];
        if(strlen($dt[0])==2) $dt[0] = '20'.$dt[0];
        if(isset($ds[1])){
            $hms = explode(":", $ds[1]);
            if(isset($hms[0])) $dt[3] = $hms[0];
            if(isset($hms[1])) $dt[4] = $hms[1];
            if(isset($hms[2])) $dt[5] = $hms[2];
        }
        foreach($dt as $k=>$v){
            $v = preg_replace("/^0{1,}/", '', trim($v));
            if($v==''){
                $dt[$k] = 0;
            }
        }
        $mt = mktime((int)$dt[3], (int)$dt[4], (int)$dt[5], (int)$dt[1], (int)$dt[2], (int)$dt[0]);
        if(!empty($mt)){
            $_G[$md5GetMkTimeKey] = $mt;
            return $mt;
        }else{
            $mt = time();
            $_G[$md5GetMkTimeKey] = $mt;
            return $mt;
        }
    }
}


/**
 *  减去时间
 *
 * @param     int  $ntime  当前时间
 * @param     int  $ctime  减少的时间
 * @return    int
 */
if (!function_exists('SubDay')){
    function SubDay($ntime, $ctime){
        $dayst = 3600 * 24;
        $cday = ceil(($ntime-$ctime)/$dayst);
        return $cday;
    }
}


/**
 *  增加天数
 *
 * @param     int  $ntime  当前时间
 * @param     int  $aday   增加天数
 * @return    int
 */
if (!function_exists('AddDay')){
    function AddDay($ntime, $aday){
        $dayst = 3600 * 24;
        $oktime = $ntime + ($aday * $dayst);
        return $oktime;
    }
}


/**
 *  返回格式化(Y-m-d H:i:s)的是时间
 *
 * @param     int    $mktime  时间戳
 * @return    string
 */
if (!function_exists('GetDateTimeMk')){
    function GetDateTimeMk($mktime){
        return MyDate('Y-m-d H:i:s',$mktime);
    }
}

/**
 *  返回格式化(Y-m-d)的日期
 *
 * @param     int    $mktime  时间戳
 * @return    string
 */
if (!function_exists('GetDateMk')){
    function GetDateMk($mktime){
        if($mktime=="0") return "暂无";
        else return MyDate("Y-m-d", $mktime);
    }
}


/**
 *  将时间转换为距离现在的精确时间
 *
 * @param     int   $seconds  秒数
 * @return    string
 */
if (!function_exists('FloorTime')){
    function FloorTime($seconds, $n = 1){
        global $langData;
        $days = floor(($seconds/86400));
        $hours = floor(($seconds/3600)%24);
        $minutes = floor(($seconds/60)%60);
        $second = floor($seconds%60);
        if($second <= 60) $times = $langData['siteConfig'][13][47];  //刚刚
        if($minutes >= 1) $times = $minutes.$langData['siteConfig'][13][41];  //分钟前
        if($hours >= 1) $times = $hours.$langData['siteConfig'][13][42];  //小时前
        if($days >= 1)  $times = $days.$langData['siteConfig'][13][43];  //天前
        if($days > 7) {
          if($n == 1){
              $times = date("Y-m-d", (GetMkTime(time() - $seconds)));
          }elseif ($n == 2){
              $times = date("Y-m-d H:i:s", (GetMkTime(time() - $seconds)));
          }elseif ($n == 3){
              $times = date("m-d", (GetMkTime(time() - $seconds)));
          }
        }
        return $times;
    }
}

if (!function_exists('FloorTimeByTemp')){
    function FloorTimeByTemp($params, $smarty = array()){
        global $langData;
        $timestamp = $params['timestamp'];
        $format = $params['format'];
        $time = time();

        if($format == 'full'){
            return date('Y-m-d H:i:s', $timestamp);
        }

        return FloorTime($time - $timestamp, $format ? $format : 1);
    }
}

/**
 * 获取当前时辰
 *
 */
if (!function_exists('getNowHour')){
    function getNowHour(){
      global $langData;
        $h=date('G');
        if ($h<11) return $langData['siteConfig'][14][0];  //早上好
        else if ($h<13) return $langData['siteConfig'][14][1];  //中午好
        else if ($h<17) return $langData['siteConfig'][14][2];  //下午好
        else return $langData['siteConfig'][14][3];  //晚上好
    }
}

/**
 * 根据天数转换为精确时间
 *
 */
if (!function_exists('FloorDay')){
    function FloorDay($params, $smarty = array()){
      global $langData;
      $day = $params['day'];

      $return = "";
      $year = floor(($day/360)%12);
      $month = floor(($day/30));
      if($day >= 1) $return = $day . $langData['siteConfig'][13][6];  //天
      if($month >= 1) $return = $month . $langData['siteConfig'][13][31];  //个月
      if($year >= 1) $return = $year . $langData['siteConfig'][13][14];  //年

      return $return;
    }
}

/**
 * 求两个日期之间相差的天数
 * (针对1970年1月1日之后，求之前可以采用泰勒公式)
 * @param string $day1
 * @param string $day2
 * @param boolean $reverse 如果时间1小于时间2，是否需要反转
 * @return number
 */
if (!function_exists('diffBetweenTwoDays')){
    function diffBetweenTwoDays($day1, $day2, $reverse = true){
      $second1 = strtotime($day1);
      $second2 = strtotime($day2);

      if ($second1 < $second2) {
        if($reverse){
            $tmp = $second2;
            $second2 = $second1;
            $second1 = $tmp;
        }else{
            return 0;
        }
      }
      return ($second1 - $second2) / 86400;
    }
}

if (!function_exists('weekday')){
    function weekday($time){
        if(is_numeric($time)){
            global $langData;
            $weekday = array(
                $langData['siteConfig'][14][10],
                $langData['siteConfig'][14][4],
                $langData['siteConfig'][14][5],
                $langData['siteConfig'][14][6],
                $langData['siteConfig'][14][7],
                $langData['siteConfig'][14][8],
                $langData['siteConfig'][14][9]
            );
            return $weekday[date('w', $time)];
        }
    }
}

//获取毫秒的时间戳
if (!function_exists('getMillisecond')){
    function getMillisecond(){
		$time = explode(" ", microtime());
	    $time = $time[1] . ($time[0] * 1000);
	    $time2 = explode(".", $time);
	    $time = $time2[0];
	    return $time;
    }

}


//营业时间格式化
//1,2,3,4,5,6,7 = 周一至周日
//1,2,4,5,6 = 周一至周二，周四至周六
//1,3,6 = 周一，周三，周六
if (!function_exists('opentimeFormat')){
    function opentimeFormat($data){

        if(!$data) return;

        global $langData;
        $weekday = $langData['siteConfig'][34][5];  //array('周日', '周一', '周二', '周三', '周四', '周五', '周六')

        //查找连续数  1,2,3,4,5,6,7 = 1-7    1,2,4,5,6 = 1-2,4-6
        $st = explode(',', $data);
        $i = $st[0];
        $j = '';
        $m = '';
        foreach ($st as $key => $var){
            if ($i == $var) {
                continue;
            }
            $n = $key-1;
            if (($var - $st[$n]) == 1) {
                $m = $var;
                continue;
            }
            if ($i != $st[$n]){
                $j .= $i.'-'.$st[$n].',';
            }else{
                $j .= $i.',';
            }
            $i = $var;
        }
        if ($i > $m){
            $j .= $i;
        }else{
            $j .= $i.'-'.$m;
        }

        $ret = array();
        if($j){
            $data = explode(',', $j);
            foreach ($data as $key => $value) {
                $v = explode('-', $value);
                $s = (int)$v[0];
                $e = $v[1];
                $s = $s == 7 ? 0 : $s;
                $e = $e == 7 ? 0 : $e;

                if(is_numeric($e)){
                    array_push($ret, $weekday[$s] . '至' . $weekday[$e]);
                }else{
                    array_push($ret, $weekday[$s]);
                }
            }
        }

        return join(',', $ret);

    }
}


//根据秒数美化字符串
//18 => 18秒
//60 => 1分钟
//3600 => 1小时
//86400 => 1天
if (!function_exists('FormatSecond')){
    function FormatSecond($second){
        $second = (int)$second;
		$return = $second . '秒';
        if($second >= 86400){
            $return = (int)($second/86400) . '天';
        }elseif($second >= 3600){
            $return = (int)($second/3600) . '小时';
        }elseif($second >= 60){
            $return = (int)($second/60) . '分钟';
        }
        return $return;
    }

}


//13位时间戳
if (!function_exists('getMillisecond')){
    function getMillisecond(){
        list($t1, $t2) = explode(' ', microtime()); 
        $ret = (float)sprintf('%.0f',(floatval($t1)+floatval($t2))*1000);
        $ret = strlen($ret) == 12 ? $ret . '0' : $ret;
        return (float)$ret;
    }

}


//判断是否在营业时间内，格式：hh:ii
if (!function_exists('isInBusinessHours')){
    function isInBusinessHours($stime, $etime) {
        // 获取当前时间的小时和分钟
        $current_time = date("H:i");

        // 如果营业结束时间小于营业开始时间，说明跨天
        if ($stime > $etime) {
            // 判断当前时间是否在营业开始时间之后，或者在营业结束时间之前
            return ($current_time >= $stime || $current_time <= $etime);
        } else {
            // 否则直接判断当前时间是否在营业时间范围内
            return ($current_time >= $stime && $current_time <= $etime);
        }
    }
}