<?php
/**
 * 网站附件管理
 *
 * @version        $Id: siteFileManage.php 2022-08-26 下午14:17:21 $
 * @package        HuoNiao.SiteConfig
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteFileManage");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteFileManage.html";

global $cfg_ftpType;

if($action != "" || $dopost != ""){

    //列表
    if($dopost == "getList") {

        $pagestep = $pagestep == "" ? 10 : $pagestep;
        $page     = $page == "" ? 1 : $page;

        $where = " AND l.`path` != ''";

        if($module){
            $where .= " AND l.`path` like '/".$module."%'";
        }

        $keyword = trim($keyword);

        //用户ID
        if(!empty($keyword)){
            if (substr($keyword, 0, 1) == '#') {
                $keyword = substr($keyword, 1);
                $where .= " AND l.`userid` = " . $keyword;
            } else {
                $where .= " AND (l.`filename` like '%$keyword%' OR l.`path` like '%$keyword%')";
            }
        }

        if($type){
            $where .= " AND l.`filetype` = '$type'";
        }else{
            $where .= " AND l.`filetype` = ''";
        }

        //时间
        if ($start != "") {
            $where .= " AND l.`pubdate` >= " . GetMkTime($start);
        }
    
        if ($end != "") {
            $where .= " AND l.`pubdate` <= " . GetMkTime($end . " 23:59:59");
        }

        if($orderby == 'size'){
            $where .= " ORDER BY l.`filesize` DESC, l.`id` DESC";
        }elseif($orderby == 'size1'){
            $where .= " ORDER BY l.`filesize` ASC, l.`id` ASC";
        }elseif($orderby == 'click'){
            $where .= " ORDER BY l.`click` DESC, l.`id` DESC";
        }elseif($orderby == 'click1'){
            $where .= " ORDER BY l.`click` ASC, l.`id` ASC";
        }elseif($orderby == 'date'){
            $where .= " ORDER BY l.`id` ASC";
        }else{
            $where .= " ORDER BY l.`id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT count(*) totalCount, sum(`filesize`) totalSize FROM `#@__attachment` l WHERE 1 = 1".$where);

        //总条数
        $totalRes = $dsql->dsqlOper($archives, "results");
        $totalCount = (int)$totalRes[0]['totalCount'];
        $totalSize = (int)$totalRes[0]['totalSize'];
        $totalSize = $totalSize ? sizeformat($totalSize) : 0;

        //总分页数
        $totalPage = ceil($totalCount/$pagestep);

        $atpage = $pagestep*($page-1);
        $where .= " LIMIT $atpage, $pagestep";
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`userid`, l.`filename`, l.`filetype`, l.`filesize`, l.`path`, l.`pubdate`, l.`duration`, l.`poster`, l.`click` FROM `#@__attachment` l WHERE 1 = 1".$where);
        $results = $dsql->dsqlOper($archives, "results");

        if(is_array($results) && count($results) > 0){
            $list = array();
            foreach ($results as $key=>$value) {
                $list[$key]["id"] = $value["id"];
                $list[$key]["userid"] = $value["userid"];
                $list[$key]["filename"] = $value["filename"] ? $value["filename"] : basename($value['path']);

                $nickname = '';
                if($value['userid'] && $value['userid'] > 0){
                    $sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $nickname = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    }else{
                        $list[$key]['userid'] = 0;
                        $nickname = '<font color="#666">用户已删除</font>';
                    }
                }
                $list[$key]['nickname'] = $nickname ? $nickname : '<font color="#999999">匿名</font>';

                $list[$key]["filetype"] = $value["filetype"];
                $list[$key]["filesize"] = sizeformat($value["filesize"]);
                $list[$key]["path"] = $value["path"];

                $filepath = (string)getFilePath($value["path"], false);
                $list[$key]["filepath"] = $filepath;
                $list[$key]['pubdate'] = $value['pubdate'];
                $list[$key]['click'] = (int)$value['click'];

                if($type == 'video'){

                    //视频时长
                    $videotime_ = '00:00';
                    if($value['duration']){
                        $theTime = $value['duration'];// 秒
                        $theTime1 = 0;// 分
                        $theTime2 = 0;// 小时
                        if($theTime > 60) {
                            $theTime1 = (int)($theTime/60);
                            $theTime = (int)($theTime%60);
                            if($theTime1 > 60) {
                                $theTime2 = (int)($theTime1/60);
                                $theTime1 = (int)($theTime1%60);
                            }
                        }

                        $theTime2 = $theTime2 && $theTime2 < 10 ? '0' . $theTime2 : $theTime2;
                        $theTime1 = $theTime1 && $theTime1 < 10 ? '0' . $theTime1 : $theTime1;
                        $theTime = $theTime && $theTime < 10 ? '0' . $theTime : $theTime;

                        $videotime_ = $theTime;
                        if($theTime1 > 0) {
                            if($theTime2 > 0) {
                                $videotime_ = "".$theTime2.":".$theTime1.":".$videotime_;
                            }else{
                                $videotime_ = "".$theTime1.":".$videotime_;
                            }
                        }else{
                            $videotime_ = "00:".$videotime_;
                        }
                    }
                    $list[$key]['duration'] = $videotime_;

                    $poster = getFilePath($value['poster']);
                    if(empty($poster)){

                        //阿里云
                        if($cfg_ftpType == 1){
                            $poster = $filepath . '?x-oss-process=video/snapshot,t_0,f_jpg,w_0,h_0,m_fast,ar_auto';

                        //七牛云
                        }elseif($cfg_ftpType == 2){
                            $poster = $filepath . '?vframe/jpg/offset/1/rotate/auto';

                        }else{
                            $pathArr = explode('.', $filepath);
                            $ext = end($pathArr);
                            $poster = str_replace('.'.$ext, '.jpg', $filepath);

                        }
                    }

                    $list[$key]['poster'] = $poster;

                }

                if($type == 'audio'){

                    //音频时长
                    $videotime_ = '00:00';
                    if($value['duration']){
                        $theTime = $value['duration'];// 秒
                        $theTime1 = 0;// 分
                        $theTime2 = 0;// 小时
                        if($theTime > 60) {
                            $theTime1 = (int)($theTime/60);
                            $theTime = (int)($theTime%60);
                            if($theTime1 > 60) {
                                $theTime2 = (int)($theTime1/60);
                                $theTime1 = (int)($theTime1%60);
                            }
                        }

                        $theTime2 = $theTime2 && $theTime2 < 10 ? '0' . $theTime2 : $theTime2;
                        $theTime1 = $theTime1 && $theTime1 < 10 ? '0' . $theTime1 : $theTime1;
                        $theTime = $theTime && $theTime < 10 ? '0' . $theTime : $theTime;
                        
                        $videotime_ = $theTime;
                        if($theTime1 > 0) {
                            if($theTime2 > 0) {
                                $videotime_ = "".$theTime2.":".$theTime1.":".$videotime_;
                            }else{
                                $videotime_ = "".$theTime1.":".$videotime_;
                            }
                        }else{
                            $videotime_ = "00:".$videotime_;
                        }
                    }
                    $list[$key]['duration'] = $videotime_;

                }
            }

            if(count($list) > 0){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalSize": "'.$totalSize.'"}, "list": '.json_encode($list).'}';
            }else{
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
            }

        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
        }
        die;

    //删除
    }elseif($dopost == "del"){
        if($id !== ""){

            $each = explode(",", $id);
            $title = array();
            $RenrenCrypt = new RenrenCrypt();

            //这里需要强制声明可以删除文件
            global $cfg_filedelstatus;
            $cfg_filedelstatus = 1;

            foreach($each as $val) {

                $val = $val;
                $archives = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "results");

                $path = $results[0]['path'];
                $pathArr = explode('/', $path);

                array_push($title, $path);

                $module = $pathArr[1];
                $type = 'del' . ucwords($pathArr[2]);

                $fid = base64_encode($RenrenCrypt->php_encrypt($val));

                delPicFile($fid, $type, $module, true);

            }

            adminLog("删除网站附件", join("、", $title));
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
            die;

        }else{
            die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
        }
    }
    //批量删除
    elseif($dopost == 'batchDel'){
        global $cfg_uploadDir;
        set_time_limit(0);

        $stime = str_replace('T', ' ', $stime);
        $etime = str_replace('T', ' ', $etime);

        $stime = GetMkTime($stime);
        $etime = GetMkTime($etime);
        $startId = (int)($_GET['startId'] ?? 0);
        $baseSql = "select a.`id` 'aid',a.`path`,a.`userid`,m.`id` 'uid',a.`click`,a.`pubdate`,a.`filetype` from `#@__attachment` a left join `#@__member` m on a.`userid`=m.`id` where 1=1 and a.`id`>$startId";
        $maxIdSql = "select count(a.`id`) from `#@__attachment` a left join `#@__member` m on a.`userid`=m.`id` where 1=1 and a.`id`>$startId";
        $where = "";
        $fileNotExist = false;  //是否不存在，这是一个特殊判断，不能用sql判断出是否不存在，而其他都可以通过sql，所以这是一个关键点，只要有了不存在则不能直接sql，反正可以
        $userDelete = false;
        //其他条件
        $else = $_GET['else'];
        if($else){
            if(in_array('1',$else)){ //文件不存在
                $fileNotExist = true;
            }
            if(in_array('2',$else)){ //用户已删除【该用户不存在】，先查附件表，然后查用户表
                $userDelete = true;
                $where .= " and a.`userid`>0 and m.`id` IS NULL";
            }
        }
        //指定类型
        $type = $_GET['type'] ?? array();
        if($type){
            $newType = array();
            if(in_array('image',$type)){ //图片
                $newType[] = "'image'";
            }
            if(in_array('video',$type)){ //视频
                $newType[] = "'video'";
            }
            if(in_array('audio',$type)){ //音频
                $newType[] = "'audio'";
            }
            if(in_array('file',$type)){ //文件
                $newType[] = "'file'";
            }
            if(in_array('',$type)){ //不是前面的几种
                $newType[] = "''";
            }
            //如果包含了全部类型，则不再判断类型了。
            if(in_array('image',$type) && in_array('video',$type) && in_array('audio',$type) && in_array('file',$type) && in_array('',$type)){
                //不加类型判断
            }else{
                $where .= " and a.`filetype` in(".join(",",$newType).")";
            }
        }

        //指定模块
        $module = $_GET['module'] ?? '';
        if($module){  //指定某个模块，而非全部
            $where .= " and a.`path` like '$module%'";
        }
        //指定会员id，多个用,分隔
        $uid = $_GET['uid'] ?? '';
        if(!empty($uid)){
            $where .= " and a.`userid` in($uid)";
        }
        //指定开始时间和结束时间
        if(!empty($stime)){
            $where .= " and a.`pubdate`>=$stime";
        }
        if(!empty($etime)){
            $where .= " and a.`pubdate`<=$etime";
        }
        //指定使用次数范围
        $scount = $_GET['scount'] ?? '';
        if(!empty($scount)){
            $where .= " and a.`click`>=$scount";
        }
        $ecount = $_GET['ecount'] ?? '';
        if(!empty($ecount)){
            $where.= " and a.`click`<=$ecount";
        }
        $countLimit = $fileNotExist ? 200 : 1000;  //如果需要删除不存在的文件，每次处理100条
        $sql = $dsql::SetQuery($baseSql.$where." order by a.`id` limit $countLimit");
        $maxIdSql = $dsql::SetQuery($maxIdSql.$where);
        $realMaxId = (int)$dsql->getOne($maxIdSql);
        $realMaxId = $realMaxId - $countLimit;
        $delList = $dsql->getArrList($sql);
        $maxId = 0;

        $nextLocation = "?next=1&dopost=";
        //dopost
        $dopost = $_GET['dopost'] ?? '';
        $nextLocation.=$dopost;
        //type
        foreach ($type as $typeItem){
            $nextLocation.="&type[]=".$typeItem;
        }
        //module
        $module = $_GET['module'] ?? '';
        $nextLocation .= "&module=$module";
        //uid
        $uid = $_GET['uid'] ?? '';
        $nextLocation .= "&uid=".$uid;
        //时间
        $stime = $_GET['stime'] ?? '';
        $nextLocation .= "&stime=".$stime;
        $etime = $_GET['etime'] ?? '';
        $nextLocation .= "&etime=".$etime;
        //次数
        $scount = $_GET['scount'] ?? '';
        $nextLocation .= "&scount=".$scount;
        $ecount = $_GET['ecount'] ?? '';
        $nextLocation .= "&ecount=".$ecount;
        //其他
        foreach ($else as $elseItem){
            $nextLocation .= "&else[]=".$elseItem;
        }
        //开始id
        $nextLocation .= "&startId=".$maxId;

        //刚进来先给出提示，再进行操作，防止出现刚打开页面长时间空白的情况
        if(!isset($_GET['next'])){
            ShowMsg("<p style='padding-top: 25px; line-height: 1.5em; font-size: 20px; margin: 0 auto;'>数据清理中，请不要关闭当前页面！</p>", $nextLocation);
            die;
        }

        $processed = 0;  //本次处理条数
        foreach ($delList as $delItem){
            $maxId = $delItem['aid'];
            //判断文件不存在，也就是说如果文件存在则返回
            if($fileNotExist){
                if(file_exists(HUONIAOROOT.$cfg_uploadDir.$delItem['path']) || $uploadClass = upload::remoteFileExists(getFilePath($delItem['aid']))){
                    //用户已删除和文件不存在是 or 条件，如果存在也要继续删除，反之continue;
                    if(!$userDelete){
                        continue;
                    }
                }else{
                    $processed++;
                    //真的不存在，直接删除数据库即可，无文件可删
                    $sql = $dsql::SetQuery("delete from `#@__attachment` where `id`={$delItem['aid']}");
                    $dsql->update($sql);
                    continue;
                }
            }
            //删除文件，删除数据库
            $pathArr = explode("/",$delItem['path']);
            //模块、类型 如果获取不到，直接删除数据库
            if(!empty($pathArr) && count($pathArr)>=2){
                $mod = $pathArr[1]; //模块名称
                $delType = $pathArr[2]; //类型名称
                if($delType!="editor"){
                    $delType = "del".$delType;
                }
                
                //删除文件

                //这里需要强制声明可以删除文件
                global $cfg_filedelstatus;
                $cfg_filedelstatus = 1;

                $processed++;
                delPicFile($delItem['aid'],$delType,$mod,true);
            }
        }
        if($realMaxId>0){

            $nextLocation .= "&startId=".$maxId;

            if($fileNotExist){
                ShowMsg("<p style='padding-top: 25px; line-height: 1.5em; font-size: 20px; margin: 0 auto;'>数据清理中，请不要关闭当前页面！<br />本次处理：$processed 个文件，剩余：$realMaxId 个文件需要排查，请稍候...</p>", $nextLocation);
            }else{
                ShowMsg("<p style='padding-top: 25px; line-height: 1.5em; font-size: 20px; margin: 0 auto;'>数据清理中，请不要关闭当前页面！<br />本次处理：$processed 个文件，剩余：$realMaxId 个文件，请稍候...</p>", $nextLocation);
            }
            die;

            echo "<script>function redirect(){location='$nextLocation'}</script>";
            echo "<script>","setTimeout(redirect, 1000)",'</script>';
            die("<title>正在清理...</title><center style='padding-top: 150px; line-height: 1.8em; font-size: 30px;'>数据清理中，请不要关闭当前页面！<br />本次处理：$countLimit 条，剩余：$realMaxId 条</center>");
        }else{
            die("<title>清理完成</title><center style='padding-top: 150px; line-height: 1.8em; font-size: 30px;'>数据清理完毕</center>");
        }
    }

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
		'admin/siteConfig/siteFileManage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('moduleList', getModuleList(false));

    $huoniaoTag->assign('cfg_record_attachment_count', (int)$cfg_record_attachment_count);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
