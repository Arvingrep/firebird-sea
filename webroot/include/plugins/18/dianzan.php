<?php

/* 点赞量的定时任务 */

require_once('../../common.inc.php');

require_once("./inc.php");

// 判断请求
$action = $_GET['action'];
// 请求不存在
if(!isset($action)){
    die ("请传递action参数");
}
$dianZan = new DianZan();
if(!method_exists($dianZan, $action)){
    die("指定方法不存在");
}
$dianZan->$action();

class DianZan{

    public function getList(){
        global $dsql;
        global $huoniaoTag;
        global $tpl;
        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "dianzan_list.html";

        // 查询点赞表
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_dianzan` order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $list = array();
        foreach ($res as $k=>$v){
            $list[$k]['id']       = $v['id'];
            // 任务名
            $list[$k]['taskname'] = $v['taskname'];
            // 模块名称
            $list[$k]['module'] = getModuleTitle(array("name"=>$v['module']));
            // 有效期筛选
            $list[$k]['limit']    = $v['limit'];
            // 间隔时间（分钟）
            $list[$k]['interval'] = $v['interval'];
            // 上一次时间
            $list[$k]['preTime'] = $v['preTime']? date("y-m-d H:i:s",$v['preTime']) : "还未执行";
            $list[$k]['nextTime'] = $v['nextTime']? date("y-m-d H:i:s",$v['nextTime']) : "";
            $list[$k]['minRand'] = $v['minRand'];
            $list[$k]['maxRand'] = $v['maxRand'];
            $list[$k]['state'] = $v['state'];
        }
        $huoniaoTag->assign("list",$list);
        $huoniaoTag->display($templates);
    }

    // 新增一个
    public function add(){
        global $huoniaoTag;
        global $tpl;
        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "dianzan_add.html";
        $huoniaoTag->display($templates);
    }

    /* 编辑 */
    public function edit(){
        global $huoniaoTag;
        global $tpl;
        $tid = $_GET['id'];
        if(!isset($tid) || $tid=="" || !is_numeric($tid)){
            die("id错误");
        }
        global $dsql;
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_dianzan` where `id`=$tid");
        $ret = $dsql->dsqlOper($sql,"results");
        if($ret && is_array($ret) && $ret[0] && is_array($ret[0])){
            $huoniaoTag->assign("id",$tid);
            $huoniaoTag->assign("module",$ret[0]['module']);
            $huoniaoTag->assign("limit",$ret[0]['limit']);
            $huoniaoTag->assign("taskname",$ret[0]['taskname']);
            $huoniaoTag->assign("interval",$ret[0]['interval']);
            $huoniaoTag->assign("minRand",$ret[0]['minRand']);
            $huoniaoTag->assign("maxRand",$ret[0]['maxRand']);
        }

        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "dianzan_edit.html";
        $huoniaoTag->display($templates);
    }

}