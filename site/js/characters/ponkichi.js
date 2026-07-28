import {financeStatus} from '../game/finance.js';

const PHASE_LINES={
  focus:'今週の重点方針を決めましょう。方針に合わせて軽微案件も処理します！',
  policy:'重要政策の判断です。費用と翌週予測を確認しましょう。',
  preview:'気になる兆候が届いています。調査費を使うか決めましょう。',
  project:'街を変える大型事業を選べます。無理な投資には注意です。',
  response:'調査結果が出ました。市長の最終判断をお願いします！',
  city:'今週の判断が街へ反映されました。変化を確認してください。',
  summary:'週次決算です。収支と目標の結果を一緒に確認しましょう。'
};

export function derivePonkichiReaction(state,context={}){
  const status=financeStatus(state);
  if(status==='bankrupt'||status==='crisis')return {mood:'panic',action:'calculatorTap',line:'市長、財政が危険です！市予算と翌週の支出をすぐ確認しましょう。'};
  if(state.gameStatus!=='active')return {mood:'tired',action:'breathe',line:state.gameOverReason||'任期の結果を振り返りましょう。'};
  if(context.type==='success')return {mood:'happy',action:'happyHop',line:context.line||'やりました、市長！街のみんなも喜んでいます！'};
  if(context.type==='warning')return {mood:'worried',action:'binderPresent',line:context.line||'少し気になる動きがあります。資料をご確認ください。'};
  if(context.type==='news')return {mood:'proud',action:'binderPresent',line:context.line||'今週のニュースをまとめました！'};
  if(state.support<30)return {mood:'worried',action:'breathe',line:'市民の支持が下がっています。住民の声を優先してみましょう。'};
  if(state.treasury<120)return {mood:'worried',action:'calculatorTap',line:'市予算が少なくなっています。大型事業は慎重に判断しましょう。'};
  return {mood:'normal',action:state.phase==='summary'?'calculatorTap':'mouthTalk',line:PHASE_LINES[state.phase]||'次の市政判断へ進みましょう。'};
}

export function renderPonkichi(reaction,skinId='classic'){
  return `<div class="ponkichi-stage mood-${reaction.mood} action-${reaction.action}" data-skin="${skinId}">
    <span class="ponkichi-shadow" aria-hidden="true"></span>
    <div class="ponkichi-motion">
      <img class="ponkichi-character ponkichi-home-asset" src="./assets/ponkichi-home-v080.svg?v=0.8.0" alt="手を振るアニメ調のタヌキ秘書・ポン吉">
      <span class="ponkichi-eyelid ponkichi-eyelid-left" aria-hidden="true"></span>
      <span class="ponkichi-eyelid ponkichi-eyelid-right" aria-hidden="true"></span>
    </div>
    <span class="ponkichi-name">秘書・ポン吉</span>
  </div>`;
}
