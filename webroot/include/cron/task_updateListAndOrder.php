<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新任务悬赏推荐、极速审核的任务数据和提交过期、审核过期、修改过期的订单数据
 *
 * @version        $Id: task_updateListAndOrder.php 2022-10-26 下午14:27:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

global $handler;
$handler = true;

//更新已过期的推荐任务
$configHandels = new handlers("task", "updateExpireBidTask");
$configHandels->getHandle();

//更新已过期的极速审核任务
$configHandels = new handlers("task", "updateExpireJsTask");
$configHandels->getHandle();

//更新没有及时操作的任务订单
$configHandels = new handlers("task", "updateExpireOrder");
$configHandels->getHandle();

//自动刷新任务
$configHandels = new handlers("task", "autoRefreshTask");
$configHandels->getHandle();

//自动判定举报胜诉方
$configHandels = new handlers("task", "autoJudgeReportWinner");
$configHandels->getHandle();

//自动删除黑名单
$configHandels = new handlers("task", "autoRecoveryBlackList");
$configHandels->getHandle();
