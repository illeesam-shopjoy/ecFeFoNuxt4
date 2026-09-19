# ═══════════════════════════════════════════════════════════
#  ShopJoy ecFeFoNuxt4 (Nuxt4 FO) - Dockerfile
# ═══════════════════════════════════════════════════════════
#  2026-09-19 신설 — 개발 서버(Synology NAS)에 docker compose 로 배포.
#  ecBeBo 와 같은 방식: 이 PC 에서 먼저 `nuxt build`(NITRO_PRESET=node-server)로 .output 을
#  만들어 build context 에 올려두고, 이 Dockerfile 은 그것을 담아 실행만 한다(컨테이너 안에서
#  pnpm install/빌드를 다시 하지 않는다 — NAS CPU 가 약하고 build context 가 .output 뿐이다).
#  .output/server/node_modules 에 런타임 의존성이 이미 번들돼 있어 별도 npm install 이 필요 없다.
# ═══════════════════════════════════════════════════════════
FROM node:22-alpine
WORKDIR /app
COPY .output ./.output
# 줄바꿈이 CRLF 로 바뀌어도 안전하도록 ENV 는 한 줄씩(백슬래시 이어쓰기 사용 안 함)
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
