<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 计划任务
 *
 * @version        $Id: cron.class.php 2015-10-20 下午16:53:15 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class Cron{

	public static function run($cronid = 0,$online=0) {
		global $dsql;
		$cron = array();

		//根据指定ID查询任务详细
		if($cronid){
            $where = '';
            if($online !=1){
                $where = "  AND `state` = 1";
            }
            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_cron` WHERE 1 = 1 ".$where." AND `id` = ".$cronid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$cron = $ret[0];
			}

		//如果没有指定ID，则根据当前时间查询出需要执行的任务
		}else{

			$now = GetMkTime(time());
			$sql = $dsql->SetQuery("SELECT * FROM `#@__site_cron` WHERE `state` = 1 AND `ntime` <= $now ORDER BY `ntime` LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$cron = $ret[0];
			}

		}

		//进程名
		$processname ='FB_CRON_'.(empty($cron) ? 'CHECKER' : $cron['id']);

		//如果指定了任务ID，并且任务存在，则删除指定的进程名
		if($cronid && !empty($cron)) {
			self::unlock($processname);
		}

		//创建进程
		if(self::islocked($processname, 60)) {
			return false;
		}

		global $cronData;
		$cronData = $cron;

		//执行任务
		if($cron) {

			$cronfile = HUONIAOINC.'/cron/'.$cron['file'].".php";

			if($cronfile) {
				self::setnextime($cron,$online);

				@set_time_limit(1000);
				@ignore_user_abort(TRUE);

				if(!@include $cronfile) {
					//初始化日志
					// require_once HUONIAOROOT."/api/payment/log.php";
					// @mkdir(HUONIAOROOT.'/log/', 0777, true);
					// $logHandler= new CLogFileHandler(HUONIAOROOT.'/log/cron_file.log');
					// $log = Log::Init($logHandler, 15);
					// Log::DEBUG($type."==".$date);
					// return false;
				}
			}

		}


		self::unlock($processname);
		return true;

	}

	//计算下次执行时间
	private static function setnextime($cron,$online){
		global $cfg_timeZone;
		global $dsql;

		$cronid   = $cron['id'];
		$loopType = $cron['type'];
		list($day, $hour, $minute) = explode('-', $cron['daytime']);

		$time = GetMkTime(time());
		$_minute = intval(date('i', $time));
		$_hour 	= date('H', $time);
		$_day 	= date('d', $time);
		$_week 	= date('w', $time);
		$_mouth = date('m', $time);
		$_year = date('Y', $time);
		$nexttime =  mktime($_hour, 0, 0, $_mouth, $_day, $_year);
		switch ($loopType) {
			case 'month':
				$isLeapYear = date('L', $time);
				$mouthDays = self::_getMouthDays($_mouth, $isLeapYear);
				if ($day == 99 || $day > $mouthDays) $day = $mouthDays;
				$nexttime += $minute * 60;
				$nexttime += ($hour < $_hour ? -($_hour - $hour) : $hour - $_hour) * 3600;
				if ($hour <= $_hour && $day == $_day) {
					$nexttime +=  ($mouthDays - $_day + $day) * 86400;
				} else {
					$nexttime +=  ($day < $_day ? $mouthDays - $_day + $day : $day - $_day) * 86400;
				}
				break;
			case 'week':
				$nexttime += $minute * 60;
				$nexttime += ($hour < $_hour ? -($_hour - $hour) : $hour - $_hour) * 3600;
				if ($hour <= $_hour && $day == $_week) {
					$nexttime +=  (7 - $_week + $day) * 86400;
				} else {
					$nexttime +=  ($day < $_week ? 7 - $_week + $day : $day - $_week) * 86400;
				}
				break;
			case 'day':
				$nexttime += $minute * 60;
				$nexttime += ($hour < $_hour ? -($_hour - $hour) : $hour - $_hour) * 3600;
				if ($hour <= $_hour) {
					$nexttime +=  86400;
				}
				break;
			case 'hour':
				$nexttime += $minute < $_minute ? 3600 + $minute * 60 :  $minute * 60;
				break;
			case 'now':
				$nexttime =  mktime($_hour, $_minute, 0, $_mouth, $_day, $_year);
				$_time = $day * 24 * 60;
				$_time += $hour * 60;
				$_time += $minute;
				$_time = $_time * 60;
				$nexttime += $_time;
				break;
		}

		if($online == 0){

            //更新计划执行时间和下次执行时间
            $sql = $dsql->SetQuery("UPDATE `#@__site_cron` SET `ltime` = ".GetMkTime(time()).", `ntime` = '$nexttime' WHERE `id` = $cronid");
            $dsql->dsqlOper($sql, "update");
        }

		return true;

	}


	//验证进程是否存在，如果不存在自动建立一个新的进程
	private static function islocked($process, $ttl = 0) {

		global $dsql;

		//查询指定进程是否存在
		$time = GetMkTime(time());
		$sql = $dsql->SetQuery("SELECT `processid` FROM `#@__site_process` WHERE `processid` = '$process' AND `expiry` >= '$time' LIMIT 1");
		$ret = $dsql->dsqlOper($sql, "results");

		//如果存在，返回true
		if($ret){
			return true;

		//如果不存在，创建进程
		}else{

			$time = GetMkTime(time()) + $ttl;
			$sql = $dsql->SetQuery("INSERT INTO `#@__site_process` (`processid`, `expiry`) VALUE ('$process', '$time')");
			$sql = $dsql->dsqlOper($sql, "update");
			return false;

		}

	}


	//删除指定进程
	private static function unlock($process) {

		global $dsql;
		$time = GetMkTime(time());
		$sql = $dsql->SetQuery("DELETE FROM `#@__site_process` WHERE `processid` = '$process'");
		$sql = $dsql->dsqlOper($sql, "update");
		$sql = $dsql->SetQuery("DELETE FROM `#@__site_process` WHERE `expiry` < '$time'");
		$sql = $dsql->dsqlOper($sql, "update");

		$sql = $dsql->SetQuery("ALTER TABLE `#@__site_process` AUTO_INCREMENT=1");
		$dsql->dsqlOper($sql, "update");

	}


	private static function _getMouthDays($month, $isLeapYear) {
		if (in_array($month,array('1','3','5','7','8','10','12'))) {
			$days = 31;
		} elseif ($month!=2) {
			$days = 30;
		} else {
			if ($isLeapYear) {
				$days = 29;
			} else {
				$days = 28;
			}
		}
		return $days;
	}

}
