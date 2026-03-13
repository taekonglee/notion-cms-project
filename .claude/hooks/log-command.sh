#!/bin/bash

# stdin에서 JSON 이벤트 읽기
INPUT=$(cat)

# jq로 tool_name과 command 추출
TOOL=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# 타임스탬프와 함께 로그 파일에 기록
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$TOOL] $COMMAND" >> ~/.claude/command-log.txt

# 정상 종료 (Claude 실행 차단 없음)
exit 0
