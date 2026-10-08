<?php
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// namespace Dysmsapi\Request\V20170525;

class CreateSmsTemplateRequest extends \RpcAcsRequest
{
	function  __construct()
	{
		parent::__construct("Dysmsapi", "2017-05-25", "CreateSmsTemplate");
		$this->setMethod("POST");
	}

	private  $templateType;

	private  $templateName;

	private  $templateContent;

	private  $remark;

	private  $relatedSignName;

	private  $applySceneContent;

    private  $templateRule;

	public function getTemplateType() {
		return $this->templateType;
	}

	public function setTemplateType($templateType) {
		$this->templateType = $templateType;
		$this->queryParameters["TemplateType"]=$templateType;
	}

	public function getTemplateName() {
		return $this->templateName;
	}

	public function setTemplateName($templateName) {
		$this->templateName = $templateName;
		$this->queryParameters["TemplateName"]=$templateName;
	}

	public function getTemplateContent() {
		return $this->templateContent;
	}

	public function setTemplateContent($templateContent) {
		$this->templateContent = $templateContent;
		$this->queryParameters["TemplateContent"]=$templateContent;
	}

	public function getRemark() {
		return $this->remark;
	}

	public function setRemark($remark) {
		$this->remark = $remark;
		$this->queryParameters["Remark"]=$remark;
	}

	public function getRelatedSignName() {
		return $this->relatedSignName;
	}

	public function setRelatedSignName($relatedSignName) {
		$this->relatedSignName = $relatedSignName;
		$this->queryParameters["RelatedSignName"]=$relatedSignName;
	}

	public function getApplySceneContent() {
		return $this->applySceneContent;
	}

	public function setApplySceneContent($applySceneContent) {
		$this->applySceneContent = $applySceneContent;
		$this->queryParameters["ApplySceneContent"]=$applySceneContent;
	}

	public function getTemplateRule() {
		return $this->templateRule;
	}

	public function setTemplateRule($templateRule) {
		$this->templateRule = $templateRule;
		$this->queryParameters["TemplateRule"]=$templateRule;
	}

}
