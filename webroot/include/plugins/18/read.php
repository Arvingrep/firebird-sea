<?php
/* 阅读量的定时任务 */

require_once('../../common.inc.php');

require_once("./inc.php");

// 判断请求
$action = $_GET['action'];
// 请求不存在
if(!isset($action)){
    die ("请传递action参数");
}
$read = new Read();
if(!method_exists($read, $action)){
    die("指定方法不存在");
}
$read->$action();

class Read{

    public function getList(){

        global $dsql;
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_read` order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $list = array();
        foreach ($res as $k=>$v){
            $list[$k]['id']       = $res[$k]['id'];
            // 任务名
            $list[$k]['taskname'] = $res[$k]['taskname'];
            // 模块名称
            if($res[$k]['module']=="article"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="info"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="sfcar"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="circle"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="house_all"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="house_rs"){
                $list[$k]['module'] = "二手房";
            }
            elseif($res[$k]['module']=="house_zu"){
                $list[$k]['module'] = "租房";
            }
            elseif($res[$k]['module']=="house_xz"){
                $list[$k]['module'] = "写字楼";
            }
            elseif($res[$k]['module']=="house_sp"){
                $list[$k]['module'] = "商铺";
            }
            elseif($res[$k]['module']=="house_cf"){
                $list[$k]['module'] = "厂房";
            }
            elseif($res[$k]['module']=="house_cw"){
                $list[$k]['module'] = "车位";
            }
            elseif($res[$k]['module']=="tieba"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            elseif($res[$k]['module']=="huodong"){
                $list[$k]['module'] = getModuleTitle(array('name' => $res[$k]['module']));
            }
            // 有效期筛选
            $list[$k]['limit']    = $res[$k]['limit'];
            // 间隔时间（分钟）
            $list[$k]['interval'] = $res[$k]['interval'];
            // 上一次时间
            $list[$k]['preTime'] = $res[$k]['preTime']? date("y-m-d H:i:s",$res[$k]['preTime']) : "还未执行";
            $list[$k]['nextTime'] = $res[$k]['nextTime']? date("y-m-d H:i:s",$res[$k]['nextTime']) : "";
            $list[$k]['minRand'] = $res[$k]['minRand'];
            $list[$k]['maxRand'] = $res[$k]['maxRand'];
            $list[$k]['state'] = $res[$k]['state'];
        }

        global $huoniaoTag;
        global $tpl;
        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "read_list.html";

        $huoniaoTag->assign("list",$list);
        $huoniaoTag->display($templates);
    }

    public function add(){
        global $huoniaoTag;
        global $tpl;
        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "read_add.html";
        $huoniaoTag->display($templates);
    }

    public function edit(){
        global $huoniaoTag;
        global $tpl;
        $tid = $_GET['id'];
        if(!isset($tid) || $tid=="" || !is_numeric($tid)){
            die("id错误");
        }
        global $dsql;
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_read` where `id`=$tid");
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
        $templates = "read_edit.html";
        $huoniaoTag->display($templates);
    }
}
