<?php
//用于服务器执行计划任务的入口文件
//宝塔创建方式：
//1.创建shell脚本任务
//2.任务名称：执行系统计划任务
//3.执行周期：N分钟 1分钟
//4.脚本内容：
//cd /huoniao/wwwroot/ihuoniao.cn/include/
//php cron.php
//

//系统核心配置文件
require_once(dirname(__FILE__).'/common.inc.php');
ini_set('max_execution_time', 58);  //最大执行58秒
set_time_limit(58); //最大执行58秒

//记录日志
require_once HUONIAOROOT . "/api/payment/log.php";
$_cronLog = new CLogFileHandler(HUONIAOROOT . '/log/cron/' . date('Y-m-d') . '.log', true);

//执行计划任务
$now = time();
$sql = $dsql->SetQuery("SELECT `id`, `title`, `file` FROM `#@__site_cron` WHERE `state` = 1 AND `ntime` <= $now ORDER BY `ntime`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        $_cronLog->DEBUG("任务ID_：" . $value['id'] . '-' . $value['title'] . '-' . $value['file'], true);
        $_s = microtime(true);

        //执行任务
        Cron::run($value['id']);
        
        $_t = number_format((microtime(true) - $_s), 6);
        $_cronLog->DEBUG("执行时间：" . $_t . ($_t > 1 ? "  超过1秒" : "") . '，占用CPU：' . get_cpu_usage(), true);
    }
}

function get_cpu_usage(){
    if (PHP_OS_FAMILY === 'Windows') {
        return get_cpu_usage_windows();
    } else {
        return get_cpu_usage_linux();
    }
}
function get_cpu_usage_linux() {
    // 不依赖 `ps -p`：容器基础镜像为 Alpine/BusyBox，其 ps 不支持 -p（会向 stderr 报 "ps: unrecognized option: p"，被 GKE 标成 ERROR）
    // 改读 /proc：CPU% = 进程累计 CPU 时间 / 进程已运行时间（与 ps 的 %cpu 定义一致）
    $pid = getmypid();
    $statFile = "/proc/$pid/stat";
    if (!is_dir("/proc/$pid") || !is_readable($statFile) || !is_readable('/proc/uptime')) {
        return 'N/A';
    }
    $stat = @file_get_contents($statFile);
    $uptime = @file_get_contents('/proc/uptime');
    if ($stat === false || $uptime === false) {
        return 'N/A';
    }
    // comm 字段可能含空格/括号，从最后一个 ")" 之后再切分；之后第 1 个字段为 state(第3项)
    $rp = strrpos($stat, ')');
    if ($rp === false) {
        return 'N/A';
    }
    $f = preg_split('/\s+/', trim(substr($stat, $rp + 1)));
    // 此时 $f[0]=state(3)，故 utime(14)=$f[11]，stime(15)=$f[12]，starttime(22)=$f[19]
    if (count($f) < 20) {
        return 'N/A';
    }
    $hz = 100; // Linux USER_HZ，容器内固定为 100
    $cpuSec = ($f[11] + $f[12]) / $hz;
    $up = floatval(explode(' ', trim($uptime))[0]);
    $elapsed = $up - ($f[19] / $hz);
    if ($elapsed <= 0) {
        return 'N/A';
    }
    return round($cpuSec / $elapsed * 100, 1) . '%';
}

function get_cpu_usage_windows() {
    $pid = getmypid();
    $output = shell_exec("tasklist /FI \"PID eq $pid\" /FO CSV /NH");
    $data = str_getcsv($output);
    
    if (isset($data[2])) {
        $cpuTime = $data[2]; // 格式为 HH:MM:SS
        list($h, $m, $s) = explode(':', $cpuTime);
        $totalSeconds = $h * 3600 + $m * 60 + $s;
        
        // 此处需要结合时间差计算使用率（类似方法二）
        // 此处仅为示例，实际需完善计算逻辑
        return $totalSeconds;
    }
    
    return 'N/A';
}


//配合Redis实现消息实时发送
//解决问题：比如支付完成后，需要给商家和用户发送订单通知，同步发送的话会造成前端页面阻塞，计划任务发送的话，有延迟
//实现过程：所有进入到updateMemberNotice和updateAdminNotice的方法，在将消息写入到数据库的同时，也更新redis的key为，huoniao_updatemessage的值为1
//如果Redis中huoniao_updatemessage查询数据库中所有is_update为0的数据，进入下一步发送流程
//注意，使用此功能必须开启Redis，并且必须使用宝塔计划任务执行当前文件

//redis状态
$lastid = array();
if($HN_memory->enable && 1 == 2){

    //死循环
    while(1){
        $huoniao_updatemessage = (int)$HN_memory->lpop('updatemessage');
        
        if($huoniao_updatemessage && !in_array($huoniao_updatemessage, $lastid)){
            
            //防止重复执行
            array_push($lastid, $huoniao_updatemessage);
        
            $_cronLog->DEBUG("任务ID：" . $huoniao_updatemessage, true);
            
            $updatenoticesql  = $dsql ->SetQuery("SELECT * FROM `#@__updatemessage` WHERE `is_update` = 0 AND `id` = " . $huoniao_updatemessage);
        
            $_cronLog->DEBUG("任务SQL：" . $updatenoticesql, true);

            $updatenoticeres  = $dsql->dsqlOper($updatenoticesql,"results");

            $_cronLog->DEBUG(json_encode($updatenoticeres, JSON_UNESCAPED_UNICODE), true);
            
            if($updatenoticeres && is_array($updatenoticeres)){

                foreach ($updatenoticeres as $k => $v){
                    
                    $sql = $dsql->SetQuery("UPDATE `#@__updatemessage` SET `is_update` = 1 WHERE `id` = ".$v['id']);
                    $dsql->dsqlOper($sql, "update");
                    
                    if($v['type'] ==0){
                        $param = unserialize($v['param']);
                        updateAdminNotice($v['module'], $v['part'],$param,2,$v['id']);
                    }else{
                        $param = unserialize($v['param']);
                        $config = unserialize($v['config']);
                        updateMemberNotice($v['uid'], $v['notify'], $param, $config,'','',2);
                    }
                }

                //删除2天前已经发送成功的记录
                $etime = GetMktime(time())-172800;
                $desql = $dsql->SetQuery("DELETE FROM `#@__updatemessage` WHERE `is_update` = 1 AND `time` < $etime");
                $deres = $dsql->dsqlOper($desql,"update");
            }
            
        }else{
            
            //不需要意外情况，如果增加了会出现发送多次消息问题
            sleep(5); //没有消息时，休息1秒再执行

            // //如果Redis被手动/意外清空了，但是消息还没有发出去，此时需要将未发送的消息重新加入Redis，或者关闭Redis服务，使用系统默认的发送方式
            // $updatenoticesql  = $dsql ->SetQuery("SELECT `id` FROM `#@__updatemessage` WHERE `is_update` = 0");
            // $updatenoticeres  = $dsql->dsqlOper($updatenoticesql,"results");
            // $_cronLog->DEBUG("意外情况：" . json_encode($updatenoticeres), true);
            // if($updatenoticeres){
            //     foreach($updatenoticeres as $key => $val){
            //         $key = array_search($val['id'], $lastid);
            //         if ($key !== false){
            //             array_splice($lastid, $key, 1);
            //         }

            //         $HN_memory->rpush('updatemessage', $val['id']);
            //     }
            // }
            
        }
    }
}