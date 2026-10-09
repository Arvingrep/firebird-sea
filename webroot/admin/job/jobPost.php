<?php
/**
 * 管理招聘职位
 *
 * @version        $Id: jobPost.php 2014-3-17 上午11:09:15 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobPost");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobPost.html";

$tab = "job_post";

//查询是否安装抖音小程序
$douyin = 0;
$sql = $dsql->SetQuery("SELECT `pid` FROM `#@__site_plugins` WHERE `pid` = 20");
$ret = $dsql->getArr($sql);
if($ret){
    //查询模块是否开启在抖音端展示
    $sql = $dsql->SetQuery("SELECT `dy` FROM `#@__site_module` WHERE `name` = 'job' AND `dy` = 1");
    $ret = $dsql->getArr($sql);
    if($ret){
        $douyin = 1;
    }
}

if($dopost == "getList") {

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    //判断公司管理权限
    if(!testPurview("jobCompany")){
        //找出它当前绑定的cid列表，然后 in
        $currentAdminId = $userLogin->getUserID();
        $bindCids = $dsql->getArr($dsql::SetQuery("select `cid` from `#@__job_company_bind` where `release_type`=0 and `admin`=".$currentAdminId));
        if($bindCids){
            $where .= " and `company` in(".join(",",$bindCids).")";
        }else{
            $where .= " and 1=2";
        }
    }

    if ($sKeyword != "") {
        $where .= " AND `title` like '%" . $sKeyword . "%'";

        $comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
        $comResult = $dsql->dsqlOper($comSql, "results");
        if ($comResult) {
            $comid = array();
            foreach ($comResult as $key => $com) {
                array_push($comid, $com['id']);
            }
            if (!empty($comid)) {
                $where .= " OR `company` in (" . join(",", $comid) . ")";
            }
        }

        //模糊匹配简历用户
        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $userid = array();
            foreach ($userResult as $key => $user) {
                $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = " . $user['id']);
                $userResult = $dsql->dsqlOper($userSql, "results");
                if ($userResult) {
                    array_push($userid, $userResult[0]['id']);
                }
            }
            if (!empty($userid)) {
                $where .= " OR `bole` in (" . join(",", $userid) . ")";
            }
        }
    }

    if ($sType != "") {
        if ($dsql->getTypeList($sType, "job_type")) {
            $lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
            $lower = $sType . "," . join(',', $lower);
        } else {
            $lower = $sType;
        }
        $where .= " AND `type` in ($lower)";
    }

    //职位性质
    if($nature){
        $where .= " AND `nature` = " . $nature;
    }

    if ($start != "") {
        $where .= " AND `pubdate` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND `pubdate` <= " . GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $tab . "` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //待审核（ 未过期：valid > $now AND valid=0【永不过期】 )
    $now = time();
    $state0 = $dsql->dsqlOper($archives . " AND `state` = 0 AND (`valid`=0 OR `valid` > $now)" . $where, "totalCount");
    //已审核
    $state1 = $dsql->dsqlOper($archives . " AND `state` = 1 AND (`valid`=0 OR `valid` > $now)" . $where, "totalCount");
    //拒绝审核
    $state2 = $dsql->dsqlOper($archives . " AND `state` = 2 AND (`valid`=0 OR `valid` > $now)" . $where, "totalCount");
    //已过期（ 已过期 <= 过期时间  and valid=0）
    $state3 = $dsql->dsqlOper($archives . " AND `valid`!=0 AND `valid` <= $now" . $where, "totalCount");
    //已下架
    $state4 = $dsql->dsqlOper($archives . " AND `off` = 1" . $where, "totalCount");
    //抖音隐藏
    $state5 = $dsql->dsqlOper($archives . " AND `douyin` = 0" . $where, "totalCount");

    if ($state != "") {

        if ($state == 3) {
            $where .= " AND `valid` <=$now AND `valid`!=0";
        } elseif($state == 4) {
            $where .= " AND `off` = 1";
        } elseif($state == 5) {
            $where .= " AND `douyin` = 0";
        }else {
            $where .= " AND `state` = $state AND (`valid` >= $now OR `valid`=0)";
        }

        if ($state == 0) {
            $totalPage = ceil($state0 / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($state1 / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($state2 / $pagestep);
        } elseif ($state == 3) {
            $totalPage = ceil($state3 / $pagestep);
        } elseif ($state == 4) {
            $totalPage = ceil($state4 / $pagestep);
        } elseif ($state == 5) {
            $totalPage = ceil($state5 / $pagestep);
        }
    }

    $where .= " order by `weight` desc, `pubdate` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `off`, `offdate`, `cityid`, `title`, `type`, `company`, `state`, `refuse_msg`, `valid`,`long_valid`, `pubdate`, `update_time`,`click`,`is_refreshing`,`is_topping`,`min_salary`,`max_salary`,`salary_type`,`mianyi`,`number`,`del`,`nature`,`douyin` FROM `#@__" . $tab . "` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");

    include_once(HUONIAOROOT."/api/handlers/job.class.php");
    $job = new job();

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["title"] = $value["title"];

            $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$value['cityid']}");
            $list[$key]['cityName'] = $dsql->getOne($sql) ?: "未知";

            $list[$key]["typeid"] = $value["type"];
            $typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__job_type` WHERE `id` = " . $value['type']);
            $typename = $dsql->getTypeName($typeSql);
            $list[$key]["type"] = $typename[0]["typename"];

            $list[$key]["companyid"] = $value["company"];
            $comSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = " . $value['company']);
            $comname = $dsql->getTypeName($comSql);
            $list[$key]["company"] = $comname[0]["title"];
            $list[$key]["number"] = $value['number'];

            $userSql = $dsql->SetQuery("SELECT m.`nickname`,m.`id` FROM `#@__job_company` c LEFT JOIN `#@__member` m ON c.`userid`=m.`id` WHERE c.`id` = " . $value['company']);
            $userArr = $dsql->getArr($userSql);
            $list[$key]["nickname"] = $userArr['nickname'];
            $list[$key]["userid"] = $userArr['id'];

            //刷新、置顶详细
            $sql = $dsql::SetQuery("select `id` from `#@__job_refresh_record` where `type`=2 and `cid`={$value['company']} and FIND_IN_SET({$value['id']},`posts`) and `less`<`refresh_count` limit 1");
            $is_refreshing = (int)$dsql->getOne($sql);
            if($is_refreshing){
                $list[$key]['is_refreshing'] = 1;
                $list[$key]['refreshDetail'] = $job->getSmartyRefresh($value['id']);
            }else{
                $list[$key]['refreshDetail'] = array();
            }
            $sql = $dsql::SetQuery("select `id` from `#@__job_top_recode` where `cid`={$value['company']} and `pid`={$value['id']} and `is_end`=0 limit 1");
            $is_topping = $dsql->getOne($sql);
            if($is_topping){
                $list[$key]['is_topping'] = 1;
                $list[$key]['topDetail'] = $job->getTopDetail($value['id']);
            }else{
                $list[$key]['topDetail'] = array();
            }
            //薪资
            $min_salary = $value['min_salary'];
            $max_salary = $value['max_salary'];
            $list[$key]['show_salary'] = salaryFormat($value['salary_type'], $min_salary, $max_salary, $value['mianyi']);

            //应聘数（面试数量）
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `pid` = {$value["id"]}");
            $list[$key]['interview'] = (int)$dsql->getOne($sql);

            $list[$key]["click"] = $value['click'];
            $list[$key]["off"] = (int)$value['off'];
            $list[$key]["offdate"] = $value['offdate'] ? date('Y-m-d H:i:s', $value['offdate']) : '';
            $list[$key]["del"] = (int)$value['del'];

            $list[$key]["state"] = $value["state"];
            $list[$key]["refuse_msg"] = $value["refuse_msg"];
            $list[$key]["valid"] = $value["valid"];
            $list[$key]["long_valid"] = $value["long_valid"];
            if($value['long_valid']==1){
                $list[$key]['show_valid'] = "无限制";
            }else{
                $list[$key]['show_valid'] = date("Y-m-d",$value["valid"]);
            }
            // $list[$key]["is_refreshing"] = $value["is_refreshing"];
            // $list[$key]["is_topping"] = $value["is_topping"];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["update_time"] = $value["update_time"] ? date('Y-m-d H:i:s', $value["update_time"]) : '无';

            $param = array(
                "service" => "job",
                "template" => "company",
                "id" => $value['company']
            );
            $list[$key]["companyurl"] = getUrlPath($param);

            $param = array(
                "service" => "job",
                "template" => "job-list",
                "param" => "type=" . $value['type']
            );
            $list[$key]["typeurl"] = getUrlPath($param);

            $param = array(
                "service" => "job",
                "template" => "job",
                "id" => $value['id']
            );
            $list[$key]["url"] = getUrlPath($param);

            //性质
            $list[$key]["natureid"] = (int)$value['nature'];
            $archives = $dsql->SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='jobNature' and `value`=" . $value["nature"]);
            $list[$key]["nature"] = $dsql->getOne($archives) ?: "";

            $list[$key]["douyin"] = (int)$value['douyin'];

        }

        if (count($list) > 0) {
            if($do!="export"){
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state5": ' . $state5 . ', "time": ' . time() . '}, "jobPost": ' . json_encode($list) . '}';
            }
        } else {
            if($do!="export"){
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state5": ' . $state5 . '}}';
            }
        }

    } else {
        if($do!="export"){
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state5": ' . $state5 . '}}';
        }
    }
    if($do == "export"){
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '职位名称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '职位类别'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '岗位薪资'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '招聘人数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '所属公司'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '管理员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '应聘次数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '浏览次数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '刷新'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '置顶'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '发布时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '更新时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '截止时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '链接地址'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","招聘职位.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['show_salary']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['number']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityName']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['company']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['interview']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['click']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refreshDetail'] ? $data['refreshDetail']['info'] : ''));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['topDetail'] ? $data['topDetail']['info'] : ''));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pubdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['update_time']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['show_valid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['state']==0? "待审核":($data['state']==1 ? "审核通过" : "审核拒绝")));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['url']));


            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 招聘职位.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }
    die;
}
//职位状态
elseif($dopost == "offState"){
	if($id != ""){

        $each = explode(",", $id);
        $error = array();
        $async = array();
        $title = array();
        foreach($each as $val){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "results");

            array_push($title, $results[0]['title']);

            //查询公司信息
            $companyid = (int)$results[0]['company'];

            $sql = $dsql->SetQuery("SELECT * FROM `#@__job_company` WHERE `id` = " . $companyid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                //统计在招职位（审核通过和待审核的）
                $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `off`=0 and `del`=0  AND `company` = " . $companyid);
                $pcount = (int)$dsql->getOne($sql);

                $results = $ret[0];

                //套餐详情
                $results['combo_id'] = (int)$results['combo_id'];  // 套餐id
                $results['combo_enddate'] = (int)$results['combo_enddate']; //套餐过期时间
                $results['combo_job'] = (int)$results['combo_job'];  //职位上架数

                $results['combo_wait'] = json_decode($results['combo_wait'],true) ?: array();  //待生效套餐包
                //如果当前套餐过期了，而且还有待生效套餐，则把待生效套餐立即生效，并清空待生效套餐
                if(time()>$results['combo_enddate'] && $results['combo_enddate']!=-1 && $results['combo_wait']){
                    $results['combo_id'] = $results['combo_wait']['id'];;
                    $results['combo_title'] = $results['combo_wait']['title'];;
                    $results['combo_enddate'] = $results['combo_wait']['enddate'];;
                    $results['combo_job'] = $results['combo_wait']['job'];;
                    $results['combo_resume'] = $results['combo_wait']['resume'];;
                    $results['combo_refresh'] = $results['combo_wait']['refresh'];;
                    $results['combo_top'] = $results['combo_wait']['top'];
                    $results['combo_wait'] = "";
                    //更新到数据库中
                    $sql = $dsql::SetQuery("update `#@__job_company` set `combo_id`={$results['combo_id']},`combo_enddate`={$results['combo_enddate']},`combo_job`={$results['combo_job']},`combo_resume`={$results['combo_resume']},`combo_refresh`={$results['combo_refresh']},`combo_top`={$results['combo_top']},`combo_wait`='{$results['combo_wait']}' where `id`=$companyid");
                    $up4 = $dsql->update($sql);
                    clearCache("job_company_detail", $companyid);
                }

                //增值包相关
                $results['package_job'] = (int)$results['package_job']; //增值包上架职位总数（随套餐生效）

                /* 计算当前可用资源，先判断套餐是否过期 */
                if($results['combo_enddate']!=-1 && $results['combo_enddate']<time()){
                    $combo_job = 0;
                    $combo_resume = 0;
                    $combo_refresh = 0;
                }else{
                    $combo_job = $results['combo_job'];  //职位上架数
                    $combo_resume = $results['combo_resume'];  //简历每天下载数
                    $combo_refresh = $results['combo_refresh']; //简历每天刷新数
                }

                //计算当前可上架的职位数
                if(($results['combo_enddate']>=time() || $results['combo_enddate']==-1) && $results['combo_job']==-1){
                    $canJobs = -1;  //当前剩余无限次数上架职位
                }else{
                    $canJobs = ($combo_job+$results['package_job']) > $pcount ? $combo_job+$results['package_job']-$pcount : 0;
                }

                if($canJobs == 0){
                    echo '{"state": 200, "info": "【'.$results['title'].'】职位所属公司可上架职位数不足！"}';
                    die;
                }

            }else{
                echo '{"state": 200, "info": "【'.$results['title'].'】职位所属公司不存在，操作失败！"}';
                die;
            }

            //更新表
            if($off){
                $archives = $dsql->SetQuery("update `#@__".$tab."` set `off`=$off,`offdate`=".GetMkTime(time())." WHERE `id` = ".$val);
            }else{
                $archives = $dsql->SetQuery("update `#@__".$tab."` set `off`=$off WHERE `id` = ".$val);
            }
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }else{
                // 清除缓存
                checkCache("job_post_list", $val);
                clearCache("job_post_detail", $val);
                clearCache("job_post_total", "key");
                $async[] = $val;
            }
        }
        dataAsync("job",$async,"post");  // 修改职位上下架状态
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            $offMsg = $off==1? "上架" : "下架";
            adminLog($offMsg."招聘职位信息", join(", ", $title));
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }
        die;

    }
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobPostDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("job_post_list", $val);
				clearCache("job_post_detail", $val);
				clearCache("job_post_total", "key");
                $async[] = $val;
			}
		}
        dataAsync("job",$async,"post");  // 删除职位
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘职位信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobPostEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

    //超管一键审核通过所有待审信息
    if($manage){

        $id = array();
        $now = time();
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `state` = 0 AND (`valid`=0 OR `valid` > $now)" . getCityFilter('`cityid`'));
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = array_column($ret, 'id');
        }
        $id = join(',', $id);

    }
    
	$each = explode(",", $id);
	$async = array();
	$error = array();
	$append = "";

    $state = (int)$state;

	if($state==2){
	    $append .= ",refuse_msg='$refuse_msg'";
    }
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT p.`state`,p.`title`,c.`userid` FROM `#@__".$tab."` p left join `#@__job_company` c ON p.`company`=c.`id` WHERE p.`id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];
			$uid = $res[0]['userid'];
			$ptitle = $res[0]['title'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state."$append WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				clearCache("job_post_detail", $val);
				//取消审核
				if($state != 1 && $state_ == 1){
					checkCache("job_post_list", $val);
					clearCache("job_post_total", "key");
					if($state==2){
//					    updateMemberNotice();
					    $dsql->update($dsql::SetQuery("insert into `#@__job_message`(`uid`,`notice`,`type`) values($uid,'职位审核拒绝：$ptitle','postRefuse')"));
                    }
				}
				//审核通过
				elseif($state == 1 && $state_ != 1){
					updateCache("job_post_list", 300);
					clearCache("job_post_total", "key");
                    $dsql->update($dsql::SetQuery("insert into `#@__job_message`(`uid`,`notice`,`type`) values($uid,'职位审核通过：$ptitle','postPass')"));
				}
				$async[] = $val;
			}
		}
        dataAsync("job",$async,"post");  // 修改职位状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新招聘职位状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
//职位在抖音端的展示状态
elseif($dopost == "douyin"){
	if($id != ""){

        $state = (int)$state;  //0隐藏  1展示

        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `douyin` = ".$state." WHERE `id` in (".$id.")");
        $results = $dsql->dsqlOper($archives, "update");
        
        $offMsg = $state == 1 ? "展示" : "隐藏";
        adminLog("修改招聘职位在抖音端的状态为：" . $offMsg, "职位ID：" . $id);
        echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        die;

    }
	die;

}
//延长截至时间
elseif($dopost == "updateTime"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $base_where = $where = getCityFilter('`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){
		$where .= " AND `title` like '%".$sKeyword."%'";

		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$comid = array();
			foreach($comResult as $key => $com){
				array_push($comid, $com['id']);
			}
			if(!empty($comid)){
				$where .= " OR `company` in (".join(",", $comid).")";
			}
		}

		//模糊匹配简历用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = ".$user['id']);
				$userResult = $dsql->dsqlOper($userSql, "results");
				if($userResult){
					array_push($userid, $userResult[0]['id']);
				}
			}
			if(!empty($userid)){
				$where .= " OR `bole` in (".join(",", $userid).")";
			}
		}
	}

	if($sType != ""){
		if($dsql->getTypeList($sType, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `type` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
    $now = time();
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//已过期
	$state3 = $dsql->dsqlOper($archives." AND `valid` <= $now AND `valid`=0".$where, "totalCount");

	if($state != ""){

		if($state == 3){
            $where .= " AND `valid` <=$now AND `valid`!=0";
		}else{
            $where .= " AND `state` = $state AND (`valid` >= $now OR `valid`=0)";
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}
	}

	$add = $time * 86400;

	if($where == $base_where){
        echo '{"state": 200, "info": "请选择过滤筛选条件！"}';
        die;
    }
	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `valid` = `valid` + $add WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "update");
	$updateEsSql = $dsql->SetQuery("select id from `#@__$tab` WHERE 1 = 1 $where");
    $updateEs = $dsql->getArr($updateEsSql);
	if($updateEs){
	    dataAsync("job",$updateEs,"post");  // 批量更新职位时间
    }
	if($results == 'ok'){
		adminLog("延长职位截止时间".$time."天", $where);
		echo '{"state": 100, "info": "操作成功！"}';
	}else{
		echo '{"state": 200, "info": "'.$results.'"}';
	}
	die;


//更新发布时间
}elseif($dopost == "updateFabuTime"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $base_where = $where = getCityFilter('`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){
		$where .= " AND `title` like '%".$sKeyword."%'";

		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$comid = array();
			foreach($comResult as $key => $com){
				array_push($comid, $com['id']);
			}
			if(!empty($comid)){
				$where .= " OR `company` in (".join(",", $comid).")";
			}
		}

		//模糊匹配简历用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = ".$user['id']);
				$userResult = $dsql->dsqlOper($userSql, "results");
				if($userResult){
					array_push($userid, $userResult[0]['id']);
				}
			}
			if(!empty($userid)){
				$where .= " OR `bole` in (".join(",", $userid).")";
			}
		}
	}

	if($sType != ""){
		if($dsql->getTypeList($sType, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `type` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
    $now = time();
    $state0 = $dsql->dsqlOper($archives." AND `state` = 0 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//已过期
	$state3 = $dsql->dsqlOper($archives." AND `valid`!=0 AND `valid` <= $now".$where, "totalCount");

	if($state != ""){

		if($state == 3){
            $where .= " AND `valid` <=$now AND `valid`!=0";
		}else{
            $where .= " AND `state` = $state AND (`valid` >= $now OR `valid`=0)";
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}
	}

	$time = time();
    if($where == $base_where){
        echo '{"state": 200, "info": "请选择过滤筛选条件！"}';
        die;
    }
	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = $time WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == 'ok'){
	    $sql = $dsql->SetQuery("select `id` from `#@__".$tab."` WHERE 1 = 1".$where);
	    $ids = $dsql->getArr($sql);
        dataAsync("job",$ids,"post");  // 更新发布时间
		adminLog("刷新职位发布时间", $where);
		echo '{"state": 100, "info": "操作成功！"}';
	}else{
		echo '{"state": 200, "info": "'.$results.'"}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobPost.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));

    $archives = $dsql->SetQuery("select `value`, `zh` from `#@__job_int_static_dict` where `name`='jobNature' order by `id` asc");
    $ret = $dsql->dsqlOper($archives, "results");
	$huoniaoTag->assign('natureListArr', $ret);

    $huoniaoTag->assign('douyin', (int)$douyin);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
