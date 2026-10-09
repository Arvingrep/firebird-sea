<?php
/**
 * 插件的所有的ajax请求
 */

require_once('../../common.inc.php');

// 1.1初始化
require_once("inc.php");

// 判断请求
$action = $_GET['action'];
// 请求不存在
if(!isset($action)){
    die ("无action参数");
}
$ajax = new Ajax($param);
if(!method_exists($ajax, $action)){
    die("请求方法不存在");
}
$ajax->$action();

class Ajax{
    private $param;  //默认参数

    /**
     * 构造函数
     */
    public function __construct($param = array())
    {
        $this->param = $param;
    }

    /**
     * 备份导出用户数据
     */
    public function backup(){
        global $data_file;
        global $json_file;
        $data = array();
        if(file_exists($data_file)){
            $data = require($data_file);
        }

        $json  =  json_encode($data);

        $filename = $json_file;

        file_put_contents($filename,$json);
        // 开始下载

        header("Cache-Control: public");
        header("Content-Description: File Transfer");
        header('Content-disposition: attachment; filename='.basename($filename)); //文件名
        header("Content-Transfer-Encoding: binary"); //告诉浏览器，这是二进制文件
        header('Content-Length: '. filesize($filename)); //告诉浏览器，文件大小
        @readfile($filename);  // 输出内容

        unlinkFile($json_file);
    }

    /**
     * 保存设置
     */
    public function setConfig(){
        global $config_file;
        $config = array();
        if(file_exists($config_file)){
            $config = require($config_file);
        }

        // 保存默认抓取个数
        $default_num = $_POST['default_num'];
        if(!isset($default_num) || !is_numeric($default_num)){
            build_err("参数错误");
        }
        $config['default_num'] = $default_num;
        $text='<?php return '.var_export($config,true).';';
        file_put_contents($config_file,$text);

        build_success();
    }

    /**
     * 删除一条用户记录
     */
    public function del(){

        global $data_file;

        $list = array();

        global $plugin_18_data;
        // 使用 session 来存储数据，防止data文件高并发读写脏数据（注意，如果其他地方更新了data，也要存入session，或清空该session的值）
        if(!empty($_SESSION[$plugin_18_data])){
            $list = $_SESSION[$plugin_18_data];  // 读取session中较新的值
        }else{
            if(file_exists($data_file)){
                $list = require($data_file);
            }
            putSession($plugin_18_data, $list);  // 把值存入session中
        }
        // 获取删除数据
        $qq = $_POST['qq'];
        $qqArr = explode(',', $qq);
        if(!empty($qq)){
            $break_flag = false;
            foreach($qqArr as $key => $val){
                foreach ($list as $k=>$v){
                    if($v['qq'] == $val){
                        array_splice($list, $k, 1);
                    }
                }
            }
            // 保存数据
            putSession('plugin_18_data', $list);  // 把更新后的值，重新存入session
            $text='<?php return '.var_export($list,true).';';
            $fp = fopen($data_file,"w");  // 覆盖
            fwrite($fp,$text);
            fclose($fp);
            $break_flag = true;
            if(!$break_flag){
                build_err("数据不存在");
            }else{
                build_success("删除成功");
            }
        }else{
            build_err("参数错误");
        }
    }
    /**
     * 创建虚拟账户
     */
    public function create(){
        global $dsql;
        global $data_file;
        $list = array();
        if(file_exists($data_file)){
            $list = require($data_file);
        }
        $num  = $_POST['num'];  // 取得要生成的数据量
        if($num<1){
            build_err("非法参数");
        }
        if($num>count($list)){
            build_err("虚拟数据不够，请继续抓取一些");
        }
        $regfrom = getCurrentTerminal();
        $_list = $list;
        $last = count($list)-1;  // 可抓取剩余数量（下标）
        $success = 0;   // 成功记录
        $allCheck = "where username in (";
        $allNames = [];
        $allImg = [];
        for($i=0; $i<$num; $i++){
            $sub = rand(0,$last);  // 随机取得一个下标
            $name = $list[$sub]['name'];  //取得名称
            $img  = $list[$sub]['img'];   //取得图片
            // 交换数组下标中的内容，总是移动到最后
            $t = $list[$sub];
            $list[$sub] = $list[$last];
            $list[$last] = $t;
            // 剩余抓取次数减一
            $last--;
            // 查询数据库，是否存在该名称
            $allCheck.= "'$name'";
            if($i<$num-1){
                $allCheck .= ",";
            }
            $allNames[] = $name;  // 存入数组
            $allImg[] = $img;  // 存入数组
        }
        $allCheck .= ")";
        $sql = $dsql->SetQuery("select username from `#@__member` $allCheck");
        $res = $dsql->dsqlOper($sql,"results");
        $allSql = array();
        // 排除存在的名称
        $dnames = [];
        if($res!=[]){
            foreach ($res as $k => $v){
                $dnames[] = $res[$k]['username'];
            }
        }
        
        // 遍历所有的names
        for($i=0;$i<$num;$i++){
            // 如果不在数据库中，则拼接
            if(!in_array($allNames[$i], $dnames)){
                array_push($allSql, "('".$allNames[$i]."','".$allNames[$i]."','".$allImg[$i]."',1,1,'$regfrom')");
                $success++;  // 成功条数

                //删除掉成功导入的
                foreach ($_list as $k=>$v){
                    if($v['name'] == $allNames[$i]){
                        array_splice($_list, $k, 1);
                    }
                }
            }
        }
        
        if($success==0){
            build_err("本次成功记录为0，请抓取些新数据试试或重新生成试试。");
        }
        $sql2 = $dsql->SetQuery("insert into `#@__member`(`username`,`nickname`,`photo`,`robot`,`state`,`regfrom`) values " . join(',', $allSql));
        $update = $dsql->dsqlOper($sql2,"update","ASSOC",NULL,0);
        if($update=="ok"){
            $fail = $num-$success;

            // 保存数据
            putSession('plugin_18_data', $_list);  // 把更新后的值，重新存入session
            $text='<?php return '.var_export($_list,true).';';
            $fp = fopen($data_file,"w");  // 覆盖
            fwrite($fp,$text);
            fclose($fp);

            adminLog("虚拟数据插件", "导入".$success."条虚拟用户数据");
            build_success("成功记录：$success 条，失败记录：$fail 条");
        }else{
            build_err("生成失败，原因：无法往表中插入数据，错误信息：" . $update . "\r\nSQL语句：" . $sql2);
        }
    }
    /* 阅读新增定时任务 */
    public function read_addTask(){
        global $dsql;
        $module   = $_POST['module'];  // 模块
        $limit   = (int)$_POST['limit'];  // 信息发布期限制
        $taskname = $_POST['taskname']; // 任务名
        $interval = (int)$_POST['interval'];  // 周期
        $minRand = (int)$_POST['minRand'];  // 增量开始
        $maxRand = (int)$_POST['maxRand'];  // 增量结束
        if(!$module){
            build_err("请选择模块");
        }
        if(!$limit){
            build_err("请输入筛选时间");
        }
        if(!$interval){
            build_err("请输入任务周期");
        }
        if(!$minRand){
            build_err("请输入增加次数");
        }
        if(!$maxRand){
            build_err("请输入增加次数");
        }
        if($minRand>$maxRand){
            build_err("增加次数开始值不可以大于结束值");
        }
        // 下次时间
        $nextTime = time()+($interval*60);
        $sql = $dsql->SetQuery("insert into `#@__site_plugins_18_read`(`taskname`,`module`,`limit`,`interval`,`preTime`,`nextTime`,`minRand`,`maxRand`,`state`) values('$taskname','$module','$limit','$interval','0','$nextTime','$minRand','$maxRand','1')");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("新增成功");
        }else{
            build_err("新增失败：" . $update);
        }
    }

    /* 阅读任务进行批量状态切换，同时更新下次执行时间 */
    public function read_changeState(){
        global $dsql;
        $tids = $_POST['tids']?$_POST['tids']:"";
        $state = $_POST['state'];
        $tids = explode(",",$tids);
        if(count($tids)<1){
            build_err("缺少tid参数");
        }
        $where = " where id in(";
        for($i=0; $i<count($tids); $i++){
            $where .= $tids[$i];
            if($i<count($tids)-1){
                $where .= ",";
            }
        }
        $where .= ")";
        $sql = $dsql->SetQuery("update `#@__site_plugins_18_read` set `state`=$state,`nextTime`=(unix_timestamp(current_timestamp)+`interval`*60) $where");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("创建成功");
        }else{
            build_err("创建失败");
        }
    }

    /* 编辑阅读任务 */
    public function read_editTask(){
        global $dsql;
        $tid = $_POST['tid'];
        if(!isset($tid) || $tid==""){
            build_err("没有tid");
        }
        $module   = $_POST['module'];  // 模块
        $limit    = (int)$_POST['limit'];   // 信息有限期限制
        $taskname = $_POST['taskname']; // 任务名
        $interval = (int)$_POST['interval'];  // 周期
        $minRand = (int)$_POST['minRand'];  // 增量开始
        $maxRand = (int)$_POST['maxRand'];  // 增量结束
        if(!$module){
            build_err("请选择模块");
        }
        if(!$limit){
            build_err("请输入筛选时间");
        }
        if(!$interval){
            build_err("请输入任务周期");
        }
        if(!$minRand){
            build_err("请输入增加次数");
        }
        if(!$maxRand){
            build_err("请输入增加次数");
        }
        if($minRand>$maxRand){
            build_err("增加次数开始值不可以大于结束值");
        }
        $sql = $dsql->SetQuery("update `#@__site_plugins_18_read` set `taskname`='$taskname',`module`='$module',`limit`='$limit',`interval`='$interval',`minRand`='$minRand',`maxRand`='$maxRand' where `id`=$tid");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("修改成功");
        }else{
            build_err("更新失败：" . $update);
        }
    }

    /* 批量删除阅读任务 */
    public function read_del(){
        global $dsql;
        $tids = $_POST['tids']?$_POST['tids']:"";
        $tids = explode(",",$tids);
        $where = " where id in(";
        for($i=0; $i<count($tids); $i++){
            $where .= $tids[$i];
            if($i<count($tids)-1){
                $where .= ",";
            }
        }
        $where .= ")";
        $sql = $dsql->SetQuery("delete from `#@__site_plugins_18_read` $where");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("删除成功");
        }else{
            build_err("删除失败");
        }
    }
    /* 手动执行阅读计划任务（不考虑开启状态） */
    public function read_runTask(){
        global $dsql;
        $tid = $_POST['tid'];
        if(!isset($tid) || $tid==""){
            build_err("没有tid");
        }
        // 解析模块
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_read` where `id`=$tid order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $module = $res[0]['module'];
        $interval = $res[0]['interval'];

        // 包含该实现模块，调用该run方法
        $cron_class_path = dirname(__FILE__)."/cron/".$module.".cron.php";
        if(file_exists($cron_class_path)){
            include_once($cron_class_path);
            $Module = new $module();
            $res = $Module->read($tid);  // 获取执行结果
            if($res==1){
                $preTime  = time();
                $nextTime = time()+($interval*60);
                $sql = $dsql->SetQuery("update `#@__site_plugins_18_read` set `preTime`='$preTime', `nextTime`='$nextTime' where `id`=$tid");
                $dsql->dsqlOper($sql,"update");
            }else{
                build_err("执行失败");
            }
        }else{
            build_err("模块不存在");
        }
        build_success("执行成功");
    }

    /* 点赞新增定时任务 */
    public function dianzan_addTask(){
        global $dsql;
        $module   = $_POST['module'];  // 模块
        $limit   = (int)$_POST['limit'];  // 信息发布期限制
        $taskname = $_POST['taskname']; // 任务名
        $interval = (int)$_POST['interval'];  // 周期
        $minRand = (int)$_POST['minRand'];  // 增量开始
        $maxRand = (int)$_POST['maxRand'];  // 增量结束
        if(!$module){
            build_err("请选择模块");
        }
        if(!$limit){
            build_err("请输入筛选时间");
        }
        if(!$interval){
            build_err("请输入任务周期");
        }
        if(!$minRand){
            build_err("请输入增加次数");
        }
        if(!$maxRand){
            build_err("请输入增加次数");
        }
        if($minRand>$maxRand){
            build_err("增加次数开始值不可以大于结束值");
        }
        // 下次时间
        $nextTime = time()+($interval*60);
        $sql = $dsql->SetQuery("insert into `#@__site_plugins_18_dianzan`(`taskname`,`module`,`limit`,`interval`,`preTime`,`nextTime`,`minRand`,`maxRand`,`state`) values('$taskname','$module','$limit','$interval','0','$nextTime','$minRand','$maxRand','1')");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("新增成功");
        }else{
            build_err("新增失败：" . $update);
        }
    }
    /* 点赞任务编辑 */
    public function dianzan_editTask(){
        global $dsql;
        $tid = $_POST['tid'];
        if(!isset($tid) || $tid==""){
            build_err("没有tid");
        }
        $module   = $_POST['module'];  // 模块
        $limit   = (int)$_POST['limit'];  // 信息发布期限制
        $taskname = $_POST['taskname']; // 任务名
        $interval = (int)$_POST['interval'];  // 周期
        $minRand = (int)$_POST['minRand'];  // 增量开始
        $maxRand = (int)$_POST['maxRand'];  // 增量结束
        if(!$module){
            build_err("请选择模块");
        }
        if(!$limit){
            build_err("请输入筛选时间");
        }
        if(!$interval){
            build_err("请输入任务周期");
        }
        if(!$minRand){
            build_err("请输入增加次数");
        }
        if(!$maxRand){
            build_err("请输入增加次数");
        }
        if($minRand>$maxRand){
            build_err("增加次数开始值不可以大于结束值");
        }
        $sql = $dsql->SetQuery("update `#@__site_plugins_18_dianzan` set `taskname`='$taskname',`module`='$module',`limit`='$limit',`interval`='$interval',`minRand`='$minRand',`maxRand`='$maxRand' where `id`=$tid");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("修改成功");
        }else{
            build_err("修改失败：" . $update);
        }
    }
    /* 点赞任务进行批量状态切换，同时更新下次执行时间 */
    public function dianzan_changeState(){
        global $dsql;
        $tids = $_POST['tids']?$_POST['tids']:"";
        $state = $_POST['state'];
        $tids = explode(",",$tids);
        if(count($tids)<1){
            die("0");
        }
        $where = " where id in(";
        for($i=0; $i<count($tids); $i++){
            $where .= $tids[$i];
            if($i<count($tids)-1){
                $where .= ",";
            }
        }
        $where .= ")";
        $sql = $dsql->SetQuery("update `#@__site_plugins_18_dianzan` set `state`=$state,`nextTime`=(unix_timestamp(current_timestamp)+`interval`*60) $where");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("更新成功");
        }else{
            build_err("更新失败");
        }
    }
    /* 批量删除阅读任务 */
    public function dianzan_del(){
        global $dsql;
        $tids = $_POST['tids']?$_POST['tids']:"";
        $tids = explode(",",$tids);
        $where = " where id in(";
        for($i=0; $i<count($tids); $i++){
            $where .= $tids[$i];
            if($i<count($tids)-1){
                $where .= ",";
            }
        }
        $where .= ")";
        $sql = $dsql->SetQuery("delete from `#@__site_plugins_18_dianzan` $where");
        $update = $dsql->dsqlOper($sql,"update");
        if($update=="ok"){
            build_success("删除成功");
        }else{
            build_err("删除失败");
        }
    }

    /* 手动执行点赞计划任务（不考虑开启状态） */
    public function dianzan_runTask(){
        global $dsql;
        $tid = $_POST['tid'];
        if(!isset($tid) || $tid==""){
            build_err("没有tid");
        }
        // 解析模块
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_dianzan` where `id`=$tid order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $module = $res[0]['module'];
        $interval = $res[0]['interval'];

        // 包含该实现模块，调用该run方法
        $cron_class_path = dirname(__FILE__)."/cron/".$module.".cron.php";
        if(file_exists($cron_class_path)){
            include_once($cron_class_path);
            $Module = new $module();
            $res = $Module->dianzan($tid);  // 获取执行结果
            if($res==1){
                $preTime  = time();
                $nextTime = time()+($interval*60);
                $sql = $dsql->SetQuery("update `#@__site_plugins_18_dianzan` set `preTime`='$preTime', `nextTime`=$nextTime where `id`=$tid");
                $dsql->dsqlOper($sql,"update");
            }else{
                build_err("执行失败");
            }
        }else{
            build_err("模块不存在");
        }
        build_success("执行成功");

    }
}






