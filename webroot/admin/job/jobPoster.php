<?php
/**
 * 管理招聘简历
 *
 * @version        $Id: jobResume.php 2014-3-17 下午17:49:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobResume");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobPoster.html";

$tab = "poster_template";
//js
$jsFile = array(
    'ui/bootstrap-datetimepicker.min.js',
    'ui/bootstrap.min.js',
    'ui/jquery-ui-selectable.js',
    'ui/chosen.jquery.min.js',
    'admin/job/jobPoster.js'
);

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;
    $state = $_POST['state'];

    $where = " WHERE 1=1";

    if($sKeyword != ""){
        $where .= " AND `title` like '%$sKeyword%'";
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__poster_template`".$where);

    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    //暂停
    $totalPause = $dsql->dsqlOper($archives." AND `type` = 'post'", "totalCount");
    //正常
    $totalNormal = $dsql->dsqlOper($archives." AND `type` = 'company'", "totalCount");

    if($state != ""){
        $where .= " AND `type` = '$state'";
    }

    $where .= " order by `id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT * FROM `#@__poster_template`".$where);
    $results = $dsql->dsqlOper($archives, "results");

    $typeList = array("post"=>"职位","company"=>"公司");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"]      = $value["id"];
            $list[$key]["title"]    = $value["title"];
            $list[$key]["module"]  = $value["module"];
            $list[$key]["type"]    = $typeList[$value["type"]];
            $list[$key]["litpic"]   = $value["litpic"];
            $list[$key]["isSystem"]     = $value["isSystem"];
            $list[$key]["state"]   = $value["state"];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}, "mytagTemp": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
    }
    die;


}
//新增
elseif($dopost == "add"){

    if($_GET['submit']==1){

        if($token == "") die('{"state": 200, "info": "token传递失败！"}');

        if(empty($title)) die('{"state": 200, "info": "海报名称不得为空！"}');
        if(empty($type)) die('{"state": 200, "info": "请选择分类！"}');
        if(empty($litpic)) die('{"state": 200, "info": "缩略图不得为空！"}');
        if(empty($html)) die('{"state": 200, "info": "页面代码不得为空！"}');

        $archives = $dsql->SetQuery("INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('$title', 'job', '$type', '$litpic', :html, '".GetMkTime(time())."')",array("html"=>$_POST['html']));
        $aid = $dsql->dsqlOper($archives, "lastid");

        if($aid){
            adminLog("添加海报", "job => " . $title);
            echo '{"state": 100, "info": "生成成功！"}';
        }else{
            echo '{"state": 200, "info": "保存失败！"}';
        }
        die;
    }

    $templates = "jobPosterAdd.html";
    //js
    $jsFile = array(
        'ui/bootstrap-datetimepicker.min.js',
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/job/jobPosterAdd.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
    );
    $huoniaoTag->assign("typeList",array("post"=>"职位","company"=>"公司"));
    $huoniaoTag->assign("type","post");
    $huoniaoTag->assign("dopost",$dopost);
}
//编辑
elseif($dopost=="edit"){
    $templates = "jobPosterAdd.html";
    //js
    $jsFile = array(
        'ui/bootstrap-datetimepicker.min.js',
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/job/jobPosterAdd.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
    );

    $huoniaoTag->assign("dopost", "edit");

    if($_GET['submit']==1){
        if(empty($token)) die('{"state": 200, "info": "token传递失败！"}');
        if(empty($id)) die('{"state": 200, "info": "要修改的信息ID传递失败！"}');

        if(empty($title)) die('{"state": 200, "info": "模板名称不得为空！"}');
        if(empty($type)) die('{"state": 200, "info": "请选择所属栏目！"}');
        if(empty($litpic)) die('{"state": 200, "info": "缩略图不得为空！"}');
        if(empty($html)) die('{"state": 200, "info": "页面代码不得为空！"}');

        $archives = $dsql->SetQuery("UPDATE `#@__poster_template` SET `title` = '$title', `type` = '$type', `litpic` = '$litpic', `html`=:html WHERE `id` = ".$id,array("html"=>$_POST['html']));
        $return = $dsql->dsqlOper($archives, "update");

        if($return == "ok"){

            adminLog("修改海报", " job => " . $title);
            echo '{"state": 100, "info": "修改成功！"}';
        }else{
            echo '{"state": 200, "info": "修改失败！"}';
        }

        die;
    }

    if(empty($id)) die('要修改的信息ID传递失败！');
    $archives = $dsql->SetQuery("SELECT * FROM `#@__$tab` WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "results");

    if(!empty($results)){
        $title     = $results[0]['title'];
        $type      = $results[0]['type'];
        $litpic    = $results[0]['litpic'];
        $html       = $results[0]['html'];

        $huoniaoTag->assign("id", $id);
        $huoniaoTag->assign("title", $title);
        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("litpic", $litpic);
        $huoniaoTag->assign("html", $html);

        $huoniaoTag->assign("typeList",array("post"=>"职位","company"=>"公司"));
        $huoniaoTag->assign("type",$type);
        $huoniaoTag->assign("dopost",$dopost);

    }else{
        die('信息不存在或已删除！');
    }
}
//删除
elseif($dopost == "del"){
	if(!testPurview("jobResumeDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);
			delPicFile($results[0]['photo'], "delPhoto", "job");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$result = $dsql->dsqlOper($archives, "update");
			if($result != "ok"){
				$error[] = $val;
			}else{

                $tempFileDir = HUONIAOROOT."/templates/poster/job/".$results[0]['type']."/skin".$id;
                deldir($tempFileDir);

				// 清除缓存
				checkCache("job_resume_list", $val);
				clearCache("job_resume_detail", $val);
				clearCache("job_resume_total", "key");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘海报", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

}else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");
    global $cfg_uploadDir;
    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    $sqls = array_filter($sqls);
    foreach ($sqls as $index => $sqlItem){
        $htmlBody = $tpl."/poster/".($index+1).".html";
        $htmlBody = file_get_contents($htmlBody);
        $sqlItem = $dsql::SetQuery($sqlItem,array("html"=>$htmlBody));
        $dsql->update($sqlItem);
    }
    adminLog("导入默认数据", "招聘海报_" . $tab);
    echo json_encode($importRes);
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

	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//海报导入默认数据，不需要删除原数据
// DELETE FROM `#@__poster_template` where `module`='job';

function getDefaultSql(){
    $time = time();
    return <<<DEFAULTSQL
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板一', 'job', 'post', '/static/images/job/poster/1.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板二', 'job', 'post', '/static/images/job/poster/2.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板三', 'job', 'post', '/static/images/job/poster/3.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板四', 'job', 'post', '/static/images/job/poster/4.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板五', 'job', 'post', '/static/images/job/poster/5.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板六', 'job', 'post', '/static/images/job/poster/6.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板七', 'job', 'post', '/static/images/job/poster/7.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板八', 'job', 'post', '/static/images/job/poster/8.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板九', 'job', 'post', '/static/images/job/poster/9.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十', 'job', 'post', '/static/images/job/poster/10.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十一', 'job', 'company', '/static/images/job/poster/11.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十二', 'job', 'company', '/static/images/job/poster/12.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十三', 'job', 'company', '/static/images/job/poster/13.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十四', 'job', 'company', '/static/images/job/poster/14.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十五', 'job', 'company', '/static/images/job/poster/15.png', :html, $time);
INSERT INTO `#@__poster_template` (`title`, `module`, `type`, `litpic`, `html`, `pubdate`) VALUES ('模板十六', 'job', 'company', '/static/images/job/poster/16.png', :html, $time);
DEFAULTSQL;
}