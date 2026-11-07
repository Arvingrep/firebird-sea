#!/usr/bin/env bash
# 维护 Arvingrep 名下的 Project「firebird-sea 总看板」：不存在就创建并关联仓库，
# 把 issue 加进看板，并按标签/开关状态填写「进度」「工作线」两个字段。
# 用法：project-board.sh full        全量同步所有打开的 issue
#       project-board.sh issue <N>   只同步一个 issue
# 依赖：runner 机器上已用 gh auth login 登录 Arvingrep（需要 project 权限）。
set -euo pipefail
unset GH_TOKEN GITHUB_TOKEN   # 用本机 gh 登录态，GITHUB_TOKEN 无权操作个人 Project
OWNER=Arvingrep
REPO=Arvingrep/firebird-sea
TITLE="firebird-sea 总看板"
STATUS_OPTS="待办,进行中,待审核,阻塞,完成"
LINE_OPTS="迁移Go,TMA上线,支付,部署架构,研发流程,未分类"
PRIO_OPTS="P0,P1,P2,未定"

num=$(gh project list --owner "$OWNER" --format json --limit 100 \
  --jq ".projects[] | select(.title==\"$TITLE\" and (.closed|not)) | .number" | head -1)
if [ -z "$num" ]; then
  num=$(gh project create --owner "$OWNER" --title "$TITLE" --format json --jq .number)
  gh project link "$num" --owner "$OWNER" --repo "$REPO"
  echo "created project #$num"
fi
pid=$(gh project view "$num" --owner "$OWNER" --format json --jq .id)

ensure_field() {  # $1 名称 $2 选项
  if ! gh project field-list "$num" --owner "$OWNER" --format json --limit 50 \
       --jq ".fields[].name" | grep -qx "$1"; then
    gh project field-create "$num" --owner "$OWNER" --name "$1" \
      --data-type SINGLE_SELECT --single-select-options "$2" >/dev/null
    echo "created field $1"
  fi
}
ensure_field "进度" "$STATUS_OPTS"
ensure_field "工作线" "$LINE_OPTS"
ensure_field "优先级" "$PRIO_OPTS"
FIELDS=$(gh project field-list "$num" --owner "$OWNER" --format json --limit 50)

# 已有字段缺选项时补齐（GitHub 只能整体替换选项，所以只在缺项时执行，之后全量同步会重新填值）
ensure_options() {  # $1 字段名 $2 选项
  local have missing f body
  have=$(jq -r --arg f "$1" '.fields[] | select(.name==$f) | .options[].name' <<<"$FIELDS")
  missing=0
  IFS=',' read -ra want <<<"$2"
  for o in "${want[@]}"; do grep -qx "$o" <<<"$have" || missing=1; done
  [ "$missing" = 0 ] && return 0
  f=$(jq -r --arg f "$1" '.fields[] | select(.name==$f) | .id' <<<"$FIELDS")
  body=$(jq -n --arg f "$f" --arg opts "$2" '{query:"mutation($f:ID!,$o:[ProjectV2SingleSelectFieldOptionInput!]){updateProjectV2Field(input:{fieldId:$f,singleSelectOptions:$o}){projectV2Field{... on ProjectV2SingleSelectField{id}}}}",variables:{f:$f,o:($opts|split(",")|map({name:.,color:"GRAY",description:""}))}}')
  gh api graphql --input - <<<"$body" >/dev/null
  echo "updated options of $1"
  FIELDS=$(gh project field-list "$num" --owner "$OWNER" --format json --limit 50)
}
ensure_options "工作线" "$LINE_OPTS"
ensure_options "优先级" "$PRIO_OPTS"
fid()  { jq -r --arg f "$1" '.fields[] | select(.name==$f) | .id' <<<"$FIELDS"; }
oid()  { jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[] | select(.name==$o) | .id' <<<"$FIELDS"; }
F_STATUS=$(fid 进度); F_LINE=$(fid 工作线); F_PRIO=$(fid 优先级)

sync_issue() {  # $1 issue 编号
  local j state labels status line prio item
  j=$(gh api "repos/$REPO/issues/$1")
  [ "$(jq -r '.pull_request // empty' <<<"$j")" ] && return 0
  state=$(jq -r .state <<<"$j")
  labels=$(jq -r '[.labels[].name] | join("\n")' <<<"$j")
  if   [ "$state" = closed ];                     then status=完成
  elif grep -qx "状态/阻塞" <<<"$labels";              then status=阻塞
  elif grep -qx "状态/待审核" <<<"$labels";       then status=待审核
  elif grep -qx "状态/进行中" <<<"$labels";       then status=进行中
  else status=待办; fi
  line=$(grep -m1 '^线/' <<<"$labels" | sed 's#^线/##' || true)
  [ -z "$line" ] && line=未分类
  [ -z "$(oid 工作线 "$line")" ] && line=未分类
  prio=$(grep -m1 '^优先级/' <<<"$labels" | sed 's#^优先级/##' || true)
  [ -z "$prio" ] && prio=未定
  item=$(gh project item-add "$num" --owner "$OWNER" --url "$(jq -r .html_url <<<"$j")" --format json --jq .id)
  gh project item-edit --id "$item" --project-id "$pid" --field-id "$F_STATUS" --single-select-option-id "$(oid 进度 "$status")" >/dev/null
  gh project item-edit --id "$item" --project-id "$pid" --field-id "$F_LINE"   --single-select-option-id "$(oid 工作线 "$line")" >/dev/null
  gh project item-edit --id "$item" --project-id "$pid" --field-id "$F_PRIO"   --single-select-option-id "$(oid 优先级 "$prio")" >/dev/null
  echo "#$1 → $status / $line / $prio"
}

case "${1:-full}" in
  issue) sync_issue "$2" ;;
  full)
    for n in $(gh api "repos/$REPO/issues?state=open&per_page=100" --paginate --jq '.[] | select(.pull_request|not) | .number'); do
      sync_issue "$n"
    done
    # 旧的 BMAD 看板已被本看板取代，关闭（可在 GitHub 上重新打开）
    for old in $(gh project list --owner "$OWNER" --format json --limit 100 \
        --jq '.projects[] | select((.title|startswith("firebird-sea · BMAD")) and (.closed|not)) | .number'); do
      gh project close "$old" --owner "$OWNER" >/dev/null && echo "closed old project #$old"
    done
    echo "project: https://github.com/users/$OWNER/projects/$num"
    ;;
esac
